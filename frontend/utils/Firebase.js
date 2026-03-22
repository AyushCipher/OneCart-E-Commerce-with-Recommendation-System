import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "onecart-e-commerce.firebaseapp.com",
  projectId: "onecart-e-commerce",
  storageBucket: "onecart-e-commerce.appspot.com",
  messagingSenderId: "881633536905",
  appId: "1:881633536905:web:228bd31630be2d79864f58",
  measurementId: "G-Q1NFY71MZP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth , provider}

