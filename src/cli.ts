#!/usr/bin/env node
import { spawn } from "node:child_process";
import { main } from "@earendil-works/pi-coding-agent";
import { routeArgs, updateCommand, VERSION } from "./args.ts";
import goon from "./goon.ts";

const args = process.argv.slice(2);
const route = routeArgs(args);

if (route === "version") {
	console.log(VERSION);
} else if (route === "update") {
	const { cmd, args: npmArgs, shell } = updateCommand(process.platform);
	spawn(cmd, npmArgs, { stdio: "inherit", shell }).on("exit", (code) => process.exit(code ?? 1));
} else {
	// Pi's own update nag would point at Pi, not GoonCodes
	process.env.PI_SKIP_VERSION_CHECK = "1";
	// shortcut: Pi help text and ~/.pi config dir still say "pi", override if friends complain.
	await main(args, { extensionFactories: [{ name: "goon", factory: goon }] });
}
