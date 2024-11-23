import { initializeApp } from "firebase/app";

const firebaseConfig = {

    //Production
    apiKey: "AIzaSyDdpAGLqYANPXgNt2R18eWeGw0udYWv4uM",
    authDomain: "dcat-c09a4.firebaseapp.com",
    databaseURL: "https://dcat-c09a4-default-rtdb.firebaseio.com",
    projectId: "dcat-c09a4",
    storageBucket: "dcat-c09a4.appspot.com",
    messagingSenderId: "729078324594",
    appId: "1:729078324594:web:8daf55a40b06bba5d691eb",
    measurementId: "G-W5S2ZHGBDR"




    //Test
    // apiKey: "AIzaSyCj-vri5DCx-9qH8P3lHwMhfqf5U9G5gGs",
    // authDomain: "dcat-test.firebaseapp.com",
    // databaseURL: "https://dcat-test-default-rtdb.firebaseio.com",
    // projectId: "dcat-test",
    // storageBucket: "dcat-test.appspot.com",
    // messagingSenderId: "760400137892",
    // appId: "1:760400137892:web:c6eee1acf089054723a031",
    // measurementId: "G-PN7F22VBWK"
};
const FIREBASE_APP = initializeApp(firebaseConfig);

export default FIREBASE_APP;