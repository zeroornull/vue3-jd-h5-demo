<script setup lang="ts">
defineOptions({ name: 'NoPermissionView' })
</script>

<template>
  <section class="no-permission">
    <p class="status">403</p>
    <h2>没有访问权限</h2>
    <RouterLink to="/index">返回首页</RouterLink>
  </section>
</template>

<style scoped>
.no-permission {
  padding: 48px 24px;
  text-align: center;
}

.status,
h2 {
  margin: 0;
}

.status {
  color: #64748b;
  font-size: 48px;
  font-weight: 700;
}

h2 {
  margin-top: 8px;
}

a {
  display: inline-block;
  margin-top: 24px;
}
</style>
