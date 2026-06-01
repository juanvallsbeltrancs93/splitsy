import { DefaultBodyType, http, HttpResponse } from 'msw';
import { SetupServer, setupServer } from 'msw/node';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface MockHandler<T extends DefaultBodyType> {
  method: Method;
  url: string;
  code: number;
  response: T;
}

function isBlobLike(value: unknown): value is Blob {
  return Boolean(
    value
    && typeof value === 'object'
    && 'arrayBuffer' in value
    && typeof (value as Blob).arrayBuffer === 'function'
    && 'size' in value
    && typeof (value as Blob).size === 'number'
    && 'type' in value
    && typeof (value as Blob).type === 'string',
  );
}

export interface TrackedRequest {
  headers: Headers;
  params: URLSearchParams;
}

export class MockWebServer {
  private server: SetupServer;
  private lastRequest: TrackedRequest | null = null;
  private allRequests: TrackedRequest[] = [];

  constructor() {
    this.server = setupServer();

    this.server.events.on('request:start', (req) => {
      const request = this.mapRequest(req.request);
      this.lastRequest = request;
      this.allRequests.push(request);
    });
  }

  start(): void {
    this.server.listen({ onUnhandledRequest: 'warn' });
  }

  resetHandlers(): void {
    this.server.resetHandlers();
    this.lastRequest = null;
    this.allRequests = [];
  }

  close(): void {
    this.server.close();
  }

  addRequestHandlers<T extends DefaultBodyType>(handlers: MockHandler<T>[]) {
    const mswHandlers = handlers.map((handler) => this.createMswHandler(handler));
    this.server.use(...mswHandlers);
  }

  addVerificationListener(assertion: (req: globalThis.Request) => void) {
    this.server.events.on('request:start', (req) => {
      assertion(req.request);
    });
  }

  getLastRequest(): TrackedRequest | null {
    return this.lastRequest;
  }

  getAllRequests(): TrackedRequest[] {
    return this.allRequests;
  }

  private createMswHandler<T extends DefaultBodyType>(handler: MockHandler<T>) {
    switch (handler.method) {
      case 'get':
        return http.get(handler.url, async () => this.createHttpResponse(handler));
      case 'post':
        return http.post(handler.url, async () => this.createHttpResponse(handler));
      case 'put':
        return http.put(handler.url, async () => this.createHttpResponse(handler));
      case 'patch':
        return http.patch(handler.url, async () => this.createHttpResponse(handler));
      case 'delete':
        return http.delete(handler.url, async () => this.createHttpResponse(handler));
      default:
        throw new Error('Method not supported');
    }
  }

  private mapRequest(req: globalThis.Request): TrackedRequest {
    return {
      headers: req.headers,
      params: new URL(req.url).searchParams,
    };
  }

  private async createHttpResponse<T extends DefaultBodyType>(handler: MockHandler<T>) {
    const { response, code } = handler;

    if (isBlobLike(response)) {
      return new HttpResponse(await response.arrayBuffer(), {
        status: code,
        headers: {
          'Content-Type': response.type || 'application/octet-stream',
        },
      });
    }

    return HttpResponse.json(response, { status: code });
  }
}
