# This file ensures the Firebase project is located in the preferred region
# instead of the default us-central

resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
}

resource "google_firebase_project_location" "default" {
    provider = google-beta
    project = google_firebase_project.default.project

    location_id = var.firebase_region

    provisioner "local-exec" {
      command = "gcloud alpha firestore databases create --region ${var.firebase_region} --project ${var.project_id}"
    }
}

