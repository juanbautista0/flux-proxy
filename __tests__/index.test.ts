import { FluxProxy } from '../src/index';
import { ChildClient } from '../src/child';
import { ParentClient } from '../src/parent';

jest.mock('../src/child');
jest.mock('../src/parent');

describe('FluxProxy', () => {
  test('should export childClient instance', () => {
    expect(FluxProxy.childClient).toBeInstanceOf(ChildClient);
  });

  test('should export parentClient instance', () => {
    expect(FluxProxy.parentClient).toBeInstanceOf(ParentClient);
  });
});