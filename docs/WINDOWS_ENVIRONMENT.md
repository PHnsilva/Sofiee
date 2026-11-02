# Reproducing the Windows web and backend environment

This guide records the compatible Node.js and npm setup for the Sofiie web and backend workspaces. It keeps the existing Node 24 installation intact and places runtime data, temporary files, dependencies, and caches on C:.

## Pinned versions

- Node.js `v22.23.4`, Windows x64 archive from the [official Node.js v22 archive](https://nodejs.org/en/download/archive/v22).
- npm `10.8.2`, selected by Corepack from the repository `packageManager` field.
- Node.js archive SHA-256: `cbc74b5e0982c9dbb41525fd8fb5dcd32fbee237863f7829072f4639a1ce5f20`.

Recheck the official archive and checksum before changing the pinned version. Keep the archive in `C:\DevCache\nodejs` and the side-by-side runtime in `C:\SDKs\Node\versions\v22.23.4`.

## Install the side-by-side runtime

Run in PowerShell. These commands use the official checksum file and stop if the downloaded archive differs.

```powershell
$version = 'v22.23.4'
$archive = "node-$version-win-x64.zip"
$cache = 'C:\DevCache\nodejs'
$stage = Join-Path $cache 'stage-v22.23.4'
$runtime = 'C:\SDKs\Node\versions\v22.23.4'
New-Item -ItemType Directory -Path $cache -Force | Out-Null
Invoke-WebRequest "https://nodejs.org/dist/$version/$archive" -OutFile (Join-Path $cache $archive)
Invoke-WebRequest "https://nodejs.org/dist/$version/SHASUMS256.txt" -OutFile (Join-Path $cache "SHASUMS256-$version.txt")
$line = Select-String -LiteralPath (Join-Path $cache "SHASUMS256-$version.txt") -Pattern "^([0-9a-fA-F]{64})\s+$([regex]::Escape($archive))$" | Select-Object -First 1
if (-not $line) { throw 'Official checksum entry not found.' }
$expected = $line.Matches[0].Groups[1].Value.ToLowerInvariant()
$actual = (Get-FileHash -LiteralPath (Join-Path $cache $archive) -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $expected) { throw 'Archive SHA-256 does not match.' }
New-Item -ItemType Directory -Path $stage | Out-Null
Expand-Archive -LiteralPath (Join-Path $cache $archive) -DestinationPath $stage
New-Item -ItemType Directory -Path (Split-Path -Parent $runtime) -Force | Out-Null
Move-Item -LiteralPath (Join-Path $stage "node-$version-win-x64") -Destination $runtime
```

## Install dependencies and run web/backend checks

Run from the repository root in a fresh PowerShell session:

```powershell
$runtime = 'C:\SDKs\Node\versions\v22.23.4'
$env:COREPACK_HOME = 'C:\DevCache\corepack'
$env:NPM_CONFIG_CACHE = 'C:\DevCache\npm'
$env:PATH = "$runtime;$env:PATH"
& "$runtime\node.exe" --version
& "$runtime\corepack.cmd" npm --version
& "$runtime\corepack.cmd" npm ci --no-audit --no-fund
& "$runtime\corepack.cmd" npm run format:check
& "$runtime\corepack.cmd" npm run lint
& "$runtime\corepack.cmd" npm run typecheck
& "$runtime\corepack.cmd" npm test
& "$runtime\corepack.cmd" npm run build
```

Expected tool versions are Node `v22.23.4` and npm `10.8.2`. Corepack honors the root `packageManager` field. Do not replace the global Node installation to run these checks.

## Windows desktop prerequisites

Tauri's [Windows prerequisites](https://v2.tauri.app/start/prerequisites/) include Rust with the MSVC toolchain and Microsoft's C++ Build Tools. WebView2 is used to render the application. On 02/11/2026, WebView2 `156.0.4314.58` was present. Rust/Cargo, Visual Studio C++ Build Tools, and the Windows SDK were not found in the checked C: locations, so desktop lint, tests, and build remain unverified. No desktop toolchain was installed; its required disk space remains to be confirmed before Pedro approves that installation.

## Validation record — 02/11/2026

The C: checkout used Node `v22.23.4` and Corepack-selected npm `10.8.2`. `npm ci --no-audit --no-fund` completed with the lockfile and installed 229 packages, using `C:\DevCache\npm`.

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed; 21 tests across backend and frontend.
- `npm run build`: passed for backend and frontend.
- `npm run format:check`: failed on 72 files in a clean worktree from `main` at `f4fa50e`; it failed on 73 files in the active checkout. This delivery does not reformat unrelated product files.
- `npm run lint:desktop` and `npm run test:desktop`: could not run because `cargo` is unavailable.
- Desktop build: not run because Rust and the MSVC build prerequisites are absent.

These results describe the local checkout on this date. Desktop validation and the existing formatting baseline remain open acceptance items.

