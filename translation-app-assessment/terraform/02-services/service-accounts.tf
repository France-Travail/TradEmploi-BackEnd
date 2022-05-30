/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

resource "google_service_account" "token_broker_sa" {
  account_id   = "pe-token-broker"
  display_name = "Token Broker Service Account"
  project      = var.project_id
}

resource "google_service_account" "client_guest_sa" {
  account_id   = "pe-client-guest"
  display_name = "Client Service Account for Guest"
  project      = var.project_id
}

resource "google_service_account" "api_gateway_sa" {
  account_id   = "pe-api-gateway"
  display_name = "API Gateway Service Account"
  project      = var.project_id
}

resource "google_service_account" "client_admin_sa" {
  account_id   = "pe-client-admin"
  display_name = "Client Service Account for Admin"
  project      = var.project_id
}

resource "google_service_account" "reporting_sa" {
  account_id   = "pe-reporting"
  display_name = "Reporting Service Account"
  project      = var.project_id
}

resource "google_service_account" "telemetry_sa" {
  account_id   = "pe-telemetry"
  display_name = "Telemetry Service Account"
  project      = var.project_id
}

resource "google_service_account" "cleanup_sa" {
  account_id   = "pe-cleanup"
  display_name = "Cleanup Service Account"
  project      = var.project_id
}

resource "google_service_account" "cleanup_job_sa" {
  account_id   = "pe-cleanup-job"
  display_name = "Cleanup Job Service Account (used by Cloud Scheduler)"
  project      = var.project_id
}

resource "google_service_account" "translation_sa" {
  account_id   = "pe-translation"
  display_name = "Translation Service Account"
  project      = var.project_id
}

resource "google_service_account" "authentication_sa" {
  account_id   = "pe-authentication"
  display_name = "Authentication Service Account"
  project      = var.project_id
}