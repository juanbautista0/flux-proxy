import { EventResponse, ProxyBridge } from '../../src/types';

export class ParentClient {
  public static isValidMessage(data: unknown): data is Record<string, any> {
    return typeof data === 'object' && data !== null;
  }

  public static async onMessage(
    data: unknown,
    handler: ProxyBridge,
    dataSource: <G>(message: Record<string, any>) => Promise<G>,
    target: string = '*',
    ignoreSources: string[] = []
  ): Promise<void> {
    // Mock implementation
    return Promise.resolve();
  }
}