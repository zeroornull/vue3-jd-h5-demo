import type { Plugin } from 'vite'

import { handleMockRequest } from '../../src/mocks/handlers.ts'

export function mockApiPlugin(enabled: boolean): Plugin {
  return {
    name: 'vue3-jd-h5:mock-api',
    apply: 'serve',
    configureServer(server) {
      if (!enabled) {
        return
      }

      server.middlewares.use((request, response, next) => {
        if (!request.method || !request.url) {
          next()
          return
        }

        const mock = handleMockRequest(
          request.method,
          new URL(request.url, 'http://localhost'),
        )

        if (!mock) {
          next()
          return
        }

        response.statusCode = mock.status
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.end(JSON.stringify(mock.body))
      })
    },
  }
}
