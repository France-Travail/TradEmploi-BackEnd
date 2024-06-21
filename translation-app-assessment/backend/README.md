`
 Copyright 2020 Google LLC. This software is provided as-is, without warranty
 or representation for any use or purpose. Your use of it is subject to your
 agreement with Google.
`

# How to deploy manually these services
From within the directory of the service you'd like to deploy:

```
gcloud builds submit . --project $GCP_ROJECT_ID
```
To change any build or deployment options, see the `cloudbuild.yaml` file for each service.

## Optional use of deepl
Optionally, you can use deepl to improve translations :
 - you need to fill your deepl api key in the environment `DEEPL_API_KEY=xxxxx`
 - you can use glossary by filling glossary id in the environment `DEEPL_GLOSSARY_<sourceLang>_<targetLang>=<ID>` (ex: `DEEPL_GLOSSARY_FR_EN=13a3761e-1234-1234-1234-4fcf8180ca05`)
