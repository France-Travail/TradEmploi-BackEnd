/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

resource "google_project_iam_member" "token_broker_firestore_role" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.token_broker_sa.email}"
}

# Allow reporting function to read from Firestore
resource "google_project_iam_member" "reporting_firestore_role" {
  project = var.project_id
  role    = "roles/datastore.viewer"
  member  = "serviceAccount:${google_service_account.reporting_sa.email}"
}

# Allow telemetry service to write to Firestore
resource "google_project_iam_member" "telemetry_firestore_role" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.telemetry_sa.email}"
}

# Allow cleanup service to write to Firestore
resource "google_project_iam_member" "cleanup_firestore_role" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cleanup_sa.email}"
}

# Allow cleanup service to write heartbeat to Monitoring
resource "google_project_iam_member" "cleanup_monitoring_role" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.cleanup_sa.email}"
}

# Allow translation service to use the Cloud Translation API
resource "google_project_iam_member" "translation_api_user_role" {
  project = var.project_id
  role    = "roles/cloudtranslate.user"
  member  = "serviceAccount:${google_service_account.translation_sa.email}"
}

# Allow token broker service to generate tokens on behalf of the client guest service account
resource "google_service_account_iam_member" "client_guest_token_creator" {
  service_account_id = google_service_account.client_guest_sa.id
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.token_broker_sa.email}"
}

# Allow token broker service to generate tokens on behalf of the client admin service account
resource "google_service_account_iam_member" "client_admin_token_creator" {
  service_account_id = google_service_account.client_admin_sa.id
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.token_broker_sa.email}"
}

# allow API Gateway Service Account to invoke all Cloud Run services
# (ie, in order to reach Cloud Run services, you need to go through API Gateway first)
resource "google_cloud_run_service_iam_member" "token_broker" {
  location = google_cloud_run_service.token_broker.location
  project = google_cloud_run_service.token_broker.project
  service = google_cloud_run_service.token_broker.name
  role = "roles/run.invoker"
  member = "serviceAccount:${google_service_account.api_gateway_sa.email}"
}
resource "google_cloud_run_service_iam_member" "reporting" {
  location = google_cloud_run_service.reporting.location
  project = google_cloud_run_service.reporting.project
  service = google_cloud_run_service.reporting.name
  role = "roles/run.invoker"
  member = "serviceAccount:${google_service_account.api_gateway_sa.email}"
}
resource "google_cloud_run_service_iam_member" "telemetry" {
  location = google_cloud_run_service.telemetry.location
  project = google_cloud_run_service.telemetry.project
  service = google_cloud_run_service.telemetry.name
  role = "roles/run.invoker"
  member = "serviceAccount:${google_service_account.api_gateway_sa.email}"
}

resource "google_cloud_run_service_iam_member" "translation" {
  location = google_cloud_run_service.translation.location
  project = google_cloud_run_service.translation.project
  service = google_cloud_run_service.translation.name
  role = "roles/run.invoker"
  member = "serviceAccount:${google_service_account.api_gateway_sa.email}"
}

# Allow unauthenticated users to invoke the Authentication service
resource "google_cloud_run_service_iam_member" "authentication" {
  location = google_cloud_run_service.authentication.location
  project = google_cloud_run_service.authentication.project
  service = google_cloud_run_service.authentication.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# allow Cleanup Job Service Account to invoke Cleanup Cloud Run service
resource "google_cloud_run_service_iam_member" "cleanup" {
  location = google_cloud_run_service.cleanup.location
  project = google_cloud_run_service.cleanup.project
  service = google_cloud_run_service.cleanup.name
  role = "roles/run.invoker"
  member = "serviceAccount:${google_service_account.cleanup_job_sa.email}"
}


data "google_project" "project" {
  project_id = var.project_id
}

locals {
  cloud_run_service_names = [
    google_cloud_run_service.token_broker.name,
    google_cloud_run_service.reporting.name,
    google_cloud_run_service.telemetry.name,
    google_cloud_run_service.cleanup.name,
    google_cloud_run_service.translation.name,
    google_cloud_run_service.authentication.name
  ]
  cloud_run_service_account_ids = [
    google_service_account.token_broker_sa.account_id,
    google_service_account.cleanup_sa.account_id,
    google_service_account.reporting_sa.account_id,
    google_service_account.telemetry_sa.account_id,
    google_service_account.translation_sa.account_id,
    google_service_account.authentication_sa.account_id
  ]
}

resource "google_cloud_run_service_iam_member" "cloud_run_member" {
  for_each = toset(local.cloud_run_service_names)
  location = var.region
  project = var.project_id
  service = each.value
  role = "roles/run.admin"
  member = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

resource "google_service_account_iam_member" "cloud_run_sa_member" {
  for_each = toset(local.cloud_run_service_account_ids)
  service_account_id = "projects/${var.project_id}/serviceAccounts/${each.value}@${var.project_id}.iam.gserviceaccount.com"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}
