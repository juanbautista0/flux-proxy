import {
  IGNORE_SOURCES,
  ACTION_READY,
  ACTION_INIT,
  ACTION_GET_DATA,
  RESPONSE_SUFFIX
} from '../src/constants';

describe('Constants', () => {
  test('should export the correct constants', () => {
    expect(IGNORE_SOURCES).toEqual(['react-', 'react-dom']);
    expect(ACTION_READY).toBe('ready');
    expect(ACTION_INIT).toBe('init');
    expect(ACTION_GET_DATA).toBe('getData');
    expect(RESPONSE_SUFFIX).toBe('_response');
  });
});