<script setup lang="ts">
import BorderBox13 from "@/components/datav/border-box-13";
import DataLineagePanel from "@/components/data-lineage-panel";
const props = withDefaults(
  defineProps<{
    // 标题
    title: number | string;
    // 可信度标签（官方统计/公开整理/研究参考）
    credLevel?: string;
    // 口径说明
    credMeta?: string;
    // 时间点
    credTime?: string;
    // 来源
    credSource?: string;
    // 处理方法
    credMethod?: string;
    // 来源链接
    sourceLink?: string;
    // 数据追溯字段
    credVersion?: string;
    credUpdatedAt?: string;
    credFormula?: string;
    credSampleSize?: string;
    credLimitations?: string;
    // 来源按钮与面板定位
    lineageTop?: number;
    lineageRight?: number;
    lineageWidth?: number;
  }>(),
  {
    title: "",
    credLevel: "",
    credMeta: "",
    credTime: "",
    credSource: "",
    credMethod: "",
    sourceLink: "",
    credVersion: "",
    credUpdatedAt: "",
    credFormula: "",
    credSampleSize: "",
    credLimitations: "",
    lineageTop: 24,
    lineageRight: 6,
    lineageWidth: 380,
  }
);
</script>

<template>
  <BorderBox13>
    <div class="item_title" v-if="title !== ''">
      <div class="zuo"></div>
      <span class="title-inner"> &nbsp;&nbsp;{{ title }}&nbsp;&nbsp; </span>
      <div class="you"></div>
    </div>
    <div
      :class="title !== '' ? 'item_title_content' : 'item_title_content_def'"
      class="item_content_wrap"
    >
      <DataLineagePanel
        :level="credLevel"
        :time="credTime"
        :source="credSource"
        :method="credMethod"
        :meta="credMeta"
        :source-link="sourceLink"
        :data-version="credVersion"
        :updated-at="credUpdatedAt"
        :formula="credFormula"
        :sample-size="credSampleSize"
        :limitations="credLimitations"
        :position-top="lineageTop"
        :position-right="lineageRight"
        :width="lineageWidth"
      />
      <slot></slot></div
  ></BorderBox13>
</template>

<style scoped lang="scss">
$item-title-height: 38px;
$item_title_content-height: calc(100% - 38px);

.item_title {
  height: $item-title-height;
  line-height: $item-title-height;
  width: 100%;
  color: #D4A847;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .zuo,
  .you {
    width: 58px;
    height: 2px;
    background: linear-gradient(to right, transparent, #C9A96E);
  }

  .you {
    background: linear-gradient(to left, transparent, #C9A96E);
  }
  .title-inner {
    font-weight: 900;
    letter-spacing: 2px;
    background: linear-gradient(
      92deg,
      #C9A96E 0%,
      #F0D89D 48.8525390625%,
      #C9A96E 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

:deep(.dv-border-box-content)  {
    box-sizing: border-box;
    padding: 6px 16px 0px;
  }

.item_title_content {
  height: $item_title_content-height;
}

.item_title_content_def {
  width: 100%;
  height: 100%;
}

.item_content_wrap {
  position: relative;
}
</style>
