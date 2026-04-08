import { computed, ref } from "vue";

export const comparePeriods = ["唐及前", "宋辽金", "元代", "明代", "清代（1911前）"];

export const provinceTrendData: Record<
  string,
  {
    official: number[];
    folk: number[];
    share: number[];
  }
> = {
  山西: { official: [24, 52, 33, 96, 118], folk: [16, 31, 22, 84, 132], share: [12, 18, 10, 28, 32] },
  河南: { official: [20, 44, 30, 75, 96], folk: [14, 28, 20, 68, 112], share: [13, 17, 12, 27, 31] },
  浙江: { official: [12, 29, 18, 60, 92], folk: [10, 22, 16, 63, 104], share: [9, 15, 10, 30, 36] },
  四川: { official: [14, 31, 20, 56, 85], folk: [12, 24, 18, 62, 101], share: [10, 16, 12, 28, 34] },
  河北: { official: [16, 33, 22, 64, 90], folk: [12, 25, 18, 61, 99], share: [11, 16, 11, 29, 33] },
  江苏: { official: [13, 27, 16, 58, 88], folk: [9, 21, 15, 60, 102], share: [8, 14, 10, 30, 38] },
  陕西: { official: [22, 42, 27, 68, 86], folk: [11, 24, 16, 52, 88], share: [14, 20, 12, 27, 27] },
  安徽: { official: [11, 25, 16, 54, 82], folk: [10, 20, 14, 57, 97], share: [9, 14, 10, 29, 38] },
};

export type ProvinceName = keyof typeof provinceTrendData;

export const linkedProvince = ref<ProvinceName>("山西");

export const priorityWeightKeys = [
  "historicalValue",
  "vulnerability",
  "accessibilityPressure",
  "riskPressure",
] as const;

export type PriorityFactorKey = (typeof priorityWeightKeys)[number];
export type PriorityFactorSet = Record<PriorityFactorKey, number>;

type PriorityLevel = "极高" | "较高" | "中等";
type ScenarioScope = "all" | "linked";
export type PriorityScenarioKey =
  | "baseline"
  | "climateShock"
  | "tourismSurge"
  | "targetedConservation"
  | "accessUpgrade";

const defaultPriorityWeightInputs: Record<PriorityFactorKey, number> = {
  historicalValue: 34,
  vulnerability: 24,
  accessibilityPressure: 18,
  riskPressure: 24,
};

export const priorityFactorLabels: Record<PriorityFactorKey, string> = {
  historicalValue: "历史价值",
  vulnerability: "脆弱性",
  accessibilityPressure: "可达性压力",
  riskPressure: "风险压力",
};

export const priorityFactorSourceNotes: Record<PriorityFactorKey, string> = {
  historicalValue: "来源：古建筑类国保省份处数与历史时期分布（公开整理+项目分组）",
  vulnerability: "来源：公开建筑史/灾害与保存状态资料的规则化代理打分（研究参考，非官方统计）",
  accessibilityPressure: "来源：公开地理交通条件与可达性难度的规则化代理打分（研究参考，非官方统计）",
  riskPressure: "来源：公开环境与人类活动扰动信息的规则化代理打分（研究参考，非官方统计）",
};

export const prioritySourceSummary =
  "历史价值基于公开整理数据；脆弱性、可达性压力、风险压力为研究代理因子，当前版本未直接接入官方统一统计库。";

export const priorityFormulaText = "保护优先级指数 = 历史价值 × 脆弱性 × 可达性压力 × 风险压力（加权几何平均）";

// 研究参考：各省份四维因子（0-100）
const defaultProvincePriorityFactors: Record<ProvinceName, PriorityFactorSet> = {
  山西: { historicalValue: 94, vulnerability: 78, accessibilityPressure: 61, riskPressure: 85 },
  河南: { historicalValue: 88, vulnerability: 71, accessibilityPressure: 66, riskPressure: 79 },
  浙江: { historicalValue: 84, vulnerability: 63, accessibilityPressure: 72, riskPressure: 68 },
  四川: { historicalValue: 82, vulnerability: 75, accessibilityPressure: 58, riskPressure: 74 },
  河北: { historicalValue: 79, vulnerability: 69, accessibilityPressure: 65, riskPressure: 72 },
  江苏: { historicalValue: 76, vulnerability: 61, accessibilityPressure: 77, riskPressure: 64 },
  陕西: { historicalValue: 87, vulnerability: 73, accessibilityPressure: 62, riskPressure: 80 },
  安徽: { historicalValue: 74, vulnerability: 67, accessibilityPressure: 70, riskPressure: 66 },
};

export interface ProvincePriorityModel {
  province: ProvinceName;
  factors: PriorityFactorSet;
  score: number;
  level: PriorityLevel;
}

interface PriorityScenarioPreset {
  key: PriorityScenarioKey;
  label: string;
  description: string;
  scope: ScenarioScope;
  factorDelta: PriorityFactorSet;
}

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;

export const priorityWeightsInput = ref<Record<PriorityFactorKey, number>>(clone(defaultPriorityWeightInputs));
export const provincePriorityFactors = ref<Record<ProvinceName, PriorityFactorSet>>(clone(defaultProvincePriorityFactors));

const zeroDelta: PriorityFactorSet = {
  historicalValue: 0,
  vulnerability: 0,
  accessibilityPressure: 0,
  riskPressure: 0,
};

export const priorityScenarioPresets = [
  {
    key: "baseline",
    label: "基线",
    description: "不叠加额外情景冲击，维持当前研究口径。",
    scope: "all",
    factorDelta: zeroDelta,
  },
  {
    key: "climateShock",
    label: "极端气候冲击",
    description: "连续强降雨与温湿波动，整体脆弱性和风险压力抬升。",
    scope: "all",
    factorDelta: {
      historicalValue: 0,
      vulnerability: 12,
      accessibilityPressure: 0,
      riskPressure: 15,
    },
  },
  {
    key: "tourismSurge",
    label: "文旅客流激增",
    description: "流量增长带来承压上行，风险压力同步抬升。",
    scope: "all",
    factorDelta: {
      historicalValue: 0,
      vulnerability: 4,
      accessibilityPressure: 14,
      riskPressure: 8,
    },
  },
  {
    key: "targetedConservation",
    label: "定向抢修投入",
    description: "仅对当前联动省份追加保护投入，优先降低脆弱性与风险压力。",
    scope: "linked",
    factorDelta: {
      historicalValue: 3,
      vulnerability: -14,
      accessibilityPressure: -6,
      riskPressure: -12,
    },
  },
  {
    key: "accessUpgrade",
    label: "通达性治理",
    description: "仅对当前联动省份优化交通组织，降低可达性和外部扰动压力。",
    scope: "linked",
    factorDelta: {
      historicalValue: 0,
      vulnerability: -3,
      accessibilityPressure: -16,
      riskPressure: -6,
    },
  },
] as const;

const priorityScenarioPresetMap = priorityScenarioPresets.reduce((acc, preset) => {
  acc[preset.key] = preset;
  return acc;
}, {} as Record<PriorityScenarioKey, PriorityScenarioPreset>);

export const priorityScenarioKey = ref<PriorityScenarioKey>("baseline");
export const priorityScenarioIntensity = ref(100);
export const currentPriorityScenarioPreset = computed(
  () => priorityScenarioPresetMap[priorityScenarioKey.value] || priorityScenarioPresetMap.baseline
);

export const priorityWeights = computed<Record<PriorityFactorKey, number>>(() => {
  const sum = priorityWeightKeys.reduce((acc, key) => acc + priorityWeightsInput.value[key], 0);
  const safeSum = sum > 0 ? sum : 1;
  return priorityWeightKeys.reduce((acc, key) => {
    acc[key] = Number((priorityWeightsInput.value[key] / safeSum).toFixed(4));
    return acc;
  }, {} as Record<PriorityFactorKey, number>);
});

const clampFactor = (value: number) => Math.max(1, Math.min(100, value));
const clampWeightInput = (value: number) => Math.max(1, Math.min(100, value));
const clampScenarioIntensity = (value: number) => Math.max(0, Math.min(150, value));

const calcPriorityScore = (factors: PriorityFactorSet) => {
  const score = priorityWeightKeys.reduce((acc, key) => {
    const normalizedFactor = clampFactor(factors[key]) / 100;
    return acc * Math.pow(normalizedFactor, priorityWeights.value[key]);
  }, 1);
  return Number((score * 100).toFixed(1));
};

const calcPriorityLevel = (score: number): PriorityLevel => {
  if (score >= 77) return "极高";
  if (score >= 68) return "较高";
  return "中等";
};

const provincePriorityModelKeys = Object.keys(defaultProvincePriorityFactors) as ProvinceName[];

const getScenarioAdjustedFactors = (province: ProvinceName, baseFactors: PriorityFactorSet) => {
  const scenario = currentPriorityScenarioPreset.value;
  const shouldApply = scenario.scope === "all" || province === linkedProvince.value;
  if (!shouldApply || scenario.key === "baseline") {
    return { ...baseFactors };
  }

  const ratio = priorityScenarioIntensity.value / 100;
  return priorityWeightKeys.reduce((acc, key) => {
    acc[key] = clampFactor(baseFactors[key] + scenario.factorDelta[key] * ratio);
    return acc;
  }, {} as PriorityFactorSet);
};

const buildProvincePriorityModel = (
  factorResolver: (province: ProvinceName) => PriorityFactorSet
): Record<ProvinceName, ProvincePriorityModel> =>
  provincePriorityModelKeys.reduce((acc, province) => {
    const factors = factorResolver(province);
    const score = calcPriorityScore(factors);
    acc[province] = {
      province,
      factors,
      score,
      level: calcPriorityLevel(score),
    };
    return acc;
  }, {} as Record<ProvinceName, ProvincePriorityModel>);

const buildRankMap = (ranking: ProvincePriorityModel[]) =>
  ranking.reduce((acc, item, index) => {
    acc[item.province] = index + 1;
    return acc;
  }, {} as Record<ProvinceName, number>);

export const provincePriorityBaseModel = computed<Record<ProvinceName, ProvincePriorityModel>>(() =>
  buildProvincePriorityModel((province) => ({
    ...provincePriorityFactors.value[province],
  }))
);

export const provincePriorityScenarioModel = computed<Record<ProvinceName, ProvincePriorityModel>>(() =>
  buildProvincePriorityModel((province) =>
    getScenarioAdjustedFactors(province, provincePriorityFactors.value[province])
  )
);

export const provincePriorityBaseRanking = computed(() =>
  (Object.keys(provincePriorityBaseModel.value) as ProvinceName[])
    .map((province) => provincePriorityBaseModel.value[province])
    .sort((a, b) => b.score - a.score)
);

export const provincePriorityRanking = computed(() =>
  (Object.keys(provincePriorityScenarioModel.value) as ProvinceName[])
    .map((province) => provincePriorityScenarioModel.value[province])
    .sort((a, b) => b.score - a.score)
);

export const provincePriorityBaseRankMap = computed(() => buildRankMap(provincePriorityBaseRanking.value));
export const provincePriorityScenarioRankMap = computed(() => buildRankMap(provincePriorityRanking.value));

export const provincePriorityModel = provincePriorityScenarioModel;

export const getProvincePriorityModel = (province: string) => {
  const key = province as ProvinceName;
  return provincePriorityScenarioModel.value[key] || provincePriorityScenarioModel.value["山西"];
};

export const getProvincePriorityBaseModel = (province: string) => {
  const key = province as ProvinceName;
  return provincePriorityBaseModel.value[key] || provincePriorityBaseModel.value["山西"];
};

export const setPriorityWeightInput = (key: PriorityFactorKey, value: number) => {
  priorityWeightsInput.value[key] = clampWeightInput(value);
};

export const setProvincePriorityFactor = (province: ProvinceName, key: PriorityFactorKey, value: number) => {
  provincePriorityFactors.value[province][key] = clampFactor(value);
};

export const setPriorityScenario = (key: PriorityScenarioKey) => {
  priorityScenarioKey.value = priorityScenarioPresetMap[key] ? key : "baseline";
};

export const setPriorityScenarioIntensity = (value: number) => {
  priorityScenarioIntensity.value = clampScenarioIntensity(value);
};

export interface PriorityReasonItem {
  key: PriorityFactorKey;
  label: string;
  factor: number;
  weightPct: number;
  weightedFactor: number;
  contributionPct: number;
  gapToTop: number;
}

export const getPriorityReasonBreakdown = (province: string): PriorityReasonItem[] => {
  const current = getProvincePriorityModel(province);
  const topProvince = provincePriorityRanking.value[0]?.province || current.province;
  const topModel = getProvincePriorityModel(topProvince);

  const weightedSum = priorityWeightKeys.reduce(
    (sum, key) => sum + current.factors[key] * priorityWeights.value[key],
    0
  );
  const safeSum = weightedSum > 0 ? weightedSum : 1;

  return priorityWeightKeys
    .map((key) => {
      const weightedFactor = Number((current.factors[key] * priorityWeights.value[key]).toFixed(2));
      const contributionPct = Number(((weightedFactor / safeSum) * 100).toFixed(1));
      const gapToTop = Number((current.factors[key] - topModel.factors[key]).toFixed(1));
      return {
        key,
        label: priorityFactorLabels[key],
        factor: current.factors[key],
        weightPct: Number((priorityWeights.value[key] * 100).toFixed(1)),
        weightedFactor,
        contributionPct,
        gapToTop,
      };
    })
    .sort((a, b) => b.contributionPct - a.contributionPct);
};

type RelationNodeCategory = "province" | "component" | "period" | "risk";

export interface ProvinceRelationNode {
  id: string;
  name: string;
  category: RelationNodeCategory;
  value: number;
}

export interface ProvinceRelationLink {
  source: string;
  target: string;
  value: number;
}

export interface ProvinceRelationNetwork {
  nodes: ProvinceRelationNode[];
  links: ProvinceRelationLink[];
  dominantPeriods: string[];
  majorComponents: string[];
  majorRisks: Array<{ key: PriorityFactorKey; label: string; value: number }>;
}

const provinceComponentMap: Record<ProvinceName, string[]> = {
  山西: ["斗拱", "榫卯", "歇山顶", "鸱吻"],
  河南: ["歇山顶", "藻井", "拱券", "桥台"],
  浙江: ["月梁", "雀替", "桥墩", "栏板与望柱"],
  四川: ["斗拱", "榫卯", "桥台", "分水尖"],
  河北: ["拱券", "桥台", "桥墩", "鸱吻"],
  江苏: ["月梁", "桥墩", "栏板与望柱", "榫卯"],
  陕西: ["斗拱", "藻井", "歇山顶", "抱鼓石"],
  安徽: ["雀替", "月梁", "榫卯", "桥台"],
};

const componentRiskMap: Record<string, PriorityFactorKey[]> = {
  斗拱: ["historicalValue", "vulnerability"],
  榫卯: ["vulnerability", "riskPressure"],
  歇山顶: ["historicalValue", "riskPressure"],
  藻井: ["historicalValue", "vulnerability"],
  雀替: ["accessibilityPressure", "vulnerability"],
  月梁: ["vulnerability", "accessibilityPressure"],
  鸱吻: ["historicalValue", "riskPressure"],
  抱鼓石: ["accessibilityPressure", "riskPressure"],
  桥台: ["riskPressure", "accessibilityPressure"],
  桥墩: ["riskPressure", "vulnerability"],
  拱券: ["vulnerability", "riskPressure"],
  分水尖: ["riskPressure", "accessibilityPressure"],
  "栏板与望柱": ["accessibilityPressure", "vulnerability"],
  雁翅墙: ["riskPressure", "accessibilityPressure"],
};

const pickTopIndexes = (values: number[], topN: number) =>
  values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN)
    .map((item) => item.index);

const calcComponentStrength = (component: string, factors: PriorityFactorSet, rank: number) => {
  const linkedFactors = componentRiskMap[component] || ["historicalValue", "vulnerability"];
  const base = linkedFactors.reduce((sum, key) => sum + factors[key], 0) / linkedFactors.length;
  return Number((base * (1 - rank * 0.06)).toFixed(1));
};

export const getProvinceRelationNetwork = (
  province: string,
  overrideFactors?: PriorityFactorSet
): ProvinceRelationNetwork => {
  const key = (province as ProvinceName) in provinceTrendData ? (province as ProvinceName) : "山西";
  const trend = provinceTrendData[key];
  const model = getProvincePriorityModel(key);
  const factors = overrideFactors ? { ...overrideFactors } : model.factors;
  const components = provinceComponentMap[key] || provinceComponentMap["山西"];
  const topPeriodIndexes = pickTopIndexes(trend.share, 3);
  const periods = topPeriodIndexes.map((idx) => comparePeriods[idx]);

  const majorRisks = [...priorityWeightKeys]
    .map((riskKey) => ({
      key: riskKey,
      label: priorityFactorLabels[riskKey],
      value: factors[riskKey],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const nodes: ProvinceRelationNode[] = [];
  const links: ProvinceRelationLink[] = [];

  const provinceNodeId = `province:${key}`;
  nodes.push({
    id: provinceNodeId,
    name: key,
    category: "province",
    value: model.score,
  });

  components.forEach((component, index) => {
    const componentId = `component:${component}`;
    const componentStrength = calcComponentStrength(component, factors, index);
    nodes.push({
      id: componentId,
      name: component,
      category: "component",
      value: componentStrength,
    });
    links.push({
      source: provinceNodeId,
      target: componentId,
      value: componentStrength,
    });

    const componentPeriod = periods[index % periods.length];
    const periodId = `period:${componentPeriod}`;
    if (!nodes.find((item) => item.id === periodId)) {
      const periodIndex = comparePeriods.indexOf(componentPeriod);
      nodes.push({
        id: periodId,
        name: componentPeriod,
        category: "period",
        value: Number((trend.share[periodIndex] || 0).toFixed(1)),
      });
    }
    links.push({
      source: componentId,
      target: periodId,
      value: Number((36 - index * 4).toFixed(1)),
    });

    const linkedRisks = componentRiskMap[component] || ["historicalValue", "vulnerability"];
    linkedRisks.forEach((riskKey, riskIndex) => {
      const riskId = `risk:${riskKey}`;
      if (!nodes.find((item) => item.id === riskId)) {
        nodes.push({
          id: riskId,
          name: priorityFactorLabels[riskKey],
          category: "risk",
          value: factors[riskKey],
        });
      }
      links.push({
        source: componentId,
        target: riskId,
        value: Number((factors[riskKey] * (riskIndex === 0 ? 0.52 : 0.44)).toFixed(1)),
      });
    });
  });

  periods.forEach((period) => {
    const periodIndex = comparePeriods.indexOf(period);
    const periodValue = trend.share[periodIndex] || 0;
    links.push({
      source: provinceNodeId,
      target: `period:${period}`,
      value: Number((periodValue * 1.4).toFixed(1)),
    });
  });

  majorRisks.forEach((risk) => {
    links.push({
      source: provinceNodeId,
      target: `risk:${risk.key}`,
      value: Number((risk.value * 0.68).toFixed(1)),
    });
  });

  return {
    nodes,
    links,
    dominantPeriods: periods,
    majorComponents: components.slice(0, 3),
    majorRisks,
  };
};

export const resetPriorityLab = () => {
  priorityWeightsInput.value = clone(defaultPriorityWeightInputs);
  provincePriorityFactors.value = clone(defaultProvincePriorityFactors);
  priorityScenarioKey.value = "baseline";
  priorityScenarioIntensity.value = 100;
};
