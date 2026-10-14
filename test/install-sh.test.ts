import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Runs site/install.sh with a fake npm that logs its args and reports `globalPrefix` as npm's global prefix.
function install(globalPrefix: string) {
	const dir = mkdtempSync(join(tmpdir(), "goon-install-"));
	const bin = join(dir, "bin");
	const home = join(dir, "home");
	mkdirSync(bin);
	mkdirSync(home);
	const log = join(dir, "npm.log");
	writeFileSync(
		join(bin, "npm"),
		`#!/bin/sh\nif [ "$1 $2" = "prefix -g" ]; then echo "${globalPrefix}"; exit 0; fi\necho "$@" >> "${log}"\n`,
	);
	chmodSync(join(bin, "npm"), 0o755);
	const run = spawnSync("sh", ["site/install.sh"], {
		encoding: "utf8",
		env: { PATH: `${bin}:${process.env.PATH}`, HOME: home },
	});
	return { run, home, npmArgs: readFileSync(log, "utf8").trim() };
}

describe.skipIf(process.platform === "win32")("install.sh", () => {
	it("installs globally when npm's global prefix is writable", () => {
		const prefix = mkdtempSync(join(tmpdir(), "goon-prefix-"));
		const { run, npmArgs } = install(prefix);
		expect(run.status).toBe(0);
		expect(npmArgs).toBe("i -g gooncodes");
	});

	it("falls back to ~/.local without sudo when the global prefix is not writable", () => {
		const { run, home, npmArgs } = install("/nonexistent-root-owned-prefix");
		expect(run.status).toBe(0);
		expect(npmArgs).toBe(`i -g --prefix ${home}/.local gooncodes`);
		expect(run.stdout + run.stderr).not.toMatch(/sudo/);
	});

	it("tells the user to add ~/.local/bin to PATH when it's missing", () => {
		const { run } = install("/nonexistent-root-owned-prefix");
		expect(run.stdout).toContain("/.local/bin");
	});
});
