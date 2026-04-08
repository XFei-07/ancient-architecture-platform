#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const BASE_URL =
  "https://services8.arcgis.com/MpJ5mLM8Jq4YQp3B/ArcGIS/rest/services/%E5%85%A8%E5%9B%BD%E9%87%8D%E7%82%B9%E6%96%87%E7%89%A9%E4%BF%9D%E6%8A%A4%E5%8D%95%E4%BD%8D%E6%95%B0%E6%8D%AE_shp/FeatureServer/0";
const QUERY_URL = `${BASE_URL}/query`;
const SOURCE_ANCHOR =
  "https://services8.arcgis.com/MpJ5mLM8Jq4YQp3B/ArcGIS/rest/services/%E5%85%A8%E5%9B%BD%E9%87%8D%E7%82%B9%E6%96%87%E7%89%A9%E4%BF%9D%E6%8A%A4%E5%8D%95%E4%BD%8D%E6%95%B0%E6%8D%AE_shp/FeatureServer";

const cwd = process.cwd();

const parseArgs = (argv) => {
  const args = {
    outDir: "public/data",
    batchSize: 1000,
    timeoutMs: 30000,
  };

  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--out-dir" || v === "-o") {
      args.outDir = argv[i + 1] || args.outDir;
      i++;
      continue;
    }
    if (v === "--batch-size") {
      const n = Number(argv[i + 1]);
      if (Number.isFinite(n) && n > 0) args.batchSize = Math.floor(n);
      i++;
      continue;
    }
    if (v === "--timeout-ms") {
      const n = Number(argv[i + 1]);
      if (Number.isFinite(n) && n > 0) args.timeoutMs = Math.floor(n);
      i++;
      continue;
    }
  }

  return args;
};

const requestJson = async (url, timeoutMs) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

const buildQueryUrl = (params) => {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    usp.set(k, String(v));
  });
  return `${QUERY_URL}?${usp.toString()}`;
};

const getCount = async (where, timeoutMs) => {
  const url = buildQueryUrl({
    where,
    returnCountOnly: true,
    f: "pjson",
  });
  const data = await requestJson(url, timeoutMs);
  const count = Number(data?.count || 0);
  if (!Number.isFinite(count) || count < 0) {
    throw new Error("Invalid count response");
  }
  return count;
};

const fetchBatch = async ({ where, offset, batchSize, timeoutMs }) => {
  const url = buildQueryUrl({
    where,
    outFields: "FID,xzqhdm,xzqhmc,pc,mc,lx,sd,dz,lon,lat",
    orderByFields: "FID ASC",
    resultOffset: offset,
    resultRecordCount: batchSize,
    returnGeometry: false,
    f: "pjson",
  });
  const data = await requestJson(url, timeoutMs);
  if (data?.error) {
    throw new Error(`ArcGIS error: ${JSON.stringify(data.error)}`);
  }
  const list = Array.isArray(data?.features) ? data.features : [];
  return list.map((it) => it?.attributes || {}).filter((it) => Object.keys(it).length > 0);
};

const inferComponent = (type) => {
  const t = String(type || "");
  if (t.includes("古建筑")) return "斗拱";
  if (t.includes("石窟") || t.includes("石刻")) return "石刻";
  if (t.includes("古墓")) return "墓室结构";
  if (t.includes("近现代")) return "砖木结构";
  if (t.includes("古遗址")) return "遗址地层";
  return "未标注";
};

const inferRecommendation = (type) => {
  const t = String(type || "");
  if (t.includes("古建筑")) return "建议开展木构节点和屋面排水的分级巡检。";
  if (t.includes("石窟") || t.includes("石刻")) return "建议重点监测风化、渗水与表层病害发展。";
  if (t.includes("古墓")) return "建议加强封护环境稳定性与结构裂隙监测。";
  if (t.includes("近现代")) return "建议结合使用现状，分区实施预防性维护。";
  if (t.includes("古遗址")) return "建议控制遗址区扰动并强化地表排水管理。";
  return "建议结合实地巡检做分级保护。";
};

const normalize = (attrs) => {
  const id = `nkpd-${String(attrs.FID || "").trim()}`;
  const name = String(attrs.mc || "未命名条目").trim();
  const province = String(attrs.xzqhmc || "未知").trim();
  const type = String(attrs.lx || "未分类").trim();
  const period = String(attrs.sd || "未标注").trim();
  const component = inferComponent(type);
  const batch = String(attrs.pc || "未标注").trim();
  const address = String(attrs.dz || "").trim();
  const lon = Number(attrs.lon);
  const lat = Number(attrs.lat);

  const summaryParts = [name, `位于${province}`];
  if (address) summaryParts.push(`地点：${address}`);
  summaryParts.push(`类别：${type}`);
  summaryParts.push(`年代：${period}`);
  summaryParts.push(`批次：${batch}`);

  return {
    id,
    name,
    province,
    type,
    period,
    component,
    summary: `${summaryParts.join("，")}。`,
    recommendation: inferRecommendation(type),
    sourceAnchor: SOURCE_ANCHOR,
    batch,
    address,
    lon: Number.isFinite(lon) ? lon : null,
    lat: Number.isFinite(lat) ? lat : null,
    districtCode: String(attrs.xzqhdm || "").trim(),
  };
};

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(cwd, args.outDir);

  const whereAll = "1=1";
  const total = await getCount(whereAll, args.timeoutMs);
  console.log(`[1/4] Counting records: ${total}`);

  const rows = [];
  for (let offset = 0; offset < total; offset += args.batchSize) {
    const batch = await fetchBatch({
      where: whereAll,
      offset,
      batchSize: args.batchSize,
      timeoutMs: args.timeoutMs,
    });
    rows.push(...batch);
    console.log(`[2/4] Pulled ${Math.min(offset + batch.length, total)}/${total}`);
  }

  rows.sort((a, b) => Number(a.FID || 0) - Number(b.FID || 0));
  const normalized = rows.map(normalize);

  const fullLatest = normalized;
  const full5058 = normalized.slice(0, 5058);

  const ancientLatest = normalized.filter((item) => item.type === "古建筑");
  const ancient2160 = ancientLatest.slice(0, 2160);

  writeJson(path.join(outDir, "gujian_5061_latest.json"), fullLatest);
  writeJson(path.join(outDir, "gujian_5058.json"), full5058);
  writeJson(path.join(outDir, "gujian_2170_latest.json"), ancientLatest);
  writeJson(path.join(outDir, "gujian_2160.json"), ancient2160);

  const meta = {
    generatedAt: new Date().toISOString(),
    source: SOURCE_ANCHOR,
    sourceTotal: total,
    output: {
      gujian_5061_latest: fullLatest.length,
      gujian_5058: full5058.length,
      gujian_2170_latest: ancientLatest.length,
      gujian_2160: ancient2160.length,
    },
    note: "gujian_5058 与 gujian_2160 为兼容历史口径，按 FID 升序截取。",
  };
  writeJson(path.join(outDir, "gujian_dataset_meta.json"), meta);

  console.log("[3/4] Files generated:");
  console.log(`- ${path.join(outDir, "gujian_5061_latest.json")}`);
  console.log(`- ${path.join(outDir, "gujian_5058.json")}`);
  console.log(`- ${path.join(outDir, "gujian_2170_latest.json")}`);
  console.log(`- ${path.join(outDir, "gujian_2160.json")}`);
  console.log(`- ${path.join(outDir, "gujian_dataset_meta.json")}`);

  console.log("[4/4] Done.");
};

main().catch((err) => {
  console.error(`Failed: ${String(err?.message || err)}`);
  process.exit(1);
});
