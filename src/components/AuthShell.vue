<script setup lang="ts">
import PageHeader from './PageHeader.vue'

defineOptions({ name: 'AuthShell' })

withDefaults(
  defineProps<{
    title: string
    subtitle: string
    switchLabel?: string
    switchTo?: string
  }>(),
  {
    switchLabel: undefined,
    switchTo: undefined,
  },
)
</script>

<template>
  <div class="auth-shell">
    <PageHeader :title="title" :subtitle="subtitle" :show-search="false" />
    <main>
      <img class="logo" src="/mock/auth/logo.png" alt="JD H5" />
      <section class="auth-card">
        <div class="intro">
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>
        <slot />
      </section>
      <RouterLink v-if="switchLabel && switchTo" class="switch-link" :to="switchTo">
        {{ switchLabel }}
      </RouterLink>
      <slot name="footer" />
    </main>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 85% 8%, rgb(254 205 211 / 55%), transparent 30%),
    linear-gradient(#fff, #fff1f2);
}

main {
  display: grid;
  justify-items: center;
  padding: 26px 18px 40px;
}

.logo {
  width: 80px;
  height: 80px;
}

.auth-card {
  width: min(420px, 100%);
  margin-top: 18px;
  padding: 22px;
  border: 1px solid rgb(226 232 240 / 75%);
  border-radius: 20px;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 18px 56px rgb(136 19 55 / 10%);
}

.intro h2,
.intro p {
  margin: 0;
}

.intro h2 {
  font-size: 23px;
}

.intro p {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.switch-link {
  margin-top: 18px;
  color: #d8182d;
  font-size: 13px;
  text-decoration: none;
}

@media (min-width: 540px) {
  .auth-shell {
    width: 540px;
    margin: 0 auto;
  }
}
</style>
