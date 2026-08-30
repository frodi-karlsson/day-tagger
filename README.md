# day-tagger

A PWA for tagging days in a calendar with user defined tags.

A tag is more than a label. It can carry a set of choices, with rules for how many of them
apply to a given day. You define your own tags in a setup menu, then tagging a day is a
matter of picking tags and answering whatever each one asks for.

## Tags

You build your own tags in a setup menu. A tag has a label, and can be switched off without
losing the days already tagged with it.

A tag can carry a set of choices, along with limits on how many of them a single day may
take. Some tags need no answer at all. Some accept any number. Some require exactly one.
Picking a tag with choices opens a multi select that holds you to those limits.

An "Exercise" tag might offer run, gym and swim, and accept any combination including none.
A "Travel" tag might offer work and leisure, and insist on exactly one.

## Stack

Astro with Solid islands, TypeScript, ESM only. pnpm for packages, Vitest with happy-dom for
tests, Prettier and ESLint for uniformity.

## Commands

| Command           | Action                                          |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | Dev server on `localhost:4321`                  |
| `pnpm build`      | Build to `./dist/`                              |
| `pnpm preview`    | Serve the build locally                         |
| `pnpm check`      | Format, typecheck, astro check, lint, then test |
| `pnpm test:watch` | Tests in watch mode                             |

`pnpm check` is the one to run before committing. It writes formatting changes rather than
only reporting them.

## Hosting

Cloudflare Pages, at `day-tagger.frodikarlsson.com`.

The project, its custom domain and the DNS record live in `tofu/` and are applied by hand.
Deploying is `pnpm deploy`, which builds and uploads. Nothing publishes on its own.

## Status

Early. The toolchain, a DI registry, and a handful of services are in place. The calendar,
the tag setup menu, and the PWA shell are not built yet.

See `AGENTS.md` for the conventions this repo follows.
