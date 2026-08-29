# AGENTS.md

Guidance for agents working in this repo.

## Stack

- Astro with the Solid.js integration.
- TypeScript, ESM only. No CommonJS, no `require`.
- pnpm as the package manager.
- Vitest with happy-dom for tests.
- Prettier for formatting, ESLint for rules. Both are strict and both must pass.

## Communication

Be clear.
If a sentence carries multiple ideas, split it into multiple sentences.

Be concise.
Use simple punctuation, mainly "." and ",".

## Code

Prefer the simple solution.
If you know a clever way to solve a problem, first look for an easier way.
Pick the clever one only when the simple one actually fails.

Write code that reads like the code around it.

## Structure

Folder by feature, not by type.
Keep a feature's components, services, types and tests together.
Do not create top-level `components/` or `services/` buckets that collect unrelated things.

Shared code may earn its own feature folder when it is not a subset of an existing feature.
If it belongs to one feature, leave it there.

## Commits

Conventional commits.
The only allowed types are `fix`, `chore`, `feat`, `docs` and `revert`.

Scopes are free-form. Use the feature or area the change touches, for example `feat(auth): add session refresh`.

## Comments

Fight inline comments.
Code should explain itself through naming and structure.

JSDoc is acceptable when it earns its place. Keep it short and factual.

A plain comment is fine in rare cases where context cannot live in the code, for example a workaround for an external bug.

## Testing

Test heavily.

- Do not test UI. Test logic.
- Design for that. Keep logic out of components and behind clear seams.
- Put logic in single-purpose services, for example `cookie.service.ts` or `storage.service.ts`.
- Services are easier to mock than loose functions. Prefer them.
- Components should call services and render. Nothing more.

Structure of a test file:

- Use `test`, not `it`.
- Test names start with "should".
- One `describe` block per unit of code, usually a method or a function.
- Do not wrap a file in a `describe` for the file's only unit. That level is redundant.

This reads as `read > should return null for a missing key`.

Split test bodies into arrange, act and assert with a blank line between each.
Use no other blank lines inside a test.

## Dependencies

Always use the latest version of a dependency you add.

Verify the version before adding it.
Use `npm view <pkg> version`, or check the source repo when the package needs closer inspection.
Do not rely on memory for version numbers or APIs.

Declare every dependency in `package.json` as `^{major}`, for example `"astro": "^7"`.
Never write a full version range like `^7.2.9`.
The lockfile holds the exact version.

Let pnpm's release-age cooldown win.
If pnpm resolves an older version than the registry latest, take it.
Do not force a version and grow `minimumReleaseAgeExclude` without asking first.
