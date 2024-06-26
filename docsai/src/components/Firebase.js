// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMq_t0ApKpD6wkHgXUwJ3VAIsWlmsZs1k",
  authDomain: "docs-ai-427317.firebaseapp.com",
  projectId: "docs-ai-427317",
  storageBucket: "docs-ai-427317.appspot.com",
  messagingSenderId: "463045630937",
  appId: "1:463045630937:web:037a409c234eb406e357c8",
  measurementId: "G-3BBGPTX5M8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth=getAuth();
export const db=getFirestore(app);
export default app;