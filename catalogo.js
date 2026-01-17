const API_BASE = 'https://backend-0lcs.onrender.com';

const productsContainer = document.getElementById('products');
const categoriesContainer = document.getElementById('categories');
const searchInput = document.getElementById('search');

let allProducts = [];
let activeCategory = null;

async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  allProducts = await res.json();
  renderCategories(allProducts);
  renderProducts(allProducts);
}

function renderCategories(products) {
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  categoriesContainer.innerHTML = `
    <button data-cat="">Todos</button>
    ${categories.map(c => `<button data-cat="${c}">${c}</button>`).join('')}
  `;

  categoriesContainer.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      activeCategory = btn.dataset.cat || null;
      applyFilters();
    };
  });
}

function applyFilters() {
  let filtered = [...allProducts];

  if (activeCategory) {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  const q = searchInput.value.toLowerCase().trim();
  if (q) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }

  renderProducts(filtered);
}

function renderProducts(products) {
  productsContainer.innerHTML = '';

  if (!products.length) {
    productsContainer.innerHTML = '<p>No hay productos</p>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <img src="${API_BASE}${p.image_url || ''}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description || ''}</p>
      <strong>$${p.price}</strong>
    `;

    productsContainer.appendChild(card);
  });
}

searchInput.addEventListener('input', applyFilters);

fetchProducts();
