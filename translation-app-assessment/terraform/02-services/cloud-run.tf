/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

resource "google_cloud_run_service" "token_broker" {
  name     = "pe-token-broker"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.token_broker_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/pe-token-broker:v1"
        env {
          name  = "GCP_PROJECT"
          value = var.project_id
        }
        env {
          name  = "API_GATEWAY_AUDIENCE"
          value = var.oidc_audience
        }
      }
    }
  }

}

resource "google_cloud_run_service" "reporting" {
  name     = "pe-reporting"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.reporting_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/pe-reporting:v1"
        env {
          name  = "GCP_PROJECT"
          value = var.project_id
        }
      }
    }
  }
}

resource "google_cloud_run_service" "telemetry" {
  name     = "pe-telemetry"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.telemetry_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/pe-telemetry:v1"
        env {
          name  = "GCP_PROJECT"
          value = var.project_id
        }
      }
    }
  }
}

resource "google_cloud_run_service" "cleanup" {
  name     = "pe-cleanup"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.cleanup_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/pe-cleanup:v1"
        env {
          name  = "GCP_PROJECT"
          value = var.project_id
        }
        env {
          name  = "LOCATION"
          value = var.region
        }
      }
    }
  }
}
resource "google_cloud_run_service" "translation" {
  name     = "pe-translation"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.translation_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/pe-translation:v1"
        env {
          name  = "GCP_PROJECT"
          value = var.project_id
        }
      }
    }
  }
}
resource "google_cloud_run_service" "authentication" {
  name     = "pe-authentication"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.authentication_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/pe-authentication:v1"
        env {
          name  = "GCP_PROJECT"
          value = var.project_id
        }
      }
    }
  }
}
resource "google_cloud_run_service" "detect_text" {
  name     = "pe-detect-text"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.detect_text_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/pe-detect-text:v1"
        env {
          name  = "GCP_PROJECT"
          value = var.project_id
        }
      }
    }
  }
}
resource "google_cloud_run_service" "pdf_to_image" {
  name     = "pe-pdf-to-image"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.pdf_to_image_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/pe-pdf-to-image:v1"
        env {
          name  = "GCP_PROJECT"
          value = var.project_id
        }
      }
    }
  }
}