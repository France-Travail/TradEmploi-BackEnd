/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

resource "google_api_gateway_api" "api" {
  provider = google-beta
  project  = var.project_id
  api_id   = "pe-api"
}

resource "google_api_gateway_api_config" "api_cfg" {
  provider = google-beta
  project  = var.project_id
  api = google_api_gateway_api.api.api_id
  api_config_id = "pe-api-config-${random_id.cfg_suffix.hex}"
  gateway_config {
    backend_config {
      google_service_account = google_service_account.api_gateway_sa.email
    }
  }

  openapi_documents {
    document {
      path = "spec.yaml"
      contents = base64encode(data.template_file.openapi.rendered)
    }
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "google_api_gateway_gateway" "api_gw" {
  provider   = google-beta
  project    = var.project_id
  api_config = google_api_gateway_api_config.api_cfg.id
  gateway_id = "pe-api-gw"
  region     = var.region
  timeouts {
    create = "15m" # default 6m seems too short
  }
}

data "template_file" "openapi" {
  template = file("../../api-gateway/openapi.yaml")
  vars = {
    token_broker_url = google_cloud_run_service.token_broker.status[0].url
    telemetry_url    = google_cloud_run_service.telemetry.status[0].url
    reporting_url    = google_cloud_run_service.reporting.status[0].url
    admin_sa_email   = google_service_account.client_admin_sa.email
    guest_sa_email   = google_service_account.client_guest_sa.email
    oidc_audience    = var.oidc_audience
  }
}
resource "random_id" "cfg_suffix" {
	  byte_length = 4
    keepers = {
      cfg_id = md5(data.template_file.openapi.rendered)
    }
}