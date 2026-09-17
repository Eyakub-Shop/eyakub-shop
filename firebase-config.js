/* =========================================================
   Eyakub Shop — Firebase কনফিগারেশন
   ==========================================================
   এই ফাইলটি আপনার Firebase প্রজেক্টের সাথে সংযোগ করে।
   নিচের মানগুলো Firebase Console থেকে কপি করে বসান।
   Firebase Console → Project settings → General → Your apps → SDK setup and configuration
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCHOSMHoW_DPJHDbJy0jCq-Alz3lJX7Qr0",
  authDomain: "eyakub-shop.firebaseapp.com",
  projectId: "eyakub-shop",
  storageBucket: "eyakub-shop.firebasestorage.app",
  messagingSenderId: "862601811106",
  appId: "1:862601811106:web:cdcb3ad187127e6d5433fb"
};

// এই ভ্যারিয়েবলটা চেক করে বোঝা যাবে Firebase সেটআপ করা হয়েছে কিনা
const FIREBASE_CONFIGURED = true;

firebase.initializeApp(firebaseConfig);
const db = FIREBASE_CONFIGURED ? firebase.firestore() : null;
const auth = FIREBASE_CONFIGURED ? firebase.auth() : null;

/* ============= দোকানের তথ্য (এখানে পরিবর্তন করুন) ============= */
const SHOP_INFO = {
  name: "Eyakub Shop",
  whatsapp: "966567225245", // দেশের কোড সহ, শুরুতে + বা 00 ছাড়া
  facebook: "https://www.facebook.com/profile.php?id=61594226919156",
  address: "ঢাকা, বাংলাদেশ",
  tagline: "অরিজিনাল জুতার সেরা কালেকশন"
};

/* ============= ডেমো/অফলাইন প্রোডাক্ট (Firebase কনফিগার না করলে দেখাবে) ============= */
const DEMO_PRODUCTS = [
  {
    id: "demo1",
    name: "ক্লাসিক লেদার লোফার",
    category: "জুতা",
    price: 1450,
    oldPrice: 1800,
    stock: 12,
    colors: ["কালো", "বাদামি"],
    sizes: ["40", "41", "42", "43"],
    description: "প্রিমিয়াম কোয়ালিটির অরিজিনাল লেদার লোফার। আরামদায়ক ও টেকসই।",
    images: []
  },
  {
    id: "demo2",
    name: "স্পোর্টস রানিং সু",
    category: "জুতা",
    price: 1650,
    oldPrice: 0,
    stock: 8,
    colors: ["সাদা", "নেভি"],
    sizes: ["39", "40", "41", "42"],
    description: "হালকা ও শ্বাস-প্রশ্বাসযোগ্য ফেব্রিকে তৈরি দৈনন্দিন ব্যবহারের জুতা।",
    images: []
  },
  {
    id: "demo3",
    name: "ফরমাল অক্সফোর্ড শু",
    category: "জুতা",
    price: 1950,
    oldPrice: 2300,
    stock: 5,
    colors: ["কালো"],
    sizes: ["41", "42", "43", "44"],
    description: "অফিস ও অনুষ্ঠানের জন্য উপযুক্ত ক্লাসিক অক্সফোর্ড ডিজাইন।",
    images: []
  }
];
