<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'MigrationPendingView' })

const route = useRoute()
const routeName = computed(() => String(route.name ?? route.path))
</script>

<template>
  <section class="migration-pending" aria-labelledby="migration-pending-title">
    <h2 id="migration-pending-title">{{ routeName }}</h2>
    <p>URL 契约已迁移，页面将在后续业务轮次实现。</p>
    <dl>
      <div>
        <dt>旧页面</dt>
        <dd>{{ route.meta.legacyView ?? '未记录' }}</dd>
      </div>
      <div>
        <dt>来源模块</dt>
        <dd>{{ route.meta.sourceModule ?? '系统路由' }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.migration-pending {
  max-width: 640px;
  margin: 32px auto 0;
  padding: 24px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #fff;
}

h2,
p,
dl,
dd {
  margin: 0;
}

p,
dl {
  margin-top: 16px;
}

dl div + div {
  margin-top: 12px;
}

dt {
  color: #64748b;
  font-size: 14px;
}

dd {
  margin-top: 4px;
  overflow-wrap: anywhere;
}
</style>
