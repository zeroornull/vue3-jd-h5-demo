<template>
  <section class="not-found">
    <p class="status">404</p>
    <h2>页面不存在</h2>
    <RouterLink to="/index">返回迁移首页</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
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
