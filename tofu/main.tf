terraform {
  required_version = ">= 1.6.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_token
}

# Deployments are pushed by CI with wrangler rather than built by Cloudflare, so there is no
# source repository attached here. The project is only a place for those uploads to land.
resource "cloudflare_pages_project" "day_tagger" {
  account_id        = var.cloudflare_account_id
  name              = var.project_name
  production_branch = "main"
}

resource "cloudflare_pages_domain" "day_tagger" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.day_tagger.name
  name         = var.hostname
}

# Points the subdomain at the project's own pages.dev address. Cloudflare issues the
# certificate once the domain above is attached.
resource "cloudflare_dns_record" "day_tagger" {
  zone_id = var.cloudflare_zone_id
  name    = var.subdomain
  content = cloudflare_pages_project.day_tagger.subdomain
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
