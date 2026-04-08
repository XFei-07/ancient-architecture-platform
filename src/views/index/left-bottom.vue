<script setup lang="ts">
import { reactive } from "vue";
import SeamlessScroll from "@/components/seamless-scroll";

const list = [
  { year: "1925年", place: "北京·故宫", event: "故宫博物院成立，明清皇宫建筑进入系统化公众保护阶段" },
  { year: "1933年", place: "河北·赵州桥", event: "营造学社开展系统测绘，隋代古桥结构研究形成经典范式" },
  { year: "1961年", place: "全国·首批国保", event: "首批全国重点文保公布，明清皇宫、古民居与古桥纳入国家保护体系" },
  { year: "1982年", place: "北京·平遥等", event: "历史文化名城制度建立，古民居与古官署片区保护机制逐步完善" },
  { year: "1987年", place: "北京·故宫", event: "明清皇宫建筑列入世界遗产，系统修缮与展示标准持续提升" },
  { year: "1997年", place: "山西·平遥古城", event: "明清县城格局申遗成功，官署与民居协同保护进入长期机制" },
  { year: "2000年", place: "安徽·西递宏村", event: "皖南古村落列入世界遗产，传统民居聚落保护体系进一步强化" },
  { year: "2008年", place: "福建·土楼", event: "福建土楼申遗成功，防御型传统民居获得更系统的保护支持" },
  { year: "2014年", place: "京杭大运河", event: "大运河申遗成功，沿线古桥与历史桥梁节点保护同步推进" },
  { year: "2019年", place: "山西·平遥县衙", event: "古官署建筑数字化建档与修缮评估持续推进，形成可追溯管理链路" },
  { year: "2022年", place: "北京·故宫", event: "古建预防性保护与数字化监测深化，皇宫建筑维护转向长期监测模式" },
  { year: "2024年", place: "多地·古桥与古民居", event: "四类古建数字化测绘与风险预警应用扩展，支撑精细化保护决策" },
];

const state = reactive({
  list,
  scroll: true,
});
</script>

<template>
  <div class="left_bottom_wrap">
    <SeamlessScroll
      :list="state.list"
      v-model="state.scroll"
      :singleHeight="42"
      :step="1.5"
      :limitScrollNum="5"
      :hover="true"
      :singleWaitTime="1500"
      :wheel="true"
    >
      <ul class="chronicle-list">
        <li class="chronicle-item" v-for="(item, i) in state.list" :key="item.year + i">
          <span class="col-year">{{ item.year }}</span>
          <span class="col-place">{{ item.place }}</span>
          <span class="col-event">{{ item.event }}</span>
        </li>
      </ul>
    </SeamlessScroll>
  </div>
</template>

<style scoped lang="scss">
.left_bottom_wrap {
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.chronicle-list {
  width: 100%;
}

.chronicle-item {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 4px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);

  .col-year {
    width: 64px;
    flex-shrink: 0;
    color: #D4A847;
    font-weight: bold;
    font-size: 13px;
  }

  .col-place {
    width: 110px;
    flex-shrink: 0;
    color: #C9A96E;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .col-event {
    flex: 1;
    color: #E8D5B5;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    opacity: 0.85;
  }
}
</style>
