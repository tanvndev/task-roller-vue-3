// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyACiUwfWDFk2aKDghbMWjCI85kY2S_5ltA',
  authDomain: 'imoneybyvue.firebaseapp.com',
  projectId: 'imoneybyvue',
  storageBucket: 'imoneybyvue.firebasestorage.app',
  messagingSenderId: '548267707461',
  appId: '1:548267707461:web:93f5ee508fd099a457672c',
  measurementId: 'G-VPM0LSRVY9',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
const db = getFirestore(app)

export { db }
