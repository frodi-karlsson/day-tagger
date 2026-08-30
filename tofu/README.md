# Infrastructure

Three resources: the Cloudflare Pages project, the custom domain attached to it, and the DNS
record pointing at it. Deployments are not managed here, CI uploads those with wrangler.

Applied by hand, not by CI. The token needed to edit DNS is more powerful than anything a build
should be holding.

## Running it

Copy the example and fill it in. The real file is ignored by git:

```sh
cp tofu.tfvars.example tofu.tfvars
```

Then:

```sh
tofu init
tofu plan -var-file=tofu.tfvars
tofu apply -var-file=tofu.tfvars
```

Once that is applied, ship a build with:

```sh
pnpm deploy
```

State is local and ignored by git. If it is ever lost, `tofu import` rebuilds it from what is
already in Cloudflare rather than anything being recreated.
