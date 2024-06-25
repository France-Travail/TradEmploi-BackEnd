# This file ensures the Firebase project is located in the preferred region
# instead of the default us-central

resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
}

resource "google_firestore_database" "database" {
  project                 = var.project_id
  name                    = "trad-prod"
  location_id             = "eur3"
  type                    = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_ENABLED"
  deletion_policy         = "DELETE"

  depends_on = [google_project_service.project_services]
}
