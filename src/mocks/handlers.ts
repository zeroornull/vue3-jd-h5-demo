import type { HomeData, HotSearchTerm } from '../types/catalog.js'

export interface MockResponse {
  status: number
  body: unknown
}

const users = new Map([
  ['zhangsan', '123456'],
  ['tom', '123'],
])

const homeData: HomeData = {
  banners: [
    {
      id: 'banner-1',
      image: '/mock/home/banner-1.jpg',
      alt: '夏日精选商品',
      to: '/classify/product',
    },
    {
      id: 'banner-2',
      image: '/mock/home/banner-2.jpg',
      alt: '数码好物推荐',
      to: '/classify/product',
    },
    {
      id: 'banner-3',
      image: '/mock/home/banner-3.jpg',
      alt: '品质生活专场',
      to: '/classify/product',
    },
  ],
  shortcuts: [
    { id: 'boutique', label: '链猫精品', icon: 'shopping-cart', to: '/search' },
    { id: 'cm', label: 'CM 专区', icon: 'check', to: '/search' },
    { id: 'coupon', label: '领券中心', icon: 'hot', to: '/search' },
    { id: 'member', label: '会员专区', icon: 'right-arrow', to: '/search' },
  ],
  sections: [
    {
      id: 'featured',
      title: '精选',
      subtitle: '猜你喜欢',
      products: [
        {
          id: 'product-1',
          title: '多功能料理机',
          subtitle: '轻松准备每日健康餐',
          image: '/mock/home/product-1.png',
          price: 125,
          originalPrice: 169,
          stock: 20,
          soldPercentage: 68,
        },
        {
          id: 'product-2',
          title: '遥控空调扇',
          subtitle: '柔和送风，低噪节能',
          image: '/mock/home/product-2.png',
          price: 245,
          originalPrice: 299,
          stock: 12,
          soldPercentage: 55,
        },
      ],
    },
    {
      id: 'fashion',
      title: '时尚',
      subtitle: '潮流百搭',
      products: [
        {
          id: 'product-3',
          title: '轻量双肩包',
          subtitle: '通勤与旅行都从容',
          image: '/mock/home/product-3.png',
          price: 89,
          originalPrice: 129,
          stock: 30,
          soldPercentage: 72,
        },
        {
          id: 'product-4',
          title: '商务行李箱',
          subtitle: '耐磨箱体，静音万向轮',
          image: '/mock/home/product-4.png',
          price: 218,
          originalPrice: 269,
          stock: 16,
          soldPercentage: 43,
        },
      ],
    },
  ],
}

const hotSearchTerms: HotSearchTerm[] = [
  { title: '小米手机', hot: true },
  { title: '笔记本', hot: true },
  { title: '电脑', hot: false },
  { title: '平板', hot: false },
  { title: '液晶电视', hot: true },
  { title: '家电', hot: false },
  { title: '玩具', hot: false },
]

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
