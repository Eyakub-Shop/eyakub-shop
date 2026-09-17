/* =========================================================
   Eyakub Shop — Firebase Configuration
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCHOSMHoW_DPJHDbJy0jCq-Alz3lJX7Qr0",
  authDomain: "eyakub-shop.firebaseapp.com",
  projectId: "eyakub-shop",
  storageBucket: "eyakub-shop.firebasestorage.app",
  messagingSenderId: "862601811106",
  appId: "1:862601811106:web:cdcb3ad187127e6d5433fb",
  measurementId: "G-CB9F51HVS1"
};


/* =========================
   Initialize Firebase
========================= */

firebase.initializeApp(firebaseConfig);


/* =========================
   Firebase Services
========================= */

const db = firebase.firestore();
const auth = firebase.auth();


/* =========================
   Shop Information
========================= */

const SHOP_INFO = {
  name: "Eyakub Shop",
  whatsapp: "966567225245",
  facebook: "https://www.facebook.com/profile.php?id=61594226919156",
  tagline: "অরিজিনাল জুতার সেরা কালেকশন",
  address: "বাংলাদেশ"
};


/* =========================
   Firebase Status
========================= */

const FIREBASE_CONFIGURED = true;


/* =========================
   Demo Products
========================= */

const DEMO_PRODUCTS = [];
