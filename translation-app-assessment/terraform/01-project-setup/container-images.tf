/*
 * Copyright 2020 Google LLC. This software is provided as-is, without warranty
 * or representation for any use or purpose. Your use of it is subject to your
 * agreement with Google.
 */

# Placeholder container images

resource "null_resource" "placeholder_images" {
  provisioner "local-exec" {
    interpreter = ["PowerShell", "-Command"]
    command = "./push-placeholder-images.sh"
    environment = {
      GCP_PROJECT = var.project_id
    }
  }
}