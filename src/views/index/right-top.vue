<script setup lang="ts">
import { computed, ref } from "vue";
import { graphic } from "echarts/core";
import {
  comparePeriods,
  currentPriorityScenarioPreset,
  getProvinceRelationNetwork,
  getPriorityReasonBreakdown,
  getProvincePriorityBaseModel,
  getProvincePriorityModel,
  linkedProvince,
  priorityFactorLabels,
  priorityFactorSourceNotes,
  priorityFormulaText,
  priorityScenarioIntensity,
  priorityScenarioKey,
  priorityScenarioPresets,
  prioritySourceSummary,
  priorityWeightKeys,
  priorityWeights,
  priorityWeightsInput,
  provincePriorityBaseRankMap,
  provincePriorityFactors,
  provincePriorityRanking,
  provincePriorityScenarioRankMap,
  provinceTrendData,
  resetPriorityLab,
  setPriorityScenario,
  setPriorityScenarioIntensity,
  setPriorityWeightInput,
  setProvincePriorityFactor,
  type PriorityFactorKey,
  type PriorityScenarioKey,
  type ProvinceName,
} from "./compare-link";

const option = computed(() => {
  const current = provinceTrendData[linkedProvince.value] || provinceTrendData["山西"];
  const yMax = Math.max(...current.official, ...current.folk) + 20;
  return {
    legend: {
      data: ["官府与皇宫", "民居与桥梁"],
      textStyle: { color: "#E8D5B5" },
      top: "2px",
      right: "10px",
    },
    xAxis: {
      type: "category",
      data: comparePeriods,
      boundaryGap: false,
      splitLine: {
        show: true,
        lineStyle: { color: "rgba(201,169,110,.15)" },
      },
      axisLine: {
        lineStyle: { color: "rgba(201,169,110,.2)" },
      },
      axisLabel: {
        color: "#E0E0E0",
        fontWeight: "500",
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      max: yMax,
      splitLine: {
        show: true,
        lineStyle: { color: "rgba(201,169,110,.15)" },
      },
      axisLine: {
        lineStyle: { color: "rgba(201,169,110,.2)" },
      },
      axisLabel: {
        color: "#E0E0E0",
        fontWeight: "500",
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(26,20,16,.9)",
      borderColor: "rgba(201,169,110,.6)",
      textStyle: { color: "#F5F0E8" },
      formatter: function (params: any) {
        let result = linkedProvince.value + " · " + params[0].axisValue + "<br/>";
        params.forEach(function (item: any) {
          result += item.marker + " " + item.seriesName + "：" + item.value.toLocaleString() + "（研究参考）<br/>";
        });
        return result;
      },
    },
    grid: {
      show: true,
      left: "10px",
      right: "20px",
      bottom: "10px",
      top: "32px",
      containLabel: true,
      borderColor: "#9C7A54",
    },
    series: [
      {
        name: "官府与皇宫",
        data: current.official,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        color: "#EBA050",
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(235,160,80,.5)" },
            { offset: 1, color: "rgba(235,160,80,.0)" },
          ]),
        },
      },
      {
        name: "民居与桥梁",
        data: current.folk,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        color: "#5B8973",
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(91,137,115,.5)" },
            { offset: 1, color: "rgba(91,137,115,.0)" },
          ]),
        },
      },
    ],
  };
});

const panelOpen = ref(false);
const detailOpen = ref(false);
const insightMode = ref<"trend" | "network">("trend");

const currentPriority = computed(() => getProvincePriorityModel(linkedProvince.value));
const currentPriorityBase = computed(() => getProvincePriorityBaseModel(linkedProvince.value));
const relationNetworkData = computed(() => getProvinceRelationNetwork(linkedProvince.value, currentPriority.value.factors));

const relationCategoryIndex: Record<string, number> = {
  province: 0,
  component: 1,
  period: 2,
  risk: 3,
};

const relationNodeColor: Record<string, string> = {
  province: "#D4A847",
  component: "#7BAA9E",
  period: "#8C4356",
  risk: "#C35B64",
};

const relationOption = computed(() => {
  const net = relationNetworkData.value;
  const idNameMap = new Map(net.nodes.map((item) => [item.id, item.name]));
  const nodes = net.nodes.map((item) => {
    const category = relationCategoryIndex[item.category] ?? 1;
    const isProvince = item.category === "province";
    return {
      ...item,
      category,
      symbolSize: isProvince ? 28 : Math.max(10, Math.min(18, item.value * 0.16)),
      itemStyle: {
        color: relationNodeColor[item.category] || "#C9A96E",
        borderColor: "rgba(245,240,232,0.55)",
        borderWidth: isProvince ? 1.2 : 0.8,
      },
      label: {
        show: true,
        color: isProvince ? "#F0D89D" : "rgba(232,213,181,0.9)",
        fontSize: isProvince ? 12 : 10,
      },
    };
  });

  const links = net.links.map((item) => ({
    ...item,
    sourceName: idNameMap.get(item.source) || item.source,
    targetName: idNameMap.get(item.target) || item.target,
    lineStyle: {
      width: Math.max(0.8, Math.min(3.2, item.value * 0.055)),
      color: "rgba(201,169,110,0.48)",
      opacity: 0.8,
      curveness: 0.12,
    },
  }));

  return {
    tooltip: {
      backgroundColor: "rgba(26,20,16,.94)",
      borderColor: "rgba(201,169,110,.6)",
      textStyle: { color: "#F5F0E8", fontSize: 11 },
      formatter: (params: any) => {
        if (params.dataType === "edge") {
          return `${params.data.sourceName} → ${params.data.targetName}<br/>关联强度：${params.data.value}`;
        }
        return `${params.data.name}<br/>关联值：${params.data.value}`;
      },
    },
    animation: true,
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        draggable: true,
        left: "6%",
        right: "6%",
        top: "10%",
        bottom: "10%",
        zoom: 0.86,
        scaleLimit: {
          min: 0.7,
          max: 1.8,
        },
        data: nodes,
        links,
        categories: [{ name: "省份" }, { name: "构件" }, { name: "时期" }, { name: "风险因子" }],
        force: {
          repulsion: 140,
          edgeLength: [24, 64],
          gravity: 0.22,
          friction: 0.4,
          layoutAnimation: true,
        },
        emphasis: {
          focus: "adjacency",
          label: { show: true },
        },
        lineStyle: { color: "source", opacity: 0.8 },
      },
    ],
  };
});

const relationFocusText = computed(() => {
  const net = relationNetworkData.value;
  const componentsText = net.majorComponents.slice(0, 2).join(" / ");
  const periodText = net.dominantPeriods[0] || "未标注";
  const riskText = net.majorRisks
    .slice(0, 2)
    .map((item) => `${item.label}${item.value}`)
    .join("、");
  return `主链路：${linkedProvince.value} → ${componentsText} → ${periodText}；高敏感因子：${riskText}`;
});

const currentRank = computed(() => provincePriorityScenarioRankMap.value[linkedProvince.value] || 1);
const baseRank = computed(() => provincePriorityBaseRankMap.value[linkedProvince.value] || 1);
const rankDelta = computed(() => baseRank.value - currentRank.value);
const scoreDelta = computed(() => Number((currentPriority.value.score - currentPriorityBase.value.score).toFixed(1)));

const factorRows = computed(() =>
  priorityWeightKeys.map((key) => ({
    key,
    label: priorityFactorLabels[key],
    value: currentPriority.value.factors[key],
    weight: priorityWeights.value[key],
    weightPct: Number((priorityWeights.value[key] * 100).toFixed(1)),
    weightInput: priorityWeightsInput.value[key],
  }))
);

const topPriorityList = computed(() =>
  provincePriorityRanking.value.slice(0, 5).map((item, index) => {
    const scenarioRank = index + 1;
    const baseRankVal = provincePriorityBaseRankMap.value[item.province] || scenarioRank;
    return {
      ...item,
      scenarioRank,
      baseRank: baseRankVal,
      rankDelta: baseRankVal - scenarioRank,
    };
  })
);
const topPriorityCompact = computed(() => topPriorityList.value.slice(0, 3));

const scenarioScopeText = computed(() =>
  currentPriorityScenarioPreset.value.scope === "all"
    ? "作用范围：全省份"
    : `作用范围：仅 ${linkedProvince.value}`
);
const reasonRows = computed(() => getPriorityReasonBreakdown(linkedProvince.value));

const syncProvince = (province: ProvinceName) => {
  linkedProvince.value = province;
  window.dispatchEvent(new CustomEvent("sync-map-province", { detail: { province } }));
};

const onWeightInput = (key: PriorityFactorKey, event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  setPriorityWeightInput(key, value);
};

const onFactorInput = (key: PriorityFactorKey, event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  setProvincePriorityFactor(linkedProvince.value, key, value);
};

const onScenarioIntensityInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  setPriorityScenarioIntensity(value);
};

const selectScenario = (scenarioKey: PriorityScenarioKey) => {
  setPriorityScenario(scenarioKey);
};

const resetPanel = () => {
  resetPriorityLab();
};

const currentProvinceFactor = computed(() => provincePriorityFactors.value[linkedProvince.value]);

const formatSigned = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
const formatRankDelta = (value: number) => (value === 0 ? "持平" : value > 0 ? `↑${value}` : `↓${Math.abs(value)}`);
</script>

<template>
  <div class="right-top-wrap">
    <div class="link-head">
      <div class="link-tip">联动省份：{{ linkedProvince }}</div>
      <div class="head-actions">
        <div class="score-pill">
          优先级 {{ currentPriority.score }}
          <span
            class="score-delta"
            :class="{ up: scoreDelta > 0, down: scoreDelta < 0, flat: scoreDelta === 0 }"
          >
            Δ{{ formatSigned(scoreDelta) }}
          </span>
        </div>
        <button class="detail-btn" @click="detailOpen = !detailOpen">{{ detailOpen ? "收起详情" : "展开详情" }}</button>
        <button class="panel-btn" @click="panelOpen = !panelOpen">{{ panelOpen ? "收起面板" : "调参推演" }}</button>
      </div>
    </div>
    <div class="mini-strip" v-if="!detailOpen">
      <span class="mini-item">等级：{{ currentPriority.level }}</span>
      <span class="mini-item">情景：{{ currentPriorityScenarioPreset.label }}</span>
      <span class="mini-item">排名：{{ currentRank }}（较基线{{ formatRankDelta(rankDelta) }}）</span>
      <span class="mini-item" v-if="topPriorityCompact[0]">
        Top1：{{ topPriorityCompact[0].province }} {{ topPriorityCompact[0].score }}
      </span>
    </div>
    <div class="tune-overlay" v-if="panelOpen" @click.self="panelOpen = false">
      <div class="tune-panel beautify-scroll-def">
        <div class="panel-title">情景推演</div>
        <div class="scenario-chip-wrap">
          <button
            v-for="preset in priorityScenarioPresets"
            :key="preset.key"
            class="scenario-chip"
            :class="{ active: priorityScenarioKey === preset.key }"
            @click="selectScenario(preset.key)"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="scenario-meta">{{ currentPriorityScenarioPreset.description }}</div>
        <div class="panel-row">
          <div class="panel-label">情景强度</div>
          <input
            class="slider"
            type="range"
            min="0"
            max="150"
            step="1"
            :value="priorityScenarioIntensity"
            @input="onScenarioIntensityInput"
          />
          <span class="panel-val">{{ priorityScenarioIntensity }}%</span>
        </div>
        <div class="scenario-meta">{{ scenarioScopeText }}</div>
        <div class="scenario-impact">
          <span>指数：{{ currentPriorityBase.score }} → {{ currentPriority.score }}（{{ formatSigned(scoreDelta) }}）</span>
          <span>排名：{{ baseRank }} → {{ currentRank }}（{{ formatRankDelta(rankDelta) }}）</span>
        </div>

        <div class="panel-title">权重调参（自动归一化）</div>
        <div class="panel-row" v-for="item in factorRows" :key="'w-' + item.key">
          <div class="panel-label">{{ item.label }}</div>
          <input
            class="slider"
            type="range"
            min="1"
            max="100"
            step="1"
            :value="item.weightInput"
            @input="(event) => onWeightInput(item.key, event)"
          />
          <span class="panel-val">{{ item.weightInput }} / {{ item.weightPct }}%</span>
        </div>

        <div class="panel-title">当前省份因子（{{ linkedProvince }}）</div>
        <div class="panel-row" v-for="item in factorRows" :key="'f-' + item.key">
          <div class="panel-label">{{ item.label }}</div>
          <input
            class="slider"
            type="range"
            min="1"
            max="100"
            step="1"
            :value="currentProvinceFactor[item.key]"
            @input="(event) => onFactorInput(item.key, event)"
          />
          <span class="panel-val">{{ currentProvinceFactor[item.key] }}</span>
        </div>

        <div class="panel-foot">
          <span>调参与推演仅用于研究演示，不改变官方统计口径。</span>
          <button class="reset-btn" @click="resetPanel">恢复默认</button>
        </div>
      </div>
    </div>
    <div class="insight-switch" v-if="!detailOpen">
      <div class="insight-tab-wrap">
        <button class="insight-tab" :class="{ active: insightMode === 'trend' }" @click="insightMode = 'trend'">
          趋势图
        </button>
        <button class="insight-tab" :class="{ active: insightMode === 'network' }" @click="insightMode = 'network'">
          关系网
        </button>
      </div>
      <div class="insight-caption" v-if="insightMode === 'trend'">当前展示：{{ linkedProvince }}历史时期趋势（研究参考）</div>
      <div class="insight-caption" v-else>{{ relationFocusText }}</div>
    </div>
    <div class="chart-stage" v-if="!detailOpen">
      <v-chart class="chart chart-main" :option="insightMode === 'trend' ? option : relationOption" />
    </div>
    <div class="priority-detail-overlay beautify-scroll-def" v-if="detailOpen">
      <div class="priority-detail-board">
        <div class="formula">{{ priorityFormulaText }}</div>
        <div class="source-summary">{{ prioritySourceSummary }}</div>
        <div class="source-summary">
          当前情景：{{ currentPriorityScenarioPreset.label }}（{{ priorityScenarioIntensity }}%）· {{ scenarioScopeText }}
        </div>

        <div class="factor-row" v-for="item in factorRows" :key="item.key">
          <span class="factor-label">{{ item.label }} · w={{ item.weightPct }}%</span>
          <div class="track">
            <span class="fill" :style="{ width: item.value + '%' }"></span>
          </div>
          <span class="factor-value">{{ item.value }}</span>
        </div>

        <div class="reason-title">排名原因分解（{{ linkedProvince }}）</div>
        <div class="reason-row" v-for="item in reasonRows" :key="'r-' + item.key">
          <div class="reason-main">
            <span class="reason-name">{{ item.label }}</span>
            <span class="reason-core">{{ item.factor }} × w{{ item.weightPct }}%</span>
          </div>
          <div class="reason-side">
            <span class="reason-share">贡献 {{ item.contributionPct }}%</span>
            <span class="reason-gap" :class="{ up: item.gapToTop > 0, down: item.gapToTop < 0 }">
              较Top1 {{ formatSigned(item.gapToTop) }}
            </span>
          </div>
        </div>

        <div class="source-note" v-for="item in factorRows" :key="'s-' + item.key">
          {{ item.label }}：{{ priorityFactorSourceNotes[item.key] }}
        </div>
        <div class="rank-title">省份优先级 Top5（研究参考）</div>
        <div class="rank-list">
          <div
            class="rank-item"
            :class="{ active: item.province === linkedProvince }"
            v-for="(item, index) in topPriorityList"
            :key="item.province"
            @click="syncProvince(item.province)"
          >
            <span class="idx">{{ index + 1 }}</span>
            <span class="province">{{ item.province }}</span>
            <span class="score">{{ item.score }}</span>
            <span class="rank-delta" :class="{ up: item.rankDelta > 0, down: item.rankDelta < 0 }">
              {{ formatRankDelta(item.rankDelta) }}
            </span>
            <span class="level">{{ item.level }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.right-top-wrap {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.link-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 2px;
  gap: 6px;
  flex-wrap: wrap;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.link-tip {
  font-size: 11px;
  color: rgba(232, 213, 181, 0.62);
}

.score-pill {
  font-size: 11px;
  color: rgba(240, 216, 157, 0.88);
  border: 1px solid rgba(212, 168, 71, 0.35);
  background: rgba(26, 20, 16, 0.35);
  border-radius: 10px;
  padding: 2px 8px;
}

.score-delta {
  margin-left: 4px;
  font-size: 10px;
}

.score-delta.up {
  color: rgba(157, 201, 177, 0.9);
}

.score-delta.down {
  color: rgba(214, 92, 108, 0.9);
}

.score-delta.flat {
  color: rgba(232, 213, 181, 0.72);
}

.panel-btn {
  height: 20px;
  border: 1px solid rgba(201, 169, 110, 0.35);
  background: rgba(26, 20, 16, 0.35);
  border-radius: 10px;
  font-size: 10px;
  color: rgba(232, 213, 181, 0.78);
  padding: 0 8px;
  cursor: pointer;
}

.detail-btn {
  height: 20px;
  border: 1px solid rgba(123, 170, 158, 0.35);
  background: rgba(26, 20, 16, 0.35);
  border-radius: 10px;
  font-size: 10px;
  color: rgba(157, 201, 177, 0.82);
  padding: 0 8px;
  cursor: pointer;
}

.mini-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 4px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
  flex-wrap: wrap;
}

.mini-item {
  font-size: 10px;
  color: rgba(232, 213, 181, 0.72);
}

.tune-overlay {
  position: absolute;
  inset: 0;
  background: rgba(12, 10, 8, 0.4);
  z-index: 60;
}

.tune-panel {
  position: absolute;
  right: 8px;
  top: 30px;
  width: min(380px, calc(100% - 16px));
  padding: 8px;
  border: 1px solid rgba(201, 169, 110, 0.25);
  border-radius: 6px;
  background: rgba(20, 16, 12, 0.96);
  max-height: 232px;
  overflow-y: auto;
}

.panel-title {
  font-size: 10px;
  color: rgba(240, 216, 157, 0.82);
  margin-bottom: 3px;
}

.scenario-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.scenario-chip {
  border: 1px solid rgba(201, 169, 110, 0.25);
  background: rgba(26, 20, 16, 0.3);
  color: rgba(232, 213, 181, 0.72);
  border-radius: 10px;
  font-size: 10px;
  line-height: 1;
  padding: 3px 8px;
  cursor: pointer;
}

.scenario-chip.active {
  border-color: rgba(212, 168, 71, 0.65);
  color: rgba(240, 216, 157, 0.95);
  background: rgba(212, 168, 71, 0.14);
}

.scenario-meta {
  font-size: 10px;
  line-height: 1.25;
  color: rgba(232, 213, 181, 0.62);
  margin-bottom: 4px;
}

.scenario-impact {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
  font-size: 10px;
  color: rgba(157, 201, 177, 0.8);
}

.panel-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.panel-label {
  width: 78px;
  flex-shrink: 0;
  font-size: 10px;
  color: rgba(232, 213, 181, 0.7);
}

.slider {
  flex: 1;
  accent-color: #d4a847;
  height: 12px;
}

.panel-val {
  width: 72px;
  text-align: right;
  flex-shrink: 0;
  font-size: 10px;
  color: rgba(240, 216, 157, 0.88);
}

.panel-foot {
  margin-top: 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: rgba(232, 213, 181, 0.58);
}

.reset-btn {
  border: 1px solid rgba(212, 168, 71, 0.45);
  background: rgba(26, 20, 16, 0.35);
  color: rgba(240, 216, 157, 0.9);
  border-radius: 10px;
  font-size: 10px;
  padding: 1px 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-main {
  min-height: 0;
}

.insight-switch {
  margin: 2px 8px 0;
  border: 1px solid rgba(201, 169, 110, 0.16);
  border-radius: 6px;
  background: rgba(26, 20, 16, 0.28);
  padding: 4px 6px;
}

.insight-tab-wrap {
  display: inline-flex;
  gap: 4px;
  margin-bottom: 3px;
}

.insight-tab {
  border: 1px solid rgba(201, 169, 110, 0.26);
  background: rgba(26, 20, 16, 0.26);
  color: rgba(232, 213, 181, 0.72);
  border-radius: 10px;
  font-size: 10px;
  line-height: 1;
  padding: 2px 8px;
  cursor: pointer;
}

.insight-tab.active {
  border-color: rgba(212, 168, 71, 0.65);
  color: rgba(240, 216, 157, 0.94);
  background: rgba(212, 168, 71, 0.14);
}

.insight-caption {
  font-size: 10px;
  line-height: 1.3;
  color: rgba(232, 213, 181, 0.66);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-stage {
  margin: 2px 8px 4px;
  border: 1px solid rgba(201, 169, 110, 0.18);
  border-radius: 6px;
  background: rgba(26, 20, 16, 0.32);
  padding: 4px;
  flex: 1;
  min-height: 108px;
}

.priority-detail-overlay {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 52px;
  bottom: 6px;
  z-index: 40;
  border: 1px solid rgba(201, 169, 110, 0.22);
  border-radius: 6px;
  background: rgba(20, 16, 12, 0.92);
  overflow-y: auto;
}

.priority-detail-board {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}

.formula {
  font-size: 10px;
  color: rgba(232, 213, 181, 0.68);
  line-height: 1.3;
}

.source-summary {
  font-size: 10px;
  line-height: 1.35;
  color: rgba(232, 213, 181, 0.58);
}

.factor-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.factor-label {
  width: 102px;
  flex-shrink: 0;
  font-size: 10px;
  color: rgba(232, 213, 181, 0.72);
}

.track {
  flex: 1;
  height: 4px;
  border-radius: 3px;
  background: rgba(201, 169, 110, 0.16);
  overflow: hidden;
}

.fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(140, 67, 86, 0.6), rgba(212, 168, 71, 0.86));
}

.factor-value {
  width: 24px;
  flex-shrink: 0;
  text-align: right;
  font-size: 10px;
  color: rgba(240, 216, 157, 0.88);
}

.reason-title {
  margin-top: 4px;
  font-size: 10px;
  color: rgba(240, 216, 157, 0.82);
}

.reason-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(201, 169, 110, 0.14);
  border-radius: 4px;
  background: rgba(26, 20, 16, 0.28);
  padding: 3px 5px;
}

.reason-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reason-name {
  font-size: 10px;
  color: rgba(232, 213, 181, 0.78);
}

.reason-core {
  font-size: 10px;
  color: rgba(240, 216, 157, 0.9);
}

.reason-side {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reason-share {
  font-size: 10px;
  color: rgba(232, 213, 181, 0.66);
}

.reason-gap {
  font-size: 10px;
  color: rgba(232, 213, 181, 0.66);
}

.reason-gap.up {
  color: rgba(157, 201, 177, 0.88);
}

.reason-gap.down {
  color: rgba(214, 92, 108, 0.9);
}

.source-note {
  font-size: 10px;
  line-height: 1.25;
  color: rgba(157, 201, 177, 0.72);
}

.rank-title {
  margin-top: 2px;
  font-size: 10px;
  color: rgba(232, 213, 181, 0.64);
}

.rank-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 6px;
  padding-bottom: 2px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  border: 1px solid rgba(201, 169, 110, 0.16);
  background: rgba(26, 20, 16, 0.26);
  border-radius: 4px;
  padding: 2px 4px;
  cursor: pointer;
}

.rank-item.active {
  border-color: rgba(212, 168, 71, 0.52);
  background: rgba(212, 168, 71, 0.12);
}

.idx {
  width: 10px;
  color: rgba(201, 169, 110, 0.8);
}

.province {
  flex: 1;
  color: rgba(232, 213, 181, 0.82);
}

.score {
  width: 26px;
  text-align: right;
  color: rgba(240, 216, 157, 0.9);
}

.rank-delta {
  width: 22px;
  text-align: right;
  color: rgba(232, 213, 181, 0.66);
}

.rank-delta.up {
  color: rgba(157, 201, 177, 0.88);
}

.rank-delta.down {
  color: rgba(214, 92, 108, 0.9);
}

.level {
  color: rgba(123, 170, 158, 0.88);
}
</style>
