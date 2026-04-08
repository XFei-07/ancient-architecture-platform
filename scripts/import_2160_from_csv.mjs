#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

const parseArgs = (argv) => {
  const args = { input: "", output: "" };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--input" || v === "-i") {
      args.input = argv[i + 1] || "";
      i++;
      continue;
    }
    if (v === "--output" || v === "-o") {
      args.output = argv[i + 1] || "";
      i++;
      continue;
    }
  }
  return args;
};

const usage = () => {
  console.log("Usage: node scripts/import_2160_from_csv.mjs --input <csvPath> --output <jsonPath>");
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let i = 0;
  let inQuote = false;

  while (i < text.length) {
    const ch = text[i];

    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuote = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuote = true;
      i++;
      continue;
    }

    if (ch === ",") {
      row.push(cell);
      cell = "";
      i++;
      continue;
    }

    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
      continue;
    }

    if (ch === "\r") {
      i++;
      continue;
    }

    cell += ch;
    i++;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => String(c || "").trim() !== ""));
};

const pick = (obj, keys) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && String(obj[key]).trim()) {
      return String(obj[key]).trim();
    }
  }
  return "";
};

const normalize = (record, index) => {
  const id = pick(record, ["id", "ID", "编号", "序号"]) || `record-${index + 1}`;
  const name = pick(record, ["name", "名称", "古建名称", "项目名称", "title"]) || "未命名条目";
  const province = pick(record, ["province", "省份", "省", "地区", "region"]) || "未知";
  const type = pick(record, ["type", "类别", "类型", "category"]) || "未分类";
  const period = pick(record, ["period", "时期", "朝代", "era"]) || "未标注";
  const component = pick(record, ["component", "构件", "关键构件", "part"]) || "未标注";
  const summary =
    pick(record, ["summary", "简介", "概述", "描述", "description"]) ||
    `${name}，位于${province}，类型为${type}。`;
  const recommendation =
    pick(record, ["recommendation", "建议", "修缮建议", "保护建议"]) ||
    "建议结合实地巡检做分级保护。";
  const sourceAnchor =
    pick(record, ["sourceAnchor", "source", "来源链接", "来源锚点"]) ||
    "/source-catalog.html#official";

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
  };
};

const main = () => {
  const { input, output } = parseArgs(process.argv.slice(2));
  if (!input || !output) {
    usage();
    process.exit(1);
  }

  const inFile = path.resolve(cwd, input);
  const outFile = path.resolve(cwd, output);

  if (!fs.existsSync(inFile)) {
    console.error(`Input file not found: ${inFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inFile, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(raw);
  if (rows.length < 2) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }

  const header = rows[0].map((h) => String(h || "").trim());
  const dataRows = rows.slice(1);

  const records = dataRows.map((cells, idx) => {
    const obj = {};
    header.forEach((key, i) => {
      obj[key] = String(cells[i] || "").trim();
    });
    return normalize(obj, idx);
  });

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(records, null, 2), "utf8");

  console.log(`Imported ${records.length} records.`);
  console.log(`Output: ${outFile}`);
  if (records[0]) {
    console.log(`First: ${records[0].id} | ${records[0].name} | ${records[0].province}`);
  }
};

main();
