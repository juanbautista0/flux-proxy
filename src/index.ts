/**
 * @file Main entry point for the flux-proxy package
 * Exports a public API while keeping implementation details private
 */

import { ChildClient } from "./child";
import { ParentClient } from "./parent";
import { EventResponse, ProxyBridge, PostMessageRequest, PostMessageResponse, Query } from "./types";

// Re-export types that should be public
export { EventResponse, ProxyBridge, PostMessageRequest, PostMessageResponse, Query };

/**
 * Main FluxProxy class that provides access to child and parent client functionality
 * This is the only class that should be directly used by consumers
 */
export class FluxProxy {
    /**
     * Access to child client functionality for communication from child contexts
     */
    public static readonly childClient = new ChildClient();

    /**
     * Access to parent client functionality for communication from parent contexts
     */
    public static readonly parentClient = new ParentClient();
}