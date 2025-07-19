import { ParentClient } from '../src/parent';
import { ACTION_READY, ACTION_INIT, ACTION_GET_DATA, RESPONSE_SUFFIX } from '../src/constants';

describe('ParentClient', () => {
  // Mock for ProxyBridge
  const mockHandler = {
    postMessage: jest.fn()
  };

  // Mock for dataSource
  const mockDataSource = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidMessage', () => {
    test('should return true for valid objects', () => {
      expect(ParentClient.isValidMessage({ test: 'value' })).toBe(true);
      expect(ParentClient.isValidMessage({})).toBe(true);
    });

    test('should return false for non-objects', () => {
      expect(ParentClient.isValidMessage(null)).toBe(false);
      expect(ParentClient.isValidMessage(undefined)).toBe(false);
      expect(ParentClient.isValidMessage('string')).toBe(false);
      expect(ParentClient.isValidMessage(123)).toBe(false);
    });
  });

  describe('onMessage', () => {
    test('should ignore invalid messages', async () => {
      await ParentClient.onMessage(null, mockHandler, mockDataSource);
      expect(mockHandler.postMessage).not.toHaveBeenCalled();
      expect(mockDataSource).not.toHaveBeenCalled();
    });

    test('should ignore messages from ignored sources', async () => {
      await ParentClient.onMessage(
        { source: 'react-dom-something' },
        mockHandler,
        mockDataSource
      );
      expect(mockHandler.postMessage).not.toHaveBeenCalled();
      expect(mockDataSource).not.toHaveBeenCalled();
    });

    test('should ignore messages without requestId', async () => {
      await ParentClient.onMessage(
        { action: ACTION_GET_DATA },
        mockHandler,
        mockDataSource
      );
      expect(mockHandler.postMessage).not.toHaveBeenCalled();
      expect(mockDataSource).not.toHaveBeenCalled();
    });

    test('should handle ACTION_READY', async () => {
      const message = { action: ACTION_READY, requestId: 'ready-id', origin: 'test-origin' };
      
      await ParentClient.onMessage(message, mockHandler, mockDataSource);
      
      expect(mockHandler.postMessage).toHaveBeenCalledWith(
        {
          action: ACTION_INIT,
          originCheck: 'test-origin',
        },
        '*'
      );
      expect(mockDataSource).not.toHaveBeenCalled();
    });

    test('should handle ACTION_GET_DATA', async () => {
      const message = { 
        action: ACTION_GET_DATA, 
        requestId: 'data-id', 
        origin: 'test-origin',
        collection: 'test-collection'
      };
      
      const mockResult = { data: 'test-data' };
      mockDataSource.mockResolvedValueOnce(mockResult);
      
      await ParentClient.onMessage(message, mockHandler, mockDataSource);
      
      expect(mockDataSource).toHaveBeenCalledWith(message);
      expect(mockHandler.postMessage).toHaveBeenCalledWith(
        {
          action: `${ACTION_GET_DATA}${RESPONSE_SUFFIX}`,
          data: mockResult,
          requestId: 'data-id',
          originCheck: 'test-origin',
        },
        '*'
      );
    });

    test('should handle unrecognized action', async () => {
      const message = { 
        action: 'unknownAction', 
        requestId: 'unknown-id', 
        origin: 'test-origin' 
      };
      
      await ParentClient.onMessage(message, mockHandler, mockDataSource);
      
      expect(mockHandler.postMessage).toHaveBeenCalledWith(
        {
          action: `unknownAction${RESPONSE_SUFFIX}`,
          error: 'Unrecognized action',
          requestId: 'unknown-id',
          originCheck: 'test-origin',
        },
        '*'
      );
    });

    test('should handle errors from dataSource', async () => {
      const message = { 
        action: ACTION_GET_DATA, 
        requestId: 'error-id', 
        origin: 'test-origin' 
      };
      
      mockDataSource.mockRejectedValueOnce(new Error('Test error'));
      
      await ParentClient.onMessage(message, mockHandler, mockDataSource);
      
      expect(mockHandler.postMessage).toHaveBeenCalledWith(
        {
          action: `${ACTION_GET_DATA}${RESPONSE_SUFFIX}`,
          error: 'Test error',
          requestId: 'error-id',
          originCheck: 'test-origin',
        },
        '*'
      );
    });

    test('should handle non-Error objects thrown', async () => {
      const message = { 
        action: ACTION_GET_DATA, 
        requestId: 'non-error-id', 
        origin: 'test-origin' 
      };
      
      mockDataSource.mockRejectedValueOnce('String error');
      
      await ParentClient.onMessage(message, mockHandler, mockDataSource);
      
      expect(mockHandler.postMessage).toHaveBeenCalledWith(
        {
          action: `${ACTION_GET_DATA}${RESPONSE_SUFFIX}`,
          error: 'Unknown error',
          requestId: 'non-error-id',
          originCheck: 'test-origin',
        },
        '*'
      );
    });

    test('should use custom target and ignoreSources', async () => {
      const message = { 
        action: ACTION_READY, 
        requestId: 'custom-id', 
        origin: 'test-origin' 
      };
      
      const customTarget = 'https://example.com';
      const customIgnoreSources = ['custom-ignore'];
      
      await ParentClient.onMessage(
        message, 
        mockHandler, 
        mockDataSource, 
        customTarget,
        customIgnoreSources
      );
      
      expect(mockHandler.postMessage).toHaveBeenCalledWith(
        {
          action: ACTION_INIT,
          originCheck: 'test-origin',
        },
        customTarget
      );
    });
  });
});