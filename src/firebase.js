import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCF8UbAApsOnSL5F7zg8TgR4CHzIzkcBQ",
  authDomain: "teknofest-asistan.firebaseapp.com",
  projectId: "teknofest-asistan",
  storageBucket: "teknofest-asistan.firebasestorage.app",
  messagingSenderId: "873402254130",
  appId: "1:873402254130:web:32dbc2a8eca3a648e18d2b",
  measurementId: "G-LQY3K2J6LL"
};

// Konsolda anahtarın doğru yüklenip yüklenmediğini kontrol edelim
console.log("Firebase API Key Yüklendi:", firebaseConfig.apiKey);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);