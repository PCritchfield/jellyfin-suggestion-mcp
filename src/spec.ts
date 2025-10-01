import fs from "fs";
import path from "path";
import crypto from "crypto";
import YAML from "yaml";

export interface LoadedSpec {
  yamlText: string;
  json: any;
  etag: string;
  mtimeMs: number;
}
let cached: LoadedSpec | null = null;

const DEFAULT_SPEC = path.resolve(process.env.SPEC_PATH ?? "../jellyfin-mcp.spec.yaml");

export function loadSpec(specPath = DEFAULT_SPEC): LoadedSpec {
  const p = path.resolve(specPath);
  const st = fs.statSync(p);
  if (cached && cached.mtimeMs === st.mtimeMs) return cached;

  const yamlText = fs.readFileSync(p, "utf8");
  const json = YAML.parse(yamlText);
  const etag = crypto.createHash("sha256").update(yamlText).digest("hex").slice(0, 16);
  cached = { yamlText, json, etag, mtimeMs: st.mtimeMs };
  return cached;
}

export function getSpecSection(sectionPath: string, spec?: LoadedSpec): any {
  const s = spec ?? loadSpec();
  const parts = sectionPath.split("/").map(x => x.trim()).filter(Boolean);
  let node: any = s.json;
  for (const part of parts) {
    if (node && typeof node === "object" && part in node) node = node[part];
    else if (Array.isArray(node)) {
      const idx = Number(part);
      if (!Number.isInteger(idx) || idx < 0 || idx >= node.length) return undefined;
      node = node[idx];
    } else return undefined;
  }
  return node;
}

export function specTopLevelIndex(spec?: LoadedSpec) {
  const s = spec ?? loadSpec();
  return { keys: Object.keys(s.json ?? {}), etag: s.etag };
}
