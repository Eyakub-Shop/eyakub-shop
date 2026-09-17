const ADMIN_EMAIL = "mdeyakub9970@gmail.com";

let editingProductId = null;

// ===============================
// AUTH CHECK
// ===============================

auth.onAuthStateChanged(function(user) {

  if (user) {

    if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      alert("এই Email দিয়ে Admin Panel ব্যবহার করার অনুমতি নেই।");
      auth.signOut();
      return;
    }

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminDashboard").style.display = "block";

    loadProducts();
    loadOrders();

  } else {

    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("adminDashboard").style.display = "none";

  }

});


// ===============================
// LOGIN
// ===============================

async function doLogin() {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;

  if (!email || !password) {
    alert("Email এবং Password দিন।");
    return;
  }

  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    alert("এই Email Admin হিসেবে অনুমোদিত নয়।");
    return;
  }

  try {

    await auth.signInWithEmailAndPassword(email, password);

  } catch (error) {

    console.error(error);

    alert(
      "লগইন করা যায়নি।\n\n" +
      "Email অথবা Password ঠিক আছে কিনা দেখুন।\n\n" +
      "Firebase Authentication-এ Email টি তৈরি করা হয়েছে কিনা নিশ্চিত করুন।"
    );

  }

}


// ===============================
// LOGOUT
// ===============================

async function doLogout() {

  try {
    await auth.signOut();
  } catch (error) {
    console.error(error);
  }

}


// ===============================
// TAB SWITCH
// ===============================

function showTab(tabName) {

  const productTab = document.getElementById("productsTab");
  const ordersTab = document.getElementById("ordersTab");

  const productBtn = document.getElementById("productTabBtn");
  const orderBtn = document.getElementById("orderTabBtn");

  if (tabName === "products") {

    if (productTab) productTab.style.display = "block";
    if (ordersTab) ordersTab.style.display = "none";

    if (productBtn) productBtn.classList.add("active");
    if (orderBtn) orderBtn.classList.remove("active");

  }

  if (tabName === "orders") {

    if (productTab) productTab.style.display = "none";
    if (ordersTab) ordersTab.style.display = "block";

    if (productBtn) productBtn.classList.remove("active");
    if (orderBtn) orderBtn.classList.add("active");

    loadOrders();

  }

}


// ===============================
// IMAGE COMPRESSION
// ===============================

function compressImage(file, maxWidth = 900, quality = 0.75) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = function(event) {

      const img = new Image();

      img.onload = function() {

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {

          height = Math.round(height * maxWidth / width);
          width = maxWidth;

        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        resolve(dataUrl);

      };

      img.onerror = reject;

      img.src = event.target.result;

    };

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}


// ===============================
// ADD / UPDATE PRODUCT
// ===============================

async function saveProduct(event) {

  if (event) event.preventDefault();

  const name = document.getElementById("pName").value.trim();
  const category = document.getElementById("pCategory").value.trim();
  const price = Number(document.getElementById("pPrice").value);
  const oldPrice = Number(document.getElementById("pOldPrice").value) || 0;
  const stock = Number(document.getElementById("pStock").value) || 0;

  const colorsText = document.getElementById("pColors").value.trim();
  const sizesText = document.getElementById("pSizes").value.trim();
  const description = document.getElementById("pDesc").value.trim();

  const imageInput = document.getElementById("pImages");

  if (!name) {
    alert("প্রোডাক্টের নাম দিন।");
    return;
  }

  if (!price || price <= 0) {
    alert("সঠিক Price দিন।");
    return;
  }

  const colors = colorsText
    ? colorsText.split(",").map(x => x.trim()).filter(Boolean)
    : [];

  const sizes = sizesText
    ? sizesText.split(",").map(x => x.trim()).filter(Boolean)
    : [];

  let images = [];

  // নতুন ছবি থাকলে
  if (imageInput && imageInput.files.length > 0) {

    try {

      for (const file of imageInput.files) {

        const compressed = await compressImage(file);

        images.push(compressed);

      }

    } catch (error) {

      console.error(error);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
      return;

    }

  }

  try {

    if (editingProductId) {

      const oldDoc = await db
        .collection("products")
        .doc(editingProductId)
        .get();

      const oldData = oldDoc.exists ? oldDoc.data() : {};

      if (images.length === 0) {
        images = oldData.images || [];
      }

      await db
        .collection("products")
        .doc(editingProductId)
        .update({

          name: name,
          category: category.toLowerCase(),
          price: price,
          oldPrice: oldPrice,
          stock: stock,
          colors: colors,
          sizes: sizes,
          description: description,
          images: images,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()

        });

      alert("প্রোডাক্ট সফলভাবে আপডেট হয়েছে।");

      editingProductId = null;

    } else {

      await db.collection("products").add({

        name: name,
        category: category.toLowerCase(),
        price: price,
        oldPrice: oldPrice,
        stock: stock,
        colors: colors,
        sizes: sizes,
        description: description,
        images: images,

        createdAt: firebase.firestore.FieldValue.serverTimestamp(),

        updatedAt: firebase.firestore.FieldValue.serverTimestamp()

      });

      alert("নতুন প্রোডাক্ট সফলভাবে যোগ হয়েছে।");

    }

    resetProductForm();
    loadProducts();

  } catch (error) {

    console.error(error);

    alert(
      "প্রোডাক্ট Save করা যায়নি।\n\n" +
      error.message
    );

  }

}


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

  const tbody = document.getElementById("productTableBody");

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="8">প্রোডাক্ট লোড হচ্ছে...</td>
    </tr>
  `;

  try {

    const snapshot = await db
      .collection("products")
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {

      tbody.innerHTML = `
        <tr>
          <td colspan="8">এখনো কোনো প্রোডাক্ট নেই।</td>
        </tr>
      `;

      return;

    }

    tbody.innerHTML = "";

    snapshot.forEach(doc => {

      const p = {
        id: doc.id,
        ...doc.data()
      };

      const firstImage =
        p.images && p.images.length
          ? p.images[0]
          : "";

      const row = document.createElement("tr");

      row.innerHTML = `

        <td>
          ${
            firstImage
              ? `<img src="${firstImage}"
                    style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`
              : "📦"
          }
        </td>

        <td>${escapeAdmin(p.name || "")}</td>

        <td>${escapeAdmin(p.category || "")}</td>

        <td>৳${Number(p.price || 0).toLocaleString("en-US")}</td>

        <td>
          ${
            p.oldPrice
              ? "৳" + Number(p.oldPrice).toLocaleString("en-US")
              : "-"
          }
        </td>

        <td>${Number(p.stock || 0)}</td>

        <td>
          ${
            p.colors && p.colors.length
              ? escapeAdmin(p.colors.join(", "))
              : "-"
          }
        </td>

        <td>

          <button
            onclick="editProduct('${p.id}')"
            style="margin:3px;">
            ✏️ Edit
          </button>

          <button
            onclick="deleteProduct('${p.id}')"
            style="margin:3px;">
            🗑️ Delete
          </button>

        </td>

      `;

      tbody.appendChild(row);

    });

  } catch (error) {

    console.error(error);

    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          প্রোডাক্ট লোড করা যায়নি।
        </td>
      </tr>
    `;

  }

}


// ===============================
// EDIT PRODUCT
// ===============================

async function editProduct(id) {

  try {

    const doc = await db
      .collection("products")
      .doc(id)
      .get();

    if (!doc.exists) {

      alert("প্রোডাক্ট পাওয়া যায়নি।");
      return;

    }

    const p = doc.data();

    editingProductId = id;

    document.getElementById("pName").value = p.name || "";
    document.getElementById("pCategory").value = p.category || "";
    document.getElementById("pPrice").value = p.price || "";
    document.getElementById("pOldPrice").value = p.oldPrice || "";
    document.getElementById("pStock").value = p.stock || "";

    document.getElementById("pColors").value =
      p.colors ? p.colors.join(", ") : "";

    document.getElementById("pSizes").value =
      p.sizes ? p.sizes.join(", ") : "";

    document.getElementById("pDesc").value =
      p.description || "";

    const title = document.getElementById("formTitle");

    if (title) {
      title.textContent = "প্রোডাক্ট Edit করুন";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (error) {

    console.error(error);
    alert("প্রোডাক্ট Edit করা যায়নি।");

  }

}


// ===============================
// DELETE PRODUCT
// ===============================

async function deleteProduct(id) {

  const confirmDelete = confirm(
    "আপনি কি নিশ্চিত এই প্রোডাক্টটি Delete করতে চান?"
  );

  if (!confirmDelete) return;

  try {

    await db
      .collection("products")
      .doc(id)
      .delete();

    alert("প্রোডাক্ট Delete হয়েছে।");

    loadProducts();

  } catch (error) {

    console.error(error);

    alert(
      "Delete করা যায়নি।\n\n" +
      error.message
    );

  }

}


// ===============================
// RESET FORM
// ===============================

function resetProductForm() {

  editingProductId = null;

  const form = document.getElementById("productForm");

  if (form) {
    form.reset();
  }

  const title = document.getElementById("formTitle");

  if (title) {
    title.textContent = "নতুন প্রোডাক্ট যোগ করুন";
  }

}


// ===============================
// LOAD ORDERS
// ===============================

async function loadOrders() {

  const tbody = document.getElementById("orderTableBody");

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="10">অর্ডার লোড হচ্ছে...</td>
    </tr>
  `;

  try {

    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {

      tbody.innerHTML = `
        <tr>
          <td colspan="10">এখনো কোনো অর্ডার নেই।</td>
        </tr>
      `;

      return;

    }

    tbody.innerHTML = "";

    snapshot.forEach(doc => {

      const o = {
        id: doc.id,
        ...doc.data()
      };

      const row = document.createElement("tr");

      row.innerHTML = `

        <td>
          ${escapeAdmin(o.productName || "-")}
        </td>

        <td>
          ${escapeAdmin(o.customerName || "-")}
        </td>

        <td>
          ${escapeAdmin(o.customerPhone || "-")}
        </td>

        <td>
          ${escapeAdmin(o.customerAddress || "-")}
        </td>

        <td>
          ${escapeAdmin(o.color || "-")}
        </td>

        <td>
          ${escapeAdmin(o.size || "-")}
        </td>

        <td>
          ${Number(o.qty || 1)}
        </td>

        <td>
          ৳${Number(
            (o.price || 0) * (o.qty || 1)
          ).toLocaleString("en-US")}
        </td>

        <td>
          <button
            onclick="toggleOrderStatus('${o.id}', '${o.status || "নতুন"}')">
            ${escapeAdmin(o.status || "নতুন")}
          </button>
        </td>

        <td>
          <button
            onclick="deleteOrder('${o.id}')">
            🗑️
          </button>
        </td>

      `;

      tbody.appendChild(row);

    });

  } catch (error) {

    console.error(error);

    tbody.innerHTML = `
      <tr>
        <td colspan="10">
          অর্ডার লোড করা যায়নি।
        </td>
      </tr>
    `;

  }

}


// ===============================
// ORDER STATUS
// ===============================

async function toggleOrderStatus(id, currentStatus) {

  let newStatus = "সম্পন্ন";

  if (currentStatus === "সম্পন্ন") {
    newStatus = "নতুন";
  }

  try {

    await db
      .collection("orders")
      .doc(id)
      .update({
        status: newStatus
      });

    loadOrders();

  } catch (error) {

    console.error(error);

    alert("Order status পরিবর্তন করা যায়নি।");

  }

}


// ===============================
// DELETE ORDER
// ===============================

async function deleteOrder(id) {

  const ok = confirm(
    "আপনি কি এই অর্ডারটি Delete করতে চান?"
  );

  if (!ok) return;

  try {

    await db
      .collection("orders")
      .doc(id)
      .delete();

    loadOrders();

  } catch (error) {

    console.error(error);

    alert(
      "Order Delete করা যায়নি।\n\n" +
      error.message
    );

  }

}


// ===============================
// HTML SECURITY
// ===============================

function escapeAdmin(value) {

  return String(value || "").replace(
    /[&<>"']/g,
    function(m) {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

      }[m];

    }
  );

}


// ===============================
// ENTER KEY LOGIN
// ===============================

document.addEventListener("DOMContentLoaded", function() {

  const passwordInput =
    document.getElementById("loginPass");

  if (passwordInput) {

    passwordInput.addEventListener(
      "keydown",
      function(event) {

        if (event.key === "Enter") {
          doLogin();
        }

      }
    );

  }

});
