# 中国古建筑类国保时空分布平台

一个基于 **Vue 3 + Vite** 的古建筑数据可视化大屏项目，面向展示、检索、联动分析与保护决策推演场景。

\---

## 1\. 项目简介

本项目围绕“古建筑类全国重点文物保护单位”数据构建，核心目标是把分散的公开信息组织成可交互的大屏分析系统，支持：

* 省级分布可视化
* 首页多面板联动（地图、排行、趋势、构件图鉴）
* 全局检索与筛选
* 保护决策沙盘（参数调节 + 方案导出）
* 数据口径追溯说明
* 3D 展厅与视频展示（可选模块）

项目适合用于：课程设计、毕业答辩、可视化演示、文博方向技术展示。

\---

## 2\. 功能模块

### 2.1 首页大屏 `/#/index`

* 三栏大屏布局（左/中/右）
* 全国地图 + 省级联动
* 保护优先级指数与情景调参
* 省份排行与趋势展示
* 古建构件图鉴
* 问答面板

### 2.2 全局检索 `/#/search`

* 按关键词、省份、类型、时期、构件筛选
* 分页浏览
* 从检索结果联动回首页地图/排行

### 2.3 决策沙盘 `/#/decision-sandbox`

* 预算、队伍、工期约束输入
* 策略模板与情景强度调节
* 方案 A/B 结果对比
* 导出 CSV/TXT 方案摘要

### 2.4 来源目录与独立页（可选）

* `public/source-catalog.html`：来源口径说明页
* `public/3d-showroom.html`：3D 模型展厅
* `public/video-viewer.html`：视频播放页

\---

## 3\. 技术栈

### 3.1 前端框架

* Vue `^3.4.21`
* Vue Router `^4.3.0`
* Pinia `^2.1.7`

### 3.2 可视化与 UI

* ECharts `^5.5.0`
* vue-echarts `^6.6.9`
* Element Plus `^2.6.2`
* CountUp.js `^2.8.0`

### 3.3 工具链

* Vite `^5.2.6`
* TypeScript `\~5.4.3`
* Sass `^1.72.0`
* TailwindCSS `^3.4.3`
* PostCSS / Autoprefixer

### 3.4 数据与脚本

* Axios
* MockJS（开发态模拟接口）
* Node.js 脚本（数据同步、CSV 导入、截图）

\---

## 4\. 环境要求

* Node.js：建议 `>= 18`
* npm：建议 `>= 9`
* 操作系统：Windows / Linux / macOS 均可

\---

## 5\. 快速开始

### 5.1 安装依赖

```bash
npm install
```

### 5.2 启动开发环境

```bash
npm run dev
```

默认端口在 `vite.config.ts` 中配置为 `8112`。

### 5.3 生产构建

```bash
npm run build
```

### 5.4 本地预览构建结果

```bash
npm run preview
```

### 5.5 类型检查

```bash
npm run type-check
```

\---

## 6\. 常用脚本

|命令|说明|
|-|-|
|`npm run dev`|启动开发服务器|
|`npm run build`|生产构建|
|`npm run preview`|本地预览构建产物|
|`npm run type-check`|TypeScript 类型检查|
|`npm run sync:relics`|从 ArcGIS 同步数据并生成 JSON 数据集|
|`npm run import:2160 -- --input <csv> --output <json>`|CSV 导入数据|

\---

## 7\. 数据说明

### 7.1 数据目录

* `public/data/`：业务数据集
* `public/map-geojson/`：地图边界数据

### 7.2 关键数据文件

* `gujian\_5061\_latest.json`：检索页当前默认数据源
* `gujian\_2170\_latest.json`：古建筑类子集
* `gujian\_5058.json` / `gujian\_2160.json`：兼容口径数据
* `gujian\_dataset\_meta.json`：数据元信息

### 7.3 数据更新流程

1. 执行 `npm run sync:relics`
2. 脚本输出最新 JSON 到 `public/data/`
3. 启动项目验证页面展示与筛选联动

\---

## 8\. 项目结构（核心目录）

```text
src/
  api/                 # 请求封装
  assets/              # 全局样式与图片素材
  components/          # 复用组件
  mock/                # mock 接口定义
  plugins/             # 插件注册（如 ECharts）
  router/              # 路由
  stores/              # Pinia 状态
  utils/               # 工具函数
  views/               # 页面模块
public/
  data/                # 数据集
  map-geojson/         # 地图边界
  models/              # 3D 模型
  video/               # 视频资源
  \*.html               # 独立展示页
scripts/               # 数据与辅助脚本
types/                 # 全局类型
```

\---

## 9\. 关键实现说明

### 9.1 路由组织

项目使用 Hash 路由，主页面挂在 `/home` 下：

* `/index`
* `/search`
* `/decision-sandbox`

### 9.2 状态管理

* 使用 Pinia 管理全局设置（缩放、自定义配置等）
* 页面间联动采用“共享状态 + 事件触发”结合方式

### 9.3 图表系统

* 统一在 `src/plugins/echarts.ts` 注册图表组件与图表类型
* 页面内通过 `v-chart` 使用 ECharts 配置项

### 9.4 Mock 机制

`src/main.ts` 默认启用了：

```ts
import { mockXHR } from "@/mock/index";
mockXHR();
```

如果你改为真实后端接口，可注释上述两行。

\---

## 10\. 配置与注意事项

### 10.1 API Key 与安全

项目中的问答面板目前采用前端直连方式。若用于正式场景，建议改成服务端代理，避免在前端暴露敏感密钥。

### 10.2 包管理器说明

当前仓库同时存在：

* `package-lock.json`
* `pnpm-lock.yaml`
建议实际使用时选择一种包管理器并保留对应锁文件。

### 10.3 大体积资源

`public/models/` 与 `public/video/` 体积较大。若仅做核心功能演示，可按需裁剪对应页面与资源。

\---

## 11\. 部署说明

本项目是标准 Vite 静态站点：

1. `npm run build`
2. 将 `dist/` 部署到静态服务器（Nginx、Netlify、Vercel、GitHub Pages 等）
3. 若部署在子路径，需按实际场景调整 `vite.config.ts` 中 `base`

\---

