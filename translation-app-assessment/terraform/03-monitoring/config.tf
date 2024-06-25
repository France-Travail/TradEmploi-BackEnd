terraform {
  backend "gcs" {
    bucket = tf_state_bucket
    prefix = "03-monitoring"
    credentials = "../../../gcloud-service-key.json"
  }
}

# Terraform Providers

# --- GOOGLE -------------------------------------------------------
# Define default parameters (project, region, zone) for Google provider
provider "google" {
  project     = var.project_id
  region      = var.region
  credentials = "../../../gcloud-service-key.json"
}

provider "google-beta" {
  project     = var.project_id
  region      = var.region
  credentials = "../../../gcloud-service-key.json"
}
