output "pages_subdomain" {
  description = "The project's own address, which the custom domain points at."
  value       = cloudflare_pages_project.day_tagger.subdomain
}

output "site_url" {
  value = "https://${var.hostname}"
}
