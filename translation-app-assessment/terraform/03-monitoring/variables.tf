/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

#  ----  PROJECT VARIABLES  ----

variable "project_id" {
  description = "Name of the GCP project"
  type        = string
#  default     = "fr-i2s-gcp-sandbox-b-et-e"
}

variable "region" {
  description = "Region for the project"
  type        = string
#  default     = "europe-west1"
}

variable "firebase_region" {
  type        = string
  description = "Default Firebase region to use"
#  default = "europe-west"
}

variable "firestore_region" {
  type        = string
  description = "Default Firestore region to use"
#  default = "eur3"
}

variable "notification_emails" {
  type        = map
  description = "Email addresses to send notifications to when alerting incidents happen."
  default     = {}
    # example
    # {
    #   "Person1" = "person1@google.com",
    #   "Person2" = "person2@example.com"
    # }
  }
