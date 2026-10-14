import { readFileSync, writeFileSync } from "node:fs";
import semver from "semver";

const DAY = 24 * 60 * 60 * 1000;

export async function fetchLatestVersion(): Promise<string> {
	const res = await fetch("https://registry.npmjs.org/gooncodes/latest", { signal: AbortSignal.timeout(2000) });
	return (await res.json()).version;
}

function lastCheck(statePath: string): number {
	try {
		return Number(JSON.parse(readFileSync(statePath, "utf8")).lastCheck) || 0;
	} catch {
		return 0;
	}
}

export async function checkForUpdate(opts: {
	current: string;
	now: number;
	statePath: string;
	fetchLatest: () => Promise<string>;
	offline: boolean;
}): Promise<string | undefined> {
	if (opts.offline || opts.now - lastCheck(opts.statePath) < DAY) return;
	try {
		// Recorded before fetching so a flaky network doesn't retry on every startup.
		writeFileSync(opts.statePath, JSON.stringify({ lastCheck: opts.now }));
	} catch {}
	try {
		const latest = await opts.fetchLatest();
		if (semver.valid(latest) && semver.gt(latest, opts.current)) {
			return `new goon dropped (v${latest}), run \`goon update\``;
		}
	} catch {}
}
