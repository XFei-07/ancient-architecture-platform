<script setup lang="ts">
const metrics = [
  { value: "2,170", label: "古建筑类国保", unit: "处", tone: "jade" },
  { value: "5,061", label: "全国重点文保", unit: "处", tone: "gold" },
  { value: "31", label: "覆盖省区市", unit: "个", tone: "blue" },
  { value: "14+", label: "历史时期", unit: "段", tone: "red" },
];

const provinces = [
  { name: "山西", value: 421, percent: 100 },
  { name: "河南", value: 157, percent: 37.3 },
  { name: "浙江", value: 145, percent: 34.4 },
  { name: "四川", value: 140, percent: 33.3 },
  { name: "河北", value: 138, percent: 32.8 },
];

const categories = [
  { name: "民居", value: 980, color: "#a9677c" },
  { name: "桥梁", value: 540, color: "#b99a72" },
  { name: "官府", value: 430, color: "#e6ad64" },
  { name: "皇宫", value: 210, color: "#72a48d" },
];

const periods = ["先秦", "秦汉", "隋唐", "宋元", "明清", "近现代"];

const goTo = (href: string) => {
  window.location.href = href;
};
</script>

<template>
  <div class="mobile-home">
    <header class="mobile-header">
      <div class="brand-mark" aria-hidden="true"><span></span></div>
      <div class="brand-copy">
        <p class="eyebrow">CHINESE ARCHITECTURAL HERITAGE</p>
        <h1>青檐千载</h1>
        <p class="subtitle">中国古建筑时空图谱</p>
      </div>
      <a class="search-button" href="/#/search" aria-label="全局检索">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6"></circle>
          <path d="m16 16 4 4"></path>
        </svg>
      </a>
    </header>

    <main class="mobile-content">
      <section class="hero-panel" aria-labelledby="mobile-overview-title">
        <div class="hero-roof" aria-hidden="true">
          <i></i><span></span><i></i>
        </div>
        <div class="hero-copy">
          <div>
            <p class="section-kicker">国家级文化遗产数据概览</p>
            <h2 id="mobile-overview-title">一屏阅古建，掌中见山河</h2>
          </div>
          <span class="fresh-chip"><i></i> 数据已同步</span>
        </div>
        <p class="hero-description">
          以公开数据为基础，轻量呈现古建筑分布、类别构成与保护线索。
        </p>
        <div class="hero-actions">
          <button class="primary-action" type="button" @click="goTo('/3d-showroom.html')">
            <span class="action-icon action-icon--cube" aria-hidden="true">◇</span>
            进入 3D 展厅
          </button>
          <button class="secondary-action" type="button" @click="goTo('/#/search')">
            检索古建
          </button>
        </div>
      </section>

      <section class="metric-grid" aria-label="核心数据">
        <article v-for="item in metrics" :key="item.label" class="metric-card" :class="`tone-${item.tone}`">
          <div class="metric-topline"></div>
          <p><strong>{{ item.value }}</strong><span>{{ item.unit }}</span></p>
          <h3>{{ item.label }}</h3>
        </article>
      </section>

      <section id="distribution" class="content-card distribution-card">
        <div class="section-heading">
          <div>
            <p class="section-kicker">PROVINCIAL DISTRIBUTION</p>
            <h2>重点省份分布</h2>
          </div>
          <a href="/?view=desktop#/index">完整地图 <span>›</span></a>
        </div>
        <div class="province-list">
          <div v-for="(item, index) in provinces" :key="item.name" class="province-row">
            <span class="rank">{{ String(index + 1).padStart(2, "0") }}</span>
            <span class="province-name">{{ item.name }}</span>
            <div class="province-track" aria-hidden="true">
              <i :style="{ width: `${item.percent}%` }"></i>
            </div>
            <strong>{{ item.value }}</strong>
            <small>处</small>
          </div>
        </div>
        <p class="data-note">省级古建筑类国保处数 · 最新公开源口径</p>
      </section>

      <section id="categories" class="content-card category-card">
        <div class="section-heading">
          <div>
            <p class="section-kicker">HERITAGE CATEGORIES</p>
            <h2>四类古建样本</h2>
          </div>
          <span class="sample-total">2,160 份样本</span>
        </div>
        <div class="category-content">
          <div class="category-ring" role="img" aria-label="民居、桥梁、官府、皇宫四类样本占比">
            <div><strong>45.4%</strong><span>民居占比</span></div>
          </div>
          <div class="category-legend">
            <div v-for="item in categories" :key="item.name" class="legend-row">
              <i :style="{ backgroundColor: item.color }"></i>
              <span>{{ item.name }}</span>
              <strong>{{ item.value }}</strong>
              <small>处</small>
            </div>
          </div>
        </div>
      </section>

      <section class="period-card">
        <div class="section-heading">
          <div>
            <p class="section-kicker">TIME CORRIDOR</p>
            <h2>穿行千年营造史</h2>
          </div>
        </div>
        <div class="period-line" aria-label="历史时期">
          <span v-for="(period, index) in periods" :key="period" :class="{ active: index === 4 }">
            <i></i>{{ period }}
          </span>
        </div>
      </section>

      <section id="explore" class="explore-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">EXPLORE</p>
            <h2>继续探索</h2>
          </div>
        </div>
        <div class="explore-grid">
          <a class="explore-card explore-card--3d" href="/3d-showroom.html">
            <span class="explore-symbol">3D</span>
            <div><strong>沉浸式展厅</strong><small>轻量模型优先加载</small></div>
            <b>›</b>
          </a>
          <a class="explore-card" href="/#/search">
            <span class="explore-symbol">检</span>
            <div><strong>古建检索</strong><small>按名称、地区与类别查找</small></div>
            <b>›</b>
          </a>
          <a class="explore-card" href="/source-catalog.html#scope">
            <span class="explore-symbol">源</span>
            <div><strong>来源与口径</strong><small>查看数据说明与版本</small></div>
            <b>›</b>
          </a>
          <a class="explore-card" href="/?view=desktop#/index">
            <span class="explore-symbol">屏</span>
            <div><strong>完整大屏</strong><small>地图、模型与研究图表</small></div>
            <b>›</b>
          </a>
        </div>
      </section>

      <aside class="performance-note">
        <span aria-hidden="true">⚡</span>
        <div><strong>移动轻量模式</strong><p>已关闭大屏动画与重型图表，减少流量和等待时间。</p></div>
      </aside>
    </main>

    <nav class="mobile-nav" aria-label="手机端主导航">
      <a class="active" href="#top"><span>檐</span>首页</a>
      <a href="#distribution"><span>域</span>分布</a>
      <a href="#categories"><span>类</span>类别</a>
      <a href="#explore"><span>游</span>探索</a>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.mobile-home {
  --mobile-jade: #83b8a0;
  --mobile-jade-bright: #b8dec9;
  --mobile-gold: #c9a96e;
  --mobile-gold-light: #ecd49f;
  --mobile-card: #0d1d16;
  --mobile-card-soft: #10251b;
  --mobile-line: rgba(131, 184, 160, 0.18);
  min-height: 100dvh;
  padding-bottom: calc(78px + env(safe-area-inset-bottom));
  background:
    linear-gradient(rgba(6, 20, 14, 0.96), rgba(7, 17, 13, 0.98)),
    repeating-linear-gradient(90deg, transparent 0 39px, rgba(131, 184, 160, 0.025) 40px);
  color: #e8f3ec;
  font-family: "Noto Serif SC", "Songti SC", "STSong", serif;
  overflow-x: hidden;
}

.mobile-header {
  min-height: 88px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 13px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 40px;
  gap: 11px;
  align-items: center;
  border-bottom: 1px solid var(--mobile-line);
  background: #081610;
}

.brand-mark {
  position: relative;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(201, 169, 110, 0.45);
  border-radius: 8px 8px 14px 14px;
  background: linear-gradient(145deg, rgba(201, 169, 110, 0.16), rgba(131, 184, 160, 0.08));
  overflow: hidden;

  &::before,
  &::after,
  span {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border-style: solid;
    border-color: transparent transparent var(--mobile-gold-light);
  }

  &::before { top: 6px; border-width: 0 16px 8px; opacity: 0.95; }
  span { top: 15px; border-width: 0 12px 6px; opacity: 0.65; }
  &::after { bottom: 7px; width: 15px; height: 13px; border: 1px solid rgba(201, 169, 110, 0.68); border-top: 0; }
}

.brand-copy {
  min-width: 0;

  .eyebrow {
    margin: 0 0 2px;
    color: rgba(131, 184, 160, 0.58);
    font-family: Arial, sans-serif;
    font-size: 7px;
    letter-spacing: 1.4px;
  }

  h1 {
    margin: 0;
    color: var(--mobile-gold-light);
    font-size: 24px;
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: 4px;
  }

  .subtitle {
    margin: 4px 0 0;
    color: rgba(220, 237, 227, 0.62);
    font-size: 10px;
    letter-spacing: 1.5px;
  }
}

.search-button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid var(--mobile-line);
  border-radius: 50%;
  color: var(--mobile-jade-bright);
  background: rgba(131, 184, 160, 0.07);

  svg { width: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; }
}

.mobile-content {
  width: min(100%, 560px);
  margin: 0 auto;
  padding: 14px 13px 20px;
}

.hero-panel,
.content-card,
.period-card {
  border: 1px solid var(--mobile-line);
  background: linear-gradient(155deg, rgba(18, 44, 32, 0.86), rgba(9, 25, 18, 0.95));
  border-radius: 17px;
}

.hero-panel {
  position: relative;
  padding: 26px 17px 17px;
  overflow: hidden;
  border-color: rgba(201, 169, 110, 0.25);

  &::after {
    content: "古建";
    position: absolute;
    right: -6px;
    bottom: -28px;
    color: rgba(201, 169, 110, 0.035);
    font-size: 100px;
    font-weight: 900;
    pointer-events: none;
  }
}

.hero-roof {
  position: absolute;
  top: 0;
  left: 18px;
  right: 18px;
  height: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: center;

  span { width: 74%; height: 8px; border-bottom: 2px solid rgba(201, 169, 110, 0.65); border-radius: 0 0 50% 50%; }
  i { width: 18px; height: 8px; border-top: 2px solid rgba(201, 169, 110, 0.7); transform: translateY(5px) rotate(16deg); }
  i:last-child { transform: translateY(5px) rotate(-16deg); }
}

.hero-copy {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;

  h2 { margin: 5px 0 0; font-size: clamp(21px, 6vw, 28px); line-height: 1.28; color: #f0dfb9; letter-spacing: 1px; }
}

.section-kicker {
  margin: 0;
  color: rgba(131, 184, 160, 0.66);
  font-family: Arial, sans-serif;
  font-size: 8px;
  letter-spacing: 1.4px;
}

.fresh-chip {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  border: 1px solid rgba(131, 184, 160, 0.2);
  border-radius: 20px;
  color: rgba(190, 222, 204, 0.75);
  font-family: sans-serif;
  font-size: 9px;

  i { width: 5px; height: 5px; border-radius: 50%; background: #76c49e; box-shadow: 0 0 7px rgba(118, 196, 158, 0.6); }
}

.hero-description {
  position: relative;
  z-index: 1;
  max-width: 310px;
  margin: 11px 0 16px;
  color: rgba(222, 237, 228, 0.65);
  font-size: 12px;
  line-height: 1.75;
}

.hero-actions { position: relative; z-index: 1; display: flex; gap: 9px; }
.hero-actions button { min-height: 42px; border-radius: 10px; font-family: inherit; font-size: 13px; letter-spacing: 0.5px; }
.primary-action { flex: 1; border: 1px solid rgba(201, 169, 110, 0.68); color: #142118; background: linear-gradient(135deg, #d7bd84, #a98a51); font-weight: 700; }
.secondary-action { width: 96px; border: 1px solid rgba(131, 184, 160, 0.28); color: #b9d9c7; background: rgba(131, 184, 160, 0.08); }
.action-icon { margin-right: 5px; font-size: 18px; vertical-align: -1px; }

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 10px;
}

.metric-card {
  position: relative;
  min-height: 104px;
  padding: 16px 13px 12px;
  overflow: hidden;
  border: 1px solid rgba(131, 184, 160, 0.13);
  border-radius: 14px;
  background: rgba(12, 31, 22, 0.88);

  &::after { content: ""; position: absolute; width: 64px; height: 64px; right: -25px; bottom: -28px; border: 1px solid currentColor; border-radius: 50%; opacity: 0.1; }
  p { margin: 0; display: flex; align-items: baseline; gap: 4px; }
  strong { font-family: Arial, sans-serif; font-size: 26px; font-weight: 500; letter-spacing: -0.5px; }
  p span { color: rgba(230, 240, 234, 0.48); font-size: 10px; }
  h3 { margin: 8px 0 0; color: rgba(231, 241, 235, 0.68); font-size: 11px; font-weight: 400; letter-spacing: 0.5px; }
}

.metric-topline { width: 26px; height: 2px; margin-bottom: 8px; background: currentColor; opacity: 0.65; }
.tone-jade { color: #8fc4aa; }
.tone-gold { color: #d9b979; }
.tone-blue { color: #8db9bd; }
.tone-red { color: #c97e7e; }

.content-card,
.period-card,
.explore-section { margin-top: 10px; padding: 17px 15px; content-visibility: auto; contain-intrinsic-size: 360px; }

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;

  h2 { margin: 4px 0 0; color: #e9dab8; font-size: 18px; line-height: 1.2; letter-spacing: 1px; }
  a { color: rgba(153, 200, 177, 0.72); font-size: 10px; text-decoration: none; }
  a span { font-size: 16px; vertical-align: -1px; }
}

.province-list { display: grid; gap: 13px; }
.province-row { display: grid; grid-template-columns: 20px 34px minmax(0, 1fr) 30px 12px; gap: 7px; align-items: center; font-family: sans-serif; }
.rank { color: rgba(201, 169, 110, 0.48); font-size: 9px; }
.province-name { color: rgba(235, 242, 237, 0.82); font-family: "Songti SC", serif; font-size: 12px; }
.province-track { height: 5px; overflow: hidden; border-radius: 10px; background: rgba(131, 184, 160, 0.09); }
.province-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, rgba(83, 139, 111, 0.72), #bf9c5d); }
.province-row strong { color: #dcc28c; font-size: 12px; text-align: right; font-weight: 500; }
.province-row small { color: rgba(230, 240, 234, 0.35); font-size: 8px; }
.data-note { margin: 15px 0 0; padding-top: 11px; border-top: 1px dashed rgba(131, 184, 160, 0.13); color: rgba(193, 216, 203, 0.42); font-size: 9px; }

.sample-total { color: rgba(201, 169, 110, 0.65); font-family: sans-serif; font-size: 10px; }
.category-content { display: grid; grid-template-columns: 128px minmax(0, 1fr); align-items: center; gap: 16px; }
.category-ring {
  width: 124px;
  height: 124px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#a9677c 0 45.4%, #b99a72 45.4% 70.4%, #e6ad64 70.4% 90.3%, #72a48d 90.3% 100%);

  &::before { content: ""; grid-area: 1 / 1; width: 78px; height: 78px; border-radius: 50%; background: #0d2118; box-shadow: inset 0 0 0 1px rgba(131, 184, 160, 0.12); }
  div { position: relative; grid-area: 1 / 1; display: grid; text-align: center; }
  strong { color: #eed8ab; font-family: Arial, sans-serif; font-size: 17px; font-weight: 500; }
  span { margin-top: 2px; color: rgba(196, 219, 206, 0.52); font-size: 9px; }
}

.category-legend { display: grid; gap: 11px; }
.legend-row { display: grid; grid-template-columns: 7px 1fr auto 12px; gap: 7px; align-items: baseline; }
.legend-row i { width: 7px; height: 7px; border-radius: 2px; }
.legend-row span { color: rgba(231, 240, 234, 0.74); font-size: 11px; }
.legend-row strong { color: #dec796; font-family: Arial, sans-serif; font-size: 12px; font-weight: 500; }
.legend-row small { color: rgba(231, 240, 234, 0.35); font-size: 8px; }

.period-card { overflow: hidden; }
.period-line { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); width: 100%; padding: 8px 0 2px; }
.period-line span { position: relative; min-width: 0; padding-top: 16px; color: rgba(215, 231, 222, 0.48); font-size: 9px; text-align: center; }
.period-line span::before { content: ""; position: absolute; top: 4px; left: 0; right: 0; height: 1px; background: rgba(131, 184, 160, 0.16); }
.period-line i { position: absolute; top: 0; left: 50%; width: 9px; height: 9px; transform: translateX(-50%) rotate(45deg); border: 1px solid rgba(131, 184, 160, 0.45); background: #0d2017; }
.period-line span.active { color: #e8d39f; }
.period-line span.active i { border-color: #d0ad68; background: #d0ad68; box-shadow: 0 0 0 4px rgba(208, 173, 104, 0.1); }

.explore-section { padding-inline: 2px; }
.explore-grid { display: grid; gap: 8px; }
.explore-card {
  min-height: 66px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  gap: 12px;
  align-items: center;
  padding: 10px 13px;
  border: 1px solid rgba(131, 184, 160, 0.13);
  border-radius: 13px;
  color: inherit;
  text-decoration: none;
  background: rgba(12, 31, 22, 0.78);

  &--3d { border-color: rgba(201, 169, 110, 0.28); background: linear-gradient(90deg, rgba(62, 48, 25, 0.42), rgba(12, 31, 22, 0.88)); }
  div { display: grid; gap: 3px; }
  strong { color: #eadab6; font-size: 13px; font-weight: 600; }
  small { color: rgba(198, 220, 208, 0.48); font-family: sans-serif; font-size: 9px; }
  b { color: rgba(201, 169, 110, 0.55); font-size: 21px; font-weight: 400; }
}

.explore-symbol { width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid rgba(201, 169, 110, 0.3); border-radius: 10px; color: #d5bd89; font-family: Arial, sans-serif; font-size: 12px; background: rgba(201, 169, 110, 0.07); }

.performance-note { margin: 14px 2px 0; padding: 11px 13px; display: flex; gap: 10px; align-items: flex-start; border-radius: 12px; color: rgba(188, 216, 201, 0.65); background: rgba(77, 129, 103, 0.08); }
.performance-note > span { color: #d7b972; font-size: 15px; }
.performance-note strong { display: block; color: rgba(213, 232, 221, 0.8); font-size: 10px; }
.performance-note p { margin: 3px 0 0; font-family: sans-serif; font-size: 9px; line-height: 1.5; }

.mobile-nav {
  position: fixed;
  z-index: 20;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(62px + env(safe-area-inset-bottom));
  padding: 7px 18px env(safe-area-inset-bottom);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(131, 184, 160, 0.16);
  background: #081610;
}

.mobile-nav a { display: grid; justify-items: center; align-content: center; gap: 2px; color: rgba(185, 211, 197, 0.45); font-family: sans-serif; font-size: 9px; text-decoration: none; }
.mobile-nav span { width: 25px; height: 25px; display: grid; place-items: center; border-radius: 8px; font-family: "Songti SC", serif; font-size: 12px; }
.mobile-nav a.active { color: #d9c38f; }
.mobile-nav a.active span { color: #0b1a12; background: #c9a96e; }

@media (min-width: 520px) {
  .metric-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .metric-card { min-height: 100px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; }
}
</style>
