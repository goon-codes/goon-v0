# GoonCodes installer: irm https://goon.codes/install.ps1 | iex
$ErrorActionPreference = "Stop"

function Test-NodeOk {
	if (-not (Get-Command node -ErrorAction SilentlyContinue)) { return $false }
	return ([version](node -p "process.versions.node") -ge [version]"22.19.0")
}

if (-not (Test-NodeOk)) {
	$have = if (Get-Command node -ErrorAction SilentlyContinue) { node --version } else { "none" }
	Write-Host "GoonCodes needs Node.js 22.19 or newer (you have $have)."
	$ans = Read-Host "Install Node 22 LTS with winget now? [Y/n]"
	if ($ans -eq "" -or $ans -match "^[Yy]") {
		if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
			Write-Error "winget not found. Install Node manually at https://nodejs.org, then re-run this."
			return
		}
		winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
		$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
	}
	if (-not (Test-NodeOk)) {
		Write-Error "Still no Node 22.19+. Install it at https://nodejs.org, restart your terminal, then re-run this."
		return
	}
}

npm i -g gooncodes
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; return }
Write-Host "goon installed. Run: goon"
