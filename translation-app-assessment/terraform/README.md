Copyright 2020 Google LLC. This software is provided as-is, without warranty
or representation for any use or purpose. Your use of it is subject to your
agreement with Google.

# How to deploy resources with Terraform

This document explains how to deploy the example Terraform templates that are provided in the Pôle Emploi translation application assessment project.

## Directory structure

This directory contains the following subdirectories:

**01-project-setup**:
Contains basic project setup steps such as: enabling all necessary GCP APIs, activating Firebase, setting up a Firestore database in Native mode, and pushing 'placeholder' (hello world) containers to Cloud Run in order for the initial deployment to succeed, before any actual code is deployed.

**02-services**:
Contains most of the GCP services used for the translation app, such as: Cloud Run services, API Gateway, Cloud Scheduler, service accounts and their role bindings.

**03-monitoring**:
Contains notification channels and alerts for the cleanup service monitoring.

## Prepare GCP project Before running Terraform

1. Make sure you have downloaded and set up recent versions of both Terraform and the Google SDK.
   [install terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
   [install google-sdk](https://cloud.google.com/sdk/docs/install)

2. Get the GCP project name and get owner right on it.

3. Create a storage bucket to keep remote Terraform state in. This allows different engineers to be able to run Terraform and get consistent results, as opposed to storing it on someone's local machine and relying on that machine for all Terraform operations.
   Run this to create your bucket:
    ```
    gsutil mb -b on -l europe-west1 -p $GCP_PROJECT_ID gs://$BUCKET_NAME
    ```
   Replace `$GCP_PROJECT_ID` above with the project where you would like to create the state bucket.
   Replace `$BUCKET_NAME` above with the name you would like to give to the bucket. This name needs to be universally unique and DNS-friendly (lower case letters, numbers, hyphens). For example: `sncf-trad-<env>-tf-state`.

4. Create a service account $SA_NAME with Owner permissions in your project, create and store its credentials in Google SecretManger.
   Run the following commands :
    ```
    gcloud iam service-accounts create $SA_NAME --project $GCP_PROJECT_ID --display-name="Terraform Deploy Service Account"

    gcloud projects add-iam-policy-binding $GCP_PROJECT_ID --member serviceAccount:$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com --role roles/owner

    gcloud iam service-accounts keys create ~/.config/gcloud/application_default_credentials.json --iam-account $SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com

    gcloud services enable secretmanager.googleapis.com  --project $GCP_PROJECT_ID

    cat ~/.config/gcloud/application_default_credentials.json | gcloud secrets create $SA_NAME-json-key --data-file=-  --project $GCP_PROJECT_ID
    ```
   Once you're done with Terraform, and until next time you need to use it, you can disable this service account for security reasons. We provide the steps to do this further down in this README.

5. Edit the following files in each dir (01-project-setup, 02-services, and 03-monitoring) to reflect the following changes:
    - In the `config.tf` file, change the value of `bucket` to be the name of the bucket you just created in the previous step. Change also the path and the name of the terraform SA credentials file create before.
    - In the `terraform.tfvars`, replace variables values. Use the terraform.tfvars.example file in each directory as an example.

## Initialize module and Apply templates

Before applying Terraform templates for the first time, you need to initialize your environment on your terminal, only after you could apply templates in order to create all necessary resources in your new project.
Please read steps carefully as there's a specific order to follow.

### Module 01-project-setup

On windows, go to `01-project-setup`, uncomment in `container-images.tf` the following lines:
```
interpreter = ["PowerShell", "-Command"]
```
Simply go to the `01-project-setup` directory and run:
```
terraform init
terraform apply
```
You'll be asked to confirm by typing `yes` and this should create resources.
It will take a few minutes to create all resources.
Only move to the next step if Terraform finished without any errors.

If execution of the `push-placeholder-image` failed, execute it manually by running
```
./push-placeholders-image.sh
```

### Module 02-services

Go to the `02-services` directory and run:
```
terraform init
terraform apply
```

### Module 03-monitoring

These templates contain notification channels (who to notify) and alerts (what to notify on) that get raised when metrics go beyond a certain threshold.
It depends on two things:
1) your project needs to have an active monitoring workspace and
2) there needs to exist at least one datapoint of the involved metrics (in our case the cleanup metric, meaning we need to run cleanup at least once).

Here are the exact steps to follow before running Terraform:
1. Open the GCP console and go to the `Monitoring` service. You'll be asked to create a new monitoring workspace or add this project to an existing workspace. If unsure, create a new workspace. If reusing an existing workspace, note its name as you'll need to give it to Terraform as input.
2. While waiting for the monitoring workspace to get activated, you can deploy the cleanup service. For that, cd to `translation-app-assessment/backend/cleanup` in this repo and run the following:
    ```
    gcloud builds submit . --project $GCP_PROJECT_ID
    ```
   Replace `$GCP_PROJECT_ID` above with the name of the project you created earlier in the *Before running Terraform* section.
   This will send the cleanup service files to Cloud Build which will create a container and deploy it to Cloud Run, making sure your cleanup service is ready for Cloud Scheduler to run.

3. Cloud Scheduler will run your cleanup service every hour. Instead of waiting, you can go to the Cloud Scheduler section of the GCP console where a job called `trad-cleanup-job` should be listed. Click the `Run now` button to manually call the cleanup service. Wait and click the `Refresh` button as needed. If you just created your monitoring workspace, it might take a few minutes for this first run to succeed. The *Result* column should show 'Success'. Make sure this is the case before you move on.

Finally, once the above steps are complete, you can apply the Terraform template. Just cd back to the `translation-app-assessment/terraform/03-monitoring` directory and run the following:

```
terraform init
terraform apply
```

If the above steps went well, this should successfully create your notification channels and alerts.

# How to apply changes

If you need to change any templates, most likely under `02-services` you just have to push commit in the gitlab repository, the CI/CD chain will deploy automaticaly modififcation on GCP.

# Finalization
As those terraform steps need to be done only for the project initialization, you have to desactivate the terraform service account for security reasons after steps execution.
```
gcloud iam service-accounts disable $SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com --project $GCP_PROJECT_ID
```

# Next steps

[Create Deepl glossaries](translation-app-assessment/deepl-glossary/README.md)
