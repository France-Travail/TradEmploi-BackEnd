/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

resource "google_project_service" "project_services" {
  for_each                   = toset(local.services)
  project                    = var.project_id
  service                    = each.value
  disable_on_destroy         = true
  disable_dependent_services = true
}

locals {
  services = [
    "firebase.googleapis.com",
    "firebasedatabase.googleapis.com",
    "apigateway.googleapis.com",
    "cloudscheduler.googleapis.com",
    "run.googleapis.com",
    "iamcredentials.googleapis.com",
    "servicecontrol.googleapis.com",
    "iam.googleapis.com",
    "texttospeech.googleapis.com",
    "speech.googleapis.com",
    "translate.googleapis.com",
    "cloudbuild.googleapis.com",
    "firestore.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "secretmanager.googleapis.com"
  ]
}