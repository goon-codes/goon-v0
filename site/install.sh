#!/bin/sh
# GoonCodes installer: curl -fsSL https://goon.codes/install.sh | sh
set -e

if ! command -v node >/dev/null 2>&1; then
	echo "GoonCodes needs Node.js 22.19 or newer. Get it at https://nodejs.org" >&2
	exit 1
fi

if ! node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=19)?0:1)'; then
	echo "GoonCodes needs Node.js 22.19 or newer (you have $(node --version)). Get it at https://nodejs.org" >&2
	exit 1
fi

# Distro-packaged Node puts npm's global folder in root-owned /usr, so fall back to ~/.local instead of sudo.
prefix=$(npm prefix -g)
if [ -w "$prefix/lib" ] || { [ ! -e "$prefix/lib" ] && [ -w "$prefix" ]; }; then
	npm i -g gooncodes
else
	npm i -g --prefix "$HOME/.local" gooncodes
	case ":$PATH:" in
	*":$HOME/.local/bin:"*) ;;
	*) echo "Add ~/.local/bin to your PATH first: export PATH=\"\$HOME/.local/bin:\$PATH\"" ;;
	esac
fi
echo "goon installed. Run: goon"
