<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { graphic } from "echarts/core";
import { comparePeriods, linkedProvince, provinceTrendData } from "./compare-link";

// 从下往上排列，山西在最顶端
const provinces = ["安徽", "陕西", "江苏", "河北", "四川", "浙江", "河南", "山西"];
const values = [87, 100, 106, 138, 140, 145, 157, 421];

const option = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    backgroundColor: "rgba(26,20,16,.9)",
    borderColor: "rgba(201,169,110,.6)",
    textStyle: { color: "#F5F0E8" },
    formatter: function (params: any) {
      return params[0].name + "：" + params[0].value + " 处";
    },
  },
  grid: {
    left: "10px",
    right: "40px",
    bottom: "6px",
    top: "18px",
    containLabel: true,
  },
  xAxis: {
    type: "value",
    axisLine: { lineStyle: { color: "rgba(201,169,110,.2)" } },
    splitLine: { lineStyle: { color: "rgba(201,169,110,.1)" } },
    axisLabel: { color: "#E8D5B5", fontSize: 11 },
  },
  yAxis: {
    type: "category",
    data: provinces,
    axisLine: { lineStyle: { color: "rgba(201,169,110,.2)" } },
    axisTick: { show: false },
    axisLabel: {
      color: "#E0E0E0",
      fontSize: 13,
      interval: 0,
      hideOverlap: false,
    },
  },
  series: [
    {
      type: "bar",
      data: values,
      barWidth: 12,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: function (params: any) {
          if (params.name === linkedProvince.value) {
            return new graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "rgba(212,168,71,0.24)" },
              { offset: 1, color: "#D4A847" },
            ]);
          }
          return new graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: "rgba(140,67,86,0.15)" },
            { offset: 1, color: "#8C4356" },
          ]);
        },
      },
      label: {
        show: true,
        position: "right",
        color: "#E8D5B5",
        fontSize: 12,
        formatter: "{c} 处",
      },
    },
  ],
}));

const compareRows = computed(() => {
  const rowData = provinceTrendData[linkedProvince.value]?.share || [0, 0, 0, 0, 0];
  return comparePeriods.map((period, index) => ({ period, value: rowData[index] }));
});

const onBarClick = (params: any) => {
  if (params?.name && provinceTrendData[params.name]) {
    linkedProvince.value = params.name;
    window.dispatchEvent(new CustomEvent("sync-map-province", { detail: { province: params.name } }));
  }
};

const exportRankingCsv = () => {
  const rows = provinces
    .map((name, index) => {
      const shares = provinceTrendData[name]?.share || [0, 0, 0, 0, 0];
      return [name, values[index], ...shares];
    })
    .sort((a, b) => Number(b[1]) - Number(a[1]));
  const header = ["省份", "古建筑类国保处数（最新口径）", ...comparePeriods.map((item) => `${item}占比%`)];
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `四类古建省份排行_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  window["$message"]?.success("省份排行 CSV 已导出。");
};

const handleExportRankingCsv = () => exportRankingCsv();

onMounted(() => {
  window.addEventListener("export-ranking-csv", handleExportRankingCsv);
});

onBeforeUnmount(() => {
  window.removeEventListener("export-ranking-csv", handleExportRankingCsv);
});
</script>

<template>
  <div class="right_center_chart">
    <v-chart class="chart" :option="option" @click="onBarClick" />
    <div class="compare-mini">
      <div class="compare-head">联动对比：{{ linkedProvince }} · 四类历史时期结构</div>
      <div class="compare-row" v-for="item in compareRows" :key="item.period">
        <span class="period">{{ item.period }}</span>
        <div class="bar-track">
          <span class="bar-fill" :style="{ width: item.value + '%' }"></span>
        </div>
        <span class="val">{{ item.value }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.right_center_chart {
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  height: 260px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .chart {
    width: 100%;
    height: 176px;
  }
}

.compare-mini {
  border-top: 1px solid rgba(201, 169, 110, 0.14);
  padding-top: 4px;
}

.compare-head {
  font-size: 11px;
  color: rgba(232, 213, 181, 0.7);
  margin-bottom: 4px;
}

.compare-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.period {
  width: 52px;
  font-size: 10px;
  color: rgba(232, 213, 181, 0.68);
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 4px;
  border-radius: 3px;
  background: rgba(201, 169, 110, 0.12);
  overflow: hidden;
}

.bar-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(91, 137, 115, 0.45), rgba(212, 168, 71, 0.72));
}

.val {
  width: 28px;
  text-align: right;
  font-size: 10px;
  color: rgba(240, 216, 157, 0.78);
  flex-shrink: 0;
}
</style>
