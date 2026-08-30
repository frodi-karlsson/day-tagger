# Infrastructure

Three resources: the Cloudflare Pages project, the custom domain attached to it, and the DNS
record pointing at it. Deployments are not managed here, `pnpm deploy` uploads those with
wrangler.

Applied by hand, not by CI. The token needed to edit DNS is more powerful than anything a build
should be holding. CI only runs `tofu fmt` and `tofu validate`, which need no credentials.

## Running it

Copy the example and fill it in. The real file is ignored by git, and tofu loads
`terraform.tfvars` on its own:

```sh
cp terraform.tfvars.example terraform.tfvars
```

Then:

```sh
tofu init
tofu plan
tofu apply
```

Once that is applied, ship a build from the project root:

```sh
pnpm deploy
```

## State

State is local and ignored by git. If it is ever lost, `tofu import` rebuilds it from what is
already in Cloudflare rather than anything being recreated.

`.terraform.lock.hcl` is committed on purpose. It pins the provider to exact versions and
verifies their hashes, so a fresh `tofu init` resolves the same thing here as anywhere else.
