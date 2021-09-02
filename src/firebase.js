import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
import {firebaseConfig} from "./firebaseConfig"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const app2 = firebase.initializeApp({
  apiKey: "AIzaSyCEyTRsaYeSg_dz7UVdnuEEMgZxBTTHzIY",
  authDomain: "cafe-order-226e3.firebaseapp.com",
  databaseURL: "https://cafe-order-226e4.firebaseio.com/",
  projectId: "cafe-order-226e3",
  storageBucket: "cafe-order-226e3.appspot.com",
  messagingSenderId: "676427099091",
  appId: "1:676427099091:web:d1c93650bc273a611f5d26",
  measurementId: "G-GFLFJCZFF1"
}, 'app2');

//firebase.analytics();

export default firebase;
