---
**TradEmploi: an instantaneous translation application between two people, one of whom is allophone**

Copyright (C) <2022>  <Innovation Department, DSI Pôle Emploi>

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License along with this program.  If not, see https://www.gnu.org/licenses/.

---

# PETranslate-back

# Licence
This project is distributed under the GNU AFFERO GENERAL PUBLIC LICENSE V3.0. Please check the LICENSE file.

# Philosophy and objective

This project is the backend of the application. The frontend is **petranslate** project. Checks readme to install it.
The purpose of this application is describe in the documention of the frontend part.

# Installation

## translation-app-assessment
This contains example code for the Jan-Feb 2021 engagement on a code review / assessment of Pôle Emploi's voice+translation application.


# Main steps

1. Create GCP Infrastructure with Terraform
2. Deploy backend services
3. Create the Firebase application
4. Deploy frontend application
5. Configure security

## Create GCP Infrastructure with Terraform 
[Build Infrastructure - Terraform GCP](translation-app-assessment/terraform/README.md)


## Deploy backend services
[Build and deploy service](translation-app-assessment/backend/README.md)
(6 services)

## Create the Firebase application

Log in to the Firebase console, then click Add project.

Select your existing Google Cloud project from the dropdown menu, then click Continue.

Click Add Firebase.

Enable authentication for your Firebase project to use Firestore:

In the Firebase console, click Authentication from the navigation panel.

Go to the Sign-in Method tab.

Enable Email/Password and the anonymous authentication, for example:

![img.png](./images/img4.png)

Add Firebase to your app by following the web guide.


## Deploy frontend application
The source code of frontend application is in **petrranslate** project. See the README.md file to install it.

## Configure security

### Add Cloud Firestore Security Rules

To set up and deploy the firestore security rules, open the Rules tab in the Cloud Firestore section of the Firebase console.
Copy the rules from [rules.txt](./firestore_rules/rules.txt) Write your rules in the online editor, then click Publish

### Edit the API key to add restrictions

You must deploy the web application before the next step in order to have the 2 APIs:
- Identity Toolkit API
- Token Service API

In APIs and Service (on GCP Platform), the Credentials part, we could restrict the API key to specific websites and Api's (only the Identity Toolkit API and
Token Service API)

**First step**:

![img.png](images/img.png)

**Second step**:

![img.png](images/img2.png)
![img.png](images/img3.png)

### Optionnally, create user
If you use application with Firebase authentication (and not with OIDC mechanism), create user in firebase; this user will be used to access to the application.
![img.png](images/img5.png)
![img.png](images/img6.png)
