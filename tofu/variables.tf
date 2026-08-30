variable "cloudflare_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_account_id" {
  type      = string
  sensitive = true
}

variable "cloudflare_zone_id" {
  type = string
}

variable "project_name" {
  type    = string
  default = "day-tagger"
}

variable "subdomain" {
  type    = string
  default = "day-tagger"
}

variable "hostname" {
  type    = string
  default = "day-tagger.frodikarlsson.com"
}
