/*
 * Création du compte de Service gitlab
 */
 resource "google_service_account" "gitlab_sa" {
  account_id   = "gitlab-sa"
  display_name = "CI/CD Gitlab Service Account"
  project      = var.project_id
}

/*
 * Création de la clef du compte de Service et stockage dans Secret Manager
 */
resource "google_service_account_key" "gitlab-sa-key" {
  service_account_id = google_service_account.gitlab_sa.name
}

resource "google_secret_manager_secret" "gitlab-sa-key-secret" {
 project   = var.project_id
 secret_id = "gitlab-sa-json-key"
 replication {
   auto {}
  }
}

resource "google_secret_manager_secret_version" "gitlab-sa-key-secret-1" {
 secret      = google_secret_manager_secret.gitlab-sa-key-secret.id
 secret_data = base64decode(google_service_account_key.gitlab-sa-key.private_key)
}