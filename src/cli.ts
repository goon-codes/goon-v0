#!/usr/bin/env node
import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CONFIG_DIR_NAME, getAgentDir, main } from "@earendil-works/pi-coding-agent";
import { routeArgs, updateCommand, VERSION } from "./args.ts";
import goon from "./goon.ts";
import { installTheme, savedTheme, themeArgs } from "./theme.ts";

const args = process.argv.slice(2);
const route = routeArgs(args);

if (route === "version") {
	console.log(VERSION);
} else if (route === "update") {
	const { cmd, args: npmArgs, shell } = updateCommand(process.platform, fileURLToPath(new URL("..", import.meta.url)));
	spawn(cmd, npmArgs, { stdio: "inherit", shell }).on("exit", (code) => process.exit(code ?? 1));
} else {
	// Pi's own update nag would point at Pi, not GoonCodes
	process.env.PI_SKIP_VERSION_CHECK = "1";
	// shortcut: Pi help text and ~/.pi config dir still say "pi", override if friends complain.
	const agentDir = getAgentDir();
	installTheme(fileURLToPath(new URL("../themes/goon.json", import.meta.url)), agentDir);
	const saved = savedTheme([join(agentDir, "settings.json"), join(process.cwd(), CONFIG_DIR_NAME, "settings.json")]);
	await main(themeArgs(args, saved), { extensionFactories: [{ name: "goon", factory: goon }] });
}
