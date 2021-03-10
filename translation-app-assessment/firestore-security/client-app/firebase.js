// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

// Initialize Cloud Firestore through Firebase
var firebaseConfig = {
  apiKey: "AIzaSyAw7jTggV3o9tcdYBHMirpD41hFwlZ96nE",
  authDomain: "aiestaran-pe-tests-1.firebaseapp.com",
  projectId: "aiestaran-pe-tests-1",
  storageBucket: "aiestaran-pe-tests-1.appspot.com",
  messagingSenderId: "24562149993",
  appId: "1:24562149993:web:4ad7d453ec41442507d0f8"
}
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


const testDatabase = async () => {
  console.log('reading')
  doc = await db.collection('chats').doc('calm-squirrel-323').get()
  console.log(doc.id, doc.data())
  console.log(new Date().getTime())
  // querySnapshot = await db.collection('chats').where('guestId', '==', 'S3HwcITKkPT4Rihex1HvwEtAYUG2').get()
  // for (const documentQuerySnapshot of querySnapshot.docs) {
  //   console.log(documentQuerySnapshot.id, documentQuerySnapshot.data())
  // }
  // console.log('got this many:', querySnapshot.size)

  // console.log('writing')
  // db.collection("externalusers").add({
  //   first: "Ada",
  //   last: "Lovelace",
  //   born: 1815
  // })  
}

var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      console.log('Congratulations')
      // testDatabase()
      return false;
    }
  },
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
});

const dbButton = document.getElementById("run-test");
dbButton.addEventListener('mouseup', () => testDatabase())