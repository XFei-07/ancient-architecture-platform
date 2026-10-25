<template>
  <section
    ref="box"
    :style="{ ...styles.box, ...boxStyle }"
    :class="[
      'v-screen-box',
      { 'is-ready': layoutReady, 'is-mobile-flow': isMobileFlow },
    ]"
  >
    <div
      ref="screenWrapper"
      :style="{ ...styles.wrapper, ...wrapperStyle }"
      class="screen-wrapper"
    >
      <slot></slot>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import type { CSSProperties, PropType } from "vue";

type AutoScale = boolean | { x?: boolean; y?: boolean };

const props = defineProps({
  width: {
    type: [String, Number] as PropType<string | number>,
    default: 1920,
  },
  height: {
    type: [String, Number] as PropType<string | number>,
    default: 1080,
  },
  fullScreen: {
    type: Boolean,
    default: false,
  },
  autoScale: {
    type: [Object, Boolean] as PropType<AutoScale>,
    default: true,
  },
  delay: {
    type: Number,
    default: 80,
  },
  mobileBreakpoint: {
    type: Number,
    default: 768,
  },
  mobileFlow: {
    type: Boolean,
    default: true,
  },
  boxStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
  wrapperStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
});

const styles: Record<string, CSSProperties> = {
  box: {
    overflow: "hidden",
    background: "#000",
    width: "100vw",
    height: "100vh",
  },
  wrapper: {
    position: "relative",
    overflow: "hidden",
    zIndex: 100,
    transformOrigin: "left top",
  },
};

const screenWrapper = ref<HTMLElement | null>(null);
const box = ref<HTMLElement | null>(null);
const layoutReady = ref(false);
const isMobileFlow = ref(false);
const state = reactive({
  width: Number(props.width) || 1920,
  height: Number(props.height) || 1080,
});

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
let resizeObserver: ResizeObserver | null = null;

const viewportSize = () => {
  const viewport = window.visualViewport;
  return {
    width: Math.round(viewport?.width || box.value?.clientWidth || window.innerWidth),
    height: Math.round(viewport?.height || box.value?.clientHeight || window.innerHeight),
  };
};

const applyLayout = () => {
  const wrapper = screenWrapper.value;
  const container = box.value;
  if (!wrapper || !container) return;

  const viewport = viewportSize();
  const mobile = props.mobileFlow && viewport.width <= props.mobileBreakpoint;
  isMobileFlow.value = mobile;

  if (mobile) {
    wrapper.style.width = "100%";
    wrapper.style.height = "auto";
    wrapper.style.minHeight = `${viewport.height}px`;
    wrapper.style.transform = "none";
    wrapper.style.margin = "0";
    container.style.overflowX = "hidden";
    container.style.overflowY = "auto";
    layoutReady.value = true;
    return;
  }

  wrapper.style.width = `${state.width}px`;
  wrapper.style.height = `${state.height}px`;
  wrapper.style.minHeight = "0";
  container.style.overflow = props.autoScale ? "hidden" : "auto";

  if (!props.autoScale) {
    wrapper.style.transform = "none";
    wrapper.style.margin = "0";
    layoutReady.value = true;
    return;
  }

  const widthScale = viewport.width / state.width;
  const heightScale = viewport.height / state.height;

  if (props.fullScreen) {
    wrapper.style.transform = `scale(${widthScale}, ${heightScale})`;
    wrapper.style.margin = "0";
  } else {
    const scale = Math.min(widthScale, heightScale);
    let offsetX = Math.max((viewport.width - state.width * scale) / 2, 0);
    let offsetY = Math.max((viewport.height - state.height * scale) / 2, 0);
    if (typeof props.autoScale === "object") {
      if (props.autoScale.x === false) offsetX = 0;
      if (props.autoScale.y === false) offsetY = 0;
    }
    wrapper.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
    wrapper.style.margin = "0";
  }

  layoutReady.value = true;
};

const scheduleLayout = (immediate = false) => {
  if (resizeTimer) clearTimeout(resizeTimer);
  if (immediate) {
    applyLayout();
    return;
  }
  resizeTimer = setTimeout(applyLayout, Math.max(16, props.delay));
};

watch(
  () => [props.width, props.height, props.autoScale, props.fullScreen],
  () => {
    state.width = Number(props.width) || 1920;
    state.height = Number(props.height) || 1080;
    nextTick(() => scheduleLayout(true));
  }
);

onMounted(() => {
  nextTick(() => {
    scheduleLayout(true);
    window.addEventListener("resize", applyLayout, { passive: true });
    window.addEventListener("orientationchange", applyLayout, { passive: true });
    window.visualViewport?.addEventListener("resize", applyLayout, { passive: true });
    if (box.value && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => scheduleLayout());
      resizeObserver.observe(box.value);
    }
  });
});

onBeforeUnmount(() => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeObserver?.disconnect();
  window.removeEventListener("resize", applyLayout);
  window.removeEventListener("orientationchange", applyLayout);
  window.visualViewport?.removeEventListener("resize", applyLayout);
});
</script>

<style scoped>
.v-screen-box {
  position: relative;
  opacity: 0;
  transition: opacity 120ms ease;
}

.v-screen-box.is-ready {
  opacity: 1;
}

.screen-wrapper {
  will-change: transform;
}

.v-screen-box.is-ready:not(.is-mobile-flow) .screen-wrapper {
  transition: transform 140ms ease-out;
}

.v-screen-box.is-mobile-flow {
  width: 100% !important;
  height: 100dvh !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
}

.v-screen-box.is-mobile-flow .screen-wrapper {
  overflow: visible !important;
}
</style>
