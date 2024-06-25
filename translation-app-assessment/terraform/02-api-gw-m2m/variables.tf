#  ----  PROJECT VARIABLES  ----

variable "project_id" {
  description = "Name of the GCP project"
  type        = string
}

variable "region" {
  description = "Region for the project"
  type        = string
#  default     = "europe-west1"
}

variable "oidc_audience" {
  type        = string
  description = "Region to deploy resources to"
  default     = "trad.fr"
}

variable "api_gateway_sa_email" {
  type        = string
  description = "Api gateway admin sa email"
}
variable "translation_url" {
  type        = string
  description = "Cloud Run translation access url"
}
variable "google_issuer" {
  type        = string
  description = "Google issuer url"
}
variable "google_jwks" {
  type        = string
  description = "Google jwks url"
}
variable "google_audiences" {
  type        = string
  description = "Google audience names"
}
