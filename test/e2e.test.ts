import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BANNER, DONE, HYPE } from "../src/copy.ts";

describe("goon -p end to end", () => {
	it("answers through Pi with plain, goon-free output", () => {
		const agentDir = mkdtempSync(join(tmpdir(), "goon-e2e-"));
		const run = spawnSync(
			process.execPath,
			[
				"dist/cli.js",
				"-p",
				"hi",
				"--extension",
				"test/fixtures/faux-provider.ts",
				"--model",
				"faux/faux-1",
				"--offline",
			],
			{ encoding: "utf8", env: { ...process.env, PI_CODING_AGENT_DIR: agentDir }, timeout: 60_000 },
		);
		expect(run.stderr).not.toMatch(/error/i);
		expect(run.status).toBe(0);
		expect(run.stdout).toContain("faux says hi");
		expect(run.stdout).not.toContain("VOICE-LEAKED");
		expect(run.stdout).not.toContain(BANNER.trim().split("\n")[0]);
		for (const line of [...HYPE, ...DONE]) expect(run.stdout).not.toContain(line);
	});
});
