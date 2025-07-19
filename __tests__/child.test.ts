import { ChildClient } from '../src/child';
import { ACTION_GET_DATA } from '../src/constants';

describe('ChildClient', () => {
  let childClient: ChildClient;
  let mockPostMessage: jest.Mock;
  let mockAddEventListener: jest.Mock;
  let mockRemoveEventListener: jest.Mock;
  let messageEventCallback: Function;
  
  // Save original methods
  const originalPostMessage = window.parent.postMessage;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  
  beforeEach(() => {
    childClient = new ChildClient();
    
    // Mock window methods
    mockPostMessage = jest.fn();
    mockAddEventListener = jest.fn((event, callback) => {
      messageEventCallback = callback as Function;
    });
    mockRemoveEventListener = jest.fn();
    
    // Replace with mocks
    window.parent.postMessage = mockPostMessage;
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore original methods
    window.parent.postMessage = originalPostMessage;
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    jest.useRealTimers();
  });
  
  describe('getData', () => {
    test('should send a message and return data on success', async () => {
      const mockData = { result: 'test data' };
      const collection = 'test-collection';
      const query = { filter: 'value' };
      
      // Call getData
      const dataPromise = childClient.getData(collection, query);
      
      // Verify addEventListener was called
      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      
      // Verify postMessage was called with correct arguments
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTION_GET_DATA,
          collection,
          options: query
        }),
        '*'
      );
      
      // Simulate response from parent
      const requestId = mockPostMessage.mock.calls[0][0].requestId;
      messageEventCallback({
        data: {
          action: `${ACTION_GET_DATA}_response`,
          requestId,
          data: mockData
        }
      });
      
      // Check result
      const [data, error] = await dataPromise;
      expect(data).toEqual(mockData);
      expect(error).toBeUndefined();
    });
    
    test('should handle errors from the response', async () => {
      const errorMessage = 'Test error message';
      const collection = 'test-collection';
      
      // Call getData
      const dataPromise = childClient.getData(collection);
      
      // Simulate error response from parent
      const requestId = mockPostMessage.mock.calls[0][0].requestId;
      messageEventCallback({
        data: {
          action: `${ACTION_GET_DATA}_response`,
          requestId,
          error: errorMessage
        }
      });
      
      // Check result
      const [data, error] = await dataPromise;
      expect(data).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe(errorMessage);
    });
    
    test('should handle timeout', async () => {
      const collection = 'test-collection';
      
      // Call getData
      const dataPromise = childClient.getData(collection);
      
      // Fast-forward timers past the timeout
      jest.advanceTimersByTime(5001);
      
      // Check result
      const [data, error] = await dataPromise;
      expect(data).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toContain('Timeout');
    });
    
    test('should reuse pending requests with the same parameters', async () => {
      const mockData = { result: 'test data' };
      const collection = 'test-collection';
      
      // Call getData twice with the same parameters
      const promise1 = childClient.getData(collection);
      const promise2 = childClient.getData(collection);
      
      // Verify postMessage was called only once
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      
      // Simulate response from parent
      const requestId = mockPostMessage.mock.calls[0][0].requestId;
      messageEventCallback({
        data: {
          action: `${ACTION_GET_DATA}_response`,
          requestId,
          data: mockData
        }
      });
      
      // Check results
      const [data1] = await promise1;
      const [data2] = await promise2;
      expect(data1).toEqual(mockData);
      expect(data2).toEqual(mockData);
    });
    
    test('should handle all parameters correctly', async () => {
      const collection = 'test-collection';
      const query = { filter: 'value' };
      const page = 1;
      const perPage = 10;
      const target = 'https://example.com';
      
      // Call getData with all parameters
      childClient.getData(collection, query, page, perPage, target);
      
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTION_GET_DATA,
          collection,
          options: query,
          page,
          perPage
        }),
        target
      );
    });
  });
});