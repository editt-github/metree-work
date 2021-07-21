import React, { useEffect } from "react";
import './App.css';
import firebase from './firebase';

function App() {
  useEffect(() => {
    firebase.database().ref('hair')
    .once("value")
    .then(snapshot => {
      console.log(snapshot.val())
    })
    return () => {
      
    }
  }, [])
  return (
    <>
    
    </>
  );
}

export default App;
