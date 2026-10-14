# GoonCodes installer: irm https://goon.codes/install.ps1 | iex
$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	Write-Error "GoonCodes needs Node.js 22.19 or newer. Get it at https://nodejs.org"
	return
}

$v = [version](node -p "process.versions.node")
if ($v -lt [version]"22.19.0") {
	Write-Error "GoonCodes needs Node.js 22.19 or newer (you have $v). Get it at https://nodejs.org"
	return
}

npm i -g gooncodes
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; return }
Write-Host "goon installed. Run: goon"
