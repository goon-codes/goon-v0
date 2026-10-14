import { createRequire } from "node:module";
import { basename, dirname, resolve } from "node:path";

export const VERSION: string = createRequire(import.meta.url)("../package.json").version;

export function routeArgs(args: string[]): "version" | "update" | "pi" {
	if (args[0] === "--version" || args[0] === "-v") return "version";
	if (args[0] === "update") return "update";
	return "pi";
}

export function updateCommand(
	platform: NodeJS.Platform,
	pkgDir?: string,
): { cmd: string; args: string[]; shell: boolean } {
	// npm is npm.cmd on Windows, which spawn only finds through a shell
	if (platform === "win32") return { cmd: "npm", args: ["i", "-g", "gooncodes@latest"], shell: true };
	// <prefix>/lib/node_modules/gooncodes: update in place, e.g. ~/.local when /usr isn't writable
	const inPrefix = pkgDir && basename(dirname(pkgDir)) === "node_modules";
	const prefix = inPrefix ? ["--prefix", resolve(pkgDir, "../../..")] : [];
	return { cmd: "npm", args: ["i", "-g", ...prefix, "gooncodes@latest"], shell: false };
}
