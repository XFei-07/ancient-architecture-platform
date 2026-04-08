<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import ItemWrap from "@/components/item-wrap";
import { GETNOBASE } from "@/api";
import { getMap, registerMap } from "echarts/core";
import {
  priorityScenarioPresets,
  priorityWeightKeys,
  priorityFactorLabels,
  priorityFactorSourceNotes,
  prioritySourceSummary,
  setPriorityScenario,
  setPriorityScenarioIntensity,
  priorityScenarioKey as globalScenarioKey,
  priorityScenarioIntensity as globalScenarioIntensity,
  provincePriorityBaseModel,
  provincePriorityBaseRankMap,
  provincePriorityScenarioModel,
  provincePriorityScenarioRankMap,
  type PriorityScenarioKey,
  type ProvinceName,
} from "@/views/index/compare-link";

type StrategyTemplate = "风险优先" | "价值优先" | "均衡";

interface ProvinceResourceProfile {
  budgetCost: number; // 万元
  teamNeed: number; // 队
  durationNeed: number; // 月
}

interface PlanCandidate {
  province: ProvinceName;
  factors: {
    historicalValue: number;
    vulnerability: number;
    accessibilityPressure: number;
    riskPressure: number;
  };
  baseScore: number;
  scenarioScore: number;
  rank: number;
  baseRank: number;
  rankDelta: number;
  budgetCost: number;
  teamNeed: number;
  durationNeed: number;
}

interface ScoredCandidate extends PlanCandidate {
  expectedGain: number;
  riskDrop: number;
  teamMonthNeed: number;
  marginalGain: number;
  priorityScore: number;
  factorContributionPct: {
    historicalValue: number;
    vulnerability: number;
    accessibilityPressure: number;
    riskPressure: number;
  };
  topDrivers: string[];
}

interface PlanResult {
  strategy: StrategyTemplate;
  items: ScoredCandidate[];
  usedBudget: number;
  usedTeamMonth: number;
  totalGain: number;
  totalRiskDrop: number;
}

const provinceProfile: Record<ProvinceName, ProvinceResourceProfile> = {
  山西: { budgetCost: 560, teamNeed: 5, durationNeed: 20 },
  河南: { budgetCost: 460, teamNeed: 4, durationNeed: 16 },
  浙江: { budgetCost: 390, teamNeed: 3, durationNeed: 13 },
  四川: { budgetCost: 520, teamNeed: 4, durationNeed: 19 },
  河北: { budgetCost: 380, teamNeed: 3, durationNeed: 14 },
  江苏: { budgetCost: 350, teamNeed: 3, durationNeed: 12 },
  陕西: { budgetCost: 470, teamNeed: 4, durationNeed: 17 },
  安徽: { budgetCost: 330, teamNeed: 3, durationNeed: 11 },
};

const strategyWeights: Record<StrategyTemplate, { risk: number; value: number; urgency: number }> = {
  风险优先: { risk: 0.58, value: 0.18, urgency: 0.24 },
  价值优先: { risk: 0.2, value: 0.55, urgency: 0.25 },
  均衡: { risk: 0.4, value: 0.35, urgency: 0.25 },
};

const backupStrategy: Record<StrategyTemplate, StrategyTemplate> = {
  风险优先: "均衡",
  价值优先: "均衡",
  均衡: "价值优先",
};

const complianceScopeText = "1911年前民居/官府/皇宫/桥梁";
const backgroundReferenceText = "可引用1911年后保护与研究事件作为背景，不改变对象范围";

const budget = ref(1200);
const teams = ref(8);
const duration = ref(18);
const strategy = ref<StrategyTemplate>("均衡");
const scenario = ref<PriorityScenarioKey>(globalScenarioKey.value);
const scenarioIntensity = ref<number>(globalScenarioIntensity.value);
const mapReady = ref(false);
const mapRef = ref<any>(null);
const sandboxPageRef = ref<HTMLElement | null>(null);

const provinceToMapName: Record<ProvinceName, string> = {
  山西: "山西省",
  河南: "河南省",
  浙江: "浙江省",
  四川: "四川省",
  河北: "河北省",
  江苏: "江苏省",
  陕西: "陕西省",
  安徽: "安徽省",
};

const factorLabels = {
  historicalValue: "历史价值",
  vulnerability: "脆弱性",
  accessibilityPressure: "可达性压力",
  riskPressure: "风险压力",
} as const;

watch(
  scenario,
  (val) => {
    setPriorityScenario(val);
  },
  { immediate: true }
);

watch(
  scenarioIntensity,
  (val) => {
    setPriorityScenarioIntensity(val);
  },
  { immediate: true }
);

const currentScenarioPreset = computed(
  () => priorityScenarioPresets.find((item) => item.key === scenario.value) || priorityScenarioPresets[0]
);

const teamMonthCapacity = computed(() => teams.value * duration.value);

const candidates = computed<PlanCandidate[]>(() => {
  const provinces = Object.keys(provincePriorityScenarioModel.value) as ProvinceName[];
  return provinces.map((province) => {
    const scenarioModel = provincePriorityScenarioModel.value[province];
    const baseModel = provincePriorityBaseModel.value[province];
    const profile = provinceProfile[province];
    const rank = provincePriorityScenarioRankMap.value[province] || 1;
    const baseRank = provincePriorityBaseRankMap.value[province] || rank;
    return {
      province,
      factors: scenarioModel.factors,
      baseScore: baseModel.score,
      scenarioScore: scenarioModel.score,
      rank,
      baseRank,
      rankDelta: baseRank - rank,
      budgetCost: profile.budgetCost,
      teamNeed: profile.teamNeed,
      durationNeed: profile.durationNeed,
    };
  });
});

const scoreByStrategy = (list: PlanCandidate[], currentStrategy: StrategyTemplate): ScoredCandidate[] => {
  const weights = strategyWeights[currentStrategy];
  return list.map((item) => {
    const riskPotential = item.factors.vulnerability * 0.58 + item.factors.riskPressure * 0.42;
    const valuePotential = item.factors.historicalValue * 0.72 + item.factors.accessibilityPressure * 0.28;
    const urgencyPotential =
      item.scenarioScore + Math.max(0, item.scenarioScore - item.baseScore) * 1.2;
    const expectedGain = Number(
      (riskPotential * weights.risk + valuePotential * weights.value + urgencyPotential * weights.urgency).toFixed(1)
    );
    const riskDrop = Number((expectedGain * 0.17).toFixed(1));
    const teamMonthNeed = item.teamNeed * item.durationNeed;
    const marginalGain = Number((expectedGain / item.budgetCost).toFixed(4));
    const priorityScore = Number((marginalGain * 1000 + (expectedGain / teamMonthNeed) * 120).toFixed(3));
    const factorRaw = {
      historicalValue: item.factors.historicalValue * weights.value * 0.72,
      vulnerability: item.factors.vulnerability * weights.risk * 0.58,
      accessibilityPressure: item.factors.accessibilityPressure * weights.value * 0.28,
      riskPressure: item.factors.riskPressure * weights.risk * 0.42,
    };
    const factorSum = Object.values(factorRaw).reduce((sum, v) => sum + v, 0) || 1;
    const factorContributionPct = {
      historicalValue: Number(((factorRaw.historicalValue / factorSum) * 100).toFixed(1)),
      vulnerability: Number(((factorRaw.vulnerability / factorSum) * 100).toFixed(1)),
      accessibilityPressure: Number(((factorRaw.accessibilityPressure / factorSum) * 100).toFixed(1)),
      riskPressure: Number(((factorRaw.riskPressure / factorSum) * 100).toFixed(1)),
    };
    const topDrivers = (Object.keys(factorContributionPct) as (keyof typeof factorContributionPct)[])
      .map((key) => ({
        key,
        pct: factorContributionPct[key],
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 2)
      .map((item) => `${factorLabels[item.key]} ${item.pct}%`);
    return {
      ...item,
      expectedGain,
      riskDrop,
      teamMonthNeed,
      marginalGain,
      priorityScore,
      factorContributionPct,
      topDrivers,
    };
  });
};

const solvePlan = (currentStrategy: StrategyTemplate): PlanResult => {
  const sorted = scoreByStrategy(candidates.value, currentStrategy)
    .filter((item) => item.durationNeed <= duration.value)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const selected: ScoredCandidate[] = [];
  let usedBudget = 0;
  let usedTeamMonth = 0;

  for (const item of sorted) {
    if (usedBudget + item.budgetCost > budget.value) continue;
    if (usedTeamMonth + item.teamMonthNeed > teamMonthCapacity.value) continue;
    selected.push(item);
    usedBudget += item.budgetCost;
    usedTeamMonth += item.teamMonthNeed;
  }

  const totalGain = Number(selected.reduce((sum, item) => sum + item.expectedGain, 0).toFixed(1));
  const totalRiskDrop = Number(selected.reduce((sum, item) => sum + item.riskDrop, 0).toFixed(1));

  return {
    strategy: currentStrategy,
    items: selected,
    usedBudget,
    usedTeamMonth,
    totalGain,
    totalRiskDrop,
  };
};

const planA = computed(() => solvePlan(strategy.value));
const planB = computed(() => solvePlan(backupStrategy[strategy.value]));

const budgetUtilization = computed(() =>
  budget.value > 0 ? Number(((planA.value.usedBudget / budget.value) * 100).toFixed(1)) : 0
);

const teamMonthUtilization = computed(() =>
  teamMonthCapacity.value > 0
    ? Number(((planA.value.usedTeamMonth / teamMonthCapacity.value) * 100).toFixed(1))
    : 0
);

const formatRankDelta = (value: number) => (value === 0 ? "持平" : value > 0 ? `↑${value}` : `↓${Math.abs(value)}`);
const backupLabel = computed(() => backupStrategy[strategy.value]);
const resultFootnote = (item: ScoredCandidate, planTag: "A" | "B") =>
  `来源：项目内省级优先级指标模型（省份=${item.province}，情景=${scenario.value}，强度=${scenarioIntensity.value}%）；口径：${planTag}方案省份级研究参考，对象限定${complianceScopeText}。`;

const planABaseScoreTotal = computed(() =>
  Number(planA.value.items.reduce((sum, item) => sum + item.baseScore, 0).toFixed(1))
);
const planAScenarioScoreTotal = computed(() =>
  Number(planA.value.items.reduce((sum, item) => sum + item.scenarioScore, 0).toFixed(1))
);
const planAScoreDelta = computed(() =>
  Number((planAScenarioScoreTotal.value - planABaseScoreTotal.value).toFixed(1))
);
const planARankDeltaAvg = computed(() => {
  if (!planA.value.items.length) return 0;
  const avg =
    planA.value.items.reduce((sum, item) => sum + item.rankDelta, 0) / planA.value.items.length;
  return Number(avg.toFixed(1));
});

const factorSourceLines = computed(() =>
  priorityWeightKeys.map((key) => `${priorityFactorLabels[key]}：${priorityFactorSourceNotes[key]}`)
);

const sandboxLineageMeta = computed(
  () => `四因子来源（研究参考）：${factorSourceLines.value.join("；")}`
);

const safeCsvCell = (value: string | number) => {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const triggerDownload = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const nowTag = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const dayTag = () => new Date().toISOString().slice(0, 10);

const buildPlanRows = (items: ScoredCandidate[], planTag: "A" | "B") => [
  [
    "方案",
    "省份",
    "情景排名",
    "较基线排名变化",
    "基线分",
    "场景分",
    "成本(万元)",
    "队伍需求",
    "工期需求(月)",
    "预估收益",
    "风险下降",
    "边际收益/成本",
    "原因分解Top2",
    "来源与口径",
  ],
  ...items.map((item) => [
    planTag,
    item.province,
    item.rank,
    item.rankDelta,
    item.baseScore,
    item.scenarioScore,
    item.budgetCost,
    item.teamNeed,
    item.durationNeed,
    item.expectedGain,
    item.riskDrop,
    item.marginalGain,
    item.topDrivers.join(" / "),
    resultFootnote(item, planTag),
  ]),
];

const exportPlanSummary = () => {
  const rows: (string | number)[][] = [
    ["模块", "保护决策沙盘（省份级）"],
    ["导出时间", nowTag()],
    ["对象范围", complianceScopeText],
    ["背景说明", backgroundReferenceText],
    [],
    ["参数", "值"],
    ["年度预算(万元)", budget.value],
    ["施工队数量", teams.value],
    ["最大工期(月)", duration.value],
    ["策略模板", strategy.value],
    ["备选策略", backupLabel.value],
    ["情景模板", currentScenarioPreset.value.label],
    ["情景Key", scenario.value],
    ["情景强度(%)", scenarioIntensity.value],
    ["人力容量(队月)", teamMonthCapacity.value],
    [],
    ["结果概览", "值"],
    ["推荐A省份数", planA.value.items.length],
    ["备选B省份数", planB.value.items.length],
    ["预算利用率(%)", budgetUtilization.value],
    ["人力容量利用率(%)", teamMonthUtilization.value],
    ["方案A总收益", planA.value.totalGain],
    ["方案A风险下降", planA.value.totalRiskDrop],
    ["方案A基线总分", planABaseScoreTotal.value],
    ["方案A当前总分", planAScenarioScoreTotal.value],
    ["方案A分值变化", planAScoreDelta.value],
    ["方案A平均排名变化", planARankDeltaAvg.value],
    [],
    ...buildPlanRows(planA.value.items, "A"),
    [],
    ...buildPlanRows(planB.value.items, "B"),
    [],
    ["总口径说明", `本模块为省份级研究参考求解；对象限定${complianceScopeText}。`],
  ];
  const csv = rows.map((row) => row.map((cell) => safeCsvCell(cell)).join(",")).join("\n");
  triggerDownload(`保护决策沙盘_方案摘要_${dayTag()}.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8;");

  const screenshotFieldLines = [
    "【保护决策沙盘答辩截图字段】",
    `导出时间: ${nowTag()}`,
    `对象范围: ${complianceScopeText}`,
    `情景模板: ${currentScenarioPreset.value.label} (${scenario.value})`,
    `情景强度: ${scenarioIntensity.value}%`,
    `策略模板: ${strategy.value} / 备选: ${backupLabel.value}`,
    `约束参数: 预算${budget.value}万元, 施工队${teams.value}, 工期${duration.value}月, 容量${teamMonthCapacity.value}队月`,
    `推荐清单A: ${planA.value.items.map((item) => item.province).join("、") || "无可行组合"}`,
    `备选清单B: ${planB.value.items.map((item) => item.province).join("、") || "无可行组合"}`,
    `结果变化: 基线总分${planABaseScoreTotal.value} -> 当前总分${planAScenarioScoreTotal.value}, 分值变化${planAScoreDelta.value >= 0 ? "+" : ""}${planAScoreDelta.value}, 平均排名变化${planARankDeltaAvg.value}`,
    `效益指标: 预算利用率${budgetUtilization.value}%, 人力容量利用率${teamMonthUtilization.value}%, 总收益${planA.value.totalGain}, 风险下降${planA.value.totalRiskDrop}`,
    `口径说明: 本模块为省份级研究参考求解；对象限定${complianceScopeText}；${backgroundReferenceText}。`,
  ].join("\n");
  triggerDownload(`保护决策沙盘_截图字段_${dayTag()}.txt`, screenshotFieldLines, "text/plain;charset=utf-8;");

  window["$message"]?.success("方案摘要已导出（CSV + 截图字段TXT）。");
};

const mapSeriesData = computed(() => {
  const selectedSet = new Set(planA.value.items.map((item) => item.province));
  return (Object.keys(provinceToMapName) as ProvinceName[]).map((province) => {
    const candidate = candidates.value.find((item) => item.province === province);
    const isSelected = selectedSet.has(province);
    return {
      name: provinceToMapName[province],
      value: candidate?.scenarioScore ?? 0,
      selectedMark: isSelected ? "入选A" : "未入选",
      itemStyle: isSelected
        ? {
            areaColor: "rgba(212,168,71,0.78)",
            borderColor: "rgba(245,230,203,0.92)",
            borderWidth: 1.3,
            shadowBlur: 14,
            shadowColor: "rgba(212,168,71,0.45)",
          }
        : {
            areaColor: "rgba(131,131,131,0.22)",
            borderColor: "rgba(171,171,171,0.35)",
            borderWidth: 1,
          },
    };
  });
});

const mapOption = computed(() => {
  if (!mapReady.value) return {};
  return {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(26,20,16,.92)",
      borderColor: "rgba(201,169,110,.55)",
      textStyle: { color: "#F5F0E8" },
      formatter: (params: any) => {
        const data = params?.data;
        if (!data) return params.name;
        return `${params.name}<br/>${data.selectedMark} · 场景分 ${data.value}`;
      },
    },
    series: [
      {
        type: "map",
        map: "china",
        roam: false,
        zoom: 1.05,
        top: 16,
        selectedMode: false,
        label: {
          show: false,
        },
        itemStyle: {
          areaColor: "rgba(100,100,100,0.15)",
          borderColor: "rgba(171,171,171,0.22)",
          borderWidth: 0.8,
        },
        emphasis: {
          itemStyle: {
            areaColor: "rgba(212,168,71,0.62)",
            borderColor: "rgba(245,230,203,0.95)",
          },
          label: {
            show: true,
            color: "#F0D89D",
            fontSize: 12,
          },
        },
        data: mapSeriesData.value,
      },
    ],
  };
});

const ensureChinaMap = async () => {
  const cached = getMap("china");
  if (cached) {
    mapReady.value = true;
    return;
  }
  const geojson: any = await GETNOBASE("./map-geojson/china.json");
  registerMap("china", {
    geoJSON: geojson as any,
    specialAreas: {},
  });
  mapReady.value = true;
};

const getMapChartInstance = () => mapRef.value?.chart || mapRef.value?.getEchartsInstance?.();

const scrollElementByWheel = (event: WheelEvent) => {
  const el = event.currentTarget as HTMLElement | null;
  if (!el) return;
  el.scrollTop += event.deltaY;
};

const scrollPageByWheel = (event: WheelEvent) => {
  const page = sandboxPageRef.value;
  if (!page) return;
  page.scrollTop += event.deltaY;
};

const refreshMapHighlight = () => {
  const chart = getMapChartInstance();
  if (!chart || !mapReady.value) return;
  const selectedNames = new Set(planA.value.items.map((item) => provinceToMapName[item.province]));
  (Object.values(provinceToMapName) as string[]).forEach((name) => {
    chart.dispatchAction({ type: "downplay", seriesIndex: 0, name });
  });
  selectedNames.forEach((name) => {
    chart.dispatchAction({ type: "highlight", seriesIndex: 0, name });
  });
};

onMounted(async () => {
  await ensureChinaMap();
  await nextTick();
  refreshMapHighlight();
});

watch(
  () => planA.value.items.map((item) => item.province).join(","),
  async () => {
    await nextTick();
    refreshMapHighlight();
  }
);
</script>

<template>
  <div class="sandbox-page" ref="sandboxPageRef">
    <div class="sandbox-scope-tip">
      对象范围：{{ complianceScopeText }}；{{ backgroundReferenceText }}。
    </div>

    <div class="sandbox-layout">
      <ItemWrap
        class="sandbox-panel sandbox-left"
        title="参数区"
        cred-level="研究参考"
        :cred-meta="sandboxLineageMeta"
        cred-time="当前版本"
        :cred-source="prioritySourceSummary"
        cred-method="交互参数输入→约束建模→省份级方案求解"
        cred-version="v2026.04-sandbox-param"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="方案求解 = 预算/工期/队伍约束 + 指数收益排序"
        cred-sample-size="8省候选省份与情景参数组合"
        cred-limitations="输出用于演示研判，不替代实际项目立项评审。"
        source-link="/source-catalog.html#priority"
      >
        <div class="panel-body" @wheel.stop.prevent="scrollElementByWheel">
          <div class="field">
            <label>年度预算（万元）</label>
            <input type="range" min="300" max="4000" step="50" v-model.number="budget" />
            <span class="val">{{ budget }}</span>
          </div>
          <div class="field">
            <label>施工队数量</label>
            <input type="range" min="2" max="30" step="1" v-model.number="teams" />
            <span class="val">{{ teams }}</span>
          </div>
          <div class="field">
            <label>最大工期（月）</label>
            <input type="range" min="6" max="36" step="1" v-model.number="duration" />
            <span class="val">{{ duration }}</span>
          </div>

          <div class="field">
            <label>策略模板</label>
            <select v-model="strategy">
              <option value="风险优先">风险优先</option>
              <option value="价值优先">价值优先</option>
              <option value="均衡">均衡</option>
            </select>
          </div>

          <div class="field">
            <label>情景模板（复用现有推演）</label>
            <select v-model="scenario">
              <option v-for="item in priorityScenarioPresets" :key="item.key" :value="item.key">
                {{ item.label }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>情景强度</label>
            <input type="range" min="0" max="150" step="1" v-model.number="scenarioIntensity" />
            <span class="val">{{ scenarioIntensity }}%</span>
          </div>

          <div class="scenario-note">
            {{ currentScenarioPreset.description }}
          </div>
          <div class="scenario-note">
            当前约束容量：{{ teamMonthCapacity }} 队月（{{ teams }}队 × {{ duration }}月）
          </div>
        </div>
      </ItemWrap>

      <ItemWrap
        class="sandbox-panel sandbox-center"
        title="空间分布区"
        cred-level="研究参考"
        cred-meta="省份级决策地图联动区"
        cred-time="当前版本"
        cred-source="项目内地图模块"
        cred-method="入选省份高亮→未入选灰显→基线对比"
        cred-version="v2026.04-sandbox-map"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="地图联动 = 入选集合高亮 + 基线分布对照"
        cred-sample-size="全国省级底图 + 8省策略集合"
        cred-limitations="地图层用于策略解释，非工程施工图与审批底图。"
        source-link="/source-catalog.html#map"
      >
        <div class="map-stage" @wheel.capture.prevent="scrollPageByWheel">
          <div class="map-grid"></div>
          <v-chart class="sandbox-map" :option="mapOption" ref="mapRef" v-if="mapReady" />
          <div class="map-placeholder-text" v-else>地图加载中...</div>
          <div class="map-legend">
            <span class="dot dot-selected"></span><span>入选A</span>
            <span class="dot dot-unselected"></span><span>未入选</span>
          </div>
          <div class="map-selection-note">
            当前推荐A：{{ planA.items.map((item) => item.province).join("、") || "暂无可行组合" }}
          </div>
        </div>
      </ItemWrap>

      <ItemWrap
        class="sandbox-panel sandbox-right"
        title="结果区"
        cred-level="研究参考"
        cred-meta="推荐清单A/B、预算利用率、总收益"
        cred-time="当前版本"
        cred-source="项目内决策求解器"
        cred-method="约束过滤→候选评估→方案排序"
        cred-version="v2026.04-sandbox-result"
        cred-updated-at="2026-04-03 20:30（UTC+8）"
        cred-formula="总收益 = Σ单省预估收益；利用率 = 已用资源 / 资源上限"
        cred-sample-size="候选方案A/B与省份级收益明细"
        cred-limitations="收益为模型估计，不等同实际财政绩效。"
        source-link="/source-catalog.html#ranking"
      >
        <div class="panel-body" @wheel.stop.prevent="scrollElementByWheel">
          <div class="export-actions">
            <button class="export-btn" @click="exportPlanSummary">一键导出方案摘要（CSV/截图字段）</button>
          </div>
          <div class="result-metric-grid">
            <div class="metric-card">
              <div class="k">推荐策略</div>
              <div class="v">{{ strategy }}</div>
            </div>
            <div class="metric-card">
              <div class="k">备选策略</div>
              <div class="v">{{ backupLabel }}</div>
            </div>
            <div class="metric-card">
              <div class="k">预算利用率</div>
              <div class="v">{{ budgetUtilization }}%</div>
            </div>
            <div class="metric-card">
              <div class="k">人力容量利用率</div>
              <div class="v">{{ teamMonthUtilization }}%</div>
            </div>
            <div class="metric-card">
              <div class="k">方案A总收益</div>
              <div class="v">{{ planA.totalGain }}</div>
            </div>
            <div class="metric-card">
              <div class="k">方案A风险下降</div>
              <div class="v">{{ planA.totalRiskDrop }}</div>
            </div>
            <div class="metric-card">
              <div class="k">基线总分（A）</div>
              <div class="v">{{ planABaseScoreTotal }}</div>
            </div>
            <div class="metric-card">
              <div class="k">当前总分（A）</div>
              <div class="v">{{ planAScenarioScoreTotal }}</div>
            </div>
            <div class="metric-card">
              <div class="k">分值变化（A）</div>
              <div class="v">{{ planAScoreDelta > 0 ? "+" : "" }}{{ planAScoreDelta }}</div>
            </div>
            <div class="metric-card">
              <div class="k">平均排名变化（A）</div>
              <div class="v">{{ planARankDeltaAvg > 0 ? "↑" : planARankDeltaAvg < 0 ? "↓" : "" }}{{ Math.abs(planARankDeltaAvg) }}</div>
            </div>
          </div>

          <div class="plan-block">
            <div class="plan-title">推荐清单A（{{ strategy }}）</div>
            <div class="plan-empty" v-if="!planA.items.length">当前约束下暂无可行组合，请提高预算或放宽工期。</div>
            <div class="plan-item" v-for="item in planA.items" :key="'a-' + item.province">
              <div class="row-top">
                <span class="province">{{ item.province }}</span>
                <span class="rank">排名 {{ item.rank }}（较基线{{ formatRankDelta(item.rankDelta) }}）</span>
              </div>
              <div class="row-sub">
                成本 {{ item.budgetCost }}万 · {{ item.teamNeed }}队/{{ item.durationNeed }}月 ·
                收益 {{ item.expectedGain }} · 边际 {{ item.marginalGain.toFixed(4) }}
              </div>
              <div class="row-reason">原因分解：{{ item.topDrivers.join(" / ") }} · 边际收益/成本 {{ item.marginalGain.toFixed(4) }}</div>
              <div class="row-meta">{{ resultFootnote(item, "A") }}</div>
            </div>
          </div>

          <div class="plan-block">
            <div class="plan-title">备选清单B（{{ backupLabel }}）</div>
            <div class="plan-empty" v-if="!planB.items.length">当前约束下备选策略暂无可行组合。</div>
            <div class="plan-item" v-for="item in planB.items" :key="'b-' + item.province">
              <div class="row-top">
                <span class="province">{{ item.province }}</span>
                <span class="rank">排名 {{ item.rank }}（较基线{{ formatRankDelta(item.rankDelta) }}）</span>
              </div>
              <div class="row-sub">
                成本 {{ item.budgetCost }}万 · {{ item.teamNeed }}队/{{ item.durationNeed }}月 ·
                收益 {{ item.expectedGain }} · 边际 {{ item.marginalGain.toFixed(4) }}
              </div>
              <div class="row-reason">原因分解：{{ item.topDrivers.join(" / ") }} · 边际收益/成本 {{ item.marginalGain.toFixed(4) }}</div>
              <div class="row-meta">{{ resultFootnote(item, "B") }}</div>
            </div>
          </div>

          <div class="source-note">
            口径说明：本模块为省份级研究参考求解；对象限定{{ complianceScopeText }}；{{ backgroundReferenceText }}。
          </div>
          <div class="source-note">
            <div class="source-title">四因子逐条来源说明</div>
            <div class="source-row" v-for="line in factorSourceLines" :key="line">{{ line }}</div>
          </div>
        </div>
      </ItemWrap>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sandbox-page {
  width: 100%;
  height: calc(100% - 64px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sandbox-scope-tip {
  color: rgba(232, 213, 181, 0.76);
  font-size: 12px;
  letter-spacing: 0.4px;
  border: 1px solid rgba(201, 169, 110, 0.28);
  background: rgba(26, 20, 16, 0.4);
  border-radius: 6px;
  padding: 6px 12px;
}

.sandbox-layout {
  display: flex;
  gap: 14px;
  min-height: 820px;
}

.sandbox-panel {
  height: 100%;
}

.sandbox-left,
.sandbox-right {
  width: 430px;
  flex-shrink: 0;
}

.sandbox-center {
  flex: 1;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow: auto;
  padding-right: 2px;
}

.field {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  border: 1px solid rgba(201, 169, 110, 0.16);
  border-radius: 6px;
  background: rgba(26, 20, 16, 0.24);
  padding: 8px;

  label {
    font-size: 12px;
    color: rgba(232, 213, 181, 0.8);
  }

  .val {
    font-size: 12px;
    color: rgba(240, 216, 157, 0.92);
  }

  input,
  select {
    width: 100%;
    accent-color: #d4a847;
    border: 1px solid rgba(201, 169, 110, 0.28);
    border-radius: 4px;
    background: rgba(16, 12, 9, 0.7);
    color: rgba(232, 213, 181, 0.88);
    padding: 6px 8px;
    font-size: 12px;
  }
}

.scenario-note {
  border: 1px solid rgba(201, 169, 110, 0.16);
  border-radius: 6px;
  background: rgba(26, 20, 16, 0.24);
  padding: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(232, 213, 181, 0.74);
}

.map-stage {
  width: 100%;
  height: 100%;
  min-height: 740px;
  border-radius: 8px;
  border: 1px solid rgba(201, 169, 110, 0.2);
  background:
    radial-gradient(circle at 30% 20%, rgba(212, 168, 71, 0.12), transparent 35%),
    radial-gradient(circle at 80% 70%, rgba(91, 137, 115, 0.12), transparent 38%),
    rgba(16, 12, 9, 0.72);
  position: relative;
  overflow: hidden;
}

.sandbox-map {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(201, 169, 110, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201, 169, 110, 0.1) 1px, transparent 1px);
  background-size: 36px 36px;
  opacity: 0.28;
}

.map-legend {
  position: absolute;
  right: 12px;
  top: 10px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid rgba(201, 169, 110, 0.22);
  border-radius: 12px;
  background: rgba(16, 12, 9, 0.72);
  font-size: 11px;
  color: rgba(232, 213, 181, 0.84);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-selected {
  background: rgba(212, 168, 71, 0.92);
  box-shadow: 0 0 8px rgba(212, 168, 71, 0.55);
}

.dot-unselected {
  background: rgba(140, 140, 140, 0.62);
}

.map-selection-note {
  position: absolute;
  left: 12px;
  bottom: 10px;
  z-index: 3;
  max-width: calc(100% - 24px);
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 6px;
  background: rgba(16, 12, 9, 0.7);
  color: rgba(232, 213, 181, 0.84);
  font-size: 12px;
  line-height: 1.5;
  padding: 6px 8px;
}

.map-placeholder-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: rgba(232, 213, 181, 0.86);
  line-height: 1.8;
  font-size: 14px;
  letter-spacing: 0.8px;
}

.result-metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.export-actions {
  display: flex;
  justify-content: flex-start;
}

.export-btn {
  border: 1px solid rgba(201, 169, 110, 0.36);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(212, 168, 71, 0.3), rgba(91, 137, 115, 0.28));
  color: rgba(245, 230, 203, 0.95);
  font-size: 12px;
  line-height: 1;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(240, 216, 157, 0.65);
    box-shadow: 0 0 10px rgba(212, 168, 71, 0.25);
  }
}

.metric-card {
  border: 1px solid rgba(201, 169, 110, 0.16);
  border-radius: 6px;
  background: rgba(26, 20, 16, 0.24);
  padding: 8px;

  .k {
    font-size: 11px;
    color: rgba(232, 213, 181, 0.66);
    margin-bottom: 2px;
  }

  .v {
    font-size: 13px;
    color: rgba(240, 216, 157, 0.92);
    font-weight: 700;
  }
}

.plan-block {
  border: 1px solid rgba(201, 169, 110, 0.16);
  border-radius: 6px;
  background: rgba(26, 20, 16, 0.24);
  padding: 8px;
}

.plan-title {
  font-size: 12px;
  color: rgba(240, 216, 157, 0.9);
  margin-bottom: 6px;
}

.plan-empty {
  font-size: 12px;
  color: rgba(232, 213, 181, 0.66);
}

.plan-item {
  border: 1px solid rgba(201, 169, 110, 0.14);
  border-radius: 4px;
  background: rgba(16, 12, 9, 0.5);
  padding: 6px;
  margin-bottom: 5px;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.province {
  font-size: 12px;
  color: rgba(240, 216, 157, 0.9);
  font-weight: 700;
}

.rank {
  font-size: 11px;
  color: rgba(157, 201, 177, 0.88);
}

.row-sub {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(232, 213, 181, 0.72);
  line-height: 1.5;
}

.row-reason {
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.45;
  color: rgba(157, 201, 177, 0.84);
}

.row-meta {
  margin-top: 2px;
  font-size: 10px;
  line-height: 1.5;
  color: rgba(232, 213, 181, 0.58);
}

.source-note {
  font-size: 12px;
  line-height: 1.55;
  color: rgba(232, 213, 181, 0.68);
  border: 1px solid rgba(201, 169, 110, 0.16);
  border-radius: 6px;
  background: rgba(26, 20, 16, 0.24);
  padding: 8px;
}

.source-title {
  color: rgba(240, 216, 157, 0.88);
  font-weight: 700;
  margin-bottom: 4px;
}

.source-row {
  margin-top: 2px;
}

@media (max-width: 1600px) {
  .sandbox-left,
  .sandbox-right {
    width: 380px;
  }
}

@media (max-width: 1360px) {
  .sandbox-layout {
    flex-wrap: wrap;
    min-height: auto;
  }

  .sandbox-left,
  .sandbox-right {
    width: calc((100% - 14px) / 2);
    min-width: 320px;
    flex: 1 1 320px;
  }

  .sandbox-center {
    width: 100%;
    flex: 1 1 100%;
    min-height: 560px;
  }

  .map-stage {
    min-height: 560px;
  }
}

@media (max-width: 900px) {
  .sandbox-page {
    gap: 8px;
  }

  .sandbox-layout {
    gap: 10px;
  }

  .sandbox-left,
  .sandbox-right,
  .sandbox-center {
    width: 100%;
    min-width: 0;
    flex: 1 1 100%;
  }

  .panel-body {
    overflow: visible;
    padding-right: 0;
  }

  .map-stage {
    min-height: 420px;
  }

  .result-metric-grid {
    grid-template-columns: 1fr;
  }

  .row-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .map-legend {
    right: 8px;
    top: 8px;
    gap: 4px;
    padding: 3px 6px;
  }

  .map-selection-note {
    left: 8px;
    right: 8px;
    max-width: none;
    bottom: 8px;
  }
}
</style>
