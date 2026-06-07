---
name: tavern-helper-script
description: Build, package, validate, and release Tavern Helper script-type projects in this template. Use when Codex works on script builds, dist output, Tavern Helper script JSON, tavern-helper-script.config.json, pnpm install/build issues, or GitHub Actions release workflows for this repository.
---

# Tavern Helper Script Workflow

Use this skill before editing or validating script build/package/release behavior in this repository.

## Source Of Truth

- Build config: `webpack.config.ts`
- Package scripts and version: `package.json`
- pnpm build-script approvals: `pnpm-workspace.yaml`
- Script JSON metadata: `tavern-helper-script.config.json`
- JSON packer: `scripts/package-tavern-helper-script.mjs`
- Main dist workflow: `.github/workflows/bundle.yaml`
- Tag release workflow: `.github/workflows/release-script-json.yaml`

## Script JSON Packaging

The packer emits Tavern Helper `type: "script"` JSON in the same shape as imported Tavern Helper scripts:

- remote update JSON: `content` is `import '<remoteUrl>'`
- inline backup JSON: `content` is the compiled JS from `dist`
- `name` is `script.baseName + "v" + package.json.version`
- `id` must remain stable across releases
- `info` belongs in `tavern-helper-script.config.json`

For template usage, keep `enabled: false` until the user fills real values. Do not publish placeholder IDs or URLs.

## Correct Command Order

Use this order to avoid wasted time:

```powershell
$env:CI='true'; pnpm install --frozen-lockfile
pnpm build:js
pnpm package:script
node scripts/package-tavern-helper-script.mjs --check-tag --tag v1.0.0
```

On Linux/macOS CI, the equivalent install command is:

```bash
CI=true pnpm install --frozen-lockfile
```

## pnpm Pitfalls To Avoid

- Do not rely on `package.json.pnpm.onlyBuiltDependencies`; current pnpm ignores it.
- Keep both `onlyBuiltDependencies` and `allowBuilds` in `pnpm-workspace.yaml` when this template uses pnpm supply-chain checks.
- If `pnpm build:js` starts installing dependencies, stop and run the explicit install command first.
- If registry fetches fail inside a sandbox, request approved network access immediately. Do not let pnpm spend minutes retrying every package.
- If `node_modules` was partially recreated, run the explicit install command before any build.

## Build Behavior

- `pnpm build:js` must compile JS only with `--env buildOnly=true`.
- `buildOnly` must skip `schema_dump` and `tavern_sync` webpack plugins.
- `pnpm build:all` may run schema dump and Tavern sync side effects.
- Production build should not leave useless source map comments in inline release JSON.

## Release Behavior

- `package.json.version` is the only version source.
- Release tag must equal `v${package.json.version}`.
- `bundle.yaml` updates `dist` on main and must not auto-create tags.
- `release-script-json.yaml` runs on `v*` tags and uploads JSON assets from `release/*.json`.
- Remote-update JSON should point to the intended `@main` CDN URL unless the user explicitly requests pinned tags.

## Validation

After implementation, verify at least:

- `pnpm build:js` succeeds.
- `pnpm package:script` produces two JSON files in concrete repos, or skips in the template while disabled.
- JSON fields include `type`, `enabled`, `name`, `id`, `content`, `info`, `button`, and `data`.
- Remote JSON starts with `import '<remoteUrl>'`.
- Inline JSON does not include `sourceMappingURL`.
- Tag check passes for the matching tag and fails for a mismatched tag.
- Changed JSON/YAML files parse successfully.
