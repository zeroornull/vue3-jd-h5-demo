import type {
  HelpTopic,
  InboxMessage,
  ProfileSettings,
  ShippingAddress,
  UserProfile,
} from '../types/profile.js'

export function createProfileSeed(): {
  profile: UserProfile
  addresses: ShippingAddress[]
  messages: InboxMessage[]
  helpTopics: HelpTopic[]
  settings: ProfileSettings
} {
  return {
    profile: {
      displayName: '演示用户',
      phone: '13800138000',
      email: 'demo@example.com',
      avatar: '/mock/auth/logo.png',
      region: '中国 +86',
      productFollows: 3,
      storeFollows: 1,
      footprints: 9,
    },
    addresses: [
      {
        id: 'address-home',
        name: '咋地',
        phone: '13545900066',
        gender: 'female',
        region: '广东省深圳市宝安区',
        detail: '福永地铁站C出口',
        tag: 'home',
        isDefault: true,
      },
      {
        id: 'address-company',
        name: '演示用户',
        phone: '13800138000',
        gender: 'male',
        region: '广东省深圳市南山区',
        detail: '科研路1001号比科大厦',
        tag: 'company',
        isDefault: false,
      },
      {
        id: 'address-school',
        name: '演示用户',
        phone: '13800138000',
        gender: 'male',
        region: '广东省深圳市南山区',
        detail: '深圳大学南校区',
        tag: 'school',
        isDefault: false,
      },
    ],
    messages: [
      {
        id: 'message-1',
        kind: 'feedback',
        title: '问题反馈',
        body: '您的反馈我们已经收到，我们会及时跟踪改进，感谢一路有你。',
        createdAt: '2026-05-17 16:30:10',
      },
      {
        id: 'message-2',
        kind: 'order',
        title: '订单通知',
        body: '您的订单已支付成功，商家正在备货。',
        createdAt: '2026-05-17 16:30:10',
      },
      {
        id: 'message-3',
        kind: 'feedback',
        title: '问题反馈',
        body: '帮助中心已更新会员登录说明。',
        createdAt: '2026-05-16 09:12:08',
      },
    ],
    helpTopics: [
      {
        id: 'member',
        title: '会员帮助',
        articles: ['如何修改登录密码？', '账号登录', '发现账号异常怎么办？'],
      },
      {
        id: 'return',
        title: '退货换货',
        articles: ['7 天无理由退货怎么申请？', '换货需要提供什么凭证？'],
      },
      {
        id: 'contact',
        title: '联系我们',
        articles: ['在线客服工作时间 9:00–21:00', '邮箱 support@example.com'],
      },
    ],
    settings: {
      notifications: true,
    },
  }
}
