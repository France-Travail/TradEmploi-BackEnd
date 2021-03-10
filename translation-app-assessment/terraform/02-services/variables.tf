/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

variable "project_id" {
  type        = string
  description = "Name of the GCP project"
}
variable "region" {
  type        = string
  description = "Region to deploy resources to"
  default     = "europe-west1"
}
variable "oidc_audience" {
  type        = string
  description = "Region to deploy resources to"
  default     = "trad.pe.fr"
}
variable "app_engine_region_mapping" {
  type        = map(string)
  description = "Current vs old fashioned region mapping for App Engine / Firebase compatibility"
  default     = {
    "europe-west1": "europe-west",
    "us-central1": "us-central"
  }
}