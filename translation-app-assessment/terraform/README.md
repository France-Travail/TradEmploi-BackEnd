`
 Copyright 2020 Google LLC. This software is provided as-is, without warranty
 or representation for any use or purpose. Your use of it is subject to your
 agreement with Google.
`

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

## Before running Terraform

Here are the first few steps that you need to take:

1. Make sure you have downloaded and set up recent versions of both Terraform and the Cloud SDK.
   [install sdk](https://cloud.google.com/sdk/docs/install)


2. Create a new GCP project and link it to a billing account.
3. Create a storage bucket to keep remote Terraform state in. This allows different engineers to be able to run Terraform and get consistent results, as opposed to storing it on someone's local machine and relying on that machine for all Terraform operations.

    Run this to create your bucket:

    ```
    gsutil mb -b on -l europe-west1 -p $GCP_PROJECT gs://$BUCKET_NAME
    ```

    Replace `$GCP_PROJECT` above with the project where you would like to create the state bucket. This can be the new projet you just created, or it could be a separate project you use just for this purpose.

    Replace `$BUCKET_NAME` above with the name you would like to give your bucket. This name needs to be universally unique and DNS-friendly (lower case letters, numbers, hyphens). For example: `pe-trad-tf-state`.
    
    Replace the Pôle Emploi tags, regex, labels and namespace with the name you would like to give, in those files: [index.ts](../backend/authentication/src/index.ts), [cloudbuild.yaml](../backend/authentication/cloudbuild.yaml), [rules.txt](../firestore_rules/rules.txt). 

4. Edit the config.tf and terraform.tfvars files in each dir (01-project-setup, 02-services, and 03-monitoring) to reflect the following changes:
    - In the config.tf file, change the value of `bucket` to be the name of the bucket you just created in the previous step.
    - In the terraform.tfvars, enter the different values you'd like to feed your variables, such as the project name. Use the terraform.tfvars.example file in each directory as an example.

5. Create a service account with Owner permissions in your project and download credentials for it. You can run the following commands to achieve this:

    ```
    gcloud iam service-accounts create terraform --project $SA_PROJECT_ID

    gcloud projects add-iam-policy-binding $SA_PROJECT_ID --member serviceAccount:terraform@$SA_PROJECT_ID.iam.gserviceaccount.com --role roles/owner

    gcloud iam service-accounts keys create ~/.config/gcloud/application_default_credentials.json --iam-account terraform@$SA_PROJECT_ID.iam.gserviceaccount.com

    ```

    Note that you can create this service account in the same project you just created above, or in a separate, centralized project where you'd like to keep such items. This is why these commands contain two different project ID substitutions.

    Replace `$SA_PROJECT_ID` where the project where you want your service account to reside. Replace $GCP_PROJECT with the ID of the project you created above, on step 2. You can optionally replace `~/credentials.json` with the location of the file containing this service account's keys. **Be aware this is a sensitive file and it shuold not be placed anywhere that is a git repository, even if your .gitignore contains this file name.**

    Once you're done with Terraform, and until next time you need to use it, you can disable this service account for security reasons. We provide the steps to do this further down in this README.

6. Set an environment variable that contains the key file you created, for Terraform to find.

    ```
    # on linux
    export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json
   
    # on Windows
    %appdata%/gcloud/application_default_credentials.json
    ```

    Change the path as needed if you created the file elsewhere or with another name.


## Initialize modules

Before applying Terraform templates for the first time, you need to initialize your environment. Go to each subdirectory (01, 02, 03) and run:

```
terraform init
```

## Apply templates

This part is the actual application of the templates that creates all necessary resources in your new project. Please read the steps carefully as there's a specific order you need to follow.

### Apply 01-project-setup

On windows, got to `01-project-setup`, uncomment in `container-images.tf` the following lines:
```
interpreter = ["PowerShell", "-Command"]
```

Simply cd to the `01-project-setup` directory and run:

```
terraform apply
```

You'll be asked to confirm by typing `yes` and this should create the first few resources.

Only move to the next step if Terraform finished without any errors.

It will take a few minutes to create all resources.
Only move to the next step if Terraform finished without any errors.
Perhaps, you must manually activate (following log errors) API:
- Cloud Resource Manager API
- Firebase Management API

### Apply 02-services

Again, cd to the `02-services` directory and run:

```
terraform apply
```

### Apply 03-monitoring

In order to apply this last set of Terraform templates, it's necessary to perform some steps first. These templates contain notification channels (who to notify) and alerts (what to notify on) that get raised when metrics go beyond a certain threshold.
It depends on two things: 
1) your project needs to have an active monitoring workspace and 
2) there needs to exist at least one datapoint of the involved metrics (in our case the cleanup metric, meaning we need to run cleanup at least once).

Here are the exact steps to follow before running Terraform:
1. Open the GCP console and go to the `Monitoring` service. You'll be asked to create a new monitoring workspace or add this project to an existing workspace. If unsure, create a new workspace. If reusing an existing workspace, note its name as you'll need to give it to Terraform as input. 
2. While waiting for the monitoring workspace to get activated, you can deploy the cleanup service. For that, cd to `translation-app-assessment/backend/cleanup` in this repo and run the following:

    ```
    gcloud builds submit . --project $GCP_PROJECT
    ```

    Replace `$GCP_PROJECT` above with the name of the project you created earlier in the *Before running Terraform* section.

    This will send the cleanup service files to Cloud Build which will create a container and deploy it to Cloud Run, making sure your cleanup service is ready for Cloud Scheduler to run.

3. Cloud Scheduler will run your cleanup service every hour. Instead of waiting, you can go to the Cloud Scheduler section of the GCP console where a job called `pe-cleanup-job` should be listed. Click the `Run now` button to manually call the cleanup service. Wait and click the `Refresh` button as needed. If you just created your monitoring workspace, it might take a few minutes for this first run to succeed. The *Result* column should show 'Success'. Make sure this is the case before you move on.

Finally, once the above steps are complete, you can apply the Terraform template. Just cd back to the `translation-app-assessment/terraform/03-monitoring` directory and run the following:

```
terraform apply
```

If the above steps went well, this should successfully create your notification channels and alerts.

# How to apply changes

If you need to change any templates, most likely under `02-services` you can do so and then run `terraform apply` similarly to what you have done when following this guide. You do not need to go back to the first (01-project-setup) directory for this, and you can run it directly on the directory where you made your changes. Only the changes will be applied and Terraform will show you a summary of the changes before you confirm by typing `yes`.

# Wrap up

Once you're done with Terraform, and before you need to run it again, it's recommended you disable the service account that's used to run these commands. This way, if you accidentally leak your credentials or they get stolen, attackers' chances of using them in any meaningful way will decrease significantly.

Run the following command to disable the Terraform service account:

```
gcloud iam service-accounts disable terraform@$SA_PROJECT_ID.iam.gserviceaccount.com --project $SA_PROJECT_ID
```

Replace the two occurrences of `$SA_PROJECT_ID` with the ID of the project where your service account was created.

You can run this exact command but using the `enable` subcommand instead of `disable`, to re-enable the service account next time you need to use it.
