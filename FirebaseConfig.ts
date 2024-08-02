import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyDdpAGLqYANPXgNt2R18eWeGw0udYWv4uM",
    authDomain: "dcat-c09a4.firebaseapp.com",
    databaseURL: "https://dcat-c09a4-default-rtdb.firebaseio.com",
    projectId: "dcat-c09a4",
    storageBucket: "dcat-c09a4.appspot.com",
    messagingSenderId: "729078324594",
    appId: "1:729078324594:web:8daf55a40b06bba5d691eb",
    measurementId: "G-W5S2ZHGBDR"
};
const FIREBASE_APP = initializeApp(firebaseConfig);

export default FIREBASE_APP;