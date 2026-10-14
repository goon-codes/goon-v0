import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { checkForUpdate } from "../src/update.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 10 * DAY;

function opts(overrides: Partial<Parameters<typeof checkForUpdate>[0]> = {}) {
	return {
		current: "0.1.0",
		now: NOW,
		statePath: join(mkdtempSync(join(tmpdir(), "goon-update-")), "gooncodes-update.json"),
		fetchLatest: vi.fn(async () => "0.2.0"),
		offline: false,
		...overrides,
	};
}

describe("checkForUpdate", () => {
	it("returns a notice for a newer version and records the check", async () => {
		const o = opts();
		expect(await checkForUpdate(o)).toBe("new goon dropped (v0.2.0), run `goon update`");
		expect(JSON.parse(readFileSync(o.statePath, "utf8"))).toEqual({ lastCheck: NOW });
	});

	it("stays quiet when already on the latest or newer", async () => {
		expect(await checkForUpdate(opts({ fetchLatest: vi.fn(async () => "0.1.0") }))).toBeUndefined();
		expect(await checkForUpdate(opts({ fetchLatest: vi.fn(async () => "0.0.9") }))).toBeUndefined();
	});

	it("checks at most once a day", async () => {
		const o = opts();
		writeFileSync(o.statePath, JSON.stringify({ lastCheck: NOW - DAY + 1000 }));
		expect(await checkForUpdate(o)).toBeUndefined();
		expect(o.fetchLatest).not.toHaveBeenCalled();
	});

	it("checks again after a day", async () => {
		const o = opts();
		writeFileSync(o.statePath, JSON.stringify({ lastCheck: NOW - DAY - 1 }));
		expect(await checkForUpdate(o)).toContain("v0.2.0");
	});

	it("skips entirely when offline", async () => {
		const o = opts({ offline: true });
		expect(await checkForUpdate(o)).toBeUndefined();
		expect(o.fetchLatest).not.toHaveBeenCalled();
	});

	it("never throws when the registry fails", async () => {
		const o = opts({ fetchLatest: vi.fn(async () => Promise.reject(new Error("ENOTFOUND"))) });
		expect(await checkForUpdate(o)).toBeUndefined();
	});

	it("ignores a garbage registry version", async () => {
		expect(await checkForUpdate(opts({ fetchLatest: vi.fn(async () => "lol") }))).toBeUndefined();
	});

	it("treats a corrupt state file as never checked", async () => {
		const o = opts();
		writeFileSync(o.statePath, "garbage");
		expect(await checkForUpdate(o)).toContain("v0.2.0");
	});

	it("never throws when the state file can't be written", async () => {
		const o = opts({ statePath: join(tmpdir(), "goon-missing-dir-xyz", "nested", "state.json") });
		expect(await checkForUpdate(o)).toContain("v0.2.0");
	});
});
