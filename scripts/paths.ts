import { join } from "path/posix"

export const manualDataPath = (...segments: string[]) =>
	join(import.meta.dirname, "../Manual/src/data", ...segments)
