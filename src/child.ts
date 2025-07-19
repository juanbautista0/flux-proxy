/**
 * @file Child client for handling communication from child contexts
 * @internal This module is for internal use only
 */

import { PostMessageRequest, PostMessageResponse, Query } from "./types";
import { ACTION_GET_DATA, ACTION_POST_DATA } from "./constants";

/**
 * ChildClient handles communication from child contexts to parent
 */
export class ChildClient {

    private pendingRequests: Map<string, Promise<any>> = new Map();

    private getCacheKey(action: string, payload: Record<string, any>) {
        return `${action}_${JSON.stringify(payload)}`;
    }

    /**
     * Send a message to parent and wait for the response.
     * @param action - The action type to send
     * @param payload - The data payload to send
     * @param target - Target origin for postMessage
     * @returns Promise with the response data
     */
    private async postMessageToParent(action: string, payload: Record<string, any>, target: string = "*"): Promise<any> {
        const cacheKey = this.getCacheKey(action, payload);

        // If there is a request in progress with the same parameters
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey)!;
        }

        const id = cacheKey;

        const promise = new Promise<any>((resolve, reject) => {
            const message: PostMessageRequest = {
                action,
                requestId: id,
                ...payload,
            };

            const handleMessage = (event: MessageEvent) => {
                const response = event.data as PostMessageResponse;

                if (
                    response &&
                    response.requestId === id &&
                    response.action === `${action}_response`
                ) {
                    window.removeEventListener('message', handleMessage);
                    clearTimeout(timeout);
                    this.pendingRequests.delete(cacheKey);

                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response.data);
                    }
                }
            };

            window.addEventListener('message', handleMessage);

            const timeout = setTimeout(() => {
                window.removeEventListener('message', handleMessage);
                this.pendingRequests.delete(cacheKey);
                reject(new Error('Timeout waiting for response from parent'));
            }, 5000);

            // Send message to parent
            window.parent.postMessage(message, target);
        });

        // Save the promise to prevent duplicate requests
        this.pendingRequests.set(cacheKey, promise);

        return promise;
    }

    /**
     * Request data from the parent context
     * @param collection - The data collection to request
     * @param query - Optional query parameters
     * @param page - Optional page number for pagination
     * @param perPage - Optional items per page for pagination
     * @param target - Optional target origin for postMessage
     * @returns Promise with tuple containing [data, error]
     */
    public async getData<R>(
        collection: string,
        query?: Query,
        page?: number,
        perPage?: number,
        target?: string
    ): Promise<[R | undefined, Error | undefined]> {
        try {
            const data = await this.postMessageToParent(ACTION_GET_DATA, {
                collection,
                options: query,
                page,
                perPage,
            }, target);

            return [data, undefined];
        } catch (err) {
            return [undefined, err as Error];
        }
    }
    
    /**
     * Send data to the parent context
     * @param collection - The data collection to post to
     * @param data - The data to send
     * @param target - Optional target origin for postMessage
     * @returns Promise with tuple containing [response, error]
     */
    public async postData<R, T>(
        collection: string,
        data: T,
        target?: string
    ): Promise<[R | undefined, Error | undefined]> {
        try {
            const response = await this.postMessageToParent(ACTION_POST_DATA, {
                collection,
                data,
            }, target);

            return [response, undefined];
        } catch (err) {
            return [undefined, err as Error];
        }
    }
}
