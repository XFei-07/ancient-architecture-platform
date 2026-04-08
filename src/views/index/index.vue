<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import ItemWrap from "@/components/item-wrap";
import LeftTop from "./left-top.vue";
import LeftCenter from "./left-center.vue";
import LeftBottom from "./left-bottom.vue";
import CenterMap from "./center-map.vue";
import CenterBottom from "./center-bottom.vue";
import RightTop from "./right-top.vue";
import RightCenter from "./right-center.vue";
import RightBottom from "./right-bottom.vue";
import { useRoute } from "vue-router";
import { linkedProvince, provinceTrendData } from "./compare-link";

const videoBgRef = ref<HTMLVideoElement | null>(null);
const route = useRoute();
const linkedByQuery = ref(false);

const applySearchLinkage = async () => {
  const province = String(route.query.province || "").trim();
  const from = String(route.query.from || "").trim();
  if (!province || linkedByQuery.value) return;
  if (!provinceTrendData[province]) return;

  linkedProvince.value = province as keyof typeof provinceTrendData;
  await nextTick();
  window.dispatchEvent(new CustomEvent("sync-map-province", { detail: { province } }));
  if (from === "search") {
    window["$message"]?.success?.(`已根据检索结果联动：${province}`);
  }
  linkedByQuery.value = true;
};

onMounted(() => {
  if (videoBgRef.value) {
    videoBgRef.value.playbackRate = 0.8;
  }
  applySearchLinkage();
});

watch(
  () => route.fullPath,
  () => {
    linkedByQuery.value = false;
    applySearchLinkage();
  }
);
</script>

<template>
  <div class="index-box">
    <!-- Video background -->
    <video class="video-bg" autoplay muted loop playsinline ref="videoBgRef">
      <source src="/video/f1feb4f37e2d379716cfb28da0019469_raw.mp4" type="video/mp4" />
    </video>
    <div class="contetn_left">
      <!-- <div class="pagetab">
        <div class="item">实时监测</div>
        <div class="item">统计分析</div>
      </div> -->
      <ItemWrap
        class="contetn_left-top contetn_lr-item"
        title="古建筑类国保核心数据（最新公开源口径）"
        cred-level="官方统计"
        cred-meta="古建筑类国保数量2170处；全国重点文保总数5061处"
        cred-time="最新公开源（2026-04-03）"
        cred-source="国家文物局相关公开数据接口"
        cred-method="公开接口拉取→字段清洗→指标汇总（同步口径）"
        cred-version="v2026.04-official-5061-2170"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="古建筑类占比 = 2170 / 5061 × 100%"
        cred-sample-size="全国31省级行政区（含自治区、直辖市）"
        cred-limitations="省级口径可用于分布对比；不代表单体完好度、修缮投入与开放状态。"
        source-link="/source-catalog.html#official"
      >
        <LeftTop />
      </ItemWrap>
      <ItemWrap
        class="contetn_left-center contetn_lr-item"
        title="1911年前四类古建样本构成"
        cred-level="研究参考"
        cred-meta="仅展示民居/官府/皇宫/桥梁四类样本结构"
        cred-time="1911年前口径"
        cred-source="公开建筑史料与项目样本库整理"
        cred-method="四类筛选→类别映射→样本聚合→占比计算"
        cred-version="v2026.04-category-1911"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="类别占比 = 类别样本数 / 四类样本总数 × 100%"
        cred-sample-size="1911年前四类古建样本（民居/官府/皇宫/桥梁）"
        cred-limitations="样本为研究整理口径，不等同全国古建全量普查。"
        source-link="/source-catalog.html#category"
      >
        <LeftCenter />
      </ItemWrap>
      <ItemWrap
        class="contetn_left-bottom contetn_lr-item"
        title="中国古建保护与研究纪事"
        cred-level="公开整理"
        cred-meta="以1911年前四类古建为对象的保护与研究时间线"
        cred-time="1925-2024"
        cred-source="公开史料与文保报道整理"
        cred-method="事件采编→对象筛选（1911年前四类）→时间序列排序→滚动展示"
        cred-version="v2026.04-timeline"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="时间线排序 = 事件发生时间升序"
        cred-sample-size="1925-2024 年保护/研究事件条目"
        cred-limitations="事件采编存在滞后；时间线用于传播与教学参考。"
        source-link="/source-catalog.html#timeline"
        style="padding: 0 10px 16px 10px"
      >
        <LeftBottom />
      </ItemWrap>
    </div>
    <div class="contetn_center">
      <CenterMap class="contetn_center_top" title="中国古建筑地域分布全景图" />
      <ItemWrap
        class="contetn_center-bottom"
        title="中国古建筑 · 青檐智问"
        cred-level="研究参考"
        cred-meta="以1911年前四类古建为核心，支持结合后续保护史料解读"
        cred-time="实时问答"
        cred-source="平台内置四类古建口径与公开知识"
        cred-method="范围约束提示词→口径注入→三段式可追溯输出"
        cred-version="v2026.04-ai-qa"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="回答结构 = 结论 + 依据来源 + 口径说明"
        cred-sample-size="平台口径知识库 + 当前会话检索上下文"
        cred-limitations="回答受语料覆盖与提示词约束影响，需结合来源目录复核。"
        source-link="/source-catalog.html#ai"
      >
        <CenterBottom />
      </ItemWrap>
    </div>
    <div class="contetn_right">
      <ItemWrap
        class="contetn_left-bottom contetn_lr-item priority-index-item"
        title="古建筑保护优先级指数（研究参考）"
        cred-level="研究参考"
        cred-meta="四维因子乘法模型：历史价值×脆弱性×可达性压力×风险压力"
        cred-time="当前版本"
        cred-source="项目内研究分组数据与指数模型"
        cred-method="四维因子量化→权重归一化→加权几何平均→敏感性调参"
        cred-version="v2026.04-priority-model"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="优先级指数 = 历史价值^w1 × 脆弱性^w2 × 可达性压力^w3 × 风险压力^w4（w归一化）"
        cred-sample-size="8省联动样本 + 四维因子评分样本"
        cred-limitations="研究模型用于比较排序，不等同官方风险评估结论。"
        :lineage-top="32"
        :lineage-right="8"
        :lineage-width="340"
        source-link="/source-catalog.html#priority"
      >
        <RightTop />
      </ItemWrap>
      <ItemWrap
        class="contetn_left-bottom contetn_lr-item"
        title="古建筑类国保省份联动排行（8省）"
        cred-level="研究参考"
        cred-meta="与联动趋势同口径的8省省级处数对比"
        cred-time="最新公开源（2026-04-03）"
        cred-source="公开史料与项目样本库整理"
        cred-method="省级处数抽取→8省联动映射→排行展示→与趋势联动"
        cred-version="v2026.04-ranking-8p"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="排序值 = 省份古建筑类国保处数（8省子集）"
        cred-sample-size="8省联动对比样本"
        cred-limitations="仅覆盖8省联动集合，不代表全国完整排名。"
        source-link="/source-catalog.html#ranking"
        style="padding: 0 10px 16px 10px"
      >
        <RightCenter />
      </ItemWrap>
      <ItemWrap
        class="contetn_left-bottom contetn_lr-item"
        title="古建核心构件图鉴"
        cred-level="公开整理"
        cred-meta="古建构件释义与案例图谱"
        cred-time="当前版本"
        cred-source="公开建筑史文献整理"
        cred-method="构件知识抽取→属性结构化→分布映射→卡片化叙事"
        cred-version="v2026.04-components"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="构件热度 = 词频权重 × 案例覆盖度（研究口径）"
        cred-sample-size="构件知识卡片与案例图谱条目"
        cred-limitations="释义以教学展示为主，地区异名与流派差异未完全展开。"
        source-link="/source-catalog.html#components"
      >
        <RightBottom />
      </ItemWrap>
    </div>
  </div>
</template>

<style scoped lang="scss">
.index-box {
  width: 100%;
  display: flex;
  min-height: calc(100% - 64px);
  justify-content: space-between;
  position: relative;
}

.video-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: -1;
  pointer-events: none;
  opacity: 0.15;
}
//左边 右边 结构一样
.contetn_left,
.contetn_right {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  position: relative;
  width: 540px;
  box-sizing: border-box;
  flex-shrink: 0;
}
.contetn_center {
  flex: 1;
  margin: 0 54px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  .contetn_center-bottom {
    height: 315px;
  }
}

.contetn_lr-item {
  height: 310px;
}

.priority-index-item :deep(.lineage-wrap) {
  top: -28px;
  right: 8px;
}
</style>
