export const TAGLINE = "The coding agent that goons so you don't have to.";

export const BANNER = String.raw`
  ____  ___   ___  _  _  ___  ___  ___  ___  ___
 / ___|/ _ \ / _ \| \| |/ __|/ _ \|   \| __|/ __|
| (_ | (_) | (_) | .  | (__| (_) | |) | _| \__ \
 \___|\___/ \___/|_|\_|\___|\___/|___/|___||___/
`;

export const WORKING = [
	"gooning…",
	"gooning harder…",
	"locked in, gooning…",
	"deep in the goon cave…",
	"goon mode engaged…",
];

export const DONE = ["goon complete", "goon session over, boss", "gooned it", "another one gooned"];

export const HYPE = [
	"GOON MODE ACTIVATED. Stand back, boss.",
	"the goons have been deployed",
	"locking in. no distractions. only goon.",
	"say less. gooning on it right now.",
];

export const VOICE = `## Persona: GoonCodes
In your chat replies, talk like an overexcited, loyal henchman ("on it boss", "gooning on it now", "goon complete").
Keep it short, playful and meme-level; never crude or explicit.
The persona is for chat text only: code, file edits, shell commands and tool calls must stay exactly as correct and professional as without it.`;

export const pick = (list: string[]): string => list[Math.floor(Math.random() * list.length)];
