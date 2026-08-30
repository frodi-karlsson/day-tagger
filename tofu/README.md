# Infrastructure

Three resources: the Cloudflare Pages project, the custom domain attached to it, and the DNS
record pointing at it. Deployments are not managed here, CI uploads those with wrangler.

Applied by hand, not by CI. The token needed to edit DNS is more powerful than anything a build
should be holding.

## Running it

Put the values in `tofu.tfvars`, which is ignored by git:

```hcl
cloudflare_token      = "..."  # Pages:Edit and DNS:Edit on the frodikarlsson.com zone
cloudflare_account_id = "..."
cloudflare_zone_id    = "..."
```

Then:

```sh
tofu init
tofu plan -var-file=tofu.tfvars
tofu apply -var-file=tofu.tfvars
```

State is local and ignored by git. If it is ever lost, `tofu import` rebuilds it from what is
already in Cloudflare rather than anything being recreated.
