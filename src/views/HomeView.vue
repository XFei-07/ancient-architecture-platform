<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import ScaleScreen from "@/components/scale-screen";
import { useSettingStore } from "@/stores/index";
import { storeToRefs } from "pinia";

const Headers = defineAsyncComponent(() => import("./header.vue"));
const Setting = defineAsyncComponent(() => import("./setting.vue"));
const MessageContent = defineAsyncComponent(() => import("@/components/Plugins/MessageContent"));

const settingStore = useSettingStore();
const { isScale, themeName } = storeToRefs(settingStore);
const wrapperStyle = {};

const themeClass = computed(() => `theme-${themeName.value}`);
const forceDesktop = new URLSearchParams(window.location.search).get("view") === "desktop";
const mobileMode = ref(
  !forceDesktop && (
    window.matchMedia("(max-width: 768px)").matches
    || window.matchMedia("(pointer: coarse)").matches
  )
);
const showOpening = ref(!mobileMode.value);
const openingLeave = ref(false);

let openingLeaveTimer: ReturnType<typeof setTimeout> | null = null;
let openingHideTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  settingStore.initSetting();
  if (mobileMode.value) return;
  openingLeaveTimer = setTimeout(() => {
    openingLeave.value = true;
  }, 1900);
  openingHideTimer = setTimeout(() => {
    showOpening.value = false;
  }, 2700);
});

onBeforeUnmount(() => {
  if (openingLeaveTimer) clearTimeout(openingLeaveTimer);
  if (openingHideTimer) clearTimeout(openingHideTimer);
});
</script>

<template>
  <main v-if="mobileMode" class="mobile-app-shell" :class="themeClass">
    <RouterView />
  </main>
  <scale-screen
    v-else
    width="1920"
    height="1080"
    :delay="80"
    :fullScreen="false"
    :boxStyle="{
      background: 'var(--theme-bg-solid)',
      overflow: isScale ? 'hidden' : 'auto',
    }"
    :wrapperStyle="wrapperStyle"
    :autoScale="isScale"
  >
    <div class="content_wrap" :class="themeClass">
      <div class="video-overlay"></div>
      <div class="opening-cinematic" :class="{ leave: openingLeave }" v-if="showOpening">
        <div class="opening-grid"></div>
        <div class="opening-title">古建筑时空分布平台</div>
        <div class="opening-subtitle">SCENARIO DASHBOARD BOOTSTRAP</div>
        <div class="opening-line"></div>
      </div>
      <div class="content_inner">
        <Headers />
        <RouterView />
        <MessageContent />
      </div>
    </div>
  </scale-screen>
  <Setting v-if="!mobileMode" />
</template>
<style lang="scss" scoped>
.mobile-app-shell {
  width: 100%;
  min-height: 100dvh;
  color: #edf8f1;
  background:
    radial-gradient(circle at 92% 4%, rgba(99, 157, 128, 0.2), transparent 34%),
    radial-gradient(circle at 0 40%, rgba(201, 169, 110, 0.1), transparent 32%),
    #07110d;
}

.content_wrap {
  --theme-bg-solid: #1a1410;
  --theme-overlay: rgba(26, 20, 16, 0.7);
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;

  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--theme-overlay);
    z-index: 1;
  }

  .content_inner {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
  }
}

.opening-cinematic {
  position: absolute;
  inset: 0;
  z-index: 6;
  background:
    radial-gradient(circle at 25% 32%, rgba(212, 168, 71, 0.3), transparent 38%),
    radial-gradient(circle at 80% 65%, rgba(91, 137, 115, 0.28), transparent 40%),
    rgba(12, 10, 8, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.opening-cinematic.leave {
  opacity: 0;
  transform: scale(1.03);
}

.opening-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(201, 169, 110, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201, 169, 110, 0.11) 1px, transparent 1px);
  background-size: 44px 44px;
  animation: opening-grid-float 9s linear infinite;
}

.opening-title {
  position: relative;
  font-size: 42px;
  font-weight: 900;
  letter-spacing: 10px;
  color: #f0d89d;
  text-shadow: 0 0 22px rgba(212, 168, 71, 0.55);
}

.opening-subtitle {
  position: relative;
  margin-top: 12px;
  font-size: 13px;
  letter-spacing: 4px;
  color: rgba(232, 213, 181, 0.78);
}

.opening-line {
  position: relative;
  margin-top: 18px;
  width: 420px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(240, 216, 157, 0.95), transparent);
  animation: opening-line-pulse 2.2s ease-in-out infinite;
}

@keyframes opening-grid-float {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(44px);
  }
}

@keyframes opening-line-pulse {
  0%, 100% {
    opacity: 0.35;
    width: 360px;
  }
  50% {
    opacity: 1;
    width: 500px;
  }
}
</style>
