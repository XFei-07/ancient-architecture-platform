<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

interface SearchRecord {
  id: string;
  name: string;
  province: string;
  type: string;
  period: string;
  component: string;
  summary: string;
  recommendation: string;
  sourceAnchor: string;
  batch?: string;
  address?: string;
  lon?: number | null;
  lat?: number | null;
}

const router = useRouter();

const seedRecords: SearchRecord[] = [
  {
    id: "sx-py-001",
    name: "平遥古城传统民居组团",
    province: "山西",
    type: "民居",
    period: "明代",
    component: "斗拱",
    summary: "晋商民居群连片性高，木构节点保存较好但受游客压力影响显著。",
    recommendation: "建议先做高人流街区错峰与梁架节点巡检。",
    sourceAnchor: "/source-catalog.html#category",
  },
  {
    id: "sx-dt-002",
    name: "大同华严寺建筑群",
    province: "山西",
    type: "官府",
    period: "宋辽金",
    component: "榫卯",
    summary: "木构层级复杂，结构价值高，温湿波动对节点影响敏感。",
    recommendation: "建议提升冬夏交替期预防性维护频次。",
    sourceAnchor: "/source-catalog.html#priority",
  },
  {
    id: "hn-ly-003",
    name: "洛阳古都建筑遗存",
    province: "河南",
    type: "官府",
    period: "宋辽金",
    component: "歇山顶",
    summary: "古都核心区文旅叠加，古建展示与保护平衡难度较高。",
    recommendation: "建议分区分级控制游客承载阈值。",
    sourceAnchor: "/source-catalog.html#ranking",
  },
  {
    id: "zj-sx-005",
    name: "绍兴古桥系统",
    province: "浙江",
    type: "桥梁",
    period: "清代（1911前）",
    component: "桥台",
    summary: "水网区域桥梁密集，桥台桥墩长期受水工环境影响。",
    recommendation: "建议先做桥台冲刷与分水构件专项复核。",
    sourceAnchor: "/source-catalog.html#map",
  },
  {
    id: "sc-lz-007",
    name: "阆中古城民居组团",
    province: "四川",
    type: "民居",
    period: "明代",
    component: "月梁",
    summary: "山地气候与降雨条件对木构耐久性提出更高要求。",
    recommendation: "建议先排查屋面排水与木构潮损链条。",
    sourceAnchor: "/source-catalog.html#priority",
  },
  {
    id: "hb-zq-010",
    name: "赵州桥及周边桥梁节点",
    province: "河北",
    type: "桥梁",
    period: "唐及前",
    component: "拱券",
    summary: "古桥水工环境复杂，桥台与分水构件稳定性是核心。",
    recommendation: "建议优先完成桥梁关键构件耐久性评估。",
    sourceAnchor: "/source-catalog.html#map",
  },
  {
    id: "js-sz-011",
    name: "苏州古民居街区",
    province: "江苏",
    type: "民居",
    period: "清代（1911前）",
    component: "榫卯",
    summary: "历史街区商业活跃，运营期维护和游客组织压力较大。",
    recommendation: "建议推进核心街区错峰游览机制。",
    sourceAnchor: "/source-catalog.html#components",
  },
  {
    id: "sn-xa-013",
    name: "西安古城官署遗存",
    province: "陕西",
    type: "官府",
    period: "明代",
    component: "歇山顶",
    summary: "核心区历史价值高、流量集中，保护优先级长期靠前。",
    recommendation: "建议划定精细化游览分区与维护窗口。",
    sourceAnchor: "/source-catalog.html#priority",
  },
  {
    id: "ah-hz-015",
    name: "徽州古民居聚落",
    province: "安徽",
    type: "民居",
    period: "清代（1911前）",
    component: "雀替",
    summary: "聚落尺度完整性高，风貌协同保护优先级突出。",
    recommendation: "建议先做聚落级病害普查再分区修缮。",
    sourceAnchor: "/source-catalog.html#category",
  },
];

const records = ref<SearchRecord[]>([]);
const loadSource = ref<"external" | "seed">("seed");
const loading = ref(true);
const loadError = ref("");
let loadToken = 0;

const latestDataset = {
  label: "全国重点文保 5061（最新源）",
  path: "/data/gujian_5061_latest.json",
  desc: "已接入最新公开源数据，支持筛选后联动首页地图与排行。",
};

const keyword = ref("");
const selectedProvince = ref("全部");
const selectedType = ref("全部");
const selectedPeriod = ref("全部");
const selectedComponent = ref("全部");

const pageSize = ref(24);
const currentPage = ref(1);

const normalizeRecord = (item: any, idx: number): SearchRecord => {
  const id = String(item.id || `record-${idx + 1}`);
  const name = String(item.name || item.title || "未命名条目");
  const province = String(item.province || item.region || "未知");
  const type = String(item.type || item.category || "未分类");
  const period = String(item.period || item.era || "未标注");
  const component = String(item.component || item.part || "未标注");
  const summary = String(item.summary || `${name}，位于${province}，类型为${type}。`);
  const recommendation = String(item.recommendation || "建议结合实地巡检做分级保护。");
  const sourceAnchor = String(item.sourceAnchor || "/source-catalog.html#official");
  const batch = item.batch ? String(item.batch) : "";
  const address = item.address ? String(item.address) : "";
  const lon = Number(item.lon);
  const lat = Number(item.lat);
  return {
    id,
    name,
    province,
    type,
    period,
    component,
    summary,
    recommendation,
    sourceAnchor,
    batch,
    address,
    lon: Number.isFinite(lon) ? lon : null,
    lat: Number.isFinite(lat) ? lat : null,
  };
};

const loadData = async () => {
  const token = ++loadToken;
  loading.value = true;
  loadError.value = "";
  try {
    const res = await fetch(latestDataset.path, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("empty dataset");
    }
    if (token !== loadToken) return;
    records.value = data.map((item, idx) => normalizeRecord(item, idx));
    loadSource.value = "external";
  } catch (err: any) {
    if (token !== loadToken) return;
    records.value = seedRecords;
    loadSource.value = "seed";
    loadError.value = `外部数据未加载（${latestDataset.path}），已回退示例数据（${String(
      err?.message || err
    )}）。`;
  } finally {
    if (token !== loadToken) return;
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const provinceOptions = computed(() => ["全部", ...Array.from(new Set(records.value.map((item) => item.province)))]);
const typeOptions = computed(() => ["全部", ...Array.from(new Set(records.value.map((item) => item.type)))]);
const periodOptions = computed(() => ["全部", ...Array.from(new Set(records.value.map((item) => item.period)))]);
const componentOptions = computed(() => ["全部", ...Array.from(new Set(records.value.map((item) => item.component)))]);

const filteredRecords = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return records.value.filter((item) => {
    if (selectedProvince.value !== "全部" && item.province !== selectedProvince.value) return false;
    if (selectedType.value !== "全部" && item.type !== selectedType.value) return false;
    if (selectedPeriod.value !== "全部" && item.period !== selectedPeriod.value) return false;
    if (selectedComponent.value !== "全部" && item.component !== selectedComponent.value) return false;
    if (!kw) return true;
    const text = `${item.name} ${item.province} ${item.type} ${item.period} ${item.component} ${item.summary}`.toLowerCase();
    return text.includes(kw);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / pageSize.value)));

const pageRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

watch(
  [keyword, selectedProvince, selectedType, selectedPeriod, selectedComponent, pageSize],
  () => {
    currentPage.value = 1;
  }
);

watch(totalPages, (val) => {
  if (currentPage.value > val) {
    currentPage.value = val;
  }
});

const resetFilters = () => {
  keyword.value = "";
  selectedProvince.value = "全部";
  selectedType.value = "全部";
  selectedPeriod.value = "全部";
  selectedComponent.value = "全部";
  currentPage.value = 1;
};

const goPrev = () => {
  currentPage.value = Math.max(1, currentPage.value - 1);
};

const goNext = () => {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1);
};

const linkToDashboard = (item: SearchRecord) => {
  router.push({
    path: "/index",
    query: {
      province: item.province,
      from: "search",
      keyword: item.name,
    },
  });
};

const openSource = (item: SearchRecord) => {
  window.open(item.sourceAnchor, "_blank");
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/index");
};
</script>

<template>
  <div class="search-page">
    <div class="search-head">
      <div class="head-top">
        <div class="head-title">古建筑全局检索</div>
        <button class="btn btn-muted head-back-btn" @click="goBack">返回首页</button>
      </div>
      <div class="head-subtitle">当前数据集：{{ latestDataset.label }}。{{ latestDataset.desc }}</div>
      <div class="head-meta">
        <span>数据文件：{{ latestDataset.path }}</span>
        <span>当前数据源：{{ loadSource === "external" ? "外部全量数据" : "内置示例数据" }}</span>
        <span>总条数：{{ records.length }}</span>
      </div>
      <div class="head-error" v-if="loadError">{{ loadError }}</div>
    </div>

    <div class="filter-panel">
      <div class="filter-grid">
        <label class="field">
          <span>关键词</span>
          <input v-model="keyword" type="text" placeholder="输入古建名称、构件或描述..." />
        </label>
        <label class="field">
          <span>省份</span>
          <select v-model="selectedProvince">
            <option v-for="item in provinceOptions" :key="'p-' + item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label class="field">
          <span>类型</span>
          <select v-model="selectedType">
            <option v-for="item in typeOptions" :key="'t-' + item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label class="field">
          <span>时期</span>
          <select v-model="selectedPeriod">
            <option v-for="item in periodOptions" :key="'r-' + item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label class="field">
          <span>核心构件</span>
          <select v-model="selectedComponent">
            <option v-for="item in componentOptions" :key="'c-' + item" :value="item">{{ item }}</option>
          </select>
        </label>
      </div>
      <div class="filter-actions">
        <div class="left-actions">
          <button class="btn btn-muted" @click="resetFilters">重置筛选</button>
          <label class="size-select">
            <span>每页</span>
            <select v-model.number="pageSize">
              <option :value="24">24</option>
              <option :value="48">48</option>
              <option :value="96">96</option>
            </select>
          </label>
        </div>
        <div class="result-count">命中 {{ filteredRecords.length }} 条</div>
      </div>
    </div>

    <div class="loading-box" v-if="loading">正在加载检索数据...</div>

    <div class="result-list beautify-scroll-def" v-else-if="pageRecords.length">
      <article class="result-card" v-for="item in pageRecords" :key="item.id">
        <header class="card-head">
          <h3 class="card-title">{{ item.name }}</h3>
          <div class="card-tags">
            <span class="tag">{{ item.province }}</span>
            <span class="tag">{{ item.type }}</span>
            <span class="tag">{{ item.period }}</span>
            <span class="tag" v-if="item.batch">{{ item.batch }}</span>
            <span class="tag tag-component">{{ item.component }}</span>
          </div>
        </header>
        <p class="card-summary">{{ item.summary }}</p>
        <p class="card-recommend">建议：{{ item.recommendation }}</p>
        <footer class="card-actions">
          <button class="btn btn-primary" @click="linkToDashboard(item)">联动首页地图/排行</button>
          <button class="btn btn-muted" @click="openSource(item)">查看来源说明</button>
        </footer>
      </article>
    </div>

    <div class="empty-box" v-else>
      <div class="empty-title">暂无匹配结果</div>
      <div class="empty-desc">尝试放宽筛选条件，或切换关键词。</div>
    </div>

    <div class="pager" v-if="!loading && filteredRecords.length">
      <button class="btn btn-muted" @click="goPrev" :disabled="currentPage <= 1">上一页</button>
      <div class="pager-info">第 {{ currentPage }} / {{ totalPages }} 页</div>
      <button class="btn btn-muted" @click="goNext" :disabled="currentPage >= totalPages">下一页</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-page {
  height: calc(100% - 64px);
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--theme-text);
}

.search-head {
  padding: 8px 12px;
  border: 1px solid var(--theme-header-border);
  border-radius: 8px;
  background: rgba(26, 20, 16, 0.4);
}

.head-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--theme-title-mid);
}

.head-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.head-back-btn {
  padding: 7px 12px;
  white-space: nowrap;
}

.head-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(232, 213, 181, 0.7);
}

.head-meta {
  margin-top: 4px;
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: rgba(157, 201, 177, 0.9);
}

.head-error {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(225, 114, 96, 0.95);
}

.filter-panel {
  padding: 10px 12px 12px;
  border: 1px solid rgba(201, 169, 110, 0.24);
  border-radius: 8px;
  background: rgba(20, 16, 12, 0.78);
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field span {
  font-size: 11px;
  color: rgba(232, 213, 181, 0.72);
}

.field input,
.field select,
.size-select select {
  height: 34px;
  border: 1px solid rgba(201, 169, 110, 0.28);
  border-radius: 6px;
  background: rgba(12, 10, 8, 0.76);
  color: rgba(245, 240, 232, 0.92);
  font-size: 12px;
  padding: 0 10px;
}

.filter-actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(232, 213, 181, 0.74);
}

.size-select select {
  height: 30px;
}

.result-count {
  font-size: 12px;
  color: rgba(232, 213, 181, 0.74);
}

.loading-box,
.empty-box {
  flex: 1;
  border: 1px dashed rgba(201, 169, 110, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  min-height: 220px;
}

.loading-box {
  color: rgba(232, 213, 181, 0.8);
  font-size: 14px;
}

.empty-title {
  font-size: 16px;
  color: var(--theme-title-mid);
}

.empty-desc {
  font-size: 12px;
  color: rgba(232, 213, 181, 0.7);
}

.result-list {
  flex: 1;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-right: 2px;
}

.result-card {
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 8px;
  background: rgba(20, 16, 12, 0.82);
  padding: 10px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.card-title {
  margin: 0;
  font-size: 15px;
  line-height: 1.35;
  color: var(--theme-title-mid);
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tag {
  border: 1px solid rgba(201, 169, 110, 0.24);
  border-radius: 10px;
  font-size: 10px;
  line-height: 1;
  padding: 3px 7px;
  color: rgba(232, 213, 181, 0.78);
}

.tag-component {
  border-color: rgba(123, 170, 158, 0.5);
  color: rgba(157, 201, 177, 0.92);
}

.card-summary {
  margin: 8px 0 4px;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(232, 213, 181, 0.82);
}

.card-recommend {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(157, 201, 177, 0.9);
}

.card-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.btn {
  border: 1px solid rgba(201, 169, 110, 0.28);
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
  padding: 8px 12px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  color: #f0d89d;
  border-color: rgba(212, 168, 71, 0.52);
  background: rgba(212, 168, 71, 0.14);
}

.btn-muted {
  color: rgba(232, 213, 181, 0.82);
  background: rgba(26, 20, 16, 0.4);
}

.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding-bottom: 2px;
}

.pager-info {
  font-size: 12px;
  color: rgba(232, 213, 181, 0.82);
}

@media (max-width: 1400px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .result-list {
    grid-template-columns: 1fr;
  }
}
</style>
