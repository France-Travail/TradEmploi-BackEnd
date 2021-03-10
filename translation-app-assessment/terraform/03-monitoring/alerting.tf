/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

resource "google_monitoring_alert_policy" "cleanup_alert" {
  project      = var.project_id
  display_name = "Alert on cleanup"
  combiner     = "OR"
  notification_channels = [for item in values(tomap(google_monitoring_notification_channel.email)): item.name] 
  conditions {
    display_name = "Cleanup not running"
    condition_absent {
      filter     = "metric.type=\"custom.googleapis.com/cleanup_heartbeat\" AND resource.type=\"generic_task\""
      duration   = "14400s" # 4 hours
      aggregations {
        alignment_period   = "3600s" # 1 hour
        per_series_aligner = "ALIGN_MAX"
      }
    }
  }
}

resource "google_monitoring_notification_channel" "email" {
  for_each     = var.notification_emails
  display_name = "Email ${each.key}"
  type         = "email"
  project      = var.project_id
  labels = {
    email_address = each.value
  }
}