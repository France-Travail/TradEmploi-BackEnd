#!/bin/bash

gcloud auth configure-docker

docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT/pe-token-broker:v1
docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT/pe-reporting:v1
docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT/pe-telemetry:v1
docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT/pe-cleanup:v1

docker push eu.gcr.io/$GCP_PROJECT/pe-token-broker:v1
docker push eu.gcr.io/$GCP_PROJECT/pe-reporting:v1
docker push eu.gcr.io/$GCP_PROJECT/pe-telemetry:v1
docker push eu.gcr.io/$GCP_PROJECT/pe-cleanup:v1
