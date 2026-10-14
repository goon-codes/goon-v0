import { VERSION as PI_VERSION } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };
import { routeArgs, updateCommand, VERSION } from "../src/args.ts";

describe("routeArgs", () => {
	it("routes --version and -v to version", () => {
		expect(routeArgs(["--version"])).toBe("version");
		expect(routeArgs(["-v"])).toBe("version");
	});

	it("routes a leading update to update", () => {
		expect(routeArgs(["update"])).toBe("update");
	});

	it("routes everything else to pi", () => {
		expect(routeArgs([])).toBe("pi");
		expect(routeArgs(["-p", "hi"])).toBe("pi");
		expect(routeArgs(["fix", "update", "bug"])).toBe("pi");
	});
});

describe("updateCommand", () => {
	it("uses a shell on Windows so npm.cmd resolves", () => {
		expect(updateCommand("win32")).toEqual({
			cmd: "npm",
			args: ["i", "-g", "gooncodes@latest"],
			shell: true,
		});
	});

	it("runs npm directly elsewhere", () => {
		expect(updateCommand("linux").shell).toBe(false);
	});

	it("updates into the prefix goon is installed in, so ~/.local installs don't hit EACCES", () => {
		expect(updateCommand("linux", "/home/me/.local/lib/node_modules/gooncodes")).toEqual({
			cmd: "npm",
			args: ["i", "-g", "--prefix", "/home/me/.local", "gooncodes@latest"],
			shell: false,
		});
	});

	it("leaves Windows on npm's default prefix", () => {
		expect(updateCommand("win32", "C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\gooncodes").args).toEqual([
			"i",
			"-g",
			"gooncodes@latest",
		]);
	});
});

describe("VERSION", () => {
	it("is our own package version, not Pi's", () => {
		expect(VERSION).toBe(pkg.version);
		expect(VERSION).not.toBe(PI_VERSION);
	});
});
