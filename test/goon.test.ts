import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DONE, HYPE, VOICE, WORKING } from "../src/copy.ts";
import goon from "../src/goon.ts";
import { fakePi } from "./fake-pi.ts";

function setup(...args: Parameters<typeof fakePi>) {
	const f = fakePi(...args);
	goon(f.api);
	return f;
}

const userStart = { messageType: "user", prompt: "hi", systemPrompt: "BASE" };

describe("goon words, banner and title", () => {
	it("sets header, title and a goon spinner in the TUI", async () => {
		const f = setup("tui");
		await f.start();
		expect(f.ctx.ui.setHeader).toHaveBeenCalledOnce();
		expect(f.ctx.ui.setTitle.mock.calls[0][0]).toContain("GoonCodes");
		expect(WORKING).toContain(f.ctx.ui.setWorkingMessage.mock.calls[0][0]);
		expect(WORKING[0]).toBe("gooning…");
	});

	it("renders the banner header as lines", async () => {
		const f = setup("tui");
		await f.start();
		const header = f.ctx.ui.setHeader.mock.calls[0][0](
			{},
			{ fg: (_c: string, t: string) => t, bold: (t: string) => t },
		);
		expect(header.render(80).join("\n")).toContain("The coding agent that goons so you don't have to.");
	});

	it("stays out of print mode entirely", async () => {
		const f = setup("print");
		await f.start();
		expect(f.ctx.ui.setHeader).not.toHaveBeenCalled();
		expect(f.ctx.ui.setTitle).not.toHaveBeenCalled();
		expect(f.ctx.ui.setWorkingMessage).not.toHaveBeenCalled();
		expect(f.ctx.ui.setTheme).not.toHaveBeenCalled();
		expect(await f.emit("before_agent_start", userStart)).toBeUndefined();
		await f.emit("agent_settled");
		expect(f.ctx.ui.notify).not.toHaveBeenCalled();
	});
});

describe("goon voice", () => {
	it("appends the voice to the system prompt in the TUI", async () => {
		const f = setup("tui");
		expect(await f.emit("before_agent_start", userStart)).toEqual({
			systemPrompt: `BASE\n\n${VOICE}`,
		});
	});

	it("keeps code and tool use normal", () => {
		expect(VOICE).toMatch(/code/i);
		expect(VOICE).toMatch(/tool/i);
	});

	it("/serious toggles the voice off and back on", async () => {
		const f = setup("tui");
		await f.run("serious");
		expect(await f.emit("before_agent_start", userStart)).toBeUndefined();
		await f.run("serious");
		expect(await f.emit("before_agent_start", userStart)).toEqual({
			systemPrompt: `BASE\n\n${VOICE}`,
		});
	});
});

describe("goon theme", () => {
	it("ships a goon theme file via resource discovery", async () => {
		const f = setup("tui");
		const result = await f.emit("resources_discover", {
			cwd: ".",
			reason: "startup",
		});
		expect(result.themePaths).toHaveLength(1);
		expect(result.themePaths[0]).toMatch(/goon\.json$/);
		expect(existsSync(result.themePaths[0])).toBe(true);
	});

	it("applies the goon theme when the user has not picked one", async () => {
		const f = setup("tui", "system");
		await f.start();
		expect(f.ctx.ui.setTheme).toHaveBeenCalledWith(f.goonTheme);
	});

	it("leaves a user-picked theme alone", async () => {
		const f = setup("tui", "dark");
		await f.start();
		expect(f.ctx.ui.setTheme).not.toHaveBeenCalled();
	});
});

describe("/goon", () => {
	it("hypes and sends the task as a prompt", async () => {
		const f = setup("tui");
		await f.run("goon", "fix the bug");
		expect(f.pi.sendUserMessage).toHaveBeenCalledWith("fix the bug");
		expect(HYPE).toContain(f.ctx.ui.notify.mock.calls[0][0]);
	});

	it("queues the task as a follow-up while the agent is busy", async () => {
		const f = setup("tui");
		f.ctx.isIdle = () => false;
		await f.run("goon", "fix the bug");
		expect(f.pi.sendUserMessage).toHaveBeenCalledWith("fix the bug", {
			deliverAs: "followUp",
		});
	});

	it("shows usage and sends nothing without a task", async () => {
		const f = setup("tui");
		await f.run("goon", "  ");
		expect(f.pi.sendUserMessage).not.toHaveBeenCalled();
		expect(f.ctx.ui.notify.mock.calls[0][0]).toContain("/goon <task>");
	});
});

describe("done message", () => {
	it("celebrates when the agent settles", async () => {
		const f = setup("tui");
		await f.emit("agent_settled");
		expect(DONE).toContain(f.ctx.ui.notify.mock.calls[0][0]);
		expect(DONE[0]).toBe("goon complete");
	});
});
