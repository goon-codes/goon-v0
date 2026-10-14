import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { installTheme, savedTheme, themeArgs } from "../src/theme.ts";

const tmp = () => mkdtempSync(join(tmpdir(), "goon-theme-"));

describe("themeArgs", () => {
	it("asks Pi for the goon theme when the user has none saved", () => {
		expect(themeArgs(["fix the bug"], undefined)).toEqual(["--use-theme", "goon", "fix the bug"]);
		expect(themeArgs([], undefined)).toEqual(["--use-theme", "goon"]);
	});

	it("leaves a saved theme alone, including a saved goon", () => {
		expect(themeArgs([], "dark")).toEqual([]);
		expect(themeArgs([], "goon")).toEqual([]);
	});

	it("leaves an explicit --use-theme alone", () => {
		expect(themeArgs(["--use-theme", "light"], undefined)).toEqual(["--use-theme", "light"]);
	});

	it("leaves Pi subcommands alone", () => {
		for (const cmd of ["install", "remove", "uninstall", "list", "config", "auth", "mcp"]) {
			expect(themeArgs([cmd, "x"], undefined)).toEqual([cmd, "x"]);
		}
	});
});

describe("savedTheme", () => {
	it("is undefined when no settings file sets a theme", () => {
		const dir = tmp();
		writeFileSync(join(dir, "settings.json"), JSON.stringify({ lastChangelogVersion: "1.2.0" }));
		expect(savedTheme([join(dir, "settings.json"), join(dir, "missing.json")])).toBeUndefined();
	});

	it("finds a theme in any of the settings files", () => {
		const dir = tmp();
		writeFileSync(join(dir, "project.json"), JSON.stringify({ theme: "light" }));
		expect(savedTheme([join(dir, "missing.json"), join(dir, "project.json")])).toBe("light");
	});

	it("ignores corrupt settings files", () => {
		const dir = tmp();
		writeFileSync(join(dir, "settings.json"), "{nope");
		expect(savedTheme([join(dir, "settings.json")])).toBeUndefined();
	});
});

describe("installTheme", () => {
	it("copies the goon theme into Pi's themes folder so Pi finds it at startup", () => {
		const src = join(tmp(), "goon.json");
		writeFileSync(src, '{"name":"goon"}');
		const agentDir = tmp();
		installTheme(src, agentDir);
		expect(readFileSync(join(agentDir, "themes", "goon.json"), "utf8")).toBe('{"name":"goon"}');
	});

	it("updates an outdated copy", () => {
		const src = join(tmp(), "goon.json");
		writeFileSync(src, '{"name":"goon","v":2}');
		const agentDir = tmp();
		mkdirSync(join(agentDir, "themes"));
		writeFileSync(join(agentDir, "themes", "goon.json"), '{"name":"goon","v":1}');
		installTheme(src, agentDir);
		expect(readFileSync(join(agentDir, "themes", "goon.json"), "utf8")).toBe('{"name":"goon","v":2}');
	});

	it("never throws when the folder can't be written", () => {
		const src = join(tmp(), "goon.json");
		writeFileSync(src, "{}");
		const blocker = join(tmp(), "file");
		writeFileSync(blocker, "");
		expect(() => installTheme(src, blocker)).not.toThrow();
	});
});
