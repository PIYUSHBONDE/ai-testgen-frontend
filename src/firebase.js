// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC5AslKNESVjLHSoIUHzee-3WN4vjuwbbg",
  authDomain: "gen-ai-hackathon-8bab9.firebaseapp.com",
  projectId: "gen-ai-hackathon-8bab9",
  storageBucket: "gen-ai-hackathon-8bab9.appspot.com",
  messagingSenderId: "243024628153",
  appId: "1:243024628153:web:f45e95895b858c8aac8e68",
  measurementId: "G-SP6MWR73C9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const functions = getFunctions(app, "us-east4"); // set region where you deployed
export const provider = new GoogleAuthProvider();
