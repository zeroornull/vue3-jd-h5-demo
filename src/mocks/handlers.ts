import { catalogData, homeData, hotSearchTerms } from './catalog-data.js'

export interface MockResponse {
  status: number
  body: unknown
}

const users = new Map([
  ['zhangsan', '123456'],
  ['tom', '123'],
])

function login(url: URL): MockResponse {
  const username = url.searchParams.get('username') ?? ''
  const password = url.searchParams.get('password') ?? ''
  const valid = users.get(username) === password

  if (!valid) {
    return {
      status: 200,
      body: {
        code: 0,
        message: '账号或者密码错误',
        result: {},
      },
    }
  }

  return {
    status: 200,
    body: {
      code: 1,
      message: '登录成功',
      token: `mock-token-${username}`,
      result: [],
    },
  }
}

function register(url: URL): MockResponse {
  const username = url.searchParams.get('username') ?? ''
  const exists = users.has(username)

  return {
    status: 200,
    body: {
      code: exists ? 0 : 1,
      message: exists ? '用户名已经存在' : '注册成功',
      result: [],
    },
  }
}

const staticResponses = new Map<string, MockResponse>([
  [
    '/api/catalog',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: catalogData,
      },
    },
  ],
  [
    '/api/home',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: homeData,
      },
    },
  ],
  [
    '/api/search/hot',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: hotSearchTerms,
      },
    },
  ],
  [
    '/api/banner',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: [
          {
            url: 'https://vuejs.org/',
            image: '/favicon.ico',
          },
        ],
      },
    },
  ],
  [
    '/api/rollinglist',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: [[{ url: '/', image: '/favicon.ico', label: '示例分类' }]],
      },
    },
  ],
  [
    '/api/classify',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: [],
      },
    },
  ],
])

export function handleMockRequest(method: string, url: URL): MockResponse | undefined {
  if (method.toUpperCase() !== 'GET') {
    return undefined
  }

  if (url.pathname === '/api/login') {
    return login(url)
  }

  if (url.pathname === '/api/register') {
    return register(url)
  }

  return staticResponses.get(url.pathname)
}
