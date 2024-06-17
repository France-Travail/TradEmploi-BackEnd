locals {
  cleanup_url = google_cloud_run_v2_service.cleanup.uri
}

resource "google_cloud_scheduler_job" "cleanup" {
  name             = "trad-cleanup-job"
  description      = "regularly runs the cleanup function"
  schedule         = var.schedule
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