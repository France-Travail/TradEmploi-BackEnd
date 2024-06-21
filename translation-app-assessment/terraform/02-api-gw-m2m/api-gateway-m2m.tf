resource "google_api_gateway_api" "api-m2m" {
  provider = google-beta
  project  = var.project_id
  api_id   = "trad-api-m2m"
}

resource "google_api_gateway_api_config" "api-m2m_cfg" {
  provider = google-beta
  project  = var.project_id
  api = google_api_gateway_api.api-m2m.api_id
  api_config_id = "trad-api-m2m-config-${random_id.cfg_suffix.hex}"
  gateway_config {
    backend_config {
      google_service_account = var.api_gateway_sa_email
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

resource "google_api_gateway_gateway" "api-m2m_gw" {
  provider   = google-beta
  project    = var.project_id
  api_config = google_api_gateway_api_config.api-m2m_cfg.id
  gateway_id = "trad-api-m2m-gw"
  region     = var.region
  timeouts {
    create = "15m" # default 6m seems too short
  }
}

data "template_file" "openapi" {
  template = file("../../api-gateway-m2m/openapi.yaml")
  vars = {
    translation_url = var.translation_url
    google_issuer   = var.google_issuer
    google_jwks     = var.google_jwks
    google_audience = var.google_audiences
  }
}

resource "random_id" "cfg_suffix" {
	  byte_length = 4
    keepers = {
      cfg_id = md5(data.template_file.openapi.rendered)
    }
}