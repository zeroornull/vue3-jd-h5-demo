import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

import { handleMockRequest } from '../../src/mocks/handlers.ts'

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return undefined
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

interface MiddlewareServer {
  middlewares: {
    use(
      handler: (
        request: IncomingMessage,
        response: ServerResponse,
        next: () => void,
      ) => void,
    ): void
  }
}

function installMockMiddleware(server: MiddlewareServer): void {
  server.middlewares.use((request, response, next) => {
    if (!request.method || !request.url) {
      next()
      return
    }

    void (async () => {
      const body = ['GET', 'HEAD'].includes(request.method ?? '')
        ? undefined
        : await readJsonBody(request)
      const authorizationHeader = request.headers.authorization
      const mock = handleMockRequest(
        request.method ?? 'GET',
        new URL(request.url ?? '/', 'http://localhost'),
        body,
        {
          authorization: Array.isArray(authorizationHeader)
            ? authorizationHeader[0]
            : authorizationHeader,
        },
      )

      if (!mock) {
        next()
        return
      }

      response.statusCode = mock.status
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.end(JSON.stringify(mock.body))
    })().catch(() => {
      response.statusCode = 400
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.end(JSON.stringify({ code: 0, message: '请求 JSON 无效', data: null }))
    })
  })
}

export function mockApiPlugin(enabled: boolean): Plugin {
  return {
    name: 'vue3-jd-h5:mock-api',
    apply: 'serve',
    configureServer(server) {
      if (enabled) {
        installMockMiddleware(server)
      }
    },
    configurePreviewServer(server) {
      if (enabled) {
        installMockMiddleware(server)
      }
    },
  }
}
