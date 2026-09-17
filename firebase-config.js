const firebaseConfig = {
  apiKey: "AIzaSyCHOSmHo_W_DPJHDbJy0jC-Alz3lJX7Qr0",
  authDomain: "eyakub-shop.firebaseapp.com",
  projectId: "eyakub-shop",
  storageBucket: "eyakub-shop.firebasestorage.app",
  messagingSenderId: "862601811106",
  appId: "1:862601811106:web:cdcb3ad187127e6d5433fb",
  measurementId: "G-CB9F51HVS1"
};

let FIREBASE_CONFIGURED = false;
let db = null;
let auth = null;

const SHOP_INFO = {
  name: "Eyakub Shop",
  tagline: "অরিজিনাল জুতার সেরা কালেকশন",
  whatsapp: "966567225245",
  address: "ঢাকা, বাংলাদেশ"
};

const DEMO_PRODUCTS = [];

try {
  firebase.initializeApp(firebaseConfig);

  db = firebase.firestore();
  auth = firebase.auth();

  FIREBASE_CONFIGURED = true;

  console.log("Firebase connected successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error);
}
