# Eyakub Shop — সেটআপ গাইড

এই ওয়েবসাইট দুটো ফ্রি সার্ভিস দিয়ে কাজ করবে:
- **GitHub Pages** → ওয়েবসাইট হোস্টিং
- **Firebase** → প্রোডাক্ট ডাটাবেস + Admin লগইন + অর্ডার সংরক্ষণ

দুটোই সম্পূর্ণ ফ্রি (কোনো টাকা লাগবে না)।

---

## ধাপ ১: Firebase প্রজেক্ট তৈরি করুন

1. https://console.firebase.google.com এ যান, Google একাউন্ট দিয়ে লগইন করুন।
2. **Add project** ক্লিক করুন → নাম দিন `eyakub-shop` → Continue → Continue → **Create project**।
3. প্রজেক্ট তৈরি হলে বাম পাশের মেনু থেকে:
   - **Build → Firestore Database** → **Create database** → **Start in production mode** → আপনার কাছের Location বেছে নিন → Enable।
   - **Build → Authentication** → **Get started** → **Sign-in method** ট্যাবে **Email/Password** চালু করুন (Enable) → Save।
   - **Authentication → Users** ট্যাবে গিয়ে **Add user** ক্লিক করে নিজের Admin ইমেইল ও পাসওয়ার্ড দিয়ে একটি ইউজার তৈরি করুন। এই ইমেইল/পাসওয়ার্ড দিয়েই আপনি admin.html এ লগইন করবেন।

4. এবার **Project settings** (⚙️ আইকন) → নিচে scroll করে **Your apps** → **</> (Web)** আইকনে ক্লিক করুন → একটা নাম দিন (যেমন `eyakub-web`) → **Register app**।
5. যে কোড দেখাবে, তার মধ্যে `firebaseConfig` অবজেক্টটা কপি করুন। এটা দেখতে এরকম:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "eyakub-shop.firebaseapp.com",
     projectId: "eyakub-shop",
     storageBucket: "eyakub-shop.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
6. এই ফাইলগুলোর মধ্যে `firebase-config.js` ফাইলটি খুলুন এবং উপরের মানগুলো বসিয়ে দিন (`আপনার-API-KEY` ইত্যাদি লেখা জায়গাগুলোতে)।

### Firestore Security Rules বসান
Firestore → **Rules** ট্যাবে গিয়ে নিচের rules বসিয়ে **Publish** করুন — এতে শুধু আপনি (admin) প্রোডাক্ট এডিট করতে পারবেন, কিন্তু সবাই দেখতে ও অর্ডার দিতে পারবে:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

## ধাপ ২: GitHub-এ ওয়েবসাইট আপলোড করুন

আপনার কম্পিউটারে এই ফোল্ডারের সবগুলো ফাইল (`index.html`, `admin.html`, `app.js`, `admin.js`, `style.css`, `firebase-config.js`, `README.md`) একটা ফোল্ডারে রাখুন। তারপর টার্মিনাল/Command Prompt-এ ফোল্ডারের ভেতরে গিয়ে নিচের কমান্ডগুলো একে একে চালান (কপি-পেস্ট করুন):

```bash
git init
git add .
git commit -m "Eyakub Shop website"
git branch -M main
git remote add origin https://github.com/আপনার-ইউজারনেম/eyakub-shop.git
git push -u origin main
```

> এর আগে GitHub.com এ গিয়ে **New repository** বানিয়ে নিন (নাম দিন `eyakub-shop`, Public সিলেক্ট করুন, README/gitignore/license কিছুই যোগ করবেন না) এবং উপরের কমান্ডে `আপনার-ইউজারনেম` জায়গায় নিজের GitHub ইউজারনেম বসান।

## ধাপ ৩: GitHub Pages চালু করুন

1. আপনার রিপোজিটরির GitHub পেজে যান → **Settings** → বাম মেনুতে **Pages**।
2. **Branch** এর নিচে `main` সিলেক্ট করুন, ফোল্ডার `/ (root)` রেখে **Save** করুন।
3. ১-২ মিনিট পর আপনার ওয়েবসাইট লাইভ হয়ে যাবে এই ঠিকানায়:
   `https://আপনার-ইউজারনেম.github.io/eyakub-shop/`

---

## ব্যবহার নির্দেশনা

- **কাস্টমারদের জন্য পেজ:** `index.html` (মূল হোমপেজ)
- **আপনার Admin Panel:** `admin.html` — এই ঠিকানায় গিয়ে আপনার Firebase ইমেইল/পাসওয়ার্ড দিয়ে লগইন করবেন। অন্য কেউ এই ইমেইল/পাসওয়ার্ড ছাড়া ঢুকতে পারবে না।
- Admin Panel থেকে প্রোডাক্ট **Add / Edit / Delete** করতে পারবেন — নাম, দাম, আগের দাম, স্টক সংখ্যা, কালার, সাইজ, বিবরণ এবং একাধিক ছবি (গ্যালারি থেকে Choose File দিয়ে) যোগ করা যাবে।
- কাস্টমার প্রোডাক্টে ক্লিক করলে কালার/সাইজ/পরিমাণ বাছাই করে নাম-ফোন-ঠিকানা দিয়ে ফর্ম পূরণ করবে, তারপর সরাসরি আপনার WhatsApp নাম্বারে (+966567225245) অর্ডারের বিস্তারিত মেসেজসহ চলে যাবে। একই সাথে অর্ডারটি Admin Panel-এর "অর্ডার সমূহ" ট্যাবেও জমা থাকবে।
- হেডার ও ফুটারে আপনার Facebook পেজের লিংক এবং WhatsApp বাটন যুক্ত করা আছে।

## যা মনে রাখবেন

- `firebase-config.js` ঠিকভাবে পূরণ না করলে ওয়েবসাইটে শুধু ৩টি ডেমো প্রোডাক্ট দেখাবে এবং Admin Panel লগইন কাজ করবে না — তাই ধাপ ১ অবশ্যই সম্পূর্ণ করুন।
- ভবিষ্যতে নতুন ক্যাটাগরি (যেমন কাপড়, ঘড়ি ইত্যাদি) যোগ করতে চাইলে প্রোডাক্ট যোগ করার সময় "ক্যাটাগরি" ঘরে নতুন নাম লিখলেই হবে — কোনো কোড পরিবর্তনের দরকার নেই।
- Firebase-এর ফ্রি প্ল্যানে (Spark) মাসে অনেক বড় পরিমাণ read/write ফ্রি — একটা ছোট-মাঝারি দোকানের জন্য এটা যথেষ্ট, কোনো টাকা লাগবে না।
