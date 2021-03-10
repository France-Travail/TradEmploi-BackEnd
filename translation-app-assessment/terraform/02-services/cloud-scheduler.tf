locals {
  cleanup_url = google_cloud_run_service.cleanup.status[0].url
}

resource "google_cloud_scheduler_job" "cleanup" {
  name             = "pe-cleanup-job"
  description      = "regularly runs the cleanup function"
  schedule         = "0 * * * *"
  time_zone        = "Europe/Paris"
  attempt_deadline = "45s"
  project          = var.project_id
  region           = var.region

  http_target {
    http_method = "POST"
    uri         = "${local.cleanup_url}/"

    oidc_token {
      service_account_email = google_service_account.cleanup_job_sa.email
      audience = local.cleanup_url
    }
  }
}