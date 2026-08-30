import 'vue-router'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    migrationStatus: 'pending-view' | 'migrated' | 'system'
    sourceModule?: string
    legacyView?: string
    legacyIndex?: number
    showTabbar?: boolean
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}
