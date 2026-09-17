/* =========================================================
   Eyakub Shop — Admin Panel Logic
   ========================================================= */

let PRODUCTS_CACHE = [];
let PENDING_IMAGES = [];

if (!FIREBASE_CONFIGURED){
  document.getElementById('configWarning').style.display = 'block';
}

/* ---------- Auth ---------- */
async function doLogin(){
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  if (!FIREBASE_CONFIGURED){
    errEl.textContent = 'প্রথমে firebase-config.js ফাইলে Firebase কনফিগার করুন।';
    return;
  }
  try{
    await auth.signInWithEmailAndPassword(email, pass);
  }catch(e){
    errEl.textContent = 'লগইন ব্যর্থ হয়েছে। ইমেইল/পাসওয়ার্ড চেক করুন।';
  }
}
function doLogout(){
  auth.signOut();
}

if (FIREBASE_CONFIGURED){
  auth.onAuthStateChanged(user => {
    if (user){
      document.getElementById('loginBox').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      loadAdminProducts();
      loadOrders();
    } else {
      document.getElementById('loginBox').style.display = 'block';
      document.getElementById('dashboard').style.display = 'none';
    }
  });
}

/* ---------- Tabs ---------- */
function switchTab(tab){
  document.getElementById('tabProducts').style.display = tab==='products' ? 'block':'none';
  document.getElementById('tabOrders').style.display = tab==='orders' ? 'block':'none';
  document.getElementById('tabProductsBtn').classList.toggle('active', tab==='products');
  document.getElementById('tabOrdersBtn').classList.toggle('active', tab==='orders');
}

/* ---------- Load / render products ---------- */
async function loadAdminProducts(){
  const snap = await db.collection('products').orderBy('createdAt','desc').get();
  PRODUCTS_CACHE = snap.docs.map(d => ({id:d.id, ...d.data()}));
  renderProductTable();
}
function renderProductTable(){
  const body = document.getElementById('productTableBody');
  document.getElementById('productTotalLabel').textContent = 'মোট প্রোডাক্ট: ' + PRODUCTS_CACHE.length;
  if (!PRODUCTS_CACHE.length){
    body.innerHTML = '<tr><td colspan="6" class="empty-note">এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</td></tr>';
    return;
  }
  body.innerHTML = PRODUCTS_CACHE.map(p => `
    <tr>
      <td><img src="${(p.images&&p.images[0])||''}" onerror="this.style.opacity=0"></td>
      <td>${escapeHtmlA(p.name)}</td>
      <td>৳${p.price}${p.oldPrice ? ` <s style="color:#999">৳${p.oldPrice}</s>`:''}</td>
      <td>${p.stock}</td>
      <td>${(p.colors||[]).join(', ')}<br><span style="color:#999">${(p.sizes||[]).join(', ')}</span></td>
      <td class="row-actions">
        <button onclick="editProduct('${p.id}')">এডিট</button>
        <button onclick="deleteProduct('${p.id}')" style="color:#E4572E">ডিলিট</button>
      </td>
    </tr>`).join('');
}
function escapeHtmlA(str){
  return String(str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------- Product form ---------- */
function openProductForm(){
  document.getElementById('formTitle').textContent = 'নতুন প্রোডাক্ট যোগ করুন';
  document.getElementById('pId').value = '';
  document.getElementById('pName').value = '';
  document.getElementById('pCategory').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pOldPrice').value = '';
  document.getElementById('pStock').value = '';
  document.getElementById('pColors').value = '';
  document.getElementById('pSizes').value = '';
  document.getElementById('pDesc').value = '';
  PENDING_IMAGES = [];
  renderImagePreview();
  document.getElementById('productModal').classList.add('open');
}
function closeProductForm(){
  document.getElementById('productModal').classList.remove('open');
}
function editProduct(id){
  const p = PRODUCTS_CACHE.find(x => x.id === id);
  if (!p) return;
  document.getElementById('formTitle').textContent = 'প্রোডাক্ট এডিট করুন';
  document.getElementById('pId').value = p.id;
  document.getElementById('pName').value = p.name || '';
  document.getElementById('pCategory').value = p.category || '';
  document.getElementById('pPrice').value = p.price || '';
  document.getElementById('pOldPrice').value = p.oldPrice || '';
  document.getElementById('pStock').value = p.stock || '';
  document.getElementById('pColors').value = (p.colors||[]).join(', ');
  document.getElementById('pSizes').value = (p.sizes||[]).join(', ');
  document.getElementById('pDesc').value = p.description || '';
  PENDING_IMAGES = (p.images || []).slice();
  renderImagePreview();
  document.getElementById('productModal').classList.add('open');
}
async function deleteProduct(id){
  if (!confirm('আপনি কি নিশ্চিত এই প্রোডাক্টটি ডিলিট করতে চান?')) return;
  await db.collection('products').doc(id).delete();
  loadAdminProducts();
}

/* ---------- Image upload + compression (base64, no paid storage needed) ---------- */
function handleImageUpload(event){
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      compressImage(e.target.result, 800, 0.7).then(dataUrl => {
        PENDING_IMAGES.push(dataUrl);
        renderImagePreview();
      });
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}
function compressImage(dataUrl, maxDim, quality){
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > h && w > maxDim){ h = h*(maxDim/w); w = maxDim; }
      else if (h > maxDim){ w = w*(maxDim/h); h = maxDim; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}
function renderImagePreview(){
  document.getElementById('imagePreviewRow').innerHTML = PENDING_IMAGES.map((im,i) => `
    <div class="th-wrap">
      <img src="${im}">
      <button class="rm" onclick="removeImage(${i})">✕</button>
    </div>`).join('');
}
function removeImage(i){
  PENDING_IMAGES.splice(i,1);
  renderImagePreview();
}

/* ---------- Save product ---------- */
async function saveProduct(){
  const id = document.getElementById('pId').value;
  const name = document.getElementById('pName').value.trim();
  const price = Number(document.getElementById('pPrice').value);
  const stock = Number(document.getElementById('pStock').value);

  if (!name || !price || document.getElementById('pStock').value === ''){
    alert('নাম, মূল্য এবং স্টক পূরণ করা আবশ্যক।');
    return;
  }

  const data = {
    name,
    category: document.getElementById('pCategory').value.trim() || 'জুতা',
    price,
    oldPrice: Number(document.getElementById('pOldPrice').value) || 0,
    stock,
    colors: document.getElementById('pColors').value.split(',').map(s=>s.trim()).filter(Boolean),
    sizes: document.getElementById('pSizes').value.split(',').map(s=>s.trim()).filter(Boolean),
    description: document.getElementById('pDesc').value.trim(),
    images: PENDING_IMAGES
  };

  try{
    if (id){
      await db.collection('products').doc(id).update(data);
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('products').add(data);
    }
    closeProductForm();
    loadAdminProducts();
  }catch(e){
    alert('সংরক্ষণ করতে সমস্যা হয়েছে: ' + e.message);
  }
}

/* ---------- Orders ---------- */
async function loadOrders(){
  const snap = await db.collection('orders').orderBy('createdAt','desc').get();
  const orders = snap.docs.map(d => ({id:d.id, ...d.data()}));
  const body = document.getElementById('ordersTableBody');
  if (!orders.length){
    body.innerHTML = '<tr><td colspan="7" class="empty-note">এখনো কোনো অর্ডার আসেনি।</td></tr>';
    return;
  }
  body.innerHTML = orders.map(o => {
    const date = o.createdAt && o.createdAt.toDate ? o.createdAt.toDate().toLocaleString('bn-BD') : '—';
    const isDone = o.status === 'সম্পন্ন';
    return `
      <tr>
        <td>${date}</td>
        <td>${escapeHtmlA(o.productName)}<br><span style="color:#999">${o.color||''} ${o.size?('/ '+o.size):''}</span></td>
        <td>${escapeHtmlA(o.customerName)}</td>
        <td>${escapeHtmlA(o.customerPhone)}</td>
        <td>${escapeHtmlA(o.customerAddress)}</td>
        <td>${o.qty}</td>
        <td>
          <span class="status-pill ${isDone?'done':''}" style="cursor:pointer" onclick="toggleOrderStatus('${o.id}','${isDone?'নতুন':'সম্পন্ন'}')">${o.status||'নতুন'}</span>
        </td>
      </tr>`;
  }).join('');
}
async function toggleOrderStatus(id, newStatus){
  await db.collection('orders').doc(id).update({status:newStatus});
  loadOrders();
      }
