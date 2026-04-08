<script setup lang="ts">
import { ref } from "vue";
import { graphic } from "echarts/core";

const colors = ["#8C4356", "#EBA050", "#5B8973", "#9C7A54"];

const echartsGraphic = (clrs: string[]) => {
  return new graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: clrs[0] },
    { offset: 1, color: clrs[1] },
  ]);
};

const option = ref({
  title: {
    top: "center",
    left: "center",
    text: "{name|四类构成}",
    textStyle: {
      rich: {
        name: {
          color: "#E8D5B5",
          fontSize: 14,
          lineHeight: 20,
        },
      },
    },
  },
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(26,20,16,.9)",
    borderColor: "rgba(201,169,110,.6)",
    textStyle: {
      color: "#FFF",
    },
    formatter: function (params: any) {
      return params.name + "：" + params.value + "处 (" + params.percent.toFixed(2) + "%)";
    },
  },
  series: [
    {
      name: "1911年前四类古建样本构成",
      type: "pie",
      radius: ["40%", "70%"],
      itemStyle: {
        borderRadius: 6,
        borderColor: "rgba(255,255,255,0)",
        borderWidth: 2,
      },
      color: colors,
      label: {
        show: true,
        formatter: function (params: any) {
          return "   {b|" + params.name + "}   \n   {c|" + params.value + "处}   {per|" + params.percent.toFixed(2) + "%}  ";
        },
        rich: {
          b: {
            color: "#F5F0E8",
            fontSize: 12,
            lineHeight: 26,
          },
          c: {
            color: "#D4A847",
            fontSize: 14,
          },
          per: {
            color: "#D4A847",
            fontSize: 14,
          },
        },
      },
      emphasis: {
        show: false,
      },
      legend: {
        show: false,
      },
      tooltip: { show: true },
      labelLine: {
        show: true,
        length: 20,
        length2: 36,
        smooth: 0.2,
        lineStyle: {},
      },
      data: [
        {
          value: 980,
          name: "民居",
          itemStyle: { color: echartsGraphic(["#8C4356", "#B0687A"]) },
        },
        {
          value: 430,
          name: "官府",
          itemStyle: { color: echartsGraphic(["#EBA050", "#F0C080"]) },
        },
        {
          value: 210,
          name: "皇宫",
          itemStyle: { color: echartsGraphic(["#5B8973", "#82AE9A"]) },
        },
        {
          itemStyle: { color: echartsGraphic(["#9C7A54", "#C4A882"]) },
          value: 540,
          name: "桥梁",
        },
      ],
    },
  ],
});
</script>

<template>
  <v-chart class="chart" :option="option" />
</template>

<style scoped lang="scss"></style>
