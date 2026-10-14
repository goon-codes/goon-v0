import { join } from "node:path";
import { type ExtensionAPI, getAgentDir } from "@earendil-works/pi-coding-agent";
import { VERSION } from "./args.ts";
import { BANNER, DONE, HYPE, pick, TAGLINE, VOICE, WORKING } from "./copy.ts";
import { checkForUpdate, fetchLatestVersion } from "./update.ts";

const realUpdateCheck = () =>
	checkForUpdate({
		current: VERSION,
		now: Date.now(),
		statePath: join(getAgentDir(), "gooncodes-update.json"),
		fetchLatest: fetchLatestVersion,
		offline: !!process.env.PI_OFFLINE,
	});

export default function goon(pi: ExtensionAPI, updateCheck: () => Promise<string | undefined> = realUpdateCheck): void {
	let voice = true;

	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		// Fire and forget so a slow registry never delays startup.
		updateCheck()
			.then((notice) => notice && ctx.ui.notify(notice, "info"))
			// ctx may be gone if the session ended first
			.catch(() => {});
		ctx.ui.setTitle("GoonCodes");
		ctx.ui.setWorkingMessage(pick(WORKING));
		ctx.ui.setHeader((_tui, theme) => ({
			render: () => [...BANNER.split("\n").map((l) => theme.fg("accent", l)), theme.bold(TAGLINE), ""],
			invalidate: () => {},
		}));
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
