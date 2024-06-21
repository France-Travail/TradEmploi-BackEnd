#!/bin/bash

gcloud auth configure-docker

docker pull us-docker.pkg.dev/cloudrun/container/hello

docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT_ID/trad-token-broker:v1
docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT_ID/trad-reporting:v1
docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT_ID/trad-telemetry:v1
docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT_ID/trad-cleanup:v1
docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT_ID/trad-translation:v1
docker tag us-docker.pkg.dev/cloudrun/container/hello eu.gcr.io/$GCP_PROJECT_ID/trad-authentication:v1

docker push eu.gcr.io/$GCP_PROJECT_ID/trad-token-broker:v1
docker push eu.gcr.io/$GCP_PROJECT_ID/trad-reporting:v1
docker push eu.gcr.io/$GCP_PROJECT_ID/trad-telemetry:v1
docker push eu.gcr.io/$GCP_PROJECT_ID/trad-cleanup:v1
docker push eu.gcr.io/$GCP_PROJECT_ID/trad-translation:v1
docker push eu.gcr.io/$GCP_PROJECT_ID/trad-authentication:v1
