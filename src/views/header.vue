<script setup lang="ts">
import { onBeforeUnmount, reactive } from "vue";
import dayjs from 'dayjs';
import type {DateDataType} from "./index.d"
import {useSettingStore} from "@/stores/index"

const dateData = reactive<DateDataType>({
  dateDay: "",
  dateYear: "",
  dateWeek: "",
  timing:null
});

const settingStore = useSettingStore()
const { setSettingShow } = settingStore
const weekday= ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

const quickActions = [
  { label: "全局检索", href: "/#/search" },
  { label: "来源与口径", href: "/source-catalog.html#scope" },
  { label: "3D展厅", href: "/3d-showroom.html" },
  { label: "导出地图PNG", event: "export-map-png" },
  { label: "导出排行CSV", event: "export-ranking-csv" },
];

const handleQuickAction = (item: { href?: string; event?: string }) => {
  if (item.href) {
    window.location.href = item.href;
    return;
  }
  if (item.event) {
    window.dispatchEvent(new Event(item.event));
  }
};

const timeFn = () => {
  dateData.timing = setInterval(() => {
    dateData.dateDay = dayjs().format("YYYY-MM-DD HH : mm : ss");
    dateData.dateWeek = weekday[dayjs().day()];
  }, 1000);
};
timeFn()

onBeforeUnmount(() => {
  if (dateData.timing) {
    clearInterval(dateData.timing as any)
  }
})
</script>

<template>
  <div class="d-flex jc-center title_wrap">
    <div class="zuojuxing"></div>
    <div class="youjuxing"></div>
    <div class="guang"></div>
    <div class="d-flex jc-center">
      <div class="title">
        <span class="title-text">中国古建筑：古建筑类国保时空分布平台</span>
      </div>
    </div>
    <div class="quick-links">
      <span
        class="quick-item"
        v-for="item in quickActions"
        :key="item.label"
        @click="handleQuickAction(item)"
      >
        {{ item.label }}
      </span>
    </div>
    <div class="timers">
      {{ dateData.dateYear }} {{ dateData.dateWeek }} {{ dateData.dateDay }}

      <div class="setting_icon"   @click="setSettingShow(true)">
          <img src="@/assets/img/headers/setting.png" alt="设置">
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.title_wrap {
  height: 60px;
  background: linear-gradient(
    to bottom,
    var(--theme-header-grad-start) 0%,
    var(--theme-header-grad-mid) 80%,
    transparent 100%
  );
  border-bottom: 1px solid var(--theme-header-border);
  position: relative;
  margin-bottom: 4px;

  .guang {
    position: absolute;
    bottom: -26px;
    background: radial-gradient(ellipse at center, var(--theme-accent-glow) 0%, transparent 70%);
    width: 100%;
    height: 56px;
  }

  .zuojuxing,
  .youjuxing {
    position: absolute;
    top: -2px;
    width: 140px;
    height: 3px;
    background: linear-gradient(to right, transparent, var(--theme-accent-muted), transparent);
  }

  .zuojuxing {
    left: 11%;
  }

  .youjuxing {
    right: 11%;
  }

  .timers {
    position: absolute;
    right: 0;
    top: 34px;
    font-size: 17px;
    display: flex;
    align-items: center;
    color: var(--theme-text);

    .setting_icon {
      width: 20px;
      height: 20px;
      cursor: pointer;
      margin-left: 12px;
      img{
        width: 100%;
        height: 100%;
      }
    }
  }

  .quick-links {
    position: absolute;
    left: 6px;
    top: 34px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    max-width: 980px;
  }

  .quick-item {
    font-size: 11px;
    color: rgba(232, 213, 181, 0.72);
    border: 1px solid rgba(201, 169, 110, 0.28);
    background: rgba(26, 20, 16, 0.3);
    padding: 2px 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      color: var(--theme-title-mid);
      opacity: 1;
      border-color: var(--theme-accent-border-strong);
    }
  }
}
.title {
  position: relative;
  text-align: center;
  background-size: cover;
  color: transparent;
  height: 60px;
  line-height: 46px;

  .title-text {
    font-size: 38px;
    font-weight: 900;
    letter-spacing: 6px;
    width: 100%;
    background: linear-gradient(
      92deg,
      var(--theme-title-start) 0%,
      var(--theme-title-mid) 48.8525390625%,
      var(--theme-title-end) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
</style>
