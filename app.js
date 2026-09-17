/* =========================================================
   Eyakub Shop — Storefront Logic
========================================================= */

let ALL_PRODUCTS = [];
let CURRENT_PRODUCT = null;
let SELECTED_COLOR = null;
let SELECTED_SIZE = null;
let QTY = 1;
let CURRENT_IMAGES = [];


/* =========================
   SHOP INFO
========================= */

const SHOP = {
  name: "Eyakub Shop",
  whatsapp: "966567225245",
  facebook: "https://www.facebook.com/profile.php?id=61594226919156",
  tagline: "অরিজিনাল জুতার সেরা কালেকশন",
  address: "বাংলাদেশ"
};


/* =========================
   SAFE ELEMENT HELPER
========================= */

function el(id){
  return document.getElementById(id);
}


/* =========================
   INITIAL PAGE DATA
========================= */

if(el("yearNow")){
  el("yearNow").textContent = new Date().getFullYear();
}

if(el("shopTagline")){
  el("shopTagline").textContent = SHOP.tagline;
}

if(el("footerAddress")){
  el("footerAddress").textContent = SHOP.address;
}

if(el("footerWa")){
  el("footerWa").textContent = "+" + SHOP.whatsapp;
}


/* =========================
   WHATSAPP
========================= */

function waLink(message){
  return "https://wa.me/" +
    SHOP.whatsapp +
    "?text=" +
    encodeURIComponent(message);
}

const defaultWaMessage =
  "আসসালামু আলাইকুম, আমি " +
  SHOP.name +
  " থেকে একটি জুতা অর্ডার করতে চাই।";

if(el("waHeaderBtn")){
  el("waHeaderBtn").href = waLink(defaultWaMessage);
}

if(el("waPromoBtn")){
  el("waPromoBtn").href = waLink(defaultWaMessage);
}

if(el("footerWaLink")){
  el("footerWaLink").href = waLink(defaultWaMessage);
}

if(el("floatWaBtn")){
  el("floatWaBtn").href = waLink(defaultWaMessage);
}


/* =========================
   MONEY
========================= */

function money(number){

  const value = Number(number || 0);

  return "৳" +
    value.toLocaleString("en-US");
}


/* =========================
   ESCAPE HTML
========================= */

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


/* =========================
   PLACEHOLDER IMAGE
========================= */

function placeholderImg(name){

  const text =
    encodeURIComponent(
      String(name || "Shoe").slice(0,2)
    );

  return `
data:image/svg+xml,
<svg xmlns='http://www.w3.org/2000/svg'
width='500'
height='500'>
<rect width='100%' height='100%'
fill='%23F1EFE9'/>
<text x='50%' y='50%'
font-size='65'
text-anchor='middle'
dy='.3em'
fill='%23c9c4b5'>
${text}
</text>
</svg>`;
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts(){

  const grid = el("productGrid");

  if(grid){
    grid.innerHTML =
      '<p class="empty-note">প্রোডাক্ট লোড হচ্ছে...</p>';
  }

  try{

    /*
      Firebase থাকলে Firestore থেকে
      product load হবে।
    */

    if(
      typeof firebase !== "undefined" &&
      typeof db !== "undefined"
    ){

      const snapshot =
        await db
          .collection("products")
          .orderBy("createdAt","desc")
          .get();

      ALL_PRODUCTS =
        snapshot.docs.map(function(doc){

          return {
            id: doc.id,
            ...doc.data()
          };

        });

    }else{

      /*
        Firebase না থাকলে demo products
      */

      ALL_PRODUCTS = getDemoProducts();

    }

  }catch(error){

    console.error(
      "Products loading error:",
      error
    );

    /*
      Firestore error হলেও website blank
      থাকবে না।
    */

    ALL_PRODUCTS = getDemoProducts();

  }


  renderGrid(
    ALL_PRODUCTS,
    "productGrid"
  );

  if(el("productCount")){

    el("productCount").textContent =
      ALL_PRODUCTS.length +
      " টি প্রোডাক্ট";

  }

}


/* =========================
   DEMO PRODUCTS
========================= */

function getDemoProducts(){

  return [

    {
      id:"demo-1",
      name:"Classic Premium Sneaker",
      price:1490,
      oldPrice:1890,
      stock:10,
      category:"sneakers",
      colors:["Black","White"],
      sizes:["40","41","42","43"],
      images:[],
      description:
        "প্রিমিয়াম কোয়ালিটির স্টাইলিশ স্নিকার্স।"
    },

    {
      id:"demo-2",
      name:"Premium Formal Shoe",
      price:1790,
      oldPrice:2190,
      stock:7,
      category:"formal",
      colors:["Black","Brown"],
      sizes:["40","41","42","43","44"],
      images:[],
      description:
        "অফিস ও ফরমাল ব্যবহারের জন্য সুন্দর জুতা।"
    },

    {
      id:"demo-3",
      name:"Comfortable Sandal",
      price:990,
      oldPrice:1290,
      stock:12,
      category:"sandals",
      colors:["Black","Brown"],
      sizes:["40","41","42","43"],
      images:[],
      description:
        "প্রতিদিনের ব্যবহারের জন্য আরামদায়ক স্যান্ডেল।"
    },

    {
      id:"demo-4",
      name:"Sports Running Shoe",
      price:1590,
      oldPrice:1990,
      stock:5,
      category:"sports",
      colors:["Black","Blue"],
      sizes:["40","41","42","43"],
      images:[],
      description:
        "হাঁটা ও স্পোর্টস ব্যবহারের জন্য হালকা জুতা।"
    }

  ];

}


/* =========================
   RENDER PRODUCTS
========================= */

function renderGrid(list, elementId){

  const grid = el(elementId);

  if(!grid){
    return;
  }

  if(!Array.isArray(list) || !list.length){

    grid.innerHTML =
      '<p class="empty-note">এখন কোনো প্রোডাক্ট নেই।</p>';

    return;
  }


  grid.innerHTML =
    list.map(function(product){

      const image =
        product.images &&
        product.images.length
          ? product.images[0]
          : placeholderImg(product.name);


      const price =
        Number(product.price || 0);

      const oldPrice =
        Number(product.oldPrice || 0);


      const hasDiscount =
        oldPrice > price;


      const discount =
        hasDiscount
          ? Math.round(
              100 -
              (price / oldPrice) * 100
            )
          : 0;


      const stock =
        Number(product.stock || 0);


      const lowStock =
        stock > 0 && stock <= 5;


      return `

      <div
        class="product-card"
        onclick="openModal('${product.id}')"
      >

        <div class="p-img">

          <img
            src="${image}"
            alt="${escapeHtml(product.name)}"
            loading="lazy"
          >

          ${
            hasDiscount
              ? `<span class="badge-discount">
                  -${discount}%
                 </span>`
              : ""
          }

          ${
            lowStock
              ? `<span class="badge-stock">
                  মাত্র ${stock} পিছ বাকি
                 </span>`
              : ""
          }

        </div>


        <div class="p-info">

          <div class="p-name">
            ${escapeHtml(product.name)}
          </div>


          <div class="p-price">

            <span class="now">
              ${money(price)}
            </span>

            ${
              hasDiscount
                ? `<span class="old">
                    ${money(oldPrice)}
                   </span>`
                : ""
            }

          </div>


          <button
            class="p-order-btn"
            onclick="event.stopPropagation();openModal('${product.id}')"
          >
            অর্ডার করুন
          </button>

        </div>

      </div>

      `;

    }).join("");

}


/* =========================
   SEARCH
========================= */

function doSearch(event){

  if(event){
    event.preventDefault();
  }

  const input = el("searchInput");

  const query =
    input
      ? input.value.trim().toLowerCase()
      : "";


  if(!query){

    renderGrid(
      ALL_PRODUCTS,
      "productGrid"
    );

  }else{

    const filtered =
      ALL_PRODUCTS.filter(function(product){

        const name =
          String(product.name || "")
            .toLowerCase();

        const category =
          String(product.category || "")
            .toLowerCase();

        return (
          name.includes(query) ||
          category.includes(query)
        );

      });


    renderGrid(
      filtered,
      "productGrid"
    );

  }


  const productsSection =
    el("products");

  if(productsSection){

    productsSection.scrollIntoView({
      behavior:"smooth"
    });

  }

  return false;
}


/* =========================
   CATEGORY FILTER
========================= */

function filterCategory(category){

  if(category === "all"){

    renderGrid(
      ALL_PRODUCTS,
      "productGrid"
    );

  }else{

    const filtered =
      ALL_PRODUCTS.filter(function(product){

        return String(
          product.category || ""
        ).toLowerCase() ===
        String(category).toLowerCase();

      });


    renderGrid(
      filtered,
      "productGrid"
    );

  }


  const section =
    el("products");

  if(section){

    section.scrollIntoView({
      behavior:"smooth"
    });

  }

}


/* =========================
   OPEN PRODUCT MODAL
========================= */

function openModal(id){

  const product =
    ALL_PRODUCTS.find(function(item){

      return String(item.id) === String(id);

    });


  if(!product){
    return;
  }


  CURRENT_PRODUCT = product;

  SELECTED_COLOR =
    product.colors &&
    product.colors.length
      ? product.colors[0]
      : null;


  SELECTED_SIZE =
    product.sizes &&
    product.sizes.length
      ? product.sizes[0]
      : null;


  QTY = 1;


  CURRENT_IMAGES =
    product.images &&
    product.images.length
      ? product.images
      : [
          placeholderImg(product.name)
        ];


  if(el("modalName")){
    el("modalName").textContent =
      product.name || "";
  }


  if(el("modalPrice")){
    el("modalPrice").textContent =
      money(product.price);
  }


  const oldPrice =
    Number(product.oldPrice || 0);

  const price =
    Number(product.price || 0);


  if(el("modalOldPrice")){

    el("modalOldPrice").textContent =
      oldPrice > price
        ? money(oldPrice)
        : "";

  }


  if(el("modalStock")){

    el("modalStock").textContent =
      Number(product.stock || 0) > 0
        ? "স্টকে আছে: " +
          product.stock +
          " পিছ"
        : "বর্তমানে স্টক আউট";

  }


  if(el("modalDesc")){

    el("modalDesc").textContent =
      product.description || "";

  }


  if(el("qtyVal")){
    el("qtyVal").textContent = "1";
  }


  if(el("modalMainImg")){

    el("modalMainImg").src =
      CURRENT_IMAGES[0];

  }


  if(el("modalThumbs")){

    el("modalThumbs").innerHTML =
      CURRENT_IMAGES.map(
        function(image,index){

          return `
          <img
            src="${image}"
            class="${index === 0 ? "active" : ""}"
            onclick="setMainImg(${index})"
            alt=""
          >
          `;

        }
      ).join("");

  }


  renderPills(
    "colorGroup",
    "colorPills",
    product.colors,
    "color"
  );


  renderPills(
    "sizeGroup",
    "sizePills",
    product.sizes,
    "size"
  );


  if(el("modalOverlay")){

    el("modalOverlay")
      .classList
      .add("open");

  }

}


/* =========================
   MAIN IMAGE
========================= */

function setMainImg(index){

  if(
    !CURRENT_IMAGES[index] ||
    !el("modalMainImg")
  ){
    return;
  }


  el("modalMainImg").src =
    CURRENT_IMAGES[index];


  document
    .querySelectorAll(".modal-thumbs img")
    .forEach(function(image,i){

      image.classList.toggle(
        "active",
        i === index
      );

    });

}


/* =========================
   COLOR / SIZE PILLS
========================= */

function renderPills(
  groupId,
  pillsId,
  values,
  type
){

  const group = el(groupId);
  const container = el(pillsId);

  if(!group || !container){
    return;
  }


  if(!values || !values.length){

    group.style.display = "none";

    return;

  }


  group.style.display = "block";


  container.innerHTML =
    values.map(
      function(value,index){

        return `

        <span
          class="opt-pill ${
            index === 0
              ? "selected"
              : ""
          }"
          onclick="
            selectPill(
              this,
              '${type
