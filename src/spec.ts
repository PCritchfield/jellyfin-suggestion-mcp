import fs from "fs";
import path from "path";
import crypto from "crypto";
import YAML from "yaml";
import { fileURLToPath } from "url";

export interface LoadedSpec {
  yamlText: string;
  json: Record<string, unknown>;
  etag: string;
  mtimeMs: number;
}
let cached: LoadedSpec | null = null;

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve spec path relative to the package root (one level up from dist/)
const DEFAULT_SPEC = path.resolve(
  process.env.SPEC_PATH ?? path.join(__dirname, "..", "jellyfin-mcp.spec.yaml")
);

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

export function getSpecSection(sectionPath: string, spec?: LoadedSpec): unknown {
  const s = spec ?? loadSpec();
  const parts = sectionPath.split("/").map(x => x.trim()).filter(Boolean);
  let node: unknown = s.json;
  for (const part of parts) {
    if (node && typeof node === "object" && part in node) {
      node = (node as Record<string, unknown>)[part];
    }
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
