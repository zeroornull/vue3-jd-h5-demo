import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const PREVIEW_ORIGIN = 'http://127.0.0.1:4173'
const PREVIEW_PORT = '4173'

async function fetchText(path: string): Promise<{ status: number; contentType: string; body: string }> {
  const response = await fetch(`${PREVIEW_ORIGIN}${path}`)
  return {
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    body: await response.text(),
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

async function waitForPreview(): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${PREVIEW_ORIGIN}/index`)
      if (response.ok) {
        return
      }
    } catch {
      // Preview is still binding the port.
    }

    await delay(250)
  }

  throw new Error(`Preview server did not become ready on ${PREVIEW_ORIGIN}`)
}

async function runSmoke(): Promise<void> {
  const index = await fetchText('/index')
  assert(index.status === 200, `GET /index returned ${index.status}`)
  assert(index.body.includes('id="app"'), 'SPA shell missing on /index')

  const deep = await fetchText('/classify/product?id=product-1')
  assert(deep.status === 200, `GET /classify/product returned ${deep.status}`)
  assert(deep.contentType.includes('text/html'), 'Deep route did not fall back to index.html')
  assert(deep.body.includes('id="app"'), 'SPA shell missing on deep route refresh')

  const catalog = await fetchText('/api/catalog')
  assert(catalog.status === 200, `GET /api/catalog returned ${catalog.status}`)
  assert(catalog.contentType.includes('application/json'), 'Preview mock did not serve JSON')
  assert(catalog.body.includes('product-1'), 'Catalog mock payload missing product-1')

  const image = await fetch(`${PREVIEW_ORIGIN}/mock/home/product-1.png`)
  assert(image.status === 200, `GET /mock/home/product-1.png returned ${image.status}`)
  assert((image.headers.get('content-type') ?? '').startsWith('image/'), 'Product image content-type is not image/*')

  const favicon = await fetch(`${PREVIEW_ORIGIN}/favicon.ico`)
  assert(favicon.status === 200, `GET /favicon.ico returned ${favicon.status}`)
}

const preview = spawn('bun', ['x', '--bun', 'vite', 'preview', '--host', '127.0.0.1', '--port', PREVIEW_PORT], {
  env: { ...process.env, VITE_ENABLE_MOCK: 'true' },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let output = ''
preview.stdout.on('data', (chunk: Buffer) => {
  output += chunk.toString()
})
preview.stderr.on('data', (chunk: Buffer) => {
  output += chunk.toString()
})

try {
  await waitForPreview()
  await runSmoke()
  console.log('Preview smoke passed: SPA fallback, /api mock, and static assets.')
} catch (error) {
  console.error(output)
  throw error
} finally {
  preview.kill('SIGTERM')
}
