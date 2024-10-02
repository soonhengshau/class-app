import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuSIjHbIJm0uo2r-mdVAzhfQL6IIZm_uw",
  authDomain: "class-booking-app-60262.firebaseapp.com",
  projectId: "class-booking-app-60262",
  storageBucket: "class-booking-app-60262.appspot.com",
  messagingSenderId: "679321935863",
  appId: "1:679321935863:web:fa2788c3fcb006c9ced8f2",
  measurementId: "G-QWKZMD2VL6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
