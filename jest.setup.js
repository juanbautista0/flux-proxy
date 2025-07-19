// Mock global objects that might not be available in the test environment
global.MessageEvent = class MessageEvent {
  constructor(type, init) {
    this.type = type;
    this.data = init?.data;
    this.origin = init?.origin || '';
    this.source = init?.source || null;
  }
};

// Ensure window.parent exists
if (!window.parent) {
  window.parent = window;
}

// Ensure we have a working setTimeout
if (!global.setTimeout) {
  global.setTimeout = (callback, ms) => {
    callback();
    return 0;
  };
}

// Ensure we have a working clearTimeout
if (!global.clearTimeout) {
  global.clearTimeout = () => {};
}