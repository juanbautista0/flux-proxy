/**
 * @file Type definitions for the flux-proxy package
 */

/**
 * Request message structure sent from child to parent
 */
export type PostMessageRequest = {
    /** Action type identifier */
    action: string;
    /** Unique request identifier */
    requestId: string;
    /** Additional properties */
    [key: string]: any;
};

/**
 * Response message structure sent from parent to child
 */
export type PostMessageResponse = {
    /** Action type identifier with response suffix */
    action: string;
    /** Unique request identifier (matching the request) */
    requestId: string;
    /** Response data (if successful) */
    data?: any;
    /** Error message (if failed) */
    error?: string;
};

/**
 * Query parameters for data requests
 */
export type Query = {
    /** Key-value pairs for filtering data */
    [key: string]: unknown;
}

/**
 * Event response structure for internal communication
 */
export type EventResponse = {
    /** Action type identifier */
    action: string;
    /** Response data (if applicable) */
    data?: unknown;
    /** Error message (if applicable) */
    error?: string;
    /** Request identifier (if applicable) */
    requestId?: string;
    /** Origin verification value */
    originCheck?: string;
}

/**
 * Interface for objects that can send messages between contexts
 */
export type ProxyBridge = {
    /** Method to send messages to another context */
    postMessage: (event: EventResponse, target?: string) => void;
}