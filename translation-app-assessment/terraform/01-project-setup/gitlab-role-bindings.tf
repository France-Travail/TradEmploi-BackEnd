/*
 * Autorise le compte de service de la chaine gitlab CI/CD
 */
resource "google_project_iam_member" "gitlab_sa_role" {
  project = var.project_id
  for_each = toset([
    "roles/run.admin",
    "roles/cloudscheduler.admin",
    "roles/iam.serviceAccountAdmin",
    "roles/resourcemanager.projectIamAdmin",
    "roles/apigateway.admin",
    "roles/iam.serviceAccountUser"
  ])
  role    = each.key
  member = "serviceAccount:${google_service_account.gitlab_sa.email}"
}
