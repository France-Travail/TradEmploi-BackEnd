#  ----  PROJECT VARIABLES  ----

variable "project_id" {
  description = "Name of the GCP project"
  type        = string
}
variable "region" {
  description = "Region for the project"
  type        = string
}

variable "oidc_audience" {
  type        = string
  description = "Region to deploy resources to"
  default     = "trad.fr"
}

variable "admin_sa_email" {
  type        = string
  description = "Admin sa email"
}
variable "guest_sa_email" {
  type        = string
  description = "Guest sa email"
}
variable "api_gateway_sa_email" {
  type        = string
  description = "Api gateway admin sa email"
}
variable "reporting_url" {
  type        = string
  description = "Cloud Run reporting access url"
}
variable "telemetry_url" {
  type        = string
  description = "Cloud Run telemetry access url"
}
variable "token_broker_url" {
  type        = string
  description = "Cloud Run token_broker access url"
}
variable "translation_url" {
  type        = string
  description = "Cloud Run translation access url"
}
