/* =========================================================
   Eyakub Shop — Admin Panel
========================================================= */

let PRODUCTS = [];
let ORDERS = [];
let EDITING_ID = null;
let PRODUCT_IMAGES = [];


/* =========================================================
   ADMIN EMAIL
========================================================= */

const ADMIN_EMAIL = "mdeyakub9970@gmail.com";


/* =========================================================
   HELPERS
========================================================= */

function $(id){
  return document.getElementById(id);
}

function show(id){
  if($(id)) $(id).style.display = "";
}

function hide(id){
  if($(id)) $(id).style.display = "none";
}

function money(value){
  return "৳" + Number(value || 0).toLocaleString("en-US");
}

function escapeHtml(value){
  return String(value || "")
    .replace(/[&<>"']/g, function(char){
      return {
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
      }[char];
    });
}


/* =========================================================
   AUTH STATE
========================================================= */

auth.onAuthStateChanged(function(user){

  if(!user){

    hide("dashboard");
    show("loginBox");

    return;
  }

  /*
    শুধু আপনার Admin email Dashboard ব্যবহার করতে পারবে
  */

  if(
    user.email.toLowerCase() !==
    ADMIN_EMAIL.toLowerCase()
  ){

    auth.signOut();

    $("loginError").textContent =
      "এই অ্যাকাউন্টের Admin Panel ব্যবহারের অনুমতি নেই।";

    return;
  }

  hide("loginBox");
  show("dashboard");

  loadProducts();
  loadOrders();

});


/* =========================================================
   LOGIN
========================================================= */

async function doLogin(){

  const email =
    $("loginEmail").value.trim();

  const password =
    $("loginPass").value;

  $("loginError").textContent = "";

  if(!email || !password){

    $("loginError").textContent =
      "ইমেইল এবং পাসওয়ার্ড দিন।";

    return;
  }

  try{

    await auth.signInWithEmailAndPassword(
      email,
      password
    );

  }catch(error){

    console.error(error);

    let message =
      "লগইন করা যায়নি। ইমেইল/পাসওয়ার্ড পরীক্ষা করুন।";

    if(error.code === "auth/invalid-credential"){
      message =
        "ইমেইল অথবা পাসওয়ার্ড ভুল।";
    }

    if(error.code === "auth/user-not-found"){
      message =
        "এই ইমেইলে কোনো Firebase account নেই।";
    }

    if(error.code === "auth/wrong-password"){
      message =
        "পাসওয়ার্ড ভুল।";
    }

    if(error.code === "auth/too-many-requests"){
      message =
        "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে চেষ্টা করুন।";
    }

    $("loginError").textContent = message;

  }

}


/* =========================================================
   LOGOUT
========================================================= */

async function doLogout(){

  try{

    await auth.signOut();

  }catch(error){

    console.error(error);

  }

}


/* =========================================================
   TAB SWITCH
========================================================= */

function switchTab(tab){

  if(tab === "products"){

    show("tabProducts");
    hide("tabOrders");

    $("tabProductsBtn")
      .classList.add("active");

    $("tabOrdersBtn")
      .classList.remove("active");

  }else{

    hide("tabProducts");
    show("tabOrders");

    $("tabProductsBtn")
      .classList.remove("active");

    $("tabOrdersBtn")
      .classList.add("active");

    loadOrders();

  }

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts(){

  try{

    const snapshot =
      await db
        .collection("products")
        .orderBy("createdAt","desc")
        .get();

    PRODUCTS =
      snapshot.docs.map(function(doc){

        return {
          id:doc.id,
          ...doc.data()
        };

      });

    renderProducts();

  }catch(error){

    console.error(
      "Products load error:",
      error
    );

    /*
      Fallback — যদি createdAt order-এ সমস্যা হয়
    */

    try{

      const snapshot =
        await db
          .collection("products")
          .get();

      PRODUCTS =
        snapshot.docs.map(function(doc){

          return {
            id:doc.id,
            ...doc.data()
          };

        });

      PRODUCTS.sort(function(a,b){

        return getTimestamp(b.createdAt) -
               getTimestamp(a.createdAt);

      });

      renderProducts();

    }catch(secondError){

      console.error(secondError);

      alert(
        "প্রোডাক্ট লোড করা যায়নি। Firebase Rules পরীক্ষা করুন।"
      );

    }

  }

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(){

  const body =
    $("productTableBody");

  if(!body){
    return;
  }

  $("productTotalLabel").textContent =
    "মোট প্রোডাক্ট: " +
    PRODUCTS.length;

  if(!PRODUCTS.length){

    body.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-note">
            এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।
          </div>
        </td>
      </tr>
    `;

    return;
  }

  body.innerHTML =
    PRODUCTS.map(function(product){

      const image =
        product.images &&
        product.images.length
          ? product.images[0]
          : "";

      const colors =
        Array.isArray(product.colors)
          ? product.colors.join(", ")
          : "";

      const sizes =
        Array.isArray(product.sizes)
          ? product.sizes.join(", ")
          : "";

      return `

      <tr>

        <td>
          ${
            image
              ? `<img src="${image}" alt="">`
              : "📦"
          }
        </td>

        <td>

          <strong>
            ${escapeHtml(product.name)}
          </strong>

          ${
            product.category
              ? `<br>
                 <small>
                   ${escapeHtml(product.category)}
                 </small>`
              : ""
          }

        </td>

        <td>

          <strong>
            ${money(product.price)}
          </strong>

          ${
            Number(product.oldPrice) >
            Number(product.price)
              ? `<br>
                 <small style="text-decoration:line-through;">
                   ${money(product.oldPrice)}
                 </small>`
              : ""
          }

        </td>

        <td>
          ${Number(product.stock || 0)}
        </td>

        <td>

          <small>
            ${escapeHtml(colors || "—")}
          </small>

          <br>

          <small>
            সাইজ:
            ${escapeHtml(sizes || "—")}
          </small>

        </td>

        <td class="row-actions">

          <button
            class="edit-btn"
            onclick="editProduct('${product.id}')"
          >
            ✏️ Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteProduct('${product.id}')"
          >
            🗑️ Delete
          </button>

        </td>

      </tr>

      `;

    }).join("");

}


/* =========================================================
   OPEN PRODUCT FORM
========================================================= */

function openProductForm(){

  EDITING_ID = null;
  PRODUCT_IMAGES = [];

  $("formTitle").textContent =
    "নতুন প্রোডাক্ট যোগ করুন";

  $("pId").value = "";
  $("pName").value = "";
  $("pCategory").value = "";
  $("pPrice").value = "";
  $("pOldPrice").value = "";
  $("pStock").value = "";
  $("pColors").value = "";
  $("pSizes").value = "";
  $("pDesc").value = "";

  $("pImages").value = "";

  renderImagePreview();

  $("productModal")
    .classList.add("open");

}


/* =========================================================
   CLOSE PRODUCT FORM
========================================================= */

function closeProductForm(){

  $("productModal")
    .classList.remove("open");

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id){

  const product =
    PRODUCTS.find(function(item){

      return item.id === id;

    });

  if(!product){
    return;
  }

  EDITING_ID = id;

  $("formTitle").textContent =
    "প্রোডাক্ট Edit করুন";

  $("pId").value =
    product.id || "";

  $("pName").value =
    product.name || "";

  $("pCategory").value =
    product.category || "";

  $("pPrice").value =
    product.price || "";

  $("pOldPrice").value =
    product.oldPrice || "";

  $("pStock").value =
    product.stock || "";

  $("pColors").value =
    Array.isArray(product.colors)
      ? product.colors.join(", ")
      : "";

  $("pSizes").value =
    Array.isArray(product.sizes)
      ? product.sizes.join(", ")
      : "";

  $("pDesc").value =
    product.description || "";

  PRODUCT_IMAGES =
    Array.isArray(product.images)
      ? [...product.images]
      : [];

  $("pImages").value = "";

  renderImagePreview();

  $("productModal")
    .classList.add("open");

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

function handleImageUpload(event){

  const files =
    Array.from(
      event.target.files || []
    );

  if(!files.length){
    return;
  }

  files.forEach(function(file){

    if(!file.type.startsWith("image/")){
      return;
    }

    compressImage(
      file,
      function(dataUrl){

        PRODUCT_IMAGES.push(dataUrl);

        renderImagePreview();

      }
    );

  });

}


/* =========================================================
   COMPRESS IMAGE
========================================================= */

function compressImage(file, callback){

  const reader =
    new FileReader();

  reader.onload = function(event){

    const image =
      new Image();

    image.onload = function(){

      const MAX_SIZE = 900;

      let width =
        image.width;

      let height =
        image.height;

      if(width > height){

        if(width > MAX_SIZE){

          height =
            height *
            MAX_SIZE /
            width;

          width =
            MAX_SIZE;

        }

      }else{

        if(height > MAX_SIZE){

          width =
            width *
            MAX_SIZE /
            height;

          height =
            MAX_SIZE;

        }

      }

      const canvas =
        document.createElement("canvas");

      canvas.width =
        Math.round(width);

      canvas.height =
        Math.round(height);

      const context =
        canvas.getContext("2d");

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const compressed =
        canvas.toDataURL(
          "image/jpeg",
          0.75
        );

      callback(compressed);

    };

    image.src =
      event.target.result;

  };

  reader.readAsDataURL(file);

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function renderImagePreview(){

  const container =
    $("imagePreviewRow");

  if(!container){
    return;
  }

  if(!PRODUCT_IMAGES.length){

    container.innerHTML =
      `<small style="color:#777;">
        কোনো ছবি নির্বাচন করা হয়নি।
       </small>`;

    return;

  }

  container.innerHTML =
    PRODUCT_IMAGES.map(
      function(image,index){

        return `

        <div class="th-wrap">

          <img
            src="${image}"
            alt=""
          >

          <button
            type="button"
            class="rm"
            onclick="removeImage(${index})"
          >
            ×
          </button>

        </div>

        `;

      }
    ).join("");

}


/* =========================================================
   REMOVE IMAGE
========================================================= */

function removeImage(index){

  PRODUCT_IMAGES.splice(
    index,
    1
  );

  renderImagePreview();

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

async function saveProduct(){

  const name =
    $("pName").value.trim();

  const category =
    $("pCategory").value.trim();

  const price =
    Number(
      $("pPrice").value
    );

  const oldPriceValue =
    $("pOldPrice").value.trim();

  const oldPrice =
    oldPriceValue
      ? Number(oldPriceValue)
      : 0;

  const stock =
    Number(
      $("pStock").value
    );

  const colors =
    $("pColors")
      .value
      .split(",")
      .map(function(value){
        return value.trim();
      })
      .filter(Boolean);

  const sizes =
    $("pSizes")
      .value
      .split(",")
      .map(function(value){
        return value.trim();
      })
      .filter(Boolean);

  const description =
    $("pDesc").value.trim();


  /* Validation */

  if(!name){

    alert(
      "প্রোডাক্টের নাম দিন।"
    );

    return;
  }

  if(!Number.isFinite(price) || price <= 0){

    alert(
      "সঠিক প্রোডাক্ট মূল্য দিন।"
    );

    return;
  }

  if(!Number.isFinite(stock) || stock < 0){

    alert(
      "সঠিক Stock সংখ্যা দিন।"
    );

    return;
  }

  if(oldPrice && oldPrice <= price){

    alert(
      "আগের মূল্য বর্তমান মূল্যের চেয়ে বেশি হওয়া উচিত।"
    );

    return;
  }


  /* Product Data */

  const productData = {

    name:name,

    category:
      category.toLowerCase(),

    price:price,

    oldPrice:oldPrice,

    stock:stock,

    colors:colors,

    sizes:sizes,

    description:description,

    images:[
      ...PRODUCT_IMAGES
    ],

    updatedAt:
      firebase.firestore
        .FieldValue
        .serverTimestamp()

  };


  try{

    /* EDIT */

    if(EDITING_ID){

      await db
        .collection("products")
        .doc(EDITING_ID)
        .update(
          productData
        );

    }

    /* NEW PRODUCT */

    else{

      productData.createdAt =
        firebase.firestore
          .FieldValue
          .serverTimestamp();

      await db
        .collection("products")
        .add(
          productData
        );

    }


    alert(
      EDITING_ID
        ? "প্রোডাক্ট সফলভাবে Update হয়েছে।"
        : "প্রোডাক্ট সফলভাবে যোগ হয়েছে।"
    );


    closeProductForm();

    await loadProducts();


  }catch(error){

    console.error(
      "Save product error:",
      error
    );

    alert(
      "প্রোডাক্ট সংরক্ষণ করা যায়নি। Firebase Rules পরীক্ষা করুন।"
    );

  }

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id){

  const product =
    PRODUCTS.find(function(item){

      return item.id === id;

    });

  if(!product){
    return;
  }

  const confirmed =
    confirm(
      "আপনি কি সত্যিই এই প্রোডাক্টটি Delete করতে চান?\n\n" +
      product.name
    );

  if(!confirmed){
    return;
  }

  try{

    await db
      .collection("products")
      .doc(id)
      .delete();

    alert(
      "প্রোডাক্ট Delete হয়েছে।"
    );

    await loadProducts();


  }catch(error){

    console.error(error);

    alert(
      "প্রোডাক্ট Delete করা যায়নি।"
    );

  }

}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders(){

  const body =
    $("ordersTableBody");

  if(!body){
    return;
  }

  body.innerHTML = `
    <tr>
      <td colspan="7">
        <div class="empty-note">
          অর্ডার লোড হচ্ছে...
        </div>
      </td>
    </tr>
  `;


  try{

    const snapshot =
      await db
        .collection("orders")
        .orderBy("createdAt","desc")
        .get();

    ORDERS =
      snapshot.docs.map(function(doc){

        return {
          id:doc.id,
          ...doc.data()
        };

      });

    renderOrders();


  }catch(error){

    console.error(
      "Orders load error:",
      error
    );


    try{

      const snapshot =
        await db
          .collection("orders")
          .get();

      ORDERS =
        snapshot.docs.map(function(doc){

          return {
            id:doc.id,
            ...doc.data()
          };

        });


      ORDERS.sort(function(a,b){

        return getTimestamp(b.createdAt) -
               getTimestamp(a.createdAt);

      });


      renderOrders();

    }catch(secondError){

      console.error(secondError);

      body.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-note">
              অর্ডার লোড করা যায়নি।
            </div>
          </td>
        </tr>
      `;

    }

  }

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders(){

  const body =
    $("ordersTableBody");

  if(!body){
    return;
  }

  if(!ORDERS.length){

    body.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-note">
            এখনো কোনো অর্ডার নেই।
          </div>
        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    ORDERS.map(function(order){

      const date =
        formatDate(
          order.createdAt
        );

      const status =
        order.status || "নতুন";

      const done =
        status === "সম্পন্ন";


      return `

      <tr>

        <td>
          ${date}
        </td>

        <td>

          <strong>
            ${escapeHtml(
              order.productName
            )}
          </strong>

          <br>

          <small>
            ${escapeHtml(
              order.color || "—"
            )}
            /
            ${escapeHtml(
              order.size || "—"
            )}
          </small>

        </td>

        <td>
          ${escapeHtml(
            order.customerName
          )}
        </td>

        <td>

          <a
            href="tel:${escapeHtml(order.customerPhone)}"
          >
            ${escapeHtml(
              order.customerPhone
            )}
          </a>

        </td>

        <td>
          ${escapeHtml(
            order.customerAddress
          )}
        </td>

        <td>
          ${Number(order.qty || 0)}
        </td>

        <td>

          <span
            class="status-pill ${
              done ? "done" : ""
            }"
          >
            ${escapeHtml(status)}
          </span>

          <br>

          <button
            style="
              margin-top:6px;
              border:1px solid #ddd;
              background:#fff;
              border-radius:6px;
              padding:4px 7px;
              font-size:11px;
            "
            onclick="toggleOrderStatus(
              '${order.id}',
              '${done ? "নতুন" : "সম্পন্ন"}'
            )"
          >
            ${
              done
                ? "নতুন করুন"
                : "সম্পন্ন করুন"
            }
          </button>

        </td>

      </tr>

      `;

    }).join("");

}


/* =========================================================
   ORDER STATUS
========================================================= */

async function toggleOrderStatus(
  orderId,
  newStatus
){

  try{

    await db
      .collection("orders")
      .doc(orderId)
      .update({

        status:newStatus,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });

    await loadOrders();


  }catch(error){

    console.error(error);

    alert(
      "Order status পরিবর্তন করা যায়নি।"
    );

  }

}


/* =========================================================
   DATE HELPERS
========================================================= */

function getTimestamp(value){

  if(!value){
    return 0;
  }

  if(
    typeof value.toMillis ===
    "function"
  ){

    return value.toMillis();

  }

  if(value.seconds){

    return value.seconds * 1000;

  }

  const date =
    new Date(value);

  return date.getTime() || 0;

}


function formatDate(value){

  const timestamp =
    getTimestamp(value);

  if(!timestamp){
    return "—";
  }

  return new Date(timestamp)
    .toLocaleString(
      "bn-BD",
      {
        year:"numeric",
        month:"short",
        day:"numeric",
        hour:"numeric",
        minute:"2-digit"
      }
    );

}


/* =========================================================
   MODAL CLOSE
========================================================= */

if($("productModal")){

  $("productModal")
    .addEventListener(
      "click",
      function(event){

        if(
          event.target.id ===
          "productModal"
        ){

          closeProductForm();

        }

      }
    );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
  "keydown",
  function(event){

    if(event.key === "Escape"){

      closeProductForm();

    }

  }
);
