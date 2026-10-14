import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { vi } from "vitest";

type Handler = (event: any, ctx: any) => any;

// Just enough of Pi's ExtensionAPI and context to drive the goon extension.
export function fakePi(mode: "tui" | "print" | "json" | "rpc" = "tui", themeName = "system") {
	const handlers = new Map<string, Handler>();
	const commands = new Map<string, { handler: (args: string, ctx: any) => any }>();
	const goonTheme = { name: "goon" };
	const ctx = {
		mode,
		hasUI: mode === "tui" || mode === "rpc",
		isIdle: () => true,
		ui: {
			theme: { name: themeName },
			setHeader: vi.fn(),
			setTitle: vi.fn(),
			setWorkingMessage: vi.fn(),
			setTheme: vi.fn(() => ({ success: true })),
			getTheme: vi.fn((name: string) => (name === "goon" ? goonTheme : undefined)),
			notify: vi.fn(),
		},
	};
	const pi = {
		on: vi.fn((event: string, handler: Handler) => {
			handlers.set(event, handler);
			return () => handlers.delete(event);
		}),
		registerCommand: vi.fn((name: string, options: { handler: (args: string, ctx: any) => any }) => {
			commands.set(name, options);
		}),
		sendUserMessage: vi.fn(),
	};
	return {
		api: pi as unknown as ExtensionAPI,
		pi,
		ctx,
		goonTheme,
		emit: (event: string, payload: object = {}) => handlers.get(event)?.({ type: event, ...payload }, ctx),
		// Runs session_start, then lets queued callbacks fire.
		start: async () => {
			await handlers.get("session_start")?.({ type: "session_start", reason: "startup" }, ctx);
			await new Promise((resolve) => setTimeout(resolve, 0));
		},
		run: (command: string, args = "") => commands.get(command)?.handler(args, ctx),
	};
}
