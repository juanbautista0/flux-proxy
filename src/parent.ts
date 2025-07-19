/**
 * @file Parent client for handling cross-origin communication in a proxy bridge pattern
 * Manages message processing between parent and child contexts (e.g., iframes, workers)
 * @internal This module is for internal use only
 */

import { ACTION_GET_DATA, ACTION_INIT, ACTION_READY, IGNORE_SOURCES, RESPONSE_SUFFIX } from "./constants";
import { EventResponse, ProxyBridge } from "./types";

/** Set to track active requests and prevent duplicate processing */
const ACTIVE_REQUESTS = new Set<string>();

/**
 * ParentClient handles communication between parent and child contexts
 * using a standardized message protocol
 */
export class ParentClient {
    /**
     * Validates if a message is a proper object that can be processed
     * @param data - The data to validate
     * @returns Boolean indicating if the data is a valid message object
     */
    public static isValidMessage(data: unknown): data is Record<string, any> {
        return typeof data === 'object' && data !== null;
    }

    /**
     * Processes incoming messages, executes appropriate actions, and sends responses
     * @param data - The message data received
     * @param handler - The communication bridge for sending responses
     * @param dataSource - Function to retrieve data when requested
     * @param target - Target origin for postMessage (defaults to '*')
     * @param ignoreSources - Sources to ignore in message processing
     */
    public static async onMessage(
        data: unknown,
        handler: ProxyBridge,
        dataSource: <G>(message: Record<string, any>) => Promise<G>,
        target: string = '*',
        ignoreSources: string[] = IGNORE_SOURCES
    ): Promise<void> {
        // Validate message and check if it should be ignored
        if (!ParentClient.isValidMessage(data) || 
            String(data?.source).includes(ignoreSources.join())) {
            return;
        }

        const message = data;
        const { action, requestId, origin } = message;
        
        // Prevent duplicate processing of the same request
        if (!requestId || ACTIVE_REQUESTS.has(requestId)) return;
        
        // Mark request as active
        ACTIVE_REQUESTS.add(requestId);
        
        let payload: EventResponse = {} as EventResponse;

        try {
            switch (action) {
                case ACTION_READY: {
                    // Initialize communication with child
                    payload = {
                        action: ACTION_INIT,
                        originCheck: origin,
                    };
                    break;
                }

                case ACTION_GET_DATA: {
                    // Process data request and prepare response
                    const result = await dataSource(message);
                    payload = {
                        action: `${ACTION_GET_DATA}${RESPONSE_SUFFIX}`,
                        data: result,
                        requestId,
                        originCheck: origin,
                    };
                    break;
                }

                default: {
                    throw new Error("Unrecognized action");
                }
            }

            // Send successful response
            handler.postMessage(payload, target);

        } catch (error) {
            // Handle and communicate errors
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            handler.postMessage(
                {
                    action: `${action}${RESPONSE_SUFFIX}`,
                    error: errorMessage,
                    requestId,
                    originCheck: origin,
                },
                target
            );
        } finally {
            // Clean up request tracking
            ACTIVE_REQUESTS.delete(requestId);
        }
    }
}