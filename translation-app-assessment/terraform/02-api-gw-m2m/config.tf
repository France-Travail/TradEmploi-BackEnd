# --- TERRAFORM CONFIG ----------------------------------------------

terraform {
  backend "gcs" {
    bucket = tf_state_bucket
    prefix = "02-api-gateway-m2m"
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
