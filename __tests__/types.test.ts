import {
  PostMessageRequest,
  PostMessageResponse,
  Query,
  EventResponse,
  ProxyBridge
} from '../src/types';

describe('Types', () => {
  test('should be able to create objects with the defined types', () => {
    // PostMessageRequest
    const request: PostMessageRequest = {
      action: 'testAction',
      requestId: 'test-id',
      extraField: 'extra'
    };
    expect(request.action).toBe('testAction');
    expect(request.requestId).toBe('test-id');
    expect(request.extraField).toBe('extra');

    // PostMessageResponse
    const response: PostMessageResponse = {
      action: 'testAction_response',
      requestId: 'test-id',
      data: { result: 'test' },
      error: undefined
    };
    expect(response.action).toBe('testAction_response');
    expect(response.requestId).toBe('test-id');
    expect(response.data).toEqual({ result: 'test' });
    expect(response.error).toBeUndefined();

    // Query
    const query: Query = {
      filter: 'value',
      page: 1,
      limit: 10
    };
    expect(query.filter).toBe('value');
    expect(query.page).toBe(1);
    expect(query.limit).toBe(10);

    // EventResponse
    const eventResponse: EventResponse = {
      action: 'testAction',
      data: { result: 'test' },
      error: undefined,
      requestId: 'test-id',
      originCheck: 'test-origin'
    };
    expect(eventResponse.action).toBe('testAction');
    expect(eventResponse.data).toEqual({ result: 'test' });
    expect(eventResponse.error).toBeUndefined();
    expect(eventResponse.requestId).toBe('test-id');
    expect(eventResponse.originCheck).toBe('test-origin');

    // ProxyBridge
    const mockPostMessage = jest.fn();
    const bridge: ProxyBridge = {
      postMessage: mockPostMessage
    };
    bridge.postMessage({ action: 'test' }, '*');
    expect(mockPostMessage).toHaveBeenCalledWith({ action: 'test' }, '*');
  });
});