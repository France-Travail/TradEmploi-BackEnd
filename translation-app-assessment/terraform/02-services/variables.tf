#  ----  PROJECT  VARIABLES  ----
variable "project_id" {
  description = "Name of the GCP project"
  type        = string
}

variable "region" {
  description = "Region for the project"
  type        = string
}

#  ----  Cleanup Job schedule  VARIABLES  ----
variable "schedule" {
  description = "Schedule for Cloud Scheduler"
  type        = string
}

#  ----  Global CloudRun  VARIABLES  ----
variable "oidc_audience" {
  type        = string
  description = "Region to deploy resources to"
  default     = "trad.fr"
}

#  ----  Translation CloudRun  VARIABLES  ----
variable "translation_min_instance_count" {
  description = "Minimum instance for CloudRun"
  type        = string
}
variable "translation_max_instance_count" {
  description = "Maximum instance for CloudRun"
  type        = string
}
variable "translation_cpu_idle" {
  description = "Is CloudRun CPU always required"
  type        = string
}
variable "translation_startup_cpu_boost" {
  description = "Is CloudRun startup_cpu_boost enabled"
  type        = string
}

#  ----  Token-broker CloudRun  VARIABLES  ----
variable "token_broker_min_instance_count" {
  description = "Minimum instance for CloudRun"
  type        = string
}
variable "token_broker_max_instance_count" {
  description = "Maximum instance for CloudRun"
  type        = string
}
variable "token_broker_cpu_idle" {
  description = "Is CloudRun CPU always required"
  type        = string
}
variable "token_broker_startup_cpu_boost" {
  description = "Is CloudRun startup_cpu_boost enabled"
  type        = string
}

#  ----  Telemetry CloudRun  VARIABLES  ----
variable "telemetry_min_instance_count" {
  description = "Minimum instance for CloudRun"
  type        = string
}
variable "telemetry_max_instance_count" {
  description = "Maximum instance for CloudRun"
  type        = string
}
variable "telemetry_cpu_idle" {
  description = "Is CloudRun CPU always required"
  type        = string
}
variable "telemetry_startup_cpu_boost" {
  description = "Is CloudRun startup_cpu_boost enabled"
  type        = string
}

#  ----  Reporting CloudRun  VARIABLES  ----
variable "reporting_min_instance_count" {
  description = "Minimum instance for CloudRun"
  type        = string
}
variable "reporting_max_instance_count" {
  description = "Maximum instance for CloudRun"
  type        = string
}
variable "reporting_cpu_idle" {
  description = "Is CloudRun CPU always required"
  type        = string
}
variable "reporting_startup_cpu_boost" {
  description = "Is CloudRun startup_cpu_boost enabled"
  type        = string
}

#  ----  Cleanup CloudRun  VARIABLES  ----
variable "cleanup_min_instance_count" {
  description = "Minimum instance for CloudRun"
  type        = string
}
variable "cleanup_max_instance_count" {
  description = "Maximum instance for CloudRun"
  type        = string
}
variable "cleanup_cpu_idle" {
  description = "Is CloudRun CPU always required"
  type        = string
}
variable "cleanup_startup_cpu_boost" {
  description = "Is CloudRun startup_cpu_boost enabled"
  type        = string
}
