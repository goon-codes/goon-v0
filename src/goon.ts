import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { BANNER, DONE, HYPE, pick, TAGLINE, VOICE, WORKING } from "./copy.ts";

const THEME_PATH = fileURLToPath(new URL("../themes/goon.json", import.meta.url));

export default function goon(pi: ExtensionAPI): void {
	let voice = true;

	pi.on("resources_discover", () => ({ themePaths: [THEME_PATH] }));

	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		ctx.ui.setTitle("GoonCodes");
		ctx.ui.setWorkingMessage(pick(WORKING));
		ctx.ui.setHeader((_tui, theme) => ({
			render: () => [...BANNER.split("\n").map((l) => theme.fg("accent", l)), theme.bold(TAGLINE), ""],
			invalidate: () => {},
		}));
		// "system" is Pi's default, so the user hasn't picked a theme yet.
		// shortcut: a user who explicitly picks "system" also gets goon, read settings.json if that bites.
		if (ctx.ui.theme.name !== "system") return;
		// Pi registers resources_discover themes right after session_start returns, so wait a tick.
		setTimeout(() => {
			const goonTheme = ctx.ui.getTheme("goon");
			// Passing the Theme object (not the name) keeps it out of the user's saved settings.
			if (goonTheme) ctx.ui.setTheme(goonTheme);
		}, 0);
	});

	pi.on("before_agent_start", (event, ctx) => {
		if (ctx.mode !== "tui" || !voice) return;
		ctx.ui.setWorkingMessage(pick(WORKING));
		return { systemPrompt: `${event.systemPrompt}\n\n${VOICE}` };
	});

	pi.on("agent_settled", (_event, ctx) => {
		if (ctx.mode === "tui") ctx.ui.notify(pick(DONE), "info");
	});

	pi.registerCommand("serious", {
		description: "Toggle the goon voice off and on",
		handler: async (_args, ctx) => {
			voice = !voice;
			ctx.ui.notify(voice ? "goon voice is back, boss" : "Serious mode on. Goon voice off.", "info");
		},
	});

	pi.registerCommand("goon", {
		description: "Lock in and goon on a task: /goon <task>",
		handler: async (args, ctx) => {
			const task = args.trim();
			if (!task) return ctx.ui.notify("usage: /goon <task>", "warning");
			ctx.ui.notify(pick(HYPE), "info");
			if (ctx.isIdle()) pi.sendUserMessage(task);
			else pi.sendUserMessage(task, { deliverAs: "followUp" });
		},
	});
}
