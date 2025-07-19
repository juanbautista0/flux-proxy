/**
 * @file Constants and utility functions for internal use
 * @internal These exports should not be used directly by package consumers
 */

// Constants used for message communication between contexts
export const IGNORE_SOURCES = ['react-', 'react-dom'];
export const ACTION_READY = 'ready';
export const ACTION_INIT = 'init';
export const ACTION_GET_DATA = 'getData';
export const ACTION_POST_DATA = 'postData';
export const RESPONSE_SUFFIX = '_response';