/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

variable "project_id" {
  type        = string
  description = "Name of the GCP project"
}
variable "firebase_region" {
  type        = string
  description = "Default Firebase region to use"
  default     = "europe-west"
}
