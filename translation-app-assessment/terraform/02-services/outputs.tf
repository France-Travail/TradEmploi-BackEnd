output "token_broker_url" {
    value = google_cloud_run_v2_service.token_broker.uri
}
output "telemetry_url" {
    value = google_cloud_run_v2_service.telemetry.uri
}
output "reporting_url" {
    value = google_cloud_run_v2_service.reporting.uri
}
output "translation_url" {
    value = google_cloud_run_v2_service.translation.uri
}
output "admin_sa_email" {
    value = google_service_account.client_admin_sa.email
}
output "guest_sa_email" {
    value = google_service_account.client_guest_sa.email
}
output "api_gateway_sa_email" {
    value = google_service_account.api_gateway_sa.email
}