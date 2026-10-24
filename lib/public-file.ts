import fs from "node:fs";
import path from "node:path";

/** True when `src` (a path under /public) exists. Server-only. */
export function publicFileExists(src: string) {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", src));
  } catch {
    return false;
  }
}
