<script setup lang="ts">
import { computed, ref ,onBeforeUpdate, nextTick} from "vue";
import { merge } from "lodash-es";
import { useElementSize  } from "@vueuse/core";
import type { PropType } from "vue";

const props = defineProps({
  color: {
    type: Array as unknown as PropType<[string, string]>,
    default: () => [],
  },
  backgroundColor: {
    type: String,
    default: "transparent",
  },
});
const defaultColor = ["#C9A96E", "#D4A847"];
const domRef = ref(null);
const { width, height } = useElementSize(domRef,{width:0,height:0}, { box: 'border-box' });
const mergedColor = computed<[string, string]>(() => {
  return merge(defaultColor, props.color);
});


</script>

<template>
  <div class="dv-border-box-13 dv-border-box" ref="domRef">
    <svg :width="width" :height="height" class="dv-border-svg-container">
      <!-- 外层圆角矩形边框 -->
      <rect
        x="3" y="3"
        :width="width - 6" :height="height - 6"
        rx="4" ry="4"
        :fill="backgroundColor"
        :stroke="mergedColor[0]"
        stroke-width="1.2"
      />
      <!-- 内层圆角矩形边框（双线效果） -->
      <rect
        x="7" y="7"
        :width="width - 14" :height="height - 14"
        rx="3" ry="3"
        fill="transparent"
        :stroke="mergedColor[1]"
        stroke-width="0.6"
        stroke-opacity="0.5"
      />

      <!-- 左上角回字纹装饰 -->
      <g>
        <polyline :stroke="mergedColor[0]" stroke-width="1.5" fill="none"
          :points="`3,18 3,3 18,3`" />
        <polyline :stroke="mergedColor[1]" stroke-width="1" fill="none"
          :points="`7,22 7,7 22,7`" />
        <polyline :stroke="mergedColor[0]" stroke-width="0.8" fill="none"
          :points="`11,18 11,11 18,11`" />
      </g>

      <!-- 右上角回字纹装饰 -->
      <g>
        <polyline :stroke="mergedColor[0]" stroke-width="1.5" fill="none"
          :points="`${width-18},3 ${width-3},3 ${width-3},18`" />
        <polyline :stroke="mergedColor[1]" stroke-width="1" fill="none"
          :points="`${width-22},7 ${width-7},7 ${width-7},22`" />
        <polyline :stroke="mergedColor[0]" stroke-width="0.8" fill="none"
          :points="`${width-18},11 ${width-11},11 ${width-11},18`" />
      </g>

      <!-- 左下角回字纹装饰 -->
      <g>
        <polyline :stroke="mergedColor[0]" stroke-width="1.5" fill="none"
          :points="`3,${height-18} 3,${height-3} 18,${height-3}`" />
        <polyline :stroke="mergedColor[1]" stroke-width="1" fill="none"
          :points="`7,${height-22} 7,${height-7} 22,${height-7}`" />
        <polyline :stroke="mergedColor[0]" stroke-width="0.8" fill="none"
          :points="`11,${height-18} 11,${height-11} 18,${height-11}`" />
      </g>

      <!-- 右下角回字纹装饰 -->
      <g>
        <polyline :stroke="mergedColor[0]" stroke-width="1.5" fill="none"
          :points="`${width-3},${height-18} ${width-3},${height-3} ${width-18},${height-3}`" />
        <polyline :stroke="mergedColor[1]" stroke-width="1" fill="none"
          :points="`${width-7},${height-22} ${width-7},${height-7} ${width-22},${height-7}`" />
        <polyline :stroke="mergedColor[0]" stroke-width="0.8" fill="none"
          :points="`${width-18},${height-11} ${width-11},${height-11} ${width-11},${height-18}`" />
      </g>
    </svg>
    <div class="dv-border-box-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dv-border-box {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 3px rgba(201, 169, 110, 0.3));
}
.dv-border-svg-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  display: block;
}
.dv-border-box-content {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
