/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

#  ----  PROJECT VARIABLES  ----

variable "project_id" {
  description = "Name of the GCP project"
  type        = string
}

variable "region" {
  description = "Region for the project"
  type        = string
}

variable "firestore_region" {
  type        = string
  description = "Default Firestore region to use"
}

variable "firestore_database_name" {
  type        = string
  description = "Firestaore database name"
}