resource "google_cloud_run_v2_service" "token_broker" {
  name     = "trad-token-broker"
  location = var.region
  project  = var.project_id
  template {
      service_account = google_service_account.token_broker_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/trad-token-broker:v1"
        resources {
          cpu_idle = var.token_broker_cpu_idle
          startup_cpu_boost = var.token_broker_startup_cpu_boost
        }
      }
      scaling {
        min_instance_count = var.token_broker_min_instance_count
        max_instance_count = var.token_broker_max_instance_count
      }
  }
}

resource "google_cloud_run_v2_service" "reporting" {
  name     = "trad-reporting"
  location = var.region
  project  = var.project_id
  template {
      service_account = google_service_account.reporting_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/trad-reporting:v1"
        resources {
          cpu_idle = var.reporting_cpu_idle
          startup_cpu_boost = var.reporting_startup_cpu_boost
        }
      }
      scaling {
        min_instance_count = var.reporting_min_instance_count
        max_instance_count = var.reporting_max_instance_count
      }
  }
}

resource "google_cloud_run_v2_service" "telemetry" {
  name     = "trad-telemetry"
  location = var.region
  project  = var.project_id
  template {
      service_account = google_service_account.telemetry_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/trad-telemetry:v1"
        resources {
          cpu_idle = var.telemetry_cpu_idle
          startup_cpu_boost = var.telemetry_startup_cpu_boost
        }
      }
      scaling {
        min_instance_count = var.telemetry_min_instance_count
        max_instance_count = var.telemetry_max_instance_count
      }
  }
}

resource "google_cloud_run_v2_service" "cleanup" {
  name     = "trad-cleanup"
  location = var.region
  project  = var.project_id
  template {
      service_account = google_service_account.cleanup_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/trad-cleanup:v1"
        resources {
          cpu_idle = var.cleanup_cpu_idle
          startup_cpu_boost = var.cleanup_startup_cpu_boost
        }
      }
      scaling {
        min_instance_count = var.cleanup_min_instance_count
        max_instance_count = var.cleanup_max_instance_count
      }
  }
}

resource "google_cloud_run_v2_service" "translation" {
  name     = "trad-translation"
  location = var.region
  project  = var.project_id
  template {
      service_account = google_service_account.translation_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/trad-translation:v1"
        resources {
          cpu_idle = var.translation_cpu_idle
          startup_cpu_boost = var.translation_startup_cpu_boost
        }
      }
      scaling {
        min_instance_count = var.translation_min_instance_count
        max_instance_count = var.translation_max_instance_count
      }
  }
}

resource "google_cloud_run_v2_service" "authentication" {
  name     = "trad-authentication"
  location = var.region
  project  = var.project_id
  template {
      service_account = google_service_account.authentication_sa.email
      containers {
        image = "eu.gcr.io/${var.project_id}/trad-authentication:v1"
        resources {
          cpu_idle = var.authentication_cpu_idle
          startup_cpu_boost = var.authentication_startup_cpu_boost
        }
      }
      scaling {
        min_instance_count = var.authentication_min_instance_count
        max_instance_count = var.authentication_max_instance_count
      }
  }
}
