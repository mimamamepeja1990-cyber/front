const API_BASE = 'https://backend-0lcs.onrender.com';

/* =========================
   STATE
========================= */
let PRODUCTS = [];
let CART = JSON.parse(localStorage.getItem('cart') || '[]');
let CURRENT_PRODUCT = null;

/* =========================
   DOM
========================= */
const grid = document.getElementById('catalogGrid');
const searchInput = document.getElementById('search');
const filterButtons = document.querySelectorAll('.filter-btn');
const cartFloating = document.getElementById('cartFloating');
const cartDrawer = document.getElementById('cartDrawer');

/* =========================
   FETCH
========================= */
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    PRODUCTS = await res.json();
    renderProducts(PRODUCTS);
  } catch (e) {
    grid.innerHTML = `<p>Error cargando productos</p>`;
  }
}

/* =========================
   RENDER PRODUCTS
========================= */
function renderProducts(list) {
  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = `<div class="no-results">No hay productos</div>`;
    return;
  }

  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';

    card.innerHTML = `
      <span class="tag">${p.category || ''}</span>
      <img class="product-thumb" src="${API_BASE}${p.image_url || ''}" />
      <div class="product-info">
        <div class="product-title">${p.name}</div>
        <div class="product-sub">${p.description || ''}</div>
        <div class="product-actions">
          <span class="price">$${p.price}</span>
          <button class="btn btn-primary">Agregar</button>
        </div>
      </div>
    `;

    card.querySelector('.btn').onclick = () => openModal(p);
    grid.appendChild(card);
  });
}

/* =========================
   MODAL
========================= */
function openModal(product) {
  CURRENT_PRODUCT = product;

  let modal = document.querySelector('.cart-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'cart-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-media">
        <img src="${API_BASE}${product.image_url || ''}">
        <div>
          <div class="modal-title">${product.name}</div>
          <div class="modal-desc">${product.description || ''}</div>
          <div class="modal-price">$${product.price}</div>
        </div>
      </div>
      <div class="modal-actions">
        <div class="quantity-control">
          <button onclick="changeQty(-1)">−</button>
          <span class="qty" id="modalQty">1</span>
          <button onclick="changeQty(1)">+</button>
        </div>
        <button class="btn" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmAdd()">Agregar</button>
      </div>
    </div>
  `;

  modal.dataset.qty = 1;
  modal.classList.add('open');
}

function changeQty(delta) {
  const modal = document.querySelector('.cart-modal');
  let qty = Number(modal.dataset.qty) + delta;
  if (qty < 1) qty = 1;
  modal.dataset.qty = qty;
  document.getElementById('modalQty').textContent = qty;
}

function closeModal() {
  document.querySelector('.cart-modal')?.classList.remove('open');
}

function confirmAdd() {
  const modal = document.querySelector('.cart-modal');
  const qty = Number(modal.dataset.qty);

  const found = CART.find(p => p.id === CURRENT_PRODUCT.id);
  if (found) found.qty += qty;
  else CART.push({ ...CURRENT_PRODUCT, qty });

  saveCart();
  closeModal();
}

/* =========================
   CART
========================= */
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(CART));
  renderCart();
}

function renderCart() {
  if (!cartDrawer) return;

  if (!CART.length) {
    cartDrawer.innerHTML = `<div class="empty">Carrito vacío</div>`;
    cartFloating.classList.add('hidden');
    return;
  }

  cartFloating.classList.remove('hidden');
  cartFloating.innerHTML = `<span class="cart-badge">${CART.reduce((a,p)=>a+p.qty,0)}</span>🛒`;

  cartDrawer.innerHTML = `
    <div class="cart-head">
      <div>Carrito</div>
      <button class="btn secondary" onclick="toggleCart()">Cerrar</button>
    </div>
    <div class="cart-items">
      ${CART.map(p => `
        <div class="cart-item">
          <img src="${API_BASE}${p.image_url || ''}">
          <div class="cart-item-info">
            <div class="cart-item-title">${p.name}</div>
            <div class="quantity-control">
              <button onclick="updateQty(${p.id},-1)">−</button>
              <span class="qty">${p.qty}</span>
              <button onclick="updateQty(${p.id},1)">+</button>
            </div>
          </div>
          <div class="cart-item-price">$${p.price * p.qty}</div>
        </div>
      `).join('')}
    </div>
    <div class="cart-footer">
      <strong>Total: $${CART.reduce((a,p)=>a+p.price*p.qty,0)}</strong>
    </div>
  `;
}

function updateQty(id, delta) {
  const p = CART.find(p => p.id === id);
  if (!p) return;
  p.qty += delta;
  if (p.qty <= 0) CART = CART.filter(x => x.id !== id);
  saveCart();
}

function toggleCart() {
  cartDrawer.classList.toggle('open');
}

/* =========================
   FILTERS
========================= */
searchInput?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderProducts(PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q)
  ));
});

/* =========================
   INIT
========================= */
loadProducts();
renderCart();
