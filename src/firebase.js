// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADITU6zBa2E-kdT6RdffHs-iuaW_TELY8",
  authDomain: "impress3d-e0ec5.firebaseapp.com",
  projectId: "impress3d-e0ec5",
  storageBucket: "impress3d-e0ec5.firebasestorage.app",
  messagingSenderId: "820476165478",
  appId: "1:820476165478:web:ca8902a92bdf359efcdca7",
  measurementId: "G-DK5KWS50E2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);