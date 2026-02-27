import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD_CxXn9H4aXKybfYpazH7DwQ9pYZRAq4E",
    authDomain: "haru-recruit.firebaseapp.com",
    projectId: "haru-recruit",
    storageBucket: "haru-recruit.firebasestorage.app",
    messagingSenderId: "344321160794",
    appId: "1:344321160794:web:483a10b3f845fb607b0a63",
    measurementId: "G-Y8TXEMLFRN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
