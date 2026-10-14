# GoonCodes

**The coding agent that goons so you don't have to.**

A real terminal coding agent (built on [Pi](https://pi.dev)) with a goon layer on top. It reads, edits and runs your code like any coding agent. It just has more fun doing it.

## Install

macOS / Linux:

```sh
curl -fsSL https://goon.codes/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://goon.codes/install.ps1 | iex
```

Or directly with npm:

```sh
npm i -g gooncodes
```

Then run `goon`.

**Supported:** Linux, macOS, Windows. Node.js 22.19 or newer.

## Bring your own AI

GoonCodes doesn't ship a model. Run `goon`, then `/login` to sign in to a provider, or set an API key the same way you would for Pi (Anthropic, OpenAI, Google, OpenRouter, Ollama and [more](https://pi.dev/models)). Switch models with `/model`.

## Goon features

- **Goon voice.** The agent talks like a hyped henchman. Code and edits stay normal.
- **`/serious`** toggles the goon voice off and back on.
- **`/goon <task>`** locks in on a task, with hype.
- **Goon theme and banner.** Applied unless you already picked a theme in `/settings`.
- **`goon update`** installs the latest version. `goon` tells you once a day when there's a new one.

Everything else is Pi: sessions, `/tree`, skills, extensions, `AGENTS.md`. See the [Pi docs](https://pi.dev/docs/latest). GoonCodes shares Pi's config folder (`~/.pi/agent`), so Pi logins carry over.

## Support

Bugs go in [GitHub Issues](https://github.com/goon-codes/goon/issues/new/choose). Fixed when we feel like it, usually within a week.

Security issues: see [SECURITY.md](SECURITY.md).

## Credits

Built on [Pi](https://github.com/earendil-works/pi) by Earendil Inc. & contributors (MIT). GoonCodes is MIT too, see [LICENSE](LICENSE).
