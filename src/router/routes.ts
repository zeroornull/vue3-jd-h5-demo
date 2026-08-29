import type { RouteRecordRaw } from 'vue-router'

interface RouteModule {
  default: RouteRecordRaw | RouteRecordRaw[]
}

const routeModules = import.meta.glob<RouteModule>('./modules/*.ts', {
  eager: true,
})

export const routes: RouteRecordRaw[] = Object.entries(routeModules)
  .sort(([left], [right]) => left.localeCompare(right))
  .flatMap(([, routeModule]) =>
    Array.isArray(routeModule.default) ? routeModule.default : [routeModule.default],
  )
