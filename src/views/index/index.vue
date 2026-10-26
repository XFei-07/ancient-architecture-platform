<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const forceDesktop = new URLSearchParams(window.location.search).get("view") === "desktop";
const compactDevice = !forceDesktop && (
  window.matchMedia("(max-width: 768px)").matches
  || window.matchMedia("(pointer: coarse)").matches
);

const MobileHome = defineAsyncComponent(() => import("./mobile-home.vue"));
const DesktopDashboard = defineAsyncComponent(() => import("./desktop-dashboard.vue"));
const activeDashboard = compactDevice ? MobileHome : DesktopDashboard;
</script>

<template>
  <Suspense>
    <component :is="activeDashboard" />
    <template #fallback>
      <div class="route-loading" aria-label="页面加载中">
        <span></span>
        <p>正在铺展古建图谱</p>
      </div>
    </template>
  </Suspense>
</template>

<style scoped>
.route-loading {
  min-height: 100dvh;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  color: #9fc8b3;
  background: #07110d;
  font-size: 13px;
  letter-spacing: 2px;
}

.route-loading span {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-top-color: #c9a96e;
  border-radius: 50%;
  animation: route-spin 0.8s linear infinite;
}

@keyframes route-spin {
  to { transform: rotate(360deg); }
}
</style>
