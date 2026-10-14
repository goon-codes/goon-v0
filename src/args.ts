import { createRequire } from "node:module";

export const VERSION: string = createRequire(import.meta.url)(
	"../package.json",
).version;

export function routeArgs(args: string[]): "version" | "update" | "pi" {
	if (args[0] === "--version" || args[0] === "-v") return "version";
	if (args[0] === "update") return "update";
	return "pi";
}

export function updateCommand(platform: NodeJS.Platform): {
	cmd: string;
	args: string[];
	shell: boolean;
} {
	// npm is npm.cmd on Windows, which spawn only finds through a shell
	return {
		cmd: "npm",
		args: ["i", "-g", "gooncodes@latest"],
		shell: platform === "win32",
	};
}
