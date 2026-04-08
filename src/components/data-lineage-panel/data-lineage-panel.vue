<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    level?: string;
    time?: string;
    source?: string;
    method?: string;
    meta?: string;
    sourceLink?: string;
    dataVersion?: string;
    updatedAt?: string;
    formula?: string;
    sampleSize?: string;
    limitations?: string;
    positionTop?: number;
    positionRight?: number;
    width?: number;
  }>(),
  {
    level: "",
    time: "",
    source: "",
    method: "",
    meta: "",
    sourceLink: "",
    dataVersion: "",
    updatedAt: "",
    formula: "",
    sampleSize: "",
    limitations: "",
    positionTop: 24,
    positionRight: 6,
    width: 380,
  }
);

const isOpen = ref(false);

const hasLineage = computed(
  () =>
    !!(
      props.level ||
      props.time ||
      props.source ||
      props.method ||
      props.meta ||
      props.dataVersion ||
      props.updatedAt ||
      props.formula ||
      props.sampleSize ||
      props.limitations
    )
);

const basicRows = computed(() =>
  [
    { key: "level", label: "可信等级", value: props.level },
    { key: "time", label: "时间", value: props.time },
    { key: "source", label: "来源", value: props.source },
    { key: "method", label: "处理方法", value: props.method },
  ].filter((item) => !!item.value)
);

const traceRows = computed(() =>
  [
    { key: "version", label: "数据版本号", value: props.dataVersion },
    { key: "updated", label: "更新时间", value: props.updatedAt },
    { key: "formula", label: "计算公式", value: props.formula },
    { key: "sample", label: "样本量", value: props.sampleSize },
  ].filter((item) => !!item.value)
);

const closeDrawer = () => {
  isOpen.value = false;
};

const toggleDrawer = () => {
  isOpen.value = !isOpen.value;
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeDrawer();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="lineage-wrap" v-if="hasLineage">
    <button class="lineage-btn" @click="toggleDrawer">
      {{ isOpen ? "收起来源" : "来源口径" }}
    </button>

    <teleport to="body">
      <transition name="lineage-fade">
        <div class="lineage-overlay" v-if="isOpen" @click="closeDrawer">
          <aside
            class="lineage-drawer"
            :style="{ top: `${positionTop}px`, right: `${positionRight}px`, width: `${width}px` }"
            @click.stop
          >
            <div class="lineage-head">
              <div class="lineage-title">数据来源与追溯详情</div>
              <button class="lineage-close-btn" @click="closeDrawer">×</button>
            </div>
            <div class="lineage-sub">用于答辩口径说明与现场追问追溯。</div>

            <div class="lineage-body beautify-scroll-def">
              <div class="lineage-section" v-if="basicRows.length">
                <div class="section-title">基础信息</div>
                <div class="lineage-row" v-for="item in basicRows" :key="item.key">
                  <span class="k">{{ item.label }}</span>
                  <span class="v">{{ item.value }}</span>
                </div>
              </div>

              <div class="lineage-section" v-if="traceRows.length">
                <div class="section-title">追溯字段</div>
                <div class="lineage-row" v-for="item in traceRows" :key="item.key">
                  <span class="k">{{ item.label }}</span>
                  <span class="v">{{ item.value }}</span>
                </div>
              </div>

              <div class="lineage-section" v-if="meta">
                <div class="section-title">口径/摘要</div>
                <div class="lineage-text">{{ meta }}</div>
              </div>

              <div class="lineage-section" v-if="limitations">
                <div class="section-title">局限性</div>
                <div class="lineage-text">{{ limitations }}</div>
              </div>
            </div>

            <div class="lineage-actions">
              <a
                class="lineage-source-link"
                v-if="sourceLink"
                :href="sourceLink"
              >
                查看来源目录
              </a>
              <button class="lineage-action-btn" @click="closeDrawer">关闭</button>
            </div>
          </aside>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped lang="scss">
.lineage-wrap {
  position: absolute;
  right: 8px;
  top: 2px;
  z-index: 21;
}

.lineage-btn {
  border: 1px solid rgba(91, 137, 115, 0.35);
  background: rgba(26, 20, 16, 0.46);
  color: rgba(157, 201, 177, 0.84);
  border-radius: 14px;
  font-size: 10px;
  line-height: 1.1;
  padding: 3px 10px;
  cursor: pointer;
  opacity: 0.72;
}

.lineage-btn:hover {
  opacity: 0.95;
}

.lineage-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 998;
}

.lineage-drawer {
  position: fixed;
  z-index: 999;
  border: 1px solid rgba(201, 169, 110, 0.36);
  background: rgba(20, 16, 12, 0.97);
  border-radius: 10px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.44);
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 36px);
  display: flex;
  flex-direction: column;
  padding: 10px;
  transform-origin: top right;
  animation: lineageDrawerIn 0.2s ease;
}

@keyframes lineageDrawerIn {
  from {
    transform: translateX(16px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.lineage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lineage-title {
  color: rgba(240, 216, 157, 0.9);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.lineage-sub {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(217, 193, 154, 0.72);
}

.lineage-close-btn {
  width: 22px;
  height: 22px;
  border: 1px solid rgba(212, 168, 71, 0.45);
  border-radius: 50%;
  background: transparent;
  color: rgba(240, 216, 157, 0.86);
  cursor: pointer;
}

.lineage-body {
  margin-top: 10px;
  overflow-y: auto;
  padding-right: 2px;
}

.lineage-section {
  border: 1px solid rgba(201, 169, 110, 0.18);
  border-radius: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 8px;
}

.section-title {
  font-size: 11px;
  color: rgba(240, 216, 157, 0.86);
  margin-bottom: 5px;
  letter-spacing: 0.4px;
}

.lineage-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 5px;
}

.k {
  width: 72px;
  flex-shrink: 0;
  font-size: 11px;
  color: rgba(232, 213, 181, 0.62);
}

.v {
  flex: 1;
  font-size: 11px;
  color: rgba(232, 213, 181, 0.88);
  line-height: 1.4;
  white-space: pre-line;
}

.lineage-text {
  font-size: 11px;
  line-height: 1.5;
  color: rgba(232, 213, 181, 0.84);
  white-space: pre-line;
}

.lineage-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.lineage-source-link {
  display: inline-block;
  font-size: 11px;
  color: rgba(212, 168, 71, 0.88);
  text-decoration: none;
}

.lineage-source-link:hover {
  text-decoration: underline;
}

.lineage-action-btn {
  border: 1px solid rgba(212, 168, 71, 0.45);
  border-radius: 8px;
  background: rgba(26, 20, 16, 0.82);
  color: rgba(240, 216, 157, 0.9);
  font-size: 11px;
  padding: 3px 10px;
  cursor: pointer;
}

.lineage-fade-enter-active,
.lineage-fade-leave-active {
  transition: opacity 0.2s ease;
}

.lineage-fade-enter-from,
.lineage-fade-leave-to {
  opacity: 0;
}
</style>
