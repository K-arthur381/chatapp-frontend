// export const environment = {
//   production: false,
//   //apiUrl: 'http://localhost:5204/api',
//   //hubUrl: 'http://localhost:5204/hubs/chat'

//    // apiUrl: 'http://192.168.100.83:5204/api',
//   // hubUrl: 'http://192.168.100.83:5204/hubs/chat'

//    apiUrl: 'http://192.168.0.164:5204/api',
//   hubUrl: 'http://192.168.0.164:5204/hubs/chat'
  
// };

export const environment = {
  production: false,
 // apiUrl: 'https://localhost:5204/api',
 // hubUrl: 'https://localhost:5204/hubs/chat',
 apiUrl: 'http://192.168.0.164:5204/api',
   hubUrl: 'http://192.168.0.164:5204/hubs/chat',
  //firebase setup in Web
  firebase: {
   apiKey: "AIzaSyCiKoNcLlW1n6ZT9lCHqowhsNisBrje0nI",
  authDomain: "chitchat-notifications.firebaseapp.com",
  projectId: "chitchat-notifications",
  storageBucket: "chitchat-notifications.firebasestorage.app",
  messagingSenderId: "592281793531",
  appId: "1:592281793531:web:ebc822afbac45e31a3d15e",
    vapidKey: "BOsfYftBPkH124W3mP5Sa37dOrZwiNTjTZGYASdD-Pi1qqJozhRhk49iGGeuKXxmaudrtgQrNsguevnFUzpcDeY"             
  }
};