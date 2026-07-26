import { app } from "electron";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILES = [".env", ".env.local", ".env.development", ".env.development.local"];

export function loadDesktopEnv() {
  const root = findWorkspaceRoot();
  if (!root) {
    return;
  }

  for (const file of ENV_FILES) {
    loadEnvFile(path.join(root, file));
  }
}

function findWorkspaceRoot() {
  const candidates = [process.cwd(), app.getAppPath(), __dirname];

  for (const candidate of candidates) {
    const root = findUp(candidate, (directory) => {
      const packageJsonPath = path.join(directory, "package.json");
      if (!existsSync(packageJsonPath)) {
        return false;
      }

      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { name?: string };
        return packageJson.name === "kickoff";
      } catch {
        return false;
      }
    });

    if (root) {
      return root;
    }
  }

  return undefined;
}

function findUp(startDirectory: string, predicate: (directory: string) => boolean) {
  let directory = path.resolve(startDirectory);

  for (let depth = 0; depth < 8; depth += 1) {
    if (predicate(directory)) {
      return directory;
    }

    const parent = path.dirname(directory);
    if (parent === directory) {
      break;
    }

    directory = parent;
  }

  return undefined;
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const parsed = parseEnvLine(line);
    if (!parsed || process.env[parsed.key] !== undefined) {
      continue;
    }

    process.env[parsed.key] = parsed.value;
  }
}

function parseEnvLine(line: string) {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith("#")) {
    return undefined;
  }

  const separatorIndex = trimmedLine.indexOf("=");
  if (separatorIndex <= 0) {
    return undefined;
  }

  const key = trimmedLine.slice(0, separatorIndex).trim();
  const value = unquoteEnvValue(trimmedLine.slice(separatorIndex + 1).trim());
  return { key, value };
}

function unquoteEnvValue(value: string) {
  const quote = value[0];
  if ((quote === "\"" || quote === "'") && value.endsWith(quote)) {
    return value.slice(1, -1);
  }

  return value;
}
