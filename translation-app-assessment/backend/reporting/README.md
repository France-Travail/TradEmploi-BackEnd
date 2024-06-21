# peTranslateFunction

## Installation

Follow this tutotial for installation

```
https://firebase.google.com/docs/functions/local-emulator

and log with

$ firebase login

```

## Run on Local

1 - Get credential json from firebase console service account and put on src

DONT FORGET TO ADD URL !!!

2 - Run

```
$ firebase use dev
$ npm start
$ Open http://localhost:5000/trad-dev/us-central1/api
```
## Obtain a login token

Obtain a login token

```
mutation LoginUser {
  login(key: "xxxxxxx")
}
```

## Header

When you have a token, add a header with Authorization

```
{
  "Authorization":"xxxxxxxxxxxx"
}
```
## Query

Obtain all rates

```
{
  rates{
    day
    hour
    language
    facilityGrade
    efficientGrade
    offerLinked
    comment
  }
}

{
  rate(language:"Français"){
    day
    language
    hour
    comment
  }
}

{
  error(roomId:""){
    roomId
    day
    hour
    detail: {
      code
      description
    }
  }
}

{
  kpi{
    roomId
    conversation{
      day, 
      begin, 
      end, 
      duration
      languages
      nbUsers
    }
    device{
      support
    }
    error{
      day
      descriptions
      hours
    }
  }
}

```
## Mutation


```
mutation LoginUser {
  login(key: "xxxxx")
}
```


## Deploy on Dev

DONT FORGET TO RUN ON LOCAL FOR TESTING

1 - Deploy

```
$ firebase use dev
$ firebase deploy --only functions --project dev
```

Test
```
https://us-central1-<project-name>.cloudfunctions.net/api/
```

## Deploy on Qualification

DONT FORGET TO RUN ON LOCAL FOR TESTING

1 - Deploy

```
$ firebase use qa
$ firebase deploy --only functions --project qa
```

## Deploy on Prod

DONT FORGET TO RUN ON LOCAL FOR TESTING

1 - Deploy

```
$ firebase use prod
$ firebase deploy --only functions --project prod
```
