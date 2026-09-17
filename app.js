/* =========================================================
   Eyakub Shop — Storefront Logic
   ========================================================= */

let ALL_PRODUCTS = [];
let CURRENT_PRODUCT = null;
let SELECTED_COLOR = null;
let SELECTED_SIZE = null;
let QTY = 1;
let CURRENT_IMAGES = [];

document.getElementById('yearNow').textContent = new Date().getFullYear();
document.getElementById('shopTagline').textContent = SHOP_INFO.tagline;
document.getElementById('footerAddress').textContent = SHOP_INFO.address;
document.getElementById('footerWa').textContent = '+' + SHOP_INFO.whatsapp;

function waLink(msg){
  return 'https://wa.me/' + SHOP_INFO.whatsapp + '?text=' + encodeURIComponent(msg);
}
const defaultWaMsg = 'আসসালামু আলাইকুম, আমি ' + SHOP_INFO.name + ' থেকে একটি জুতা অর্ডার করতে চাই।';
document.getElementById('waHeaderBtn').href = waLink(defaultWaMsg);
document.getElementById('waPromoBtn').href = waLink(defaultWaMsg);
document.getElementById('footerWaLink').href = waLink(defaultWaMsg);
document.getElementById('floatWaBtn').href = waLink(defaultWaMsg);

function money(n){
  return '৳' + Number(n).toLocaleString('en-US');
}

/* ---------- Load products (Firestore if configured, else demo data) ---------- */
async function loadProducts(){
  if (FIREBASE_CONFIGURED) {
    try{
      const snap = await db.collection('products').orderBy('createdAt','desc').get();
      ALL_PRODUCTS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }catch(e){
      console.error('Firestore থেকে প্রোডাক্ট লোড করতে সমস্যা হয়েছে:', e);
      ALL_PRODUCTS = DEMO_PRODUCTS;
    }
  } else {
    ALL_PRODUCTS = DEMO_PRODUCTS;
  }
  renderGrid(ALL_PRODUCTS, 'productGrid');
  document.getElementById('productCount').textContent = ALL_PRODUCTS.length + ' টি প্রোডাক্ট';
}

function renderGrid(list, elId){
  const grid = document.getElementById(elId);
  if (!list.length){
    grid.innerHTML = '<p class="empty-note">এখন কোনো প্রোডাক্ট নেই। শীঘ্রই যুক্ত করা হবে।</p>';
    return;
  }
  grid.innerHTML = list.map(p => {
    const img = (p.images && p.images[0]) ? p.images[0] : placeholderImg(p.name);
    const hasDiscount = p.oldPrice && Number(p.oldPrice) > Number(p.price);
    const discountPct = hasDiscount ? Math.round(100 - (p.price / p.oldPrice) * 100) : 0;
    const lowStock = Number(p.stock) > 0 && Number(p.stock) <= 5;
    return `
      <div class="product-card" onclick="openModal('${p.id}')">
        <div class="p-img">
          <img src="${img}" alt="${escapeHtml(p.name)}">
          ${hasDiscount ? `<span class="badge-discount">-${discountPct}%</span>` : ''}
          ${lowStock ? `<span class="badge-stock">মাত্র ${p.stock} পিছ বাকি</span>` : ''}
        </div>
        <div class="p-info">
          <div class="p-name">${escapeHtml(p.name)}</div>
          <div class="p-price">
            <span class="now">${money(p.price)}</span>
            ${hasDiscount ? `<span class="old">${money(p.oldPrice)}</span>` : ''}
          </div>
          <button class="p-order-btn" onclick="event.stopPropagation(); openModal('${p.id}')">অর্ডার করুন</button>
        </div>
      </div>`;
  }).join('');
}

function placeholderImg(name){
  const initials = encodeURIComponent((name||'Shoe').slice(0,2));
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%25' height='100%25' fill='%23F1EFE9'/><text x='50%25' y='50%25' font-size='60' text-anchor='middle' dy='.3em' fill='%23c9c4b5'>${initials}</text></svg>`;
}
function escapeHtml(str){
  return String(str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------- Search ---------- */
function doSearch(e){
  e.preventDefault();
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = q ? ALL_PRODUCTS.filter(p => (p.name||'').toLowerCase().includes(q)) : ALL_PRODUCTS;
  renderGrid(filtered, 'productGrid');
  document.getElementById('products').scrollIntoView({behavior:'smooth'});
  return false;
}

/* ---------- Product Modal ---------- */
function openModal(id){
  const p = ALL_PRODUCTS.find(x => x.id === id);
  if (!p) return;
  CURRENT_PRODUCT = p;
  SELECTED_COLOR = (p.colors && p.colors[0]) || null;
  SELECTED_SIZE = (p.sizes && p.sizes[0]) || null;
  QTY = 1;
  CURRENT_IMAGES = (p.images && p.images.length) ? p.images : [placeholderImg(p.name)];

  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalPrice').textContent = money(p.price);
  const hasDiscount = p.oldPrice && Number(p.oldPrice) > Number(p.price);
  document.getElementById('modalOldPrice').textContent = hasDiscount ? money(p.oldPrice) : '';
  document.getElementById('modalStock').textContent = Number(p.stock) > 0
    ? `স্টকে আছে: ${p.stock} পিছ` : 'বর্তমানে স্টক আউট';
  document.getElementById('modalDesc').textContent = p.description || '';
  document.getElementById('qtyVal').textContent = QTY;

  document.getElementById('modalMainImg').src = CURRENT_IMAGES[0];
  document.getElementById('modalThumbs').innerHTML = CURRENT_IMAGES.map((im,i) =>
    `<img src="${im}" class="${i===0?'active':''}" onclick="setMainImg(${i})">`).join('');

  renderPills('colorGroup','colorPills', p.colors, 'color');
  renderPills('sizeGroup','sizePills', p.sizes, 'size');

  document.getElementById('modalOverlay').classList.add('open');
}
function setMainImg(i){
  document.getElementById('modalMainImg').src = CURRENT_IMAGES[i];
  document.querySelectorAll('.modal-thumbs img').forEach((el,idx)=> el.classList.toggle('active', idx===i));
}
function renderPills(groupId, pillsId, values, type){
  const group = document.getElementById(groupId);
  if (!values || !values.length){ group.style.display='none'; return; }
  group.style.display='block';
  document.getElementById(pillsId).innerHTML = values.map((v,i) =>
    `<span class="opt-pill ${i===0?'selected':''}" onclick="selectPill(this,'${type}','${escapeHtml(v)}')">${escapeHtml(v)}</span>`
  ).join('');
}
function selectPill(el, type, value){
  el.parentElement.querySelectorAll('.opt-pill').forEach(p=>p.classList.remove('selected'));
  el.classList.add('selected');
  if (type==='color') SELECTED_COLOR = value; else SELECTED_SIZE = value;
}
function changeQty(delta){
  QTY = Math.max(1, QTY + delta);
  document.getElementById('qtyVal').textContent = QTY;
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('open');
  // Related products: show others excluding current
  const related = ALL_PRODUCTS.filter(p => p.id !== (CURRENT_PRODUCT && CURRENT_PRODUCT.id)).slice(0,8);
  renderGrid(related, 'relatedGrid');
}
document.getElementById('modalOverlay').addEventListener('click', (e)=>{
  if (e.target.id === 'modalOverlay') closeModal();
});

/* ---------- Submit order ---------- */
async function submitOrder(){
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const note = document.getElementById('custNote').value.trim();

  if (!name || !phone || !address){
    alert('অনুগ্রহ করে নাম, ফোন নাম্বার এবং ঠিকানা পূরণ করুন।');
    return;
  }
  if (Number(CURRENT_PRODUCT.stock) <= 0){
    alert('দুঃখিত, এই প্রোডাক্টটি বর্তমানে স্টকে নেই।');
    return;
  }

  const orderMsg =
`আসসালামু আলাইকুম, আমি একটি অর্ডার দিতে চাই:

পণ্য: ${CURRENT_PRODUCT.name}
কালার: ${SELECTED_COLOR || '—'}
সাইজ: ${SELECTED_SIZE || '—'}
পরিমাণ: ${QTY}
মূল্য: ${money(CURRENT_PRODUCT.price)} x ${QTY} = ${money(CURRENT_PRODUCT.price * QTY)}

নাম: ${name}
ফোন: ${phone}
ঠিকানা: ${address}
নোট: ${note || '—'}`;

  // Firestore-এ অর্ডার সংরক্ষণ (Admin panel-এ দেখা যাবে)
  if (FIREBASE_CONFIGURED){
    try{
      await db.collection('orders').add({
        productId: CURRENT_PRODUCT.id,
        productName: CURRENT_PRODUCT.name,
        price: CURRENT_PRODUCT.price,
        color: SELECTED_COLOR || '',
        size: SELECTED_SIZE || '',
        qty: QTY,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        note: note || '',
        status: 'নতুন',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }catch(e){
      console.error('অর্ডার সংরক্ষণ করতে সমস্যা হয়েছে:', e);
    }
  }

  window.open(waLink(orderMsg), '_blank');
  closeModal();
}

loadProducts();
