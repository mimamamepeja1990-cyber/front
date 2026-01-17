const API_BASE = 'https://backend-0lcs.onrender.com';
const PRODUCTS_ENDPOINT = `${API_BASE}/products`;
const DEFAULT_IMAGE = `${API_BASE}/uploads/default.png`;
let products = [];
let filteredProducts = [];
let currentCategory = 'all';
let searchQuery = '';
function $(selector) {
  return document.querySelector(selector);
}
function $all(selector) {
  return document.querySelectorAll(selector);
}
function formatPrice(value) {
  if (value === null || value === undefined) return '';
  return `$${Number(value).toLocaleString('es-AR')}`;
}
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
async function fetchProducts() {
  try {
    const res = await fetch(PRODUCTS_ENDPOINT);
    if (!res.ok) throw new Error('Error cargando productos');

    const data = await res.json();

    products = data.filter(p => p.active !== false);
    filteredProducts = [...products];

    renderCategories();
    renderProducts();
  } catch (err) {
    console.error('Error:', err);
    showError('No se pudieron cargar los productos');
  }
}

/* ============================================================
   FILTROS
============================================================ */

function applyFilters() {
  filteredProducts = products.filter(p => {
    const matchesCategory =
      currentCategory === 'all' || p.category === currentCategory;

    const matchesSearch =
      normalizeText(p.name).includes(normalizeText(searchQuery)) ||
      normalizeText(p.description || '').includes(normalizeText(searchQuery));

    return matchesCategory && matchesSearch;
  });

  renderProducts();
}

/* ============================================================
   CATEGORÍAS
============================================================ */

function renderCategories() {
  const container = $('#categories');
  if (!container) return;

  const categories = [
    'all',
    ...new Set(products.map(p => p.category).filter(Boolean)),
  ];

  container.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.textContent = cat === 'all' ? 'Todos' : cat;

    if (cat === currentCategory) btn.classList.add('active');

    btn.addEventListener('click', () => {
      currentCategory = cat;
      $all('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });

    container.appendChild(btn);
  });
}

/* ============================================================
   RENDER PRODUCTOS
============================================================ */

function renderProducts() {
  const grid = $('#products');
  if (!grid) return;

  grid.innerHTML = '';

  if (filteredProducts.length === 0) {
    grid.innerHTML = `<p class="empty">No hay productos</p>`;
    return;
  }

  filteredProducts.forEach(product => {
    grid.appendChild(createProductCard(product));
  });
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const img = document.createElement('img');
  img.src = product.image_url
    ? `${API_BASE}${product.image_url}`
    : DEFAULT_IMAGE;

  img.onerror = () => {
    img.src = DEFAULT_IMAGE;
  };

  const name = document.createElement('h3');
  name.textContent = product.name;

  const desc = document.createElement('p');
  desc.textContent = product.description || '';

  const price = document.createElement('span');
  price.className = 'price';
  price.textContent = formatPrice(product.price);

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(desc);
  card.appendChild(price);

  return card;
}

/* ============================================================
   BUSCADOR
============================================================ */

function initSearch() {
  const input = $('#search');
  if (!input) return;

  input.addEventListener('input', e => {
    searchQuery = e.target.value;
    applyFilters();
  });
}

/* ============================================================
   ERRORES
============================================================ */

function showError(msg) {
  const grid = $('#products');
  if (!grid) return;

  grid.innerHTML = `<p class="error">${msg}</p>`;
}

/* ============================================================
   INIT
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  fetchProducts();
});
