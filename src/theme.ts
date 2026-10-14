import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PI_SUBCOMMANDS = new Set(["install", "remove", "uninstall", "update", "list", "config", "auth", "mcp"]);

// Pi's --use-theme is an in-memory override: it survives /new, /resume and /reload
// without ever writing to the user's settings.json.
export function themeArgs(args: string[], saved: string | undefined): string[] {
	if (saved || args.includes("--use-theme") || PI_SUBCOMMANDS.has(args[0])) return args;
	return ["--use-theme", "goon", ...args];
}

export function savedTheme(settingsPaths: string[]): string | undefined {
	for (const path of settingsPaths) {
		try {
			const theme = JSON.parse(readFileSync(path, "utf8")).theme;
			if (theme) return theme;
		} catch {}
	}
}

// Pi resolves the startup theme before extensions load, so the file must already be in its themes folder.
export function installTheme(src: string, agentDir: string): void {
	try {
		const dest = join(agentDir, "themes", "goon.json");
		const content = readFileSync(src, "utf8");
		let current: string | undefined;
		try {
			current = readFileSync(dest, "utf8");
		} catch {}
		if (current === content) return;
		mkdirSync(join(agentDir, "themes"), { recursive: true });
		writeFileSync(dest, content);
	} catch {}
}
