<script setup lang="ts">
import { ref, nextTick, computed, onMounted, onBeforeUnmount } from "vue";
import { GETNOBASE } from "@/api";
import { registerMap, getMap } from "echarts/core";
import { optionHandle, regionCodes } from "./center.map";
import BorderBox13 from "@/components/datav/border-box-13";
import DataLineagePanel from "@/components/data-lineage-panel";
import {
  linkedProvince,
  provinceTrendData,
  getProvincePriorityModel,
  priorityFactorLabels,
  priorityWeightKeys,
  type PriorityFactorKey,
} from "./compare-link";

import type { MapdataType, RegionValueItem } from "./center.map";

const option = ref({});
const code = ref("china");
const centerMapRef = ref<any>(null);
const provinceDetailName = ref("");
const provinceDetailVisible = ref(false);

withDefaults(
  defineProps<{
    title: number | string;
  }>(),
  {
    title: "地图",
  }
);

// 省级分布口径（最新公开源，2026-04-03同步）
const staticData: RegionValueItem[] = [
  { name: "山西省", value: 421 }, { name: "河南省", value: 157 },
  { name: "浙江省", value: 145 }, { name: "四川省", value: 140 },
  { name: "河北省", value: 138 }, { name: "江苏省", value: 106 },
  { name: "陕西省", value: 100 }, { name: "福建省", value: 90 },
  { name: "安徽省", value: 87 }, { name: "云南省", value: 80 },
  { name: "湖南省", value: 79 }, { name: "北京市", value: 78 },
  { name: "江西省", value: 67 }, { name: "山东省", value: 56 },
  { name: "广东省", value: 54 }, { name: "甘肃省", value: 53 },
  { name: "湖北省", value: 47 }, { name: "西藏自治区", value: 44 },
  { name: "贵州省", value: 39 }, { name: "辽宁省", value: 38 },
  { name: "内蒙古自治区", value: 34 }, { name: "广西壮族自治区", value: 24 },
  { name: "青海省", value: 22 }, { name: "宁夏回族自治区", value: 15 },
  { name: "新疆维吾尔自治区", value: 14 }, { name: "重庆市", value: 11 },
  { name: "海南省", value: 10 }, { name: "天津市", value: 7 },
  { name: "吉林省", value: 6 }, { name: "上海市", value: 5 },
  { name: "黑龙江省", value: 3 },
];

const provinceMax = Math.max(...staticData.map((item) => item.value));
const cityHeatCache = new Map<string, RegionValueItem[]>();

interface ProvinceStoryCardMeta {
  sites: string[];
  highlight: string;
  repairAdvice: string[];
  source: string[];
}

const defaultProvinceStoryCard: ProvinceStoryCardMeta = {
  sites: ["地方古城核心街区", "传统民居组团", "典型古桥节点"],
  highlight: "该省份在古建分布与空间连片性上具有代表性，建议结合重点区县做分层保护。",
  repairAdvice: ["优先推进木构节点病害普查", "建立桥梁水工风险巡检台账", "对高游览压力片区实施分流管理"],
  source: ["[S1] 国家文物局公开名录", "[S3] 本平台四类样本整理", "[S4] 本平台研究模型（风险代理）"],
};

const provinceStoryCardMap: Record<string, ProvinceStoryCardMeta> = {
  山西: {
    sites: ["平遥古城古民居组团", "应县木塔", "大同华严寺木构群"],
    highlight: "木构遗产密度高、年代跨度大，维护策略需以预防性保养和结构监测并重。",
    repairAdvice: ["优先治理梁架节点开裂与虫蛀", "加密冬夏温湿波动监测", "历史街区实施游客承载阈值控制"],
    source: ["[S1] 国家文物局名录", "[S3] 四类样本整理（山西）", "[S4] 省级优先级模型"],
  },
  河南: {
    sites: ["洛阳古建群", "开封城内官署遗存", "安阳古桥节点"],
    highlight: "古都文化叠层明显，文旅压力与环境扰动共同抬升了保护复杂度。",
    repairAdvice: ["建立城址-街区-单体三级修缮顺序", "重点加固高人流区立面与屋面", "完善洪涝季排水与应急预案"],
    source: ["[S1] 国家文物局名录", "[S3] 四类样本整理（河南）", "[S4] 风险压力代理评分"],
  },
  浙江: {
    sites: ["南浔/西塘古民居", "宁波官府建筑遗存", "绍兴古桥系统"],
    highlight: "水网区域古桥与民居并存，湿热环境对构件耐久性影响显著。",
    repairAdvice: ["加强木构件防潮与防霉处理", "古桥桥台冲刷专项巡检", "核心街区夜游客流分级管控"],
    source: ["[S1] 国家文物局名录", "[S3] 四类样本整理（浙江）", "[S4] 可达性与风险代理评分"],
  },
  四川: {
    sites: ["阆中古城传统民居", "成都官府遗存", "川西古桥节点"],
    highlight: "山地地形与多雨环境叠加，结构稳定性和排水组织是修缮关键。",
    repairAdvice: ["坡地古建优先做基础沉降监测", "增加屋面排水节点巡检频次", "高风险片区采用轻干预加固方案"],
    source: ["[S1] 国家文物局名录", "[S3] 四类样本整理（四川）", "[S4] 脆弱性代理评分"],
  },
  河北: {
    sites: ["正定古建群", "保定官署遗存", "赵州桥及周边桥梁"],
    highlight: "桥梁与木构双类型并存，需在交通压力和文保需求之间做平衡维护。",
    repairAdvice: ["重点桥梁开展分水尖/桥台病害复核", "古城核心区实施交通分级绕行", "推进重点单体数字化测绘归档"],
    source: ["[S1] 国家文物局名录", "[S3] 四类样本整理（河北）", "[S4] 研究模型基线"],
  },
  江苏: {
    sites: ["苏州古民居组团", "扬州官府遗存", "宝带桥等古桥节点"],
    highlight: "高可达性带来较高游览压力，运营期维护应与展示活动协同规划。",
    repairAdvice: ["对高频开放点位实行错峰参观", "桥梁构件开展周期性微损伤检测", "木构立面实施低干预清洁保养"],
    source: ["[S1] 国家文物局名录", "[S3] 四类样本整理（江苏）", "[S4] 可达性压力代理评分"],
  },
  陕西: {
    sites: ["西安古城官府遗存", "关中古民居样本", "渭河流域古桥节点"],
    highlight: "历史价值高且文旅关注集中，建议优先进行高等级单体预防性保护。",
    repairAdvice: ["建立重点单体季度健康评估", "古城开放区执行分区承载上限", "对重点桥梁进行抗冲刷复核"],
    source: ["[S1] 国家文物局名录", "[S3] 四类样本整理（陕西）", "[S4] 风险压力代理评分"],
  },
  安徽: {
    sites: ["徽州古民居组团", "皖中官府遗存", "皖南古桥节点"],
    highlight: "传统聚落连片性较强，需优先保护街巷肌理与建筑群协同关系。",
    repairAdvice: ["先做聚落级风貌与病害一体普查", "湿热季重点巡检木构受潮区域", "提升游客导览线路的分流能力"],
    source: ["[S1] 国家文物局名录", "[S3] 四类样本整理（安徽）", "[S4] 研究模型基线"],
  },
};

const capitalByAdcode: Record<string, string> = {
  "110000": "东城区",
  "120000": "和平区",
  "130000": "石家庄市",
  "140000": "太原市",
  "150000": "呼和浩特市",
  "210000": "沈阳市",
  "220000": "长春市",
  "230000": "哈尔滨市",
  "310000": "黄浦区",
  "320000": "南京市",
  "330000": "杭州市",
  "340000": "合肥市",
  "350000": "福州市",
  "360000": "南昌市",
  "370000": "济南市",
  "410000": "郑州市",
  "420000": "武汉市",
  "430000": "长沙市",
  "440000": "广州市",
  "450000": "南宁市",
  "460000": "海口市",
  "500000": "渝中区",
  "510000": "成都市",
  "520000": "贵阳市",
  "530000": "昆明市",
  "540000": "拉萨市",
  "610000": "西安市",
  "620000": "兰州市",
  "630000": "西宁市",
  "640000": "银川市",
  "650000": "乌鲁木齐市",
  "710000": "台湾省",
  "810000": "中西区",
  "820000": "大堂区",
};

const historyHotKeywords = ["洛阳", "开封", "西安", "大同", "平遥", "苏州", "扬州", "泉州", "潮州", "曲阜", "丽江", "大理", "歙县", "阆中", "敦煌"];

const normalizeName = (name: string) =>
  name.replace(/特别行政区|壮族自治区|回族自治区|维吾尔自治区|自治区|自治州|自治县|地区|盟|省|市|区|县|旗/g, "");

const textHash = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 131 + input.charCodeAt(i)) % 1000003;
  }
  return hash;
};

const buildCityHeatList = async (adcode: string, provinceValue: number) => {
  const cache = cityHeatCache.get(adcode);
  if (cache) return cache;

  const geojson: any = await getGeojson(adcode);
  const features = geojson?.features || [];
  const provinceFactor = Math.max(0.2, Math.min(1, provinceValue / provinceMax));
  const capitalName = capitalByAdcode[adcode] || "";

  const list: RegionValueItem[] = features.map((feature: any, index: number) => {
    const name = feature?.properties?.name || `区域${index + 1}`;
    const seed = textHash(`${adcode}-${name}-${index}`);
    const ratio = (Math.sin(seed) + 1) / 2;
    const bandMin = 30 + Math.round(provinceFactor * 10);
    const bandRange = 35 + Math.round(provinceFactor * 18);
    let value = Math.round(bandMin + ratio * bandRange);

    if (capitalName && normalizeName(name) === normalizeName(capitalName)) {
      value = Math.max(value, 78 + Math.round(provinceFactor * 18));
    }
    if (historyHotKeywords.some((word) => name.includes(word))) {
      value = Math.min(100, value + 5);
    }

    return { name, value: Math.max(25, Math.min(100, value)) };
  });

  cityHeatCache.set(adcode, list);
  return list;
};

const mapNoteText = computed(() =>
  code.value === "china"
    ? "省级：古建筑类国保处数（最新公开源，点击省份查看详情卡）"
    : "地级市：热力指数（研究参考，非官方处数）"
);

const mapCredLabel = computed(() => (code.value === "china" ? "官方统计" : "研究参考"));
const mapMethod = computed(() =>
  code.value === "china"
    ? "公开接口拉取→省份聚合→分布渲染→详情卡解释链路"
    : "省级基数约束→地市热力仿真→中心点聚合→下钻可视分析"
);

const selectedProvinceShortName = computed(() => (provinceDetailName.value ? normalizeName(provinceDetailName.value) : ""));
const selectedProvinceCount = computed(
  () => staticData.find((item) => item.name === provinceDetailName.value)?.value || 0
);

const selectedProvinceStoryCard = computed<ProvinceStoryCardMeta>(
  () => provinceStoryCardMap[selectedProvinceShortName.value] || defaultProvinceStoryCard
);

const selectedProvinceModel = computed(() => {
  if (!selectedProvinceShortName.value) return null;
  if (!provinceTrendData[selectedProvinceShortName.value]) return null;
  return getProvincePriorityModel(selectedProvinceShortName.value);
});

const calcFactorLevel = (value: number) => {
  if (value >= 78) return "高";
  if (value >= 63) return "中";
  return "低";
};

const getFallbackFactors = (count: number): Record<PriorityFactorKey, number> => {
  const historicalValue = Math.min(92, Math.max(52, Math.round(48 + count * 0.11)));
  const vulnerability = Math.min(82, Math.max(48, Math.round(56 + count * 0.05)));
  const accessibilityPressure = Math.min(80, Math.max(42, Math.round(44 + count * 0.06)));
  const riskPressure = Math.min(84, Math.max(46, Math.round(50 + count * 0.05)));
  return {
    historicalValue,
    vulnerability,
    accessibilityPressure,
    riskPressure,
  };
};

const selectedRiskRows = computed(() => {
  const factorSource = selectedProvinceModel.value?.factors || getFallbackFactors(selectedProvinceCount.value);
  return priorityWeightKeys.map((key) => ({
    key,
    label: priorityFactorLabels[key],
    value: factorSource[key],
    level: calcFactorLevel(factorSource[key]),
  }));
});

const selectedProvinceScoreText = computed(() => {
  if (!selectedProvinceModel.value) {
    return `省级处数：${selectedProvinceCount.value}（详情因子为研究参考代理值）`;
  }
  return `优先级指数：${selectedProvinceModel.value.score}（研究参考） · 等级：${selectedProvinceModel.value.level}`;
});

const hasSelectedProvince = computed(() => code.value === "china" && !!provinceDetailName.value);

const selectProvince = async (provinceFullName: string, showDetail = false) => {
  provinceDetailName.value = provinceFullName;
  provinceDetailVisible.value = showDetail;
  await nextTick();
  const chart = getMapChartInstance();
  if (!chart || code.value !== "china") return;
  staticData.forEach((item) => {
    chart.dispatchAction({ type: "downplay", seriesIndex: 0, name: item.name });
  });
  chart.dispatchAction({ type: "highlight", seriesIndex: 0, name: provinceFullName });
  chart.dispatchAction({ type: "showTip", seriesIndex: 0, name: provinceFullName });
};

const openProvinceDetail = async (provinceFullName: string) => {
  await selectProvince(provinceFullName, true);
};

const toggleProvinceDetail = async () => {
  if (!provinceDetailName.value || code.value !== "china") return;
  if (provinceDetailVisible.value) {
    closeProvinceDetail();
    return;
  }
  await openProvinceDetail(provinceDetailName.value);
};

const closeProvinceDetail = () => {
  provinceDetailVisible.value = false;
};

const enterProvinceCityHeat = async (provinceFullName: string) => {
  const xzqData = regionCodes[provinceFullName];
  if (!provinceFullName || !xzqData) {
    window["$message"]?.warning("当前省份暂不支持地市热力下钻。");
    return;
  }
  const provinceValue = staticData.find((item) => item.name === provinceFullName)?.value || 20;
  const cityHeatList = await buildCityHeatList(xzqData.adcode, provinceValue);
  await dataSetHandle(xzqData.adcode, cityHeatList, "heat");
  provinceDetailVisible.value = false;
  window["$message"]?.info("已切换地级市热力指数（研究参考），用于观察空间分布。");
};

const enterCityHeatFromCard = async () => {
  await enterProvinceCityHeat(provinceDetailName.value);
};

const backToChina = async () => {
  await dataSetHandle("china", staticData, "count");
};

const dataSetHandle = async (regionCode: string, list: RegionValueItem[] = [], metric: "count" | "heat" = "count") => {
  code.value = regionCode;
  if (regionCode !== "china") {
    provinceDetailVisible.value = false;
  }
  const geojson: any = await getGeojson(regionCode);
  const cityCenter: Record<string, [number, number]> = {};
  const mapData: MapdataType[] = [];

  geojson.features.forEach((element: any) => {
    cityCenter[element.properties.name] = element.properties.centroid || element.properties.center;
  });

  list.forEach((item) => {
    if (cityCenter[item.name]) {
      mapData.push({
        name: item.name,
        value: cityCenter[item.name].concat(item.value),
      });
    }
  });

  await nextTick();
  option.value = optionHandle(regionCode, list, mapData, metric);
};

const getGeojson = (regionCode: string) => {
  return new Promise<boolean>(async (resolve) => {
    let mapjson = getMap(regionCode);
    if (mapjson) {
      mapjson = mapjson.geoJSON;
      resolve(mapjson);
    } else {
      mapjson = await GETNOBASE(`./map-geojson/${regionCode}.json`).then((data) => data);
      registerMap(regionCode, {
        geoJSON: mapjson as any,
        specialAreas: {},
      });
      resolve(mapjson);
    }
  });
};

// 省级处数口径（最新公开源）
dataSetHandle("china", staticData, "count");

const mapClick = async (params: any) => {
  const xzqData = regionCodes[params.name];
  if (xzqData) {
    const shortName = normalizeName(params.name);
    if (provinceTrendData[shortName]) {
      linkedProvince.value = shortName as keyof typeof provinceTrendData;
    }
    if (code.value === "china") {
      await selectProvince(params.name, false);
      return;
    }
  } else {
    window["$message"].warning(code.value === "china" ? "暂无下级地市" : "当前层级暂无下钻，点击“中国”返回省级分布。");
  }
};

const mapDblClick = async (params: any) => {
  const xzqData = regionCodes[params.name];
  if (!xzqData || code.value !== "china") return;
  const shortName = normalizeName(params.name);
  if (provinceTrendData[shortName]) {
    linkedProvince.value = shortName as keyof typeof provinceTrendData;
  }
  await enterProvinceCityHeat(params.name);
};

const getMapChartInstance = () => centerMapRef.value?.chart || centerMapRef.value?.getEchartsInstance?.();

const exportMapPng = () => {
  const chart = getMapChartInstance();
  if (!chart) {
    window["$message"]?.warning("地图尚未加载完成，暂时无法导出。");
    return;
  }
  const image = chart.getDataURL({
    type: "png",
    pixelRatio: 2,
    backgroundColor: "#1A1410",
  });
  const a = document.createElement("a");
  a.href = image;
  a.download = `古建筑地图_${new Date().toISOString().slice(0, 10)}.png`;
  a.click();
  window["$message"]?.success("地图 PNG 已导出。");
};

const syncMapByProvince = async (shortProvinceName: string) => {
  const targetProvince = staticData.find((item) => normalizeName(item.name) === shortProvinceName);
  if (!targetProvince) return;
  if (code.value !== "china") {
    await dataSetHandle("china", staticData, "count");
  }
  await selectProvince(targetProvince.name, false);
};

const syncMapByProvinces = async (shortProvinceNames: string[]) => {
  const targetList = staticData.filter((item) => shortProvinceNames.includes(normalizeName(item.name)));
  if (!targetList.length) return;
  if (code.value !== "china") {
    await dataSetHandle("china", staticData, "count");
  }
  await nextTick();
  const chart = getMapChartInstance();
  if (!chart) return;
  targetList.forEach((item) => {
    chart.dispatchAction({ type: "highlight", seriesIndex: 0, name: item.name });
  });
  chart.dispatchAction({ type: "showTip", seriesIndex: 0, name: targetList[0].name });
  setTimeout(() => {
    targetList.forEach((item) => {
      chart.dispatchAction({ type: "downplay", seriesIndex: 0, name: item.name });
    });
  }, 1800);
};

const handleSyncMapProvince = (event: Event) => {
  const province = (event as CustomEvent).detail?.province;
  if (province) {
    syncMapByProvince(province);
  }
};

const handleSyncMapProvinces = (event: Event) => {
  const provinces = (event as CustomEvent).detail?.provinces;
  if (Array.isArray(provinces) && provinces.length) {
    syncMapByProvinces(provinces);
  }
};

const handleExportMapPng = () => exportMapPng();

onMounted(() => {
  window.addEventListener("sync-map-province", handleSyncMapProvince as EventListener);
  window.addEventListener("sync-map-provinces", handleSyncMapProvinces as EventListener);
  window.addEventListener("export-map-png", handleExportMapPng);
});

onBeforeUnmount(() => {
  window.removeEventListener("sync-map-province", handleSyncMapProvince as EventListener);
  window.removeEventListener("sync-map-provinces", handleSyncMapProvinces as EventListener);
  window.removeEventListener("export-map-png", handleExportMapPng);
});
</script>

<template>
  <div class="centermap">
    <div class="maptitle">
      <span class="title-deco">「</span>
      <span class="titletext">{{ title }}</span>
      <span class="title-deco">」</span>
    </div>
    <div class="mapwrap">
      <BorderBox13>
        <div class="quanguo" @click="backToChina" v-if="code !== 'china'">中国</div>
        <DataLineagePanel
          :level="mapCredLabel"
          :time="code === 'china' ? '最新公开源（2026-04-03）' : '当前版本'"
          :source="code === 'china' ? '国家文物局相关公开数据接口' : '平台研究模型'"
          :method="mapMethod"
          :meta="code === 'china' ? '古建筑类国保省级处数分布（2170）' : '地级市热力指数（研究参考）'"
          :data-version="code === 'china' ? 'v2026.04-map-province' : 'v2026.04-map-city-heat'"
          :updated-at="code === 'china' ? '2026-04-03 20:30（UTC+8）' : '2026-04-03 20:30（UTC+8）'"
          :formula="
            code === 'china'
              ? '省级值 = 古建筑类国保处数'
              : '热力指数 = 省级基数约束 + 文旅/空间代理因子归一化'
          "
          :sample-size="code === 'china' ? '全国31省级行政区' : '省内地级市行政单元'"
          :limitations="
            code === 'china'
              ? '省级口径不代表单体完好度与修缮投入。'
              : '地市热力为研究参考值，非官方处数。'
          "
          source-link="/source-catalog.html#map"
          :position-top="8"
          :position-right="8"
          :width="320"
        />
        <div class="map-note">{{ mapNoteText }}</div>
        <button class="map-detail-toggle" v-if="hasSelectedProvince" @click="toggleProvinceDetail">
          {{ provinceDetailVisible ? "收起详情" : `查看详情：${provinceDetailName}` }}
        </button>
        <v-chart
          class="chart"
          :option="option"
          ref="centerMapRef"
          @click="mapClick"
          @dblclick="mapDblClick"
          v-if="JSON.stringify(option) != '{}'"
        />
        <div class="province-detail-card beautify-scroll-def" v-if="code === 'china' && provinceDetailVisible">
          <div class="detail-head">
            <div class="detail-title">{{ provinceDetailName }}</div>
            <button class="detail-close" @click="closeProvinceDetail">×</button>
          </div>
          <div class="detail-meta">古建筑类国保处数：{{ selectedProvinceCount }}（最新公开源）</div>
          <div class="detail-meta">{{ selectedProvinceScoreText }}</div>

          <div class="detail-section">
            <div class="section-title">代表古建/片区</div>
            <div class="section-row" v-for="site in selectedProvinceStoryCard.sites" :key="site">{{ site }}</div>
          </div>

          <div class="detail-section">
            <div class="section-title">风险因子（研究参考）</div>
            <div class="factor-row" v-for="item in selectedRiskRows" :key="item.key">
              <span class="factor-label">{{ item.label }}</span>
              <div class="factor-track">
                <span class="factor-fill" :style="{ width: `${item.value}%` }"></span>
              </div>
              <span class="factor-val">{{ item.value }}/{{ item.level }}</span>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">修缮建议</div>
            <div class="section-row" v-for="advice in selectedProvinceStoryCard.repairAdvice" :key="advice">{{ advice }}</div>
          </div>

          <div class="detail-section">
            <div class="section-title">说明与来源</div>
            <div class="source-line">{{ selectedProvinceStoryCard.highlight }}</div>
            <div class="source-line" v-for="line in selectedProvinceStoryCard.source" :key="line">{{ line }}</div>
          </div>

          <div class="detail-actions">
            <button class="detail-btn detail-btn-primary" @click="enterCityHeatFromCard">查看地市热力</button>
            <button class="detail-btn" @click="closeProvinceDetail">收起详情</button>
          </div>
        </div>
        <!-- Immersive Entry Buttons -->
        <div class="entry-btn-wrap">
          <button class="entry-btn" onclick="window.location.href='/#/decision-sandbox'">
            进入保护决策沙盘
          </button>
          <button class="entry-btn" onclick="window.open('/3d-showroom.html', '_blank')">
            进入 3D 沉浸式展厅
          </button>
        </div>
      </BorderBox13>
    </div>
  </div>
</template>

<style scoped lang="scss">
.centermap {
  margin-bottom: 30px;

  .maptitle {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 10px;
    box-sizing: border-box;

    .title-deco {
      font-size: 26px;
      color: #C9A96E;
      opacity: 0.6;
      margin: 0 4px;
      font-weight: 300;
    }

    .titletext {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 6px;
      background: linear-gradient(92deg, #C9A96E 0%, #F0D89D 48.8525390625%, #C9A96E 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .mapwrap {
    height: 580px;
    width: 100%;
    box-sizing: border-box;
    position: relative;

    .quanguo {
      position: absolute;
      right: 20px;
      top: -46px;
      width: 80px;
      height: 28px;
      border: 1px solid #C9A96E;
      border-radius: 10px;
      color: #D4A847;
      text-align: center;
      line-height: 26px;
      letter-spacing: 6px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(201, 169, 110, 0.3), 0 0 6px rgba(201, 169, 110, 0.2);
      z-index: 10;
    }

    .map-note {
      position: absolute;
      left: 18px;
      top: 12px;
      color: rgba(232, 213, 181, 0.58);
      font-size: 11px;
      z-index: 10;
      letter-spacing: 1px;
    }

    .map-detail-toggle {
      position: absolute;
      left: 18px;
      top: 34px;
      z-index: 12;
      border: 1px solid rgba(201, 169, 110, 0.35);
      border-radius: 12px;
      background: rgba(26, 20, 16, 0.58);
      color: rgba(240, 216, 157, 0.9);
      font-size: 11px;
      line-height: 1;
      padding: 5px 10px;
      cursor: pointer;
      max-width: 360px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .province-detail-card {
      position: absolute;
      right: 18px;
      top: 42px;
      width: 330px;
      max-height: calc(100% - 120px);
      z-index: 40;
      border: 1px solid rgba(201, 169, 110, 0.28);
      border-radius: 8px;
      background: rgba(16, 12, 9, 0.92);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.36);
      padding: 10px 10px 12px;
      overflow-y: auto;
    }

    .detail-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .detail-title {
      font-size: 16px;
      color: #f0d89d;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .detail-close {
      border: none;
      background: transparent;
      color: rgba(232, 213, 181, 0.7);
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
    }

    .detail-meta {
      font-size: 11px;
      color: rgba(232, 213, 181, 0.72);
      line-height: 1.5;
    }

    .detail-section {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(201, 169, 110, 0.14);
    }

    .section-title {
      font-size: 11px;
      color: rgba(240, 216, 157, 0.88);
      margin-bottom: 4px;
    }

    .section-row {
      font-size: 11px;
      color: rgba(232, 213, 181, 0.8);
      line-height: 1.45;
      margin-bottom: 3px;
    }

    .factor-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .factor-label {
      width: 62px;
      font-size: 10px;
      color: rgba(232, 213, 181, 0.7);
      flex-shrink: 0;
    }

    .factor-track {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: rgba(201, 169, 110, 0.15);
      overflow: hidden;
    }

    .factor-fill {
      display: block;
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, rgba(140, 67, 86, 0.6), rgba(212, 168, 71, 0.9));
    }

    .factor-val {
      width: 54px;
      text-align: right;
      font-size: 10px;
      color: rgba(240, 216, 157, 0.84);
      flex-shrink: 0;
    }

    .source-line {
      font-size: 10px;
      color: rgba(157, 201, 177, 0.8);
      line-height: 1.45;
      margin-bottom: 3px;
    }

    .detail-actions {
      margin-top: 10px;
      display: flex;
      gap: 8px;
    }

    .detail-btn {
      flex: 1;
      border: 1px solid rgba(201, 169, 110, 0.28);
      border-radius: 12px;
      background: rgba(26, 20, 16, 0.4);
      color: rgba(232, 213, 181, 0.8);
      font-size: 11px;
      line-height: 1;
      padding: 7px 8px;
      cursor: pointer;
    }

    .detail-btn-primary {
      color: #f0d89d;
      border-color: rgba(212, 168, 71, 0.5);
      background: rgba(212, 168, 71, 0.15);
    }

  }
}

/* Immersive Entry Buttons */
.entry-btn-wrap {
  position: absolute;
  right: 20px;
  bottom: 24px;
  z-index: 99;
  display: flex;
  align-items: center;
  gap: 10px;
}

.entry-btn {
  display: inline-block;
  padding: 10px 22px;
  background: rgba(26, 20, 16, 0.75);
  border: 1px solid #D4AF37;
  border-radius: 4px;
  color: #D4A847;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  animation: glowBreathe 2.5s ease-in-out infinite;
  transition: background 0.3s;

  &:hover {
    background: rgba(26, 20, 16, 0.9);
    color: #F0D89D;
  }
}

@media (max-width: 1320px) {
  .entry-btn-wrap {
    gap: 8px;
  }

  .entry-btn {
    padding: 8px 16px;
    font-size: 13px;
    letter-spacing: 1px;
  }
}

@media (max-width: 1040px) {
  .entry-btn-wrap {
    flex-direction: column;
    align-items: flex-end;
  }
}

@keyframes glowBreathe {
  0%, 100% {
    box-shadow: 0 0 6px rgba(212, 175, 55, 0.2), 0 0 12px rgba(212, 175, 55, 0.1);
  }
  50% {
    box-shadow: 0 0 14px rgba(212, 175, 55, 0.5), 0 0 28px rgba(212, 175, 55, 0.25);
  }
}
</style>
