# day-tagger

A PWA for tagging days in a calendar with tags you define yourself.

A tag is more than a label. It can carry a set of choices, with rules for how many of them
apply to a given day. You build your own in a setup menu, then tagging a day is a matter of
picking tags and answering whatever each one asks for.

## Tags

A tag has a label, and can be deleted without losing the days already tagged with it. Naming a
new tag the same as a deleted one brings the old one back, so its history reattaches rather
than being stranded behind a second name.

A tag can carry a set of choices, along with limits on how many of them a single day may take.
Some tags need no answer at all. Some accept any number. Some require exactly one.

An "Exercise" tag might offer run, gym and swim, and accept any combination including none.
A "Travel" tag might offer work and leisure, and insist on exactly one.

## The calendar

Opens on today, ready to tag. Behind that, a month at a time, each day carrying a coloured dot
for every tag on it, so a pattern shows up before you go looking for one.

## Analysis

Two questions: how often something happens, and how one thing relates to another.

Both work at either grain. "Drinking" and "drinking wine" are the same kind of question, so
either can be asked, and either can be compared against the other.

Relationships take a window, so "how does drinking relate to a bad stomach within 2 days" is a
question you can put directly. That matters when an effect lands the day after rather than the
same evening, which is invisible if you only ever compare within a single day.

Results are shown as counts alongside percentages, because a striking looking correlation over
nine days is not a finding.

## Your data

Everything stays in the browser. Nothing is sent anywhere and there is no account, which also
means clearing site data loses it. The backup menu writes the lot to one file you keep
yourself, and reads it back.

The app works offline once loaded, and installs to a home screen.

## Stack

Astro with Solid islands, TypeScript, ESM only. pnpm for packages, Vitest with happy-dom for
unit tests, Playwright for screenshots, Prettier and ESLint for uniformity.

Logic lives apart from the components that render it, so the parts worth testing can be tested
without a browser.

## Hosting

Cloudflare Pages, at `day-tagger.frodikarlsson.com`.

The project, its custom domain and the DNS record live in `tofu/` and are applied by hand.
Deploying is `pnpm deploy`, which builds and uploads. Nothing publishes on its own.

Conventions this repo follows are in `AGENTS.md`.
