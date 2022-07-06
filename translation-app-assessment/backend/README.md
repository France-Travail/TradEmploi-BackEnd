`
 Copyright 2020 Google LLC. This software is provided as-is, without warranty
 or representation for any use or purpose. Your use of it is subject to your
 agreement with Google.
`

# How to deploy these services
From within the directory of the service you'd like to deploy:

```
gcloud builds submit . --project <PROJECT-ID-TO-DEPLOY-TO>
```

To change any build or deployment options, see the `cloudbuild.yaml` file for each service.

## Optional use of deepl
Optionally, you can use deepl to improve translations, you need to fill your deepl api key in the environment `DEEPL_API_KEY=xxxxx`
