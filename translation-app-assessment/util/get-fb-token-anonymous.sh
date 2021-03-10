#!/bin/bash

# Copyright 2020 Google LLC. This software is provided as-is, without warranty
# or representation for any use or purpose. Your use of it is subject to your
# agreement with Google.

curl 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyAw7jTggV3o9tcdYBHMirpD41hFwlZ96nE' \
  -H 'content-type: application/json' \
  --data-raw '{"returnSecureToken":true}' \