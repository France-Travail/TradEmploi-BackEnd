/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

variable "project_id" {
  type        = string
  description = "Name of the GCP project. Must be a monitoring workspace."
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