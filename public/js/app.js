'use strict';

const app = document.getElementById('app');
const LS = { token: 'vayoraToken', user: 'vayoraUser', cart: 'vayoraCart', wishlist: 'vayoraWishlist', order: 'vayoraLastOrder' };
const getJson = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; } };
const state = {
  categories: [], products: [], reviews: [], settings: {},
  token: localStorage.getItem(LS.token) || '', user: getJson(LS.user, null),
  cart: getJson(LS.cart, {}), wishlist: getJson(LS.wishlist, []), lastOrder: getJson(LS.order, null),
  pendingRoute: '', toast: '', toastKind: '', mobileNav: false, productQty: 1, homeReviewIndex: 0,
  adminData: null, adminTab: 'dashboard', adminSearch: '', adminCategoryFilter: 'all', editingProduct: null, profileOrders: null,
};

const icons = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  bag: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  truck: '<path d="M3 6h11v12H3z"/><path d="M14 10h4l3 4v4h-7"/><circle cx="7.5" cy="19" r="1.8"/><circle cx="17.5" cy="19" r="1.8"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="m8.2 13-1 8 4.8-2.6 4.8 2.6-1-8"/>',
  leaf: '<path d="M20 4c-8 0-14 4-14 11a5 5 0 0 0 5 5c7 0 11-8 9-16Z"/><path d="M4 21c3-6 6-8 12-12"/>',
  package: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M7 3H5a2 2 0 0 0-2 2 16 16 0 0 0 16 16 2 2 0 0 0 2-2v-2l-5-2-2 2a12 12 0 0 1-5-5l2-2-2-5Z"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="m3 3 18 18M10.6 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-3.3 4.1M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10.4 10.4 0 0 0 3.5-.6"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  chart: '<path d="M3 3v18h18M8 16V9M13 16V5M18 16v-5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1A8 8 0 0 1 7 13.2l-1.8-.3v-2.8l1.8-.3a8 8 0 0 1 .9-1.6L6.5 6.5 8 4.1l1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 .9 1.6l1.8.3v2.8l-1.8.3a8 8 0 0 1-.9 1.6Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
};
function icon(name, cls = '') { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.bag}</svg>`; }
function esc(value = '') { const raw = String(value ?? '').replace(/\/assets\/products-photo\/([^/"'?#]+)\.webp/g, '/assets/products-photo-png/$1.png'); return raw.replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function currency(value) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0); }
function effectiveDiscount(p) { return Math.min(80, Number(p.discount || 0) + Number(state.settings.storewideDiscount || 0)); }
function discounted(p) { return Math.round(Number(p.price) * (100 - effectiveDiscount(p)) / 100); }
function stars(n) { const full = Math.floor(Number(n) || 0); const half = Number(n) - full >= .5; return `${'★'.repeat(full)}${half ? '½' : ''}${'☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}`; }
function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join('') || 'VY'; }
function categoryOf(slug) { return state.categories.find(c => c.slug === slug); }
function productOf(id) { return state.products.find(p => p.id === id); }
function reviewProduct(r) { return productOf(r.productId) || state.products.find(p => p.category === 'travel') || state.products[0]; }
function allCartLines() { return Object.entries(state.cart).map(([id, qty]) => ({ product: productOf(id), qty: Number(qty) || 1 })).filter(x => x.product && x.qty > 0); }
function cartCount() { return allCartLines().reduce((sum, x) => sum + x.qty, 0); }
function cartSubtotal() { return allCartLines().reduce((sum, x) => sum + discounted(x.product) * x.qty, 0); }
function productHref(p) { return `/product/${encodeURIComponent(p.id)}`; }
function saveCart() { localStorage.setItem(LS.cart, JSON.stringify(state.cart)); }
function saveWishlist() { localStorage.setItem(LS.wishlist, JSON.stringify(state.wishlist)); }
function saveAuth() { if (state.token && state.user) { localStorage.setItem(LS.token, state.token); localStorage.setItem(LS.user, JSON.stringify(state.user)); } else { localStorage.removeItem(LS.token); localStorage.removeItem(LS.user); } }
function isProtected(path) { return /^\/(categories|category\/|product\/|search|wishlist|cart|checkout|profile|orders\/)/.test(path); }

class ApiError extends Error { constructor(message, status = 0, data = {}) { super(message); this.status = status; this.data = data; } }
async function api(path, options = {}) {
  const { method = 'GET', body, auth = true } = options;
  const headers = { 'Accept': 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = state.token || localStorage.getItem(LS.token) || '';
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let response;
  try { response = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch { throw new ApiError('The demo server could not be reached. Check that node server.js is running.', 0); }
  let data = {};
  try { data = await response.json(); } catch { /* non-JSON API response */ }
  if (!response.ok) throw new ApiError(data.error || `Request failed (${response.status}).`, response.status, data);
  return data;
}
async function refreshStore() {
  const data = await api('/api/bootstrap', { auth: false });
  state.categories = data.categories || [];
  state.products = data.products || [];
  state.reviews = data.reviews || [];
  state.settings = data.settings || {};
}
async function refreshAdmin() {
  const result = await api('/api/admin/state');
  state.adminData = result;
  state.categories = result.categories;
  state.products = result.products;
  state.reviews = result.reviews.filter(r => r.visible !== false);
  state.settings = result.settings;
  return result;
}
function showToast(message, kind = '') {
  state.toast = String(message || 'Done.'); state.toastKind = kind;
  const msg = state.toast;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { if (state.toast === msg) { state.toast = ''; render(); } }, 3200);
}
function clearToast() { state.toast = ''; state.toastKind = ''; }
function go(path, replace = false) {
  clearToast();
  if (!path || typeof path !== 'string') path = '/';
  if (path.startsWith('#')) { document.querySelector(path)?.scrollIntoView({ behavior: 'smooth' }); return; }
  if (isProtected(path) && !state.user) {
    state.pendingRoute = path;
    path = '/login';
  }
  if (path.startsWith('/admin') && !(state.user && state.user.role === 'admin')) {
    if (state.user && state.user.role !== 'admin') { state.pendingRoute = ''; path = '/admin-login'; }
    else { path = '/admin-login'; }
  }
  if (state.user?.role === 'admin' && !path.startsWith('/admin') && !['/', '/about', '/contact', '/login', '/signup'].includes(path)) path = '/admin';
  if (replace) history.replaceState({}, '', path); else if (location.pathname + location.search !== path) history.pushState({}, '', path);
  state.mobileNav = false;
  state.productQty = 1;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function link(path, text, cls = '') { return `<a class="${cls}" href="${esc(path)}" data-route="${esc(path)}">${text}</a>`; }

function renderHeader() {
  const activePath = location.pathname;
  const isAdmin = state.user?.role === 'admin';
  const nav = isAdmin
    ? [['/','Storefront'], ['/admin','Admin studio'], ['/about','About'], ['/contact','Contact']]
    : [['/','Home'], ['/categories','Categories'], ['/about','About'], ['/contact','Contact']];
  const navMarkup = nav.map(([path, label]) => `<a href="${path}" data-route="${path}" class="${activePath === path || (path === '/categories' && activePath.startsWith('/category/')) ? 'active' : ''}">${label}</a>`).join('');
  const mobileItems = isAdmin ? [...nav, ['/admin-login','Admin login']] : [
    ...nav, ['/wishlist','Wishlist'], ['/cart','Add to cart'], ...(state.user ? [['/profile','Profile']] : [['/login','Login / Sign Up']])
  ];
  return `
    <div class="announcement"><div class="announcement-inner">
      <span class="announcement-item">${icon('truck')} <strong>${esc(state.settings.announcement || 'FREE SHIPPING on orders above ₹999')}</strong></span>
      <span class="announcement-item">${icon('refresh')} Easy returns within 7 days</span>
      <span class="announcement-item">${icon('pin')} Chinnamanur Agraharam, Theni</span>
    </div></div>
    <header class="site-header">
      <div class="header-inner">
        <a href="/" data-route="/" class="brand-logo" aria-label="VAYORA home"><img src="/assets/logo.svg" alt="VAYORA — Carry Beyond"></a>
        <form class="searchbox searchbox-wrap" data-form="search" role="search" autocomplete="off">
          ${icon('search')}<input type="search" name="q" data-live-search placeholder="Search bags, backpacks, travel gear…" aria-label="Search bags" aria-expanded="false" aria-controls="search-suggestions" value="${activePath === '/search' ? esc(new URLSearchParams(location.search).get('q') || '') : ''}">
          <button class="search-submit" type="submit" aria-label="Search">${icon('search')}</button>
          <div class="search-suggestions" id="search-suggestions" role="listbox" hidden></div>
        </form>
        <nav class="header-nav-inline" aria-label="Main navigation">${navMarkup}</nav>
        <div class="header-actions">
          ${!isAdmin ? `<a href="/wishlist" data-route="/wishlist" class="icon-link" aria-label="Wishlist">
  ${icon('heart')}
  <span class="sr-only">Wishlist</span>
  ${state.user && state.wishlist.length
    ? `<b class="count-bubble">${state.wishlist.length}</b>`
    : ''}
</a>
<a href="/cart" data-route="/cart" class="icon-link" aria-label="Shopping cart">
  ${icon('bag')}
  <span class="sr-only">Cart</span>
  ${state.user && cartCount()
    ? `<b class="count-bubble">${cartCount()}</b>`
    : ''}
</a>
${state.user ? `<a href="/profile" data-route="/profile" class="icon-link profile-link" aria-label="Profile">
  ${icon('user')}
  <span class="sr-only">Profile</span>
</a>` : ''}` : `<a href="/admin" data-route="/admin" class="btn btn-dark btn-sm">Admin studio</a>`}
          ${state.user ? `<button class="btn btn-outline btn-sm signout-button" data-action="logout">${icon('logout')} Sign out</button>` : `<button class="btn btn-primary header-signup" data-route="/login">${icon('user')} Login / Sign Up</button>`}
          <button class="mobile-menu-btn" data-action="mobile-menu" aria-label="Open navigation">${icon(state.mobileNav ? 'close' : 'menu')}</button>
        </div>
      </div>
    </header>
    <nav class="main-nav ${state.mobileNav ? 'mobile-open' : ''}" aria-label="Mobile navigation"><div class="main-nav-inner">
      ${mobileItems.map(([path, label]) => `<a href="${path}" data-route="${path}" class="${activePath === path || (path === '/categories' && activePath.startsWith('/category/')) ? 'active' : ''}">${label}</a>`).join('')}
    </div></nav>`;
}
function renderBrandMarquee() {
  const brands = [
    ['safari','SAFARI'], ['wildcraft','WILDCRAFT'], ['american-tourister','AMERICAN TOURISTER'],
    ['skybags','Skybags'], ['fastrack','fastrack'], ['samsonite','Samsonite'],
    ['lavie','LAVIE'], ['caprese','CAPRESE'], ['tommy','TOMMY HILFIGER'],
    ['nike','NIKE'], ['adidas','adidas'], ['puma','PUMA'], ['hrx','HRX'], ['vayora','VAYORA']
  ];
  const makeGroup = (hidden = false) => `<div class="marquee-group" ${hidden ? 'aria-hidden="true"' : ''}>${brands.map(([cls, brand]) => `<span class="marquee-item wordmark-${cls}">${esc(brand)}</span>`).join('')}</div>`;
  return `<section class="brand-marquee" aria-label="Brands available at VAYORA">
    <div class="brand-marquee-copy"><span>TOP BRANDS</span><strong>AT VAYORA</strong></div>
    <div class="marquee-viewport"><div class="marquee-track">${makeGroup()}${makeGroup(true)}</div></div>
  </section>`;
}
function renderFooter() {
  const quickCategories = state.categories.slice(0, 6);
  return `<footer class="site-footer">
    <div class="footer-benefits">
      <div class="footer-benefit">${icon('truck')}<div><b>Free Shipping</b><span>Orders above ₹999</span></div></div>
      <div class="footer-benefit">${icon('shield')}<div><b>Secure Demo Checkout</b><span>Your demo details stay local</span></div></div>
      <div class="footer-benefit">${icon('refresh')}<div><b>Easy Returns</b><span>7-day demo policy</span></div></div>
      <div class="footer-benefit">${icon('award')}<div><b>Premium Selection</b><span>Everyday, work and travel</span></div></div>
      <div class="footer-benefit">${icon('users')}<div><b>Customer Support</b><span>Here to help</span></div></div>
    </div>
    <div class="footer-top">
      <div class="footer-brand"><img class="footer-logo" src="/assets/logo-white.svg" alt="VAYORA"><p>More than just bags. We carry your journeys, your stories and your tomorrow.</p><div class="footer-socials"><a class="social-instagram" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a><a class="social-x" href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h4.8l11.2 18h-4.8L4 3Zm0 18 6.7-7.8M13.3 10.8 20 3"/></svg></a><a class="social-facebook" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.5 1.6-1.5h1.7V3.3c-.3 0-1.4-.1-2.6-.1-2.7 0-4.5 1.6-4.5 4.6v2H7.5V13h2.9v8h3.8Z" fill="currentColor" stroke="none"/></svg></a><a class="social-youtube" href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/></svg></a></div></div>
      <div class="footer-col"><h3>Quick Links</h3>${link('/','Home')}${link('/categories','Categories')}${link('/about','About VAYORA')}${link('/contact','Contact Us')}</div>
      <div class="footer-col"><h3>Customer Care</h3>${link('/profile','My account')}${link('/profile','Track orders')}${link('/contact','Shipping & returns')}${link('/contact','FAQs')}${link('/admin-login','Admin portal','admin-footer')}</div>
      <div class="footer-col"><h3>Our Store (In-Store)</h3><span class="footer-address">${icon('pin')} Chinnamanur Agraharam,<br>Chinnamanur, Theni District,<br>Tamil Nadu – 625515</span><a class="footer-directions" href="https://www.google.com/maps/search/?api=1&query=Chinnamanur+Agraharam%2C+Chinnamanur%2C+Theni%2C+Tamil+Nadu" target="_blank" rel="noopener noreferrer">View on Google Maps ${icon('arrow')}</a><span>${esc(state.settings.supportPhone || '+91 98765 43210')}</span></div>
      <div class="footer-col footer-newsletter"><h3>Stay Updated</h3><p>Get new arrivals, fresh collections and offers.</p><form class="newsletter-form" data-form="newsletter"><input type="email" name="email" placeholder="Enter your email address" required aria-label="Email for updates"><button type="submit" aria-label="Subscribe">${icon('arrow')}</button></form><small>Demo preview · No marketing emails are sent.</small></div>
    </div>
    <div class="footer-bottom"><div class="footer-bottom-inner"><span>© ${new Date().getFullYear()} <b>VAYORA</b>. All rights reserved.</span><span class="footer-signoff">Carry Beyond. Go Further.</span></div></div>
  </footer>`;
}
function layout(content, opts = {}) {
  if (opts.noShell) return `${content}${state.toast ? `<div class="toast ${state.toastKind}">${esc(state.toast)}</div>` : ''}`;
  return `${renderHeader()}<main id="main">${content}</main>${renderBrandMarquee()}${renderFooter()}${state.toast ? `<div class="toast ${state.toastKind}">${esc(state.toast)}</div>` : ''}`;
}
function sampleProduct(slug) { return state.products.find(p => p.category === slug && p.id.endsWith('-01')) || state.products[0]; }
function categoryCard(c) {
  const p = sampleProduct(c.slug);
  return `<a class="category-card" href="/category/${esc(c.slug)}" data-route="/category/${esc(c.slug)}">
    <img loading="lazy" src="${esc(p?.image || '/assets/products-photo-png/college-01.png')}" alt="${esc(c.name)} sample bag design">
    <div class="category-info"><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><div class="category-bottom"><span>Explore collection</span><span class="category-arrow">${icon('arrow')}</span></div></div>
  </a>`;
}
function priceHtml(p) { return `<div class="product-price"><strong>${currency(discounted(p))}</strong>${effectiveDiscount(p) ? `<del>${currency(p.price)}</del>` : ''}</div>`; }
function productCard(p, options = {}) {
  const liked = state.wishlist.includes(p.id);
  const category = categoryOf(p.category);
  const cardImage = options.image || p.image;
  return `<article class="product-card">
    <div class="product-image-wrap"><a href="${productHref(p)}" data-route="${productHref(p)}" aria-label="View ${esc(p.name)}"><img loading="lazy" src="${esc(cardImage)}" alt="${esc(p.name)} product photo"></a>
      ${effectiveDiscount(p) ? `<span class="discount-tag">${effectiveDiscount(p)}% OFF</span>` : ''}
      <button class="wishlist-heart ${liked ? 'active' : ''}" data-action="wishlist-toggle" data-id="${esc(p.id)}" aria-label="${liked ? 'Remove from' : 'Add to'} wishlist">${icon('heart')}</button>
    </div>
    <div class="product-info"><span class="product-category">${esc(category?.short || category?.name || 'VAYORA')}</span><h3><a href="${productHref(p)}" data-route="${productHref(p)}">${esc(p.name)}</a></h3>
      ${priceHtml(p)}<div class="product-rating"><b>${stars(p.rating)}</b><span>${Number(p.rating).toFixed(1)} · ${p.reviewCount || 0} reviews</span></div>
      <button class="btn btn-outline product-add" data-action="add-cart" data-id="${esc(p.id)}">${icon('plus')} Add to cart <span class="added-check">✓</span></button>
    </div></article>`;
}
function reviewStory(r, index) {
  const p = reviewProduct(r);
  return `<article class="story-row"><div class="story-image"><span class="story-no">0${index + 1}</span><img loading="lazy" src="${esc(p?.image || '/assets/products-photo-png/travel-01.png')}" alt="${esc(r.productName || p?.name || 'VAYORA bag')}"></div>
    <div class="story-copy"><div class="story-rating"><span class="starline">${stars(r.rating)}</span><strong>${Number(r.rating).toFixed(1)} / 5</strong></div><h3>${esc(r.title || 'A thoughtful everyday carry')}</h3><p>“${esc(r.text)}”</p><div class="story-product-line"><img loading="lazy" src="${esc(p?.image || '/assets/products-photo-png/travel-01.png')}" alt=""><div><b>${esc(r.name)}</b><div class="story-name"><span>${esc(r.role || 'Verified customer')}</span></div></div></div><div class="story-product-line"><span class="pill">${esc(r.productName || p?.name || 'VAYORA collection')}</span></div></div></article>`;
}
function renderHomeHeroReview(review) {
  const r = review || { name: 'Abishek Sundar Velpandian', role: 'Chinnamanur · Customer story', rating: 4.5, title: 'A thoughtful everyday carry', text: 'Super quality and spacious. My VAYORA bag made my recent trip comfortable.', productName: 'VAYORA collection' };
  return `<div class="home-review-person"><span class="home-review-avatar">${esc(initials(r.name || 'AS'))}</span><div><b>${esc(r.name || 'VAYORA customer')}</b><small>${esc(r.role || 'Customer story')}</small></div></div>
    <div class="home-review-score"><span class="starline">${stars(r.rating)}</span><b>${Number(r.rating || 4.5).toFixed(1)}</b></div>
    <strong class="home-review-title">${esc(r.title || 'A thoughtful everyday carry')}</strong>
    <blockquote>“${esc(r.text || 'Thoughtfully designed, comfortable to carry and made for everyday journeys.') }”</blockquote>
    <small class="home-review-product">${esc(r.productName || 'VAYORA collection')}</small>`;
}
function renderHomeReviewMarqueeCard(r, index) {
  const p = reviewProduct(r);
  const rating = Number(r.rating || 4.5);
  return `<article class="review-marquee-card">
    <div class="review-marquee-card-head">
      <div class="home-review-person"><span class="home-review-avatar">${esc(initials(r.name || 'V'))}</span><div><b>${esc(r.name || 'VAYORA customer')}</b><small>${esc(r.role || 'Customer story')}</small></div></div>
      <span class="review-marquee-number" aria-hidden="true">0${index + 1}</span>
    </div>
    <div class="home-review-score"><span class="starline">${stars(rating)}</span><b>${rating.toFixed(1)}</b></div>
    <strong class="review-marquee-title">${esc(r.title || 'A thoughtful everyday carry')}</strong>
    <blockquote>“${esc(r.text || 'Thoughtfully designed, comfortable to carry and ready for everyday journeys.') }”</blockquote>
    <div class="review-marquee-card-foot"><span class="review-marquee-product">${esc(r.productName || p?.name || 'VAYORA collection')}</span><span class="review-marquee-wordmark">VAYORA</span></div>
  </article>`;
}
function renderHomeReviewMarquee(reviews) {
  const fallbackReviews = [
    { name: 'Abishek Sundar Velpandian', role: 'Chinnamanur · Customer story', rating: 4.5, title: 'A travel companion that feels premium', text: 'Super quality and spacious! My VAYORA travel bag made my recent trip comfortable. Worth every trip.', productName: 'Voyager Trolley Travel Bag', productId: 'travel-01' },
    { name: 'Nivetha R.', role: 'Campus buyer', rating: 5, title: 'My everyday college essential', text: 'The compartments fit my laptop and notebooks neatly. Comfortable to carry through a long college day.', productName: 'Campus Core College Bag', productId: 'college-01' },
    { name: 'Karthik M.', role: 'Office commuter', rating: 4.5, title: 'Smart, sturdy and organised', text: 'A professional look, useful storage and a sturdy finish. It keeps my work essentials organised.', productName: 'Urban Office Bag', productId: 'office-01' },
    { name: 'Priya S.', role: 'Everyday style', rating: 4.8, title: 'A lovely everyday handbag', text: 'The handbag looks premium and feels roomy without being bulky. It matches my everyday outfits.', productName: 'Grace Handbag', productId: 'handbags-01' },
    { name: 'Arjun P.', role: 'Frequent traveller', rating: 4.5, title: 'Ready for a quick getaway', text: 'Smooth wheels, a roomy interior and a solid build made packing for the weekend simple.', productName: 'Nomad Spinner Travel Bag', productId: 'travel-02' }
  ];
  const visible = [...(reviews || [])].filter(r => r.visible !== false);
  const five = visible.slice(0, 5);
  for (const fallback of fallbackReviews) {
    if (five.length >= 5) break;
    if (!five.some(review => review.name === fallback.name)) five.push(fallback);
  }
  const cards = five.slice(0, 5);
  const group = (duplicate = false) => `<div class="home-review-marquee-group" ${duplicate ? 'aria-hidden="true"' : ''}>${cards.map((r, i) => renderHomeReviewMarqueeCard(r, i)).join('')}</div>`;
  return `<section class="home-stories-section home-review-marquee-section">
    <div class="container"><div class="home-section-heading"><div><span class="eyebrow">Real people · Real journeys</span><h2>Our Customers <em>♥</em> VAYORA</h2></div><span class="home-rating-pill">★ 4.8 / 5 <small>Demo store rating</small></span></div></div>
    <div class="home-review-marquee-viewport" aria-label="Scrolling customer reviews"><div class="home-review-marquee-track">${group()}${group(true)}</div></div>
  </section>`;
}

function renderHomeCategoryGroup(duplicate = false) {
  return state.categories.map(c => {
    const p = sampleProduct(c.slug);
    const categoryName = c.short || c.name.replace(/ Bags?|Backpacks|Trolleys|& Sports/g,'');
    return `<a class="home-category-card" href="/category/${esc(c.slug)}" data-route="${state.user ? `/category/${esc(c.slug)}` : '/login'}" ${duplicate ? 'tabindex="-1"' : ''}><div class="home-category-photo"><img src="${esc(p?.image || '/assets/products-photo-png/college-01.png')}" alt="${esc(c.name)} bag" loading="lazy"></div><b>${esc(categoryName)}</b></a>`;
  }).join('');
}
function startHomeReviewRotation() {
  if (window.__vayoraReviewTimer) window.clearInterval(window.__vayoraReviewTimer);
  window.__vayoraReviewTimer = window.setInterval(() => {
    const reviews = state.reviews.filter(r => r.visible !== false);
    const card = document.querySelector('.home-hero-review');
    if (reviews.length < 2 || !card || location.pathname !== '/') return;
    state.homeReviewIndex = (state.homeReviewIndex + 1) % reviews.length;
    card.classList.add('is-changing');
    window.setTimeout(() => {
      if (!card.isConnected) return;
      card.innerHTML = renderHomeHeroReview(reviews[state.homeReviewIndex]);
      card.classList.remove('is-changing');
    }, 240);
  }, 4600);
}

function renderHome() {
  const allVisibleReviews = [...state.reviews].filter(r => r.visible !== false);
  const featuredIds = ['college-01', 'children-01', 'casual-sling-01', 'handbags-01', 'travel-01'];
  const featured = featuredIds.map(id => productOf(id)).filter(Boolean);
  const reviewMain = allVisibleReviews.length ? allVisibleReviews[(state.homeReviewIndex || 0) % allVisibleReviews.length] : null;
  const heroTitle = state.settings.heroTitle || 'Travel Bags';
  const heroTitleMarkup = esc(heroTitle).replace(/Bags/ig, match => `<em>${match}</em>`);
  const heroSubtitle = state.settings.heroSubtitle || 'Built for journeys. Designed for you.';
  const heroCta = state.settings.heroCta || 'Shop Travel Bags';
  return `<div class="home-page">
    <section class="home-hero" aria-label="VAYORA travel collection">
      <img class="home-hero-photo" src="/assets/photos/hero-travel.webp" alt="Premium travel suitcase, backpack, leather duffel and trekking bag on a mountain overlook" fetchpriority="high">
      <div class="home-hero-shade"></div>
      <div class="home-hero-copy">
        <span class="home-eyebrow">TRAVEL · EXPLORE · CARRY MORE</span>
        <h1>${heroTitleMarkup}</h1>
        <p>${esc(heroSubtitle)}</p>
        <div class="home-hero-perks">
          <span>${icon('package')} Spacious</span><span>${icon('shield')} Durable</span><span>${icon('award')} Stylish</span>
        </div>
        <a class="btn btn-primary home-shop-button" href="/category/travel" data-route="${state.user ? '/category/travel' : '/login'}">${esc(heroCta)} ${icon('arrow')}</a>
        <div class="home-hero-stats"><span><b data-counter="300" data-suffix="+">300+</b><small>DESIGNS</small></span><span><b data-counter="12">12</b><small>CATEGORIES</small></span><span><b data-counter="4.8" data-decimals="1" data-suffix=" ★">4.8 ★</b><small>DEMO RATING</small></span></div>
      </div>
      <aside class="home-hero-review" aria-live="polite" aria-label="Rotating customer review">${renderHomeHeroReview(reviewMain)}</aside>
      
    </section>

    <section class="home-categories container" id="sample-collections">
      <div class="home-section-heading"><div><span class="eyebrow">Explore our collections</span><h2>Shop by Category</h2></div>${link('/categories','View all categories '+icon('arrow'),'home-view-link')}</div>
      <div class="home-category-marquee" aria-label="Browse bag categories"><div class="home-category-track"><div class="home-category-group">${renderHomeCategoryGroup(false)}</div><div class="home-category-group" aria-hidden="true">${renderHomeCategoryGroup(true)}</div></div></div>
      ${!state.user ? `<div class="home-preview-note">${icon('shield')} Public preview · Sign in to unlock every design, wishlist and demo checkout.</div>` : ''}
    </section>

    <section class="home-featured-section">
      <div class="container">
        <div class="home-section-heading"><div><span class="eyebrow">Customer favourites</span><h2>Featured Bags</h2><p>Distinct designs for campus, weekends, work and your next getaway.</p></div>${link('/categories','View all products '+icon('arrow'),'home-view-link')}</div>
        <div class="home-product-grid">${featured.map(p => productCard(p)).join('')}</div>
      </div>
    </section>

    ${renderHomeReviewMarquee(allVisibleReviews)}
  </div>`;
}
function renderCategoryIndex() {
  return `<section class="page-hero category-directory-hero"><div class="container page-hero-inner"><div><div class="breadcrumbs">${link('/','Home')} <span class="crumb-separator" aria-hidden="true">›</span> <span>Categories</span></div><span class="eyebrow">The VAYORA directory</span><h1>Find your kind of carry.</h1><p>Explore dedicated collections for campus, work, everyday carry and every kind of journey.</p></div><div class="page-hero-art category-models-art"><img src="/assets/photos/category-models.png" alt="Four people modelling office, school, trekking and handbag styles"></div></div></section><section class="page-content"><div class="container"><div class="section-head"><div><span class="eyebrow">12 collections · 300 designs</span><h2>Shop by purpose.</h2></div><span class="pill">All categories</span></div><div class="category-grid">${state.categories.map(categoryCard).join('')}</div></div></section>`;
}
function renderCategory(slug) {
  const c = categoryOf(slug); if (!c) return renderNotFound();
  let products = state.products.filter(p => p.category === slug);
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  if (query) products = products.filter(p => `${p.name} ${p.description} ${p.sku}`.toLowerCase().includes(query.toLowerCase()));
  const sort = params.get('sort') || 'featured';
  const priceRange = params.get('price') || '';
  const selectedColor = (params.get('color') || '').toLowerCase();
  const minRating = Number(params.get('rating') || 0);
  const minDiscount = Number(params.get('discount') || 0);
  if (priceRange) products = products.filter(p => { const price=discounted(p); if(priceRange==='3500+') return price>3500; const [lo,hi]=priceRange.split('-').map(Number); return price>=lo && price<=hi; });
  if (selectedColor) products = products.filter(p => String(p.color||'').toLowerCase()===selectedColor);
  if (minRating) products = products.filter(p => Number(p.rating||0)>=minRating);
  if (minDiscount) products = products.filter(p => effectiveDiscount(p)>=minDiscount);
  if (sort === 'low') products.sort((a,b) => discounted(a)-discounted(b));
  else if (sort === 'high') products.sort((a,b) => discounted(b)-discounted(a));
  else if (sort === 'rating') products.sort((a,b) => b.rating-a.rating);
  else products.sort((a,b) => Number(b.featured)-Number(a.featured) || a.id.localeCompare(b.id));
  const colourOptions = [...new Set(state.products.filter(p=>p.category===slug).map(p=>String(p.color||'').toLowerCase()).filter(Boolean))].slice(0,8);
  return `<section class="catalog-page"><div class="container catalog-layout">
    <aside class="catalog-sidebar">
      <div class="catalog-sidebar-head"><b>Shop by Category</b><span>${state.categories.length}</span></div>
      <div class="catalog-category-links">${state.categories.map(item => `<a href="/category/${esc(item.slug)}" data-route="/category/${esc(item.slug)}" class="${item.slug===slug?'active':''}"><span class="catalog-side-dot"></span><span>${esc(item.name)}</span></a>`).join('')}</div>
      <div class="catalog-filter-facets">
        <section class="catalog-filter-section"><h3>Price</h3>${[['','All prices'],['0-1000','Under ₹1,000'],['1000-2000','₹1,000 – ₹2,000'],['2000-3500','₹2,000 – ₹3,500'],['3500+','Over ₹3,500']].map(([value,label])=>`<label><input type="radio" name="catalog-price" data-catalog-filter="price" value="${value}" ${params.get('price')===value||(!params.has('price')&&!value)?'checked':''}><span>${label}</span></label>`).join('')}</section>
        <section class="catalog-filter-section"><h3>Customer Reviews</h3>${[['','All ratings'],['4','★★★★☆ & up'],['4.5','★★★★½ & up']].map(([value,label])=>`<label><input type="radio" name="catalog-rating" data-catalog-filter="rating" value="${value}" ${params.get('rating')===value||(!params.has('rating')&&!value)?'checked':''}><span class="filter-rating-label">${label}</span></label>`).join('')}</section>
        <section class="catalog-filter-section"><h3>Colour / style</h3><div class="catalog-filter-colours">${colourOptions.map((color,i)=>`<label title="Style colour ${i+1}"><input type="radio" name="catalog-colour" data-catalog-filter="color" value="${color}" ${params.get('color')===color?'checked':''}><span style="--filter-color:${color}"></span></label>`).join('')}</div><small>Choose one of the colours listed for this collection.</small><label class="catalog-filter-reset-label"><input type="radio" name="catalog-colour" data-catalog-filter="color" value="" ${!params.has('color')?'checked':''}><span>All colours</span></label></section>
        <section class="catalog-filter-section"><h3>Discount</h3>${[['','Any discount'],['10','10% off or more'],['25','25% off or more'],['35','35% off or more'],['50','50% off or more']].map(([value,label])=>`<label><input type="radio" name="catalog-discount" data-catalog-filter="discount" value="${value}" ${params.get('discount')===value||(!params.has('discount')&&!value)?'checked':''}><span>${label}</span></label>`).join('')}</section>
        <button class="catalog-clear-filters" data-action="clear-category-filter">Clear all filters</button>
      </div>
      <div class="catalog-side-promo"><img src="/assets/photos/hero-travel.webp" alt="Travel bags in the VAYORA collection"><span>READY FOR YOUR NEXT JOURNEY?</span><b>Find your everyday favourite.</b><a href="/categories" data-route="/categories">Explore collections ${icon('arrow')}</a></div>
    </aside>
    <div class="catalog-main">
      <div class="breadcrumbs">${link('/','Home')} <span class="crumb-separator" aria-hidden="true">›</span> ${link('/categories','Categories')} <span class="crumb-separator" aria-hidden="true">›</span> <span>${esc(c.name)}</span></div>
      <div class="catalog-heading"><div><span class="eyebrow">VAYORA collection</span><h1>${esc(c.name)}</h1><p>${esc(c.description)}</p></div></div>
      <div class="catalog-toolbar"><div class="catalog-toolbar-left"><span class="catalog-results"><b>${products.length}</b> products</span><input class="filter-input" id="category-filter" type="search" value="${esc(query)}" placeholder="Search this collection…" aria-label="Filter category products"></div><div class="catalog-toolbar-right"><label for="category-sort">Sort by</label><select id="category-sort" class="filter-input" aria-label="Sort products"><option value="featured" ${sort==='featured'?'selected':''}>Featured</option><option value="low" ${sort==='low'?'selected':''}>Price: low to high</option><option value="high" ${sort==='high'?'selected':''}>Price: high to low</option><option value="rating" ${sort==='rating'?'selected':''}>Top rated</option></select></div></div>
      ${products.length ? `<div class="product-grid catalog-product-grid">${products.map(p=>productCard(p)).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">${icon('search')}</div><h3>No matching bags found</h3><p>Try another search term or clear the filter to see all designs in ${esc(c.name)}.</p><button class="btn btn-primary" data-action="clear-category-filter">Clear filters</button></div>`}
    </div>
  </div></section>`;
}
function renderSearch(query) {
  const q = String(query || '').trim();
  const products = q ? state.products.filter(p => `${p.name} ${p.category} ${p.description} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) : state.products;
  return `<section class="page-hero"><div class="container page-hero-inner"><div><div class="breadcrumbs">${link('/','Home')} <span class="crumb-separator" aria-hidden="true">›</span> <span>Search</span></div><span class="eyebrow">Search the whole edit</span><h1>${q ? `Results for “${esc(q)}”` : 'Explore all designs.'}</h1><p>Search across all VAYORA collections and discover the design that works for you.</p></div><div class="page-hero-art"><img src="/assets/products-photo-png/college-01.png" alt="VAYORA college backpack photograph"></div></div></section><section class="page-content"><div class="container"><div class="filter-row"><span class="result-count"><strong>${products.length}</strong> matching designs</span><span class="pill">Across ${state.categories.length} categories</span></div>${products.length ? `<div class="product-grid">${products.map(p => productCard(p)).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">${icon('search')}</div><h3>Nothing in the racks for “${esc(q)}”</h3><p>Try words like college, trolley, laptop, office, sling or travel.</p><button class="btn btn-primary" data-action="search-all">Browse all designs</button></div>`}</div></section>`;
}
function productHighlights(p) {
  const common = [
    'Purposeful storage layout for everyday essentials',
    'Smooth zips and practical access pockets',
    'Comfort-minded carry design for regular use'
  ];
  const byCategory = {
    college: ['Room for notebooks, stationery and daily essentials', 'Multiple compartments help separate small items', 'Padded shoulder straps for day-to-day campus use', 'Front organiser pocket keeps frequently used items close', 'Side pocket for a bottle or umbrella'],
    school: ['Book-friendly main compartment for everyday school items', 'Front pocket for stationery and small essentials', 'Padded shoulder straps designed for comfortable carrying', 'Side pockets for a water bottle or umbrella', 'Easy-pull zip closures for everyday access'],
    office: ['Structured compartments for workday essentials', 'Dedicated padded section for a laptop or tablet where size allows', 'Front organiser pockets for chargers, pens and accessories', 'Reinforced handles with a clean professional finish', 'Easy-access zip pockets for commute essentials'],
    'casual-sling': ['Compact profile for phone, wallet and daily essentials', 'Adjustable crossbody strap for a personalised fit', 'Quick-access zip pockets for small valuables', 'Lightweight shape for hands-free city movement', 'Easy-care material and practical everyday construction'],
    formal: ['Structured silhouette suited to office and formal settings', 'Organised interior for documents and daily essentials', 'Secure zip or flap closure depending on the design', 'Reinforced carry handles and detachable strap where fitted', 'Refined stitching and hardware details'],
    lunch: ['Insulated-style carry compartment for lunch and snacks', 'Easy-clean lining for everyday meal carrying', 'Separate space for a bottle or small container', 'Secure zip closure helps keep contents together', 'Compact shape for school, office and short outings'],
    travel: ['Roomy packing compartment for trips and overnight stays', 'Easy-roll trolley design on wheeled models', 'Internal straps and pockets help organise packed items', 'Durable handles and rolling hardware on trolley styles', 'Front or side pockets for travel documents and accessories'],
    tourist: ['Supportive backpack layout for longer outdoor days', 'Multiple pockets for keeping travel items organised', 'Adjustable shoulder straps and carry handle', 'Side bottle pockets on compatible designs', 'Practical exterior loops and compression details on selected styles'],
    handbags: ['Organised main compartment for everyday essentials', 'Interior pockets for quick access to smaller items', 'Structured handles and shoulder carry options depending on style', 'Secure closure and polished hardware details', 'Versatile shape for work, errands and everyday occasions'],
    children: ['Kid-friendly shape with playful colours or patterns', 'Easy-open zips and accessible front pockets', 'Main compartment for books, toys or daily essentials', 'Lightweight design with adjustable shoulder straps', 'Easy-to-spot colours and character details on selected designs'],
    laptop: ['Protective main compartment for work or study gear', 'Dedicated laptop section on compatible designs', 'Front organiser pockets for cables, charger and accessories', 'Padded back panel and shoulder straps on selected models', 'Side pocket for a bottle or travel accessories'],
    gym: ['Roomy compartment for training clothes and gear', 'Separate pocket for shoes or used clothing on selected models', 'Carry handles and adjustable shoulder strap', 'Side pocket for water bottle and small accessories', 'Wipe-clean, practical materials for regular training']
  };
  return byCategory[p.category] || common;
}
function productSpecs(p, c) {
  const type = c?.name || 'Everyday bag';
  const laptop = ['laptop','office','college'].includes(p.category);
  const travel = ['travel','tourist'].includes(p.category);
  return [
    ['Brand', 'VAYORA'], ['Collection', type], ['Model', p.name], ['SKU', p.sku || p.id],
    ['Primary material', p.category === 'handbags' || p.category === 'formal' ? 'Textured premium-look finish' : 'Durable woven fabric finish'],
    ['Carry type', c?.type || 'Everyday carry'], ['Laptop compatibility', laptop ? 'Designed for compatible devices; check dimensions before purchase' : 'Not specified for this design'],
    ['Recommended use', travel ? 'Travel, weekends and outdoor journeys' : p.category === 'lunch' ? 'Meal, snack and lunch carrying' : laptop ? 'Study, office and daily commuting' : 'Everyday use'],
    ['Colour / style', `Sample style · ${p.color || 'Neutral'}`], ['Care', 'Spot clean with a soft damp cloth; air dry'], ['Availability', p.stock > 0 ? 'In stock (demo inventory)' : 'Out of stock (demo inventory)']
  ];
}
function sampleProductReviews(p) {
  const c = categoryOf(p.category);
  const subject = c?.short || 'bag';
  const bank = [
    { name:'Priya S.', title:'Looks smart and feels practical', text:`The ${subject.toLowerCase()} has a neat finish and useful space for the things I carry every day. The pockets make small items easier to organise.`, rating:5 },
    { name:'Karthik M.', title:'Good value for everyday use', text:`A thoughtful ${subject.toLowerCase()} design with a clean look. It feels comfortable for regular use and the details are easy to work with.`, rating:4 },
    { name:'Nivetha R.', title:'Useful layout and a polished look', text:`I like the overall design and the way the compartments are arranged. It fits my usual essentials without making the bag feel too complicated.`, rating:5 },
    { name:'Arjun P.', title:'A nice addition to my collection', text:`The bag looks close to the product preview and works well for the purpose I picked it for. I would like a few more real-life photos for comparison.`, rating:4 }
  ];
  const seed = Math.abs(String(p.id).split('').reduce((n,ch)=>n*31+ch.charCodeAt(0),7));
  return bank.map((r,i)=>({...r, rating: i===1 ? Math.min(5,Number(p.rating||4.5)) : r.rating, name: bank[(i+(seed%bank.length))%bank.length].name, date: ['11 Oct 2026','06 Oct 2026','29 Sep 2026','18 Sep 2026'][i], sample:true}));
}
function renderProduct(id) {
  const p = productOf(id); if (!p) return renderNotFound();
  const c = categoryOf(p.category);
  const allSiblings = state.products.filter(x => x.category === p.category && x.id !== p.id);
  const related = allSiblings.slice(0,5);
  const alternatives = allSiblings.slice(0,6);
  const bundle = [p, ...related.slice(0,2)];
  const features = productHighlights(p);
  const specs = productSpecs(p,c);
  const reviews = sampleProductReviews(p);
  const rating = Math.min(5,Math.max(0,Number(p.rating)||4.5));
  const reviewCount = Math.max(1,Number(p.reviewCount)||24);
  const ratingBars = [5,4,3,2,1].map(star => {
    let pct = star===5 ? Math.round(42 + (rating-3.5)*18) : star===4 ? Math.round(25 - Math.abs(rating-4.2)*5) : star===3 ? 11 : star===2 ? 5 : 4;
    pct = Math.max(2,Math.min(78,pct));
    return {star,pct};
  });
  const colourNames = ['Jet black','Navy','Olive','Sand','Blush','Slate'];
  const productColour = p.color || '#d4d4d4';
  const freeShipping = discounted(p) >= 999;
  const relatedViews = state.products.filter(x => x.id !== p.id && x.category !== p.category).sort((a,b)=>Number(b.featured)-Number(a.featured)).slice(0,5);
  return `<section class="page-content product-page-content"><div class="container product-page-container">
    <nav class="breadcrumbs product-breadcrumbs" aria-label="Breadcrumb"><a href="/" data-route="/">Home</a><span class="crumb-separator">›</span><a href="/categories" data-route="/categories">Categories</a><span class="crumb-separator">›</span><a href="/category/${esc(p.category)}" data-route="/category/${esc(p.category)}">${esc(c?.name || 'Collection')}</a><span class="crumb-separator">›</span><span class="current-crumb">${esc(p.name)}</span></nav>
    <div class="amazon-product-layout">
      <section class="product-gallery-column" aria-label="Product photo gallery">
        <div class="product-gallery-grid">
          <div class="detail-thumbnails" aria-label="Product views">
            <button class="detail-thumb active" data-action="product-view" data-view="front" aria-label="Front product view"><img src="${esc(p.image)}" alt=""><span>Front</span></button>
            <button class="detail-thumb" data-action="product-view" data-view="detail" aria-label="Zoom into product details"><img src="${esc(p.image)}" alt=""><span>Detail zoom</span></button>
            <button class="detail-thumb" data-action="product-view" data-view="finish" aria-label="Inspect material finish"><img src="${esc(p.image)}" alt=""><span>Finish</span></button>
            <button class="detail-thumb" data-action="product-view" data-view="alternate" aria-label="Alternate visual preview"><img src="${esc(p.image)}" alt=""><span>Alt. view</span></button>
          </div>
          <div class="detail-image">
            ${effectiveDiscount(p) ? `<span class="discount-tag">${effectiveDiscount(p)}% OFF</span>` : ''}
            <div class="detail-image-stage" id="detail-image-stage" data-action="product-zoom" role="button" tabindex="0" aria-label="Click to toggle product image zoom">
              <img id="detail-main-image" src="${esc(p.image)}" alt="${esc(p.name)} — VAYORA product image" data-original-src="${esc(p.image)}">
              <span class="zoom-hint">Hover / tap to zoom</span>
            </div>
            <div class="gallery-view-label" id="gallery-view-label">Front view · product photograph</div>
          </div>
        </div>
        <p class="gallery-note">Use the thumbnails to inspect the bag image. Zoom is available on hover or tap. This demo uses generated product photography, so alternate views are visual previews rather than verified studio shots of the reverse side.</p>
      </section>
      <section class="product-information-column">
        <div class="product-brand-line"><span class="product-brand-mark">V</span><span>VAYORA</span><a href="/categories" data-route="/categories">Visit the VAYORA Store</a></div>
        <h1 class="product-detail-title">${esc(p.name)}</h1>
        <p class="product-subtitle">${esc(c?.description || 'A considered everyday carry design from VAYORA.')}</p>
        <div class="product-review-summary"><span class="starline">${stars(rating)}</span><b>${rating.toFixed(1)}</b><span class="muted">(${reviewCount.toLocaleString('en-IN')} sample ratings)</span><span class="summary-separator">|</span><a href="#customer-reviews" class="text-link product-review-jump">Customer reviews</a></div>
        ${p.featured ? `<div class="product-best-seller"><span># VAYORA FEATURED PICK</span><small>Highlighted in this collection</small></div>` : ''}
        <div class="product-sale-line"><span class="product-sale-badge">-${effectiveDiscount(p)}%</span><div class="product-sale-price"><span class="currency-symbol">₹</span><strong>${discounted(p).toLocaleString('en-IN')}</strong></div></div>
        <div class="product-price-meta"><span>MRP: <del>${currency(p.price)}</del></span><b>Save ${currency(Math.max(0,p.price-discounted(p)))} (${effectiveDiscount(p)}%)</b></div>
        <p class="product-tax-note">Inclusive of all taxes · Demo price</p>
        <div class="product-offer-row"><span class="offer-icon">%</span><div><b>VAYORA Demo Offer</b><span>Discount shown is calculated from the demo catalogue. No live coupon or bank offer is applied.</span></div></div>
        <div class="product-option-block"><div class="product-option-title"><b>Colour / style options</b><span>Choose another look</span></div><p>Current style: <strong>${colourNames[Math.abs(String(p.id).length*3)%colourNames.length]}</strong></p><div class="product-colour-options">${alternatives.map((x,i)=>`<button class="product-colour-option" data-action="product-variant" data-id="${esc(x.id)}" title="Open ${esc(x.name)}"><span class="variant-swatch" style="--swatch:${esc(x.color || ['#242424','#2d4668','#71806a','#cfc2ad','#d9a6a3','#7f8790'][i%6])}"><img src="${esc(x.image)}" alt=""></span><span>${esc(['Explore style','Navy style','Olive style','Neutral style','Colour style','Classic style'][i%6])}</span><b>${currency(discounted(x))}</b></button>`).join('')}</div><small class="variant-note">Selecting an option opens that VAYORA product listing; these are separate demo designs, not colour variants of the same SKU.</small></div>
        <div class="product-highlights"><h2>About this bag</h2><ul>${features.map(f=>`<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul></div>
        <div class="product-mini-specs"><div><span>Brand</span><b>VAYORA</b></div><div><span>Collection</span><b>${esc(c?.short || p.category)}</b></div><div><span>Item model</span><b>${esc(p.sku || p.id)}</b></div></div>
      </section>
      <aside class="product-purchase-column" aria-label="Purchase options">
        <div class="product-buy-box"><div class="buybox-price"><span>Price:</span><strong>${currency(discounted(p))}</strong></div><p class="buybox-tax">Inclusive of all taxes</p>
          <div class="buybox-delivery"><div>${icon('truck')}<span><b>${freeShipping?'FREE demo delivery':'Demo delivery available'}</b><small>${freeShipping?'On this order at the displayed price':'Free demo delivery on orders above ₹1,999'}</small></span></div><div>${icon('pin')}<span><b>Deliver to Chinnamanur</b><small>Choose your address at checkout</small></span></div></div>
          <p class="buybox-stock ${p.stock>0?'in-stock':'out-stock'}">${p.stock>0?'In stock':'Currently unavailable'} <small>${p.stock>0?`${p.stock} units in demo stock`:''}</small></p>
          <div class="buybox-quantity"><label for="product-quantity-select">Quantity</label><select id="product-quantity-select" class="filter-input">${Array.from({length:Math.min(10,Math.max(1,p.stock||1))},(_,i)=>`<option value="${i+1}" ${state.productQty===i+1?'selected':''}>${i+1}</option>`).join('')}</select></div>
          <button class="btn btn-primary btn-block buybox-add-button" data-action="add-cart-detail" data-id="${esc(p.id)}" ${p.stock<1?'disabled':''}>${icon('bag')} Add to Cart</button>
          <button class="btn btn-outline btn-block buybox-buy-button" data-action="buy-now-detail" data-id="${esc(p.id)}" ${p.stock<1?'disabled':''}>Buy Now</button>
          <button class="buybox-wishlist" data-action="wishlist-toggle" data-id="${esc(p.id)}">${icon('heart')} Add to Wishlist</button>
          <div class="buybox-trust"><div>${icon('shield')}<span>Secure demo checkout</span></div><div>${icon('refresh')}<span>7-day demo return policy</span></div></div>
          <dl class="buybox-meta"><div><dt>Ships from</dt><dd>VAYORA demo store</dd></div><div><dt>Sold by</dt><dd>VAYORA</dd></div><div><dt>Payment</dt><dd>UPI, card or cash on delivery (demo)</dd></div><div><dt>SKU</dt><dd>${esc(p.sku || p.id)}</dd></div></dl>
          <p class="demo-purchase-note">Demo store only. No real payment is processed and no physical product is shipped.</p>
        </div>
      </aside>
    </div>
    <section class="product-details-panel"><div class="product-section-heading"><div><span class="eyebrow">Product information</span><h2>Product details</h2></div><span class="muted">VAYORA · ${esc(p.sku || p.id)}</span></div><div class="product-spec-layout"><div class="product-spec-table">${specs.map(([key,value])=>`<div class="product-spec-row"><b>${esc(key)}</b><span>${esc(value)}</span></div>`).join('')}</div><aside class="product-spec-highlights"><h3>Designed for everyday use</h3><ul>${features.slice(0,4).map(f=>`<li>${esc(f)}</li>`).join('')}</ul><p>These are sample product details for a demo catalogue. Confirm exact measurements, material and device fit before using this copy for a real retail listing.</p></aside></div></section>
    <section class="product-bundle-section"><div class="product-section-heading"><div><span class="eyebrow">Pair it with</span><h2>Frequently explored together</h2><p>Suggested VAYORA styles selected for this demonstration.</p></div></div><div class="product-bundle-row">${bundle.map((x,i)=>`${i?'<span class="bundle-plus">+</span>':''}<article class="bundle-product"><a href="${productHref(x)}" data-route="${productHref(x)}"><img src="${esc(x.image)}" alt="${esc(x.name)}"><b>${esc(x.name)}</b></a><strong>${currency(discounted(x))}</strong></article>`).join('')}<div class="bundle-cta"><b>${currency(bundle.reduce((sum,x)=>sum+discounted(x),0))}</b><small>Combined sample price</small><button class="btn btn-primary" data-action="bundle-add" data-ids="${esc(bundle.map(x=>x.id).join(','))}">Add selection to cart</button></div></div></section>
    ${related.length?`<section class="section-sm product-related-section"><div class="section-head"><div><span class="eyebrow">More from this collection</span><h2>More ${esc(c?.short || 'VAYORA')} styles</h2></div><a href="/category/${esc(p.category)}" data-route="/category/${esc(p.category)}" class="text-link">View full collection ${icon('arrow')}</a></div><div class="featured-grid">${related.map(x=>productCard(x)).join('')}</div></section>`:''}
    <section class="product-related-section"><div class="section-head"><div><span class="eyebrow">Keep browsing</span><h2>Customers also viewed</h2></div><a href="/categories" data-route="/categories" class="text-link">Explore all collections ${icon('arrow')}</a></div><div class="featured-grid">${relatedViews.map(x=>productCard(x)).join('')}</div></section>
    <section class="customer-reviews-section" id="customer-reviews"><div class="product-section-heading"><div><span class="eyebrow">Customer feedback</span><h2>Customer reviews</h2><p>Illustrative sample reviews for the VAYORA demo catalogue; not verified purchases.</p></div></div><div class="customer-reviews-layout"><aside class="rating-breakdown"><strong>${rating.toFixed(1)} out of 5</strong><div class="starline">${stars(rating)}</div><span>${reviewCount.toLocaleString('en-IN')} sample ratings</span>${ratingBars.map(r=>`<div class="rating-bar-row"><span>${r.star} star</span><span class="rating-bar"><i style="width:${r.pct}%"></i></span><b>${r.pct}%</b></div>`).join('')}<button class="btn btn-outline btn-block" data-route="/login">Sign in to add a review</button></aside><div class="reviews-main"><div class="customers-say"><h3>Customers say</h3><p>Demo feedback highlights appearance, day-to-day usefulness and storage. Review text below is sample content created to demonstrate the page layout.</p><div class="review-topic-tags"><span>Appearance</span><span>Storage</span><span>Everyday use</span><span>Value for money</span></div></div><div class="review-photo-strip"><b>Product photos</b><div>${[p,...related.slice(0,3)].map(x=>`<a href="${productHref(x)}" data-route="${productHref(x)}"><img src="${esc(x.image)}" alt="${esc(x.name)}"></a>`).join('')}</div></div>${reviews.map((r,i)=>`<article class="customer-review-card"><div class="customer-review-avatar">${esc(initials(r.name))}</div><div class="customer-review-body"><b>${esc(r.name)}</b><span class="review-sample-badge">Sample review · ${esc(r.date)}</span><div class="starline">${stars(r.rating)}</div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p><div class="customer-review-meta"><span>Style: ${esc(p.name)}</span><span>Helpful · ${12+i*7}</span></div></div></article>`).join('')}</div></div></section>
    <p class="product-disclaimer">VAYORA is a demo storefront. Ratings, reviews, popularity indicators and product details are illustrative sample data. Actual product photos and specifications should be verified before a live launch.</p>
  </div></section>`;
}
function renderAbout() {
  const reviewCards = state.reviews.filter(r=>r.visible!==false);
  const mapQuery = 'Chinnamanur Agraharam, Chinnamanur, Theni, Tamil Nadu 625515';
  const mapEmbed = 'https://maps.google.com/maps?q=' + encodeURIComponent(mapQuery) + '&z=15&output=embed';
  const mapLink = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery);
  const townLines = [
    'Chinnamanur sits in Theni district, within the Cumbum Valley of southern Tamil Nadu.',
    'Green fields and the nearby Western Ghats shape the landscape around the town.',
    'Temple towers, familiar streets and local markets give Chinnamanur its own rhythm.',
    'The warmth of its people and everyday traditions make it feel like home.'
  ];
  const shopLines = [
    'VAYORA brings bags together for college, school, work, weekends and travel.',
    'Each collection balances useful storage with a clean, confident design.',
    'We want choosing a bag to feel welcoming, simple and personal.',
    'Most of all, we value the trust each customer carries through our door.'
  ];
  return `<section class="page-hero"><div class="container page-hero-inner"><div><div class="breadcrumbs">${link('/','Home')} <span class="crumb-separator" aria-hidden="true">›</span> <span>About VAYORA</span></div><span class="eyebrow">Carry beyond</span><h1>Good design goes places.</h1><p>VAYORA is built around a simple idea: the right bag should fit your day, feel like you and become part of the journeys you remember.</p></div></div></section>
    <section class="section"><div class="container"><div class="about-intro"><div><span class="eyebrow">Our point of view</span><h2>Function first.<br>Character always.</h2><p class="section-copy">From the campus backpack to a cabin trolley, a workday brief to an easy sling, every VAYORA collection is designed around a real use case. We pair useful organisation with a modern, restrained look—then add enough personality for the bag to feel like yours.</p><p class="section-copy" style="margin-top:15px">Thoughtful design matters, but so does the relationship behind every purchase. We want the experience to feel helpful, friendly and easy from the first browse to the moment you carry your new bag home.</p><div class="hero-actions"><a href="/categories" data-route="/categories" class="btn btn-primary">Explore collections ${icon('arrow')}</a><a href="/contact" data-route="/contact" class="btn btn-outline">Talk to the team</a></div></div><div class="about-art"><img src="/assets/photos/about-backpack.png" alt="High-quality VAYORA-style black backpack product photograph"><div class="about-note"><b>300+</b><span>Individual styles for everyday carry, work and travel.</span></div></div></div></div></section>
    <section class="vayora-location-section" id="visit-us"><div class="container"><div class="section-head"><div><span class="eyebrow">Come say hello</span><h2>Our in-store location.</h2><p>Find us in Chinnamanur Agraharam. We would love to help you choose a bag for your next chapter.</p></div><span class="pill">VAYORA · IN STORE</span></div><div class="vayora-location-layout"><article class="vayora-address-card"><span class="vayora-location-mark">${icon('pin')}</span><span class="eyebrow">Visit VAYORA</span><h3>Chinnamanur Agraharam</h3><p class="vayora-address">Chinnamanur Agraharam,<br>Chinnamanur, Theni District,<br>Tamil Nadu – 625515, India</p><div class="vayora-address-detail">${icon('truck')}<div><b>Local store, thoughtful service</b><span>Drop by to explore styles for everyday carry, campus, work and travel.</span></div></div><a class="btn btn-primary btn-block" href="${mapLink}" target="_blank" rel="noopener noreferrer">Get directions ${icon('arrow')}</a><p class="vayora-map-note">Map opens Google Maps in a new tab. The pin is based on the neighbourhood search, so please confirm the exact storefront pin before visiting.</p></article><div class="vayora-map-card"><div class="vayora-map-topline"><div><b>Find our neighbourhood</b><span>Chinnamanur Agraharam · Chinnamanur</span></div><span class="map-live-dot" aria-hidden="true"></span></div><iframe title="Map to VAYORA store location in Chinnamanur Agraharam" src="${mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><div class="vayora-map-bottom"><span>${icon('pin')} Chinnamanur, Theni, Tamil Nadu</span><a href="${mapLink}" target="_blank" rel="noopener noreferrer">Open larger map ${icon('arrow')}</a></div></div></div>
      <div class="place-story-grid">
        <article class="place-story-card town-story-card">
          <div class="place-story-image"><img src="/assets/photos/chinnamanur-temple.webp" alt="Temple photograph shared as a landmark of Chinnamanur"><span>About Chinnamanur</span></div>
          <div class="place-story-content"><span class="eyebrow">Our hometown</span><h3>A little about Chinnamanur.</h3><p class="place-story-lead">A town whose landscape, traditions and familiar faces make it special.</p>
            <div class="place-story-zigzag town-story-list">${townLines.map((line,i)=>`<p class="zigzag-line zigzag-line-${i+1}"><span class="zigzag-mark">${i%2?'↙':'↗'}</span><span>${line}</span></p>`).join('')}</div>
          </div>
        </article>
        <article class="place-story-card shop-story-card">
          <div class="place-story-image"><img src="/assets/photos/vayora-store-ai.webp" alt="AI-generated concept image of a premium VAYORA bag store"><span>VAYORA · Storefront concept</span></div>
          <div class="place-story-content"><span class="eyebrow">Our store</span><h3>More than a place to buy a bag.</h3><p class="place-story-lead">A thoughtful selection, friendly guidance and a little care in every detail.</p>
            <div class="place-story-zigzag shop-story-list">${shopLines.map((line,i)=>`<p class="zigzag-line zigzag-line-${i+1}"><span class="zigzag-mark">${i%2?'↙':'↗'}</span><span>${line}</span></p>`).join('')}</div>
            <small class="place-story-disclaimer">AI-generated storefront concept for this demo.</small>
          </div>
        </article>
      </div>
      <section class="owner-promise"><div class="owner-promise-icon">${icon('heart')}</div><div><span class="eyebrow">A note from the owner</span><blockquote>“You may visit us looking for a bag, but you become part of our story. Your trust is the most precious thing we carry.”</blockquote><p>With gratitude to every customer — <strong>The VAYORA owner</strong></p></div></section>
    </div></section>
    <section class="section" style="background:#f6f5ef"><div class="container"><div class="section-head"><div><span class="eyebrow">What we value</span><h2>The details matter.</h2><p>Three principles guide VAYORA, from the collection to the way we serve people.</p></div></div><div class="value-grid"><article class="value-card"><div class="value-icon">${icon('package')}</div><h3>Purposeful variety</h3><p>Separate collections for college, school, work, travel, sport, kids and everyday styles—each with its own visual identity.</p></article><article class="value-card"><div class="value-icon">${icon('shield')}</div><h3>A confident experience</h3><p>Clear prices, visible savings, product details, saved favourites and a structured order journey designed to be easy to follow.</p></article><article class="value-card"><div class="value-icon">${icon('sliders')}</div><h3>Managed, not hard-coded</h3><p>A dedicated admin studio lets a store manager maintain listings, images, offers, stock, reviews, orders and storefront copy through forms.</p></article></div></div></section>
    <section class="section"><div class="container"><div class="section-head"><div><span class="eyebrow">Notes from the community</span><h2>Carried. Tested. Reviewed.</h2><p>These sample reviews can be maintained in the admin studio.</p></div><span class="pill">${reviewCards.length} published reviews</span></div><div class="review-grid">${reviewCards.map(r=>{const p=reviewProduct(r);return `<article class="review-card"><div class="review-card-top"><span class="starline">${stars(r.rating)}</span><span class="pill">${Number(r.rating).toFixed(1)} / 5</span></div><h3>${esc(r.title)}</h3><p>“${esc(r.text)}”</p><div class="review-person"><div class="avatar">${initials(r.name)}</div><div><b>${esc(r.name)}</b><span>${esc(r.role || 'Verified customer')} · ${esc(r.productName || p?.name || 'VAYORA collection')}</span></div></div></article>`}).join('')}</div></div></section>`;
}
function renderContact() {
  return `<section class="page-hero"><div class="container page-hero-inner"><div><div class="breadcrumbs">${link('/','Home')} <span class="crumb-separator" aria-hidden="true">›</span> <span>Contact</span></div><span class="eyebrow">We're here to help</span><h1>Let's talk bags.</h1><p>Ask about a collection, share feedback or try the contact-to-admin message workflow. Your demo enquiry will appear in the admin studio.</p></div></div></section>
    <section class="page-content"><div class="container"><div class="contact-grid"><aside class="contact-aside"><span class="eyebrow">Get in touch</span><h2>A better answer starts with a conversation.</h2><p>Send the VAYORA demo team a message. This form uses the backend, so a submitted enquiry is saved and can be reviewed from the administrator portal.</p><div class="contact-detail">${icon('mail')}<div><b>Email us</b><span>${esc(state.settings.supportEmail || 'hello@vayora.demo')}</span></div></div><div class="contact-detail">${icon('phone')}<div><b>Call the demo desk</b><span>${esc(state.settings.supportPhone || '+91 90000 12345')}</span></div></div><div class="contact-detail">${icon('pin')}<div><b>Service hours</b><span>Monday–Saturday · 9:30 AM–6:00 PM</span></div></div></aside>
      <div class="form-panel"><h2>Send a message</h2><p class="small">Fields marked with an asterisk are required.</p><div id="contact-feedback"></div><form data-form="contact"><div class="form-grid"><div class="field"><label for="contact-name">Full name *</label><input id="contact-name" name="name" placeholder="Your name" required minlength="2"></div><div class="field"><label for="contact-email">Email address *</label><input id="contact-email" name="email" type="email" placeholder="you@example.com" required></div><div class="field field-full"><label for="contact-subject">Subject</label><input id="contact-subject" name="subject" placeholder="What can we help with?"></div><div class="field field-full"><label for="contact-message">Message *</label><textarea id="contact-message" name="message" required minlength="8" placeholder="Tell us a little more…"></textarea></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">Send message ${icon('arrow')}</button><span class="form-note">Demo only · No external email is sent.</span></div></form></div></div></div></section>`;
}
function authMessage() {
  if (!state.pendingRoute) return 'Sign in to access the full catalogue and save your favourites.';
  const route = state.pendingRoute;
  if (route.startsWith('/category/')) return 'Create an account or sign in to explore this collection and its full product range.';
  if (route.startsWith('/cart') || route.startsWith('/checkout')) return 'Sign in to keep your cart, continue to checkout and view your orders.';
  if (route.startsWith('/wishlist')) return 'Sign in to save bags to your personal wishlist.';
  if (route.startsWith('/product/')) return 'Sign in to view full product details and add a bag to your cart.';
  return 'Sign in to unlock the full store experience and manage your favourites.';
}
function renderAuth(mode = 'login') {
  const signup = mode === 'signup';
  const pending = state.pendingRoute;
  const mini = ['travel-01','college-01','handbags-01'].map(id=>productOf(id)).filter(Boolean);
  return `<section class="auth-layout"><div class="auth-visual"><div><img class="auth-brand" src="/assets/logo-white.svg" alt="VAYORA"><span class="eyebrow" style="margin-top:28px;color:var(--yellow)">${signup?'Your next chapter starts here':'Welcome back to VAYORA'}</span><h1>${signup?'Make space for more.':'Good to carry on.'}</h1><p>${signup?'Create your account to explore every collection, save the designs you love and test the full demo checkout.':'Your saved bags and next favourites are right where you left them. Sign in to continue exploring.'}</p><div class="auth-mini-products">${mini.map(p=>`<img src="${esc(p.image)}" alt="${esc(p.name)}">`).join('')}</div></div><div class="auth-visual-footer"><span>12 collections · 300 unique designs</span><span>Carry beyond. Go further.</span></div></div><div class="auth-card"><span class="eyebrow">${signup?'Join the collection':'Your VAYORA account'}</span><h2>${signup?'Create your account':'Sign in to continue'}</h2><p>${esc(authMessage())}</p><div class="auth-tabs"><a href="/login" data-route="/login" class="${!signup?'active':''}">Sign in</a><a href="/signup" data-route="/signup" class="${signup?'active':''}">Create account</a></div><form class="auth-form" data-form="${signup?'signup':'login'}">${signup?`<div class="field"><label for="auth-name">Full name</label><input id="auth-name" name="name" placeholder="Enter your full name" autocomplete="name" minlength="2" required></div>`:''}<div class="field"><label for="auth-email">Email address</label><input id="auth-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required></div><div class="field"><label for="auth-password">Password</label><input id="auth-password" name="password" type="password" placeholder="${signup?'At least 8 characters':'Enter your password'}" autocomplete="${signup?'new-password':'current-password'}" minlength="${signup?8:1}" required></div>${signup?`<div class="password-hint">Use at least 8 characters. This demo stores your account in the local backend.</div>`:''}<button class="btn btn-primary btn-block" type="submit">${signup?'Create account':'Sign in securely'} ${icon('arrow')}</button></form><div class="auth-demo"><b>Demo customer account</b><p>Email: <strong>user@vayora.demo</strong><br>Password: <strong>Vayora@123</strong> &nbsp; <button type="button" data-action="fill-demo" data-role="customer">Use demo login</button></p></div><p class="small" style="margin-top:18px">Managing the store? ${link('/admin-login','Open the admin portal','text-link')}</p>${pending?`<p class="form-note">After signing in, you’ll continue to the page you selected.</p>`:''}</div></section>`;
}
function renderAdminLogin() {
  return `<section class="admin-login-route"><div class="admin-login-card"><img src="/assets/logo.svg" alt="VAYORA"><span class="eyebrow">Store management</span><h1>Admin portal</h1><p>Manage the catalogue, stock, category offers, customer reviews, orders and storefront content from one place.</p><form class="auth-form" data-form="admin-login"><div class="field"><label for="admin-email">Admin email</label><input id="admin-email" name="email" type="email" autocomplete="username" required placeholder="admin@vayora.demo"></div><div class="field"><label for="admin-password">Password</label><input id="admin-password" name="password" type="password" autocomplete="current-password" required placeholder="Admin password"></div><button type="submit" class="btn btn-dark btn-block">Sign in to admin studio ${icon('arrow')}</button></form><div class="auth-demo"><b>Demo administrator credentials</b><p>Email: <strong>admin@vayora.demo</strong><br>Password: <strong>Admin@123</strong> &nbsp; <button type="button" data-action="fill-demo" data-role="admin">Fill demo details</button></p></div><p class="small" style="margin-top:20px">${link('/','← Return to public storefront','text-link')} · ${link('/login','Customer sign in')}</p></div></section>`;
}
function renderWishlist() {
  const products = state.wishlist.map(id=>productOf(id)).filter(Boolean);
  return `<section class="page-hero"><div class="container page-hero-inner"><div><div class="breadcrumbs">${link('/','Home')} <span class="crumb-separator" aria-hidden="true">›</span> <span>Wishlist</span></div><span class="eyebrow">Saved for later</span><h1>Your shortlist.</h1><p>Keep the bags you love in one place, then add a favourite to your cart whenever you’re ready.</p></div><div class="page-hero-art"><img src="/assets/products-photo-png/handbags-04.png" alt="VAYORA handbag design"></div></div></section><section class="page-content"><div class="container"><div class="section-head"><div><h2>Saved bags <span class="muted" style="font-size:18px">(${products.length})</span></h2></div>${link('/categories','Find another favourite '+icon('arrow'),'text-link')}</div>${products.length?`<div class="product-grid">${products.map(p=>productCard(p)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${icon('heart')}</div><h3>Your wishlist is ready for a first pick.</h3><p>Tap the heart on any bag to save it here. We’ll keep your shortlist ready while you explore.</p><button class="btn btn-primary" data-route="/categories">Explore collections ${icon('arrow')}</button></div>`}</div></section>`;
}
function renderCart() {
  const lines = allCartLines(); const subtotal = cartSubtotal(); const shipping = subtotal === 0 || subtotal >= 1999 ? 0 : 99;
  const recommendations = state.products.filter(p => !state.cart[p.id] && p.stock > 0).slice(0, 8);
  const cartItemMarkup = lines.map(({product:p,qty})=>`<article class="amazon-cart-item"><a class="amazon-cart-image" href="${productHref(p)}" data-route="${productHref(p)}"><img src="${esc(p.image)}" alt="${esc(p.name)}"></a><div class="amazon-cart-item-info"><h3><a href="${productHref(p)}" data-route="${productHref(p)}">${esc(p.name)}</a></h3><span class="cart-stock">In stock · Demo listing</span><p class="cart-delivery-note">Eligible for free demo delivery on orders above ₹1,999.</p><div class="amazon-cart-controls"><div class="quantity-control"><button data-action="cart-qty" data-id="${esc(p.id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-action="cart-qty" data-id="${esc(p.id)}" data-delta="1" aria-label="Increase quantity">+</button></div><span class="cart-control-divider"></span><button class="remove-link" data-action="remove-cart" data-id="${esc(p.id)}">Delete</button><span class="cart-control-divider"></span><button class="remove-link" data-action="wishlist-toggle" data-id="${esc(p.id)}">Save for later</button></div></div><div class="amazon-cart-item-price"><strong>${currency(discounted(p)*qty)}</strong><small>${currency(discounted(p))} each</small></div></article>`).join('');
  return `<section class="page-content amazon-cart-page"><div class="container"><div class="amazon-cart-layout"><section class="amazon-cart-main"><div class="amazon-cart-heading"><h1>Shopping Cart</h1><a href="/categories" data-route="/categories">Shop today's collections</a></div>${lines.length?`<div class="amazon-cart-sortline"><span>Price</span><span>Items in your cart (${cartCount()})</span></div>${cartItemMarkup}<div class="amazon-cart-subtotal">Subtotal (${cartCount()} item${cartCount()===1?'':'s'}): <strong>${currency(subtotal)}</strong></div>`:`<div class="amazon-empty-cart"><div class="empty-icon">${icon('bag')}</div><div><h2>Your VAYORA cart is empty.</h2><p>When you add bags, they’ll appear here so you can review quantities and continue to checkout.</p><a class="btn btn-primary" href="/categories" data-route="/categories">Explore bags ${icon('arrow')}</a></div></div>`}</section>${lines.length?`<aside class="amazon-cart-summary"><div class="free-delivery-message">${icon('check')} ${subtotal>=1999?'Your order qualifies for free demo delivery.':'Add '+currency(Math.max(0,1999-subtotal))+' more to unlock free demo delivery.'}</div><div class="summary-line"><span>Subtotal (${cartCount()} items)</span><strong>${currency(subtotal)}</strong></div><div class="summary-line"><span>Shipping</span><strong>${shipping===0?'FREE':currency(shipping)}</strong></div><div class="summary-line summary-total"><span>Order total</span><strong>${currency(subtotal+shipping)}</strong></div><a class="btn btn-primary btn-block" href="/checkout" data-route="/checkout">Proceed to checkout ${icon('arrow')}</a><p class="form-note">Secure demo checkout · No real payment is collected.</p><button class="btn btn-outline btn-block" data-action="clear-cart">Clear cart</button></aside>`:''}</div>
    ${recommendations.length?`<section class="amazon-cart-recommendations"><div class="amazon-recommendation-heading"><div><h2>Customers who bought bags in your cart also explored</h2><p>Suggested from the VAYORA collection · demo recommendations</p></div><a href="/categories" data-route="/categories">View all</a></div><div class="amazon-recommendation-grid">${recommendations.slice(0,4).map(p=>productCard(p)).join('')}</div></section><section class="amazon-cart-recommendations amazon-recommendations-secondary"><div class="amazon-recommendation-heading"><div><h2>Recommended for your next journey</h2><p>More styles for campus, office and travel.</p></div><a href="/categories" data-route="/categories">Explore all bags</a></div><div class="amazon-recommendation-grid">${recommendations.slice(4,8).map(p=>productCard(p)).join('')}</div></section>`:''}</div></section>`;
}
function renderCheckout() {
  const lines = allCartLines(); if (!lines.length) return renderEmptyCheckout();
  const subtotal = cartSubtotal(); const shipping = subtotal >= 1999 ? 0 : 99;
  const nameParts = String(state.user?.name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() || '';
  const lastName = nameParts.join(' ');
  const banks = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Punjab National Bank','Bank of Baroda','Canara Bank','Union Bank of India','Indian Bank','IDFC FIRST Bank','Federal Bank','IndusInd Bank','Yes Bank','Bank of India'];
  return `<section class="page-hero checkout-page-hero"><div class="container page-hero-inner checkout-hero-inner"><div><div class="breadcrumbs">${link('/','Home')} <span class="crumb-separator" aria-hidden="true">›</span> ${link('/cart','Cart')} <span class="crumb-separator" aria-hidden="true">›</span> <span>Checkout</span></div><span class="eyebrow">Secure demo checkout</span><h1>Nearly there.</h1><p>Confirm your delivery details and choose a demo payment method to complete your VAYORA order.</p></div><div class="checkout-warehouse-art"><img src="/assets/photos/checkout-warehouse.svg" alt="Warehouse shelves with VAYORA delivery parcels ready for dispatch"></div></div></section>
  <section class="page-content checkout-page-content"><div class="container"><form data-form="checkout"><div class="checkout-layout checkout-layout-enhanced"><div class="checkout-form-column">
    <section class="form-panel checkout-section-panel"><div class="checkout-step"><span class="step-number">1</span><h3>Contact details</h3></div><div class="form-grid checkout-form-grid">
      <div class="field"><label for="ship-first-name">First name *</label><input id="ship-first-name" name="firstName" value="${esc(firstName)}" autocomplete="given-name" required></div>
      <div class="field"><label for="ship-last-name">Last name *</label><input id="ship-last-name" name="lastName" value="${esc(lastName)}" autocomplete="family-name" required></div>
      <div class="field"><label for="ship-email">Email address *</label><input id="ship-email" name="email" type="email" value="${esc(state.user?.email || '')}" autocomplete="email" placeholder="you@example.com" required></div>
      <div class="field"><label for="ship-phone">Phone number *</label><input id="ship-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required minlength="8" placeholder="10-digit mobile number"></div>
    </div></section>
    <section class="form-panel checkout-section-panel"><div class="checkout-step"><span class="step-number">2</span><h3>Delivery address</h3></div><div class="form-grid checkout-form-grid">
      <div class="field field-full"><label for="ship-address1">Address line 1 *</label><input id="ship-address1" name="address1" autocomplete="address-line1" placeholder="House / flat number, street name" required minlength="5"></div>
      <div class="field field-full"><label for="ship-address2">Address line 2 <span class="muted">(optional)</span></label><input id="ship-address2" name="address2" autocomplete="address-line2" placeholder="Apartment, building, area"></div>
      <div class="field field-full"><label for="ship-landmark">Landmark <span class="muted">(optional)</span></label><input id="ship-landmark" name="landmark" placeholder="Nearby landmark"></div>
      <div class="field field-full"><label>Save address as *</label><input type="radio" name="deliveryAddressChoice" value="primary" checked class="visually-hidden"><div class="checkout-address-types"><label class="checkout-address-type"><input type="radio" name="addressType" value="Home" checked><span class="checkout-address-type-icon">${icon('home')}</span><span><b>Home</b><small>Home address</small></span></label><label class="checkout-address-type"><input type="radio" name="addressType" value="Office"><span class="checkout-address-type-icon">${icon('briefcase')}</span><span><b>Office</b><small>Work address</small></span></label></div></div>
      <div class="field"><label for="ship-city">Town / City *</label><input id="ship-city" name="city" autocomplete="address-level2" required></div>
      <div class="field"><label for="ship-district">District *</label><input id="ship-district" name="district" required></div>
      <div class="field"><label for="ship-state">State *</label><input id="ship-state" name="state" autocomplete="address-level1" required></div>
      <div class="field"><label for="ship-pincode">PIN code *</label><input id="ship-pincode" name="pincode" inputmode="numeric" autocomplete="postal-code" required minlength="6" maxlength="6" pattern="[0-9]{6}" placeholder="6-digit PIN code"></div>
    </div>
    <div class="checkout-add-address-row"><button type="button" class="checkout-add-address" data-action="checkout-add-address">${icon('plus')} Add another address</button><span class="form-note">Optional · add an alternate address for this order.</span></div>
    <div id="checkout-extra-address" class="checkout-extra-address" hidden><div class="checkout-extra-address-head"><h4>Alternate delivery address</h4><button type="button" class="checkout-remove-address" data-action="checkout-remove-address" aria-label="Remove alternate address">${icon('close')}</button></div><label class="checkout-use-alternate"><input type="radio" name="deliveryAddressChoice" value="alternate"> Use this address for delivery</label><div class="form-grid checkout-form-grid"><div class="field field-full"><label for="ship-alt-address1">Address line 1 *</label><input id="ship-alt-address1" name="altAddress1" placeholder="House / flat number, street name"></div><div class="field field-full"><label for="ship-alt-address2">Address line 2</label><input id="ship-alt-address2" name="altAddress2" placeholder="Apartment, building, area"></div><div class="field field-full"><label for="ship-alt-landmark">Landmark</label><input id="ship-alt-landmark" name="altLandmark" placeholder="Nearby landmark"></div><div class="field"><label for="ship-alt-city">Town / City *</label><input id="ship-alt-city" name="altCity"></div><div class="field"><label for="ship-alt-district">District *</label><input id="ship-alt-district" name="altDistrict"></div><div class="field"><label for="ship-alt-state">State *</label><input id="ship-alt-state" name="altState"></div><div class="field"><label for="ship-alt-pincode">PIN code *</label><input id="ship-alt-pincode" name="altPincode" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="6-digit PIN code"></div></div></div>
    </section>
    <section class="form-panel checkout-section-panel"><div class="checkout-step"><span class="step-number">3</span><h3>Payment method</h3></div><div class="payment-options payment-options-four">
      <label class="payment-option"><input type="radio" name="paymentMethod" value="UPI" checked><b>UPI</b><span>Demo payment</span></label>
      <label class="payment-option"><input type="radio" name="paymentMethod" value="Card"><b>Debit / credit card</b><span>No card details needed</span></label>
      <label class="payment-option"><input type="radio" name="paymentMethod" value="Net Banking"><b>Net banking</b><span>Bank list below</span></label>
      <label class="payment-option"><input type="radio" name="paymentMethod" value="Cash on delivery"><b>Cash on delivery</b><span>Pay at delivery (demo)</span></label>
    </div><div class="netbanking-bank-list"><strong>Available banks <span>(display only)</span></strong><div class="netbanking-bank-names">${banks.map(bank=>`<span>${esc(bank)}</span>`).join('')}</div><small>Bank names are shown for the demo only; they are not selectable and no bank site will open.</small></div>
      <div class="checkout-demo-note">${icon('shield')}<div><strong>Demo payment notice</strong><br>This website does not connect to a payment gateway. Placing this sample order records a demo payment status only. Do not enter real payment details.</div></div><button class="btn btn-primary btn-block checkout-place-order" type="submit">Place demo order · ${currency(subtotal+shipping)} ${icon('arrow')}</button><p class="form-note checkout-submit-note">Your order will be saved to your profile and visible to the admin studio.</p>
    </section>
  </div><aside class="summary-panel checkout-summary-panel"><div class="checkout-summary-head"><div><span class="eyebrow">Order summary</span><h3>Your order</h3></div><span class="checkout-secure-mark">${icon('shield')} Secure</span></div>${lines.map(({product:p,qty})=>`<div class="checkout-order-line"><img src="${esc(p.image)}" alt="${esc(p.name)}"><div class="checkout-order-item-copy"><b>${esc(p.name)}</b><span>Qty ${qty} · ${currency(discounted(p))} each</span></div><strong>${currency(discounted(p)*qty)}</strong></div>`).join('')}<div class="summary-line"><span>Subtotal (${cartCount()} item${cartCount()===1?'':'s'})</span><strong>${currency(subtotal)}</strong></div><div class="summary-line"><span>Shipping</span><strong>${shipping===0?'FREE':currency(shipping)}</strong></div><div class="summary-line summary-total"><span>Total</span><strong>${currency(subtotal+shipping)}</strong></div><div class="checkout-summary-note">${icon('package')} <span>Warehouse team will prepare your order after the demo checkout is completed.</span></div></aside></div></form></div></section>`;
}
function renderEmptyCheckout() { return `<section class="page-content"><div class="container"><div class="empty-state"><div class="empty-icon">${icon('bag')}</div><h3>Nothing to check out yet.</h3><p>Add a bag to your cart and return here to try the sample checkout.</p><button class="btn btn-primary" data-route="/categories">Browse collections</button></div></div></section>`; }
function renderOrderSuccess(id) {
  if (!state.lastOrder || state.lastOrder.id !== id) {
    if (!state._loadingOrder) { state._loadingOrder = true; api(`/api/orders/${encodeURIComponent(id)}`).then(d=>{state.lastOrder=d.order;localStorage.setItem(LS.order,JSON.stringify(d.order));state._loadingOrder=false;render();}).catch(()=>{state._loadingOrder=false;render();}); }
    return `<section class="order-success"><div class="skeleton" style="width:84px;height:84px;margin:0 auto 25px;border-radius:50%"></div><h2>Confirming your demo order…</h2><p>Please keep this page open for a moment.</p></section>`;
  }
  const order = state.lastOrder;
  return `<section class="order-success"><div class="success-icon">${icon('check')}</div><span class="eyebrow" style="justify-content:center">Order confirmed</span><h1>That's a good carry.</h1><p>Your demo order is placed. We've saved the sample order to your VAYORA profile so you can view its status later.</p><div class="order-number">ORDER ID <strong>${esc(order.id)}</strong></div><div class="order-summary-mini"><div class="summary-line"><span>Order status</span><strong>${esc(order.status || 'Order placed')}</strong></div><div class="summary-line"><span>Payment</span><strong>${esc(order.paymentStatus || 'Demo payment')}</strong></div><div class="summary-line"><span>Total</span><strong>${currency(order.total)}</strong></div><div class="summary-line"><span>Ship to</span><strong>${esc(order.city || '')}, ${esc(order.state || '')}</strong></div></div><div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="/profile" data-route="/profile">View my orders ${icon('arrow')}</a><a class="btn btn-outline" href="/categories" data-route="/categories">Keep exploring</a></div><p class="form-note" style="margin-top:19px">No real payment was made and no physical item will be shipped from this demo.</p></section>`;
}
function renderProfile() {
  const u = state.user;
  if (!state.profileOrders) {
    if (!state._loadingProfile) { state._loadingProfile = true; api('/api/orders').then(d=>{state.profileOrders=d.orders||[];state._loadingProfile=false;render();}).catch(()=>{state.profileOrders=[];state._loadingProfile=false;render();}); }
  }
  const orders = state.profileOrders || [];
  const savedAll = getJson('vayoraProfileDetails', {});
  const emailKey = String(u?.email || '').toLowerCase();
  const saved = state.profileDraft || savedAll[emailKey] || {};
  const nameParts = String(u?.name || '').trim().split(/\s+/);
  const first = saved.firstName ?? nameParts.shift() ?? '';
  const last = saved.lastName ?? nameParts.join(' ');
  const addressCount = Math.max(1, Math.min(10, Number(saved.addressCount) || 1));
  const photo = saved.photo || '';
  const field = (label,name,placeholder='',value='',type='text',required=false) => `<div class="field"><label for="${name}">${label}${required?' *':''}</label><input id="${name}" name="${name}" type="${type}" value="${esc(value ?? '')}" placeholder="${placeholder}" ${required?'required':''}></div>`;
  const addressFields = Array.from({length:addressCount},(_,i)=>`<section class="profile-address-block"><div class="profile-address-heading"><h3>Address ${i+1}</h3>${i>0?`<span class="pill">Additional address</span>`:''}</div><div class="form-grid">${field('Address line 1',`address1_${i}`,'House no., street, area',saved[`address1_${i}`]||'', 'text',i===0)}${field('Address line 2',`address2_${i}`,'Apartment, building, optional',saved[`address2_${i}`]||'')}${field('Landmark',`landmark_${i}`,'Nearby landmark',saved[`landmark_${i}`]||'')}${field('Town / City',`town_${i}`,'Town or city',saved[`town_${i}`]||'', 'text',i===0)}${field('District',`district_${i}`,'District',saved[`district_${i}`]||'', 'text',i===0)}${field('State',`state_${i}`,'State',saved[`state_${i}`]||'', 'text',i===0)}${field('PIN code',`pincode_${i}`,'6-digit PIN code',saved[`pincode_${i}`]||'', 'text',i===0)}</div></section>`).join('');
  return `<section class="page-content profile-page"><div class="container"><div class="profile-page-heading"><div><div class="breadcrumbs">${link('/','Home')} <span class="crumb-separator" aria-hidden="true">›</span> <span>Your profile</span></div><span class="eyebrow">Your VAYORA account</span><h1>Profile & addresses</h1><p>Manage your account details, delivery addresses and recent orders.</p></div></div><div class="profile-account-layout"><aside class="profile-card profile-account-card"><div class="profile-avatar profile-photo-avatar">${photo?`<img src="${esc(photo)}" alt="Your profile photo">`:initials(`${first} ${last}`)}</div><h3>${esc(`${first} ${last}`.trim() || u?.name || 'VAYORA customer')}</h3><p>${esc(saved.email || u?.email || '')}</p><label class="btn btn-outline btn-block profile-upload-label" for="profile-photo">${icon('user')} Upload profile photo</label><span class="pill">Customer account</span><div class="profile-actions"><a class="btn btn-outline btn-block" href="/wishlist" data-route="/wishlist">${icon('heart')} My wishlist (${state.wishlist.length})</a><a class="btn btn-outline btn-block" href="/cart" data-route="/cart">${icon('bag')} My cart (${cartCount()})</a><button class="btn btn-dark btn-block" data-action="logout">${icon('logout')} Sign out</button></div></aside><div class="profile-main-column"><section class="profile-editor-panel"><div class="profile-panel-heading"><div><span class="eyebrow">Personal information</span><h2>Account details</h2></div><span class="pill">Saved in this browser</span></div><form data-form="profile" id="profile-form"><input type="file" id="profile-photo" name="profilePhoto" accept="image/*" class="visually-hidden"><input type="hidden" name="addressCount" value="${addressCount}"><input type="hidden" name="photoSaved" value="${esc(photo)}"><div class="profile-person-grid">${field('First name','firstName','First name',first,'text',true)}${field('Last name','lastName','Last name',last)}${field('Email address','email','you@example.com',saved.email || u?.email || '', 'email',true)}${field('Phone number','phone','10-digit mobile number',saved.phone || '', 'tel',true)}</div><div class="profile-panel-heading profile-address-title"><div><span class="eyebrow">Delivery book</span><h2>Saved addresses</h2><p>Add one or more addresses for your deliveries.</p></div></div><div class="profile-address-list">${addressFields}</div><div class="profile-form-actions"><button type="button" class="btn btn-outline" data-action="add-profile-address">${icon('plus')} Add another address</button><button type="submit" class="btn btn-primary">Save profile ${icon('check')}</button></div><p class="form-note">Your profile photo and address book are stored locally in this browser for this demo.</p></form></section><section class="profile-orders-section"><div class="section-head"><div><span class="eyebrow">Order history</span><h2 style="font-size:25px">Your orders</h2></div><span class="pill">${orders.length} orders</span></div>${state._loadingProfile?`<div class="skeleton" style="height:110px;margin-bottom:12px"></div><div class="skeleton" style="height:110px"></div>`:orders.length?orders.map(o=>`<article class="order-card"><div class="order-card-head"><div><b>Order ${esc(o.id)}</b><div class="small muted" style="margin-top:4px">${new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · ${o.items.length} item(s)</div></div><div style="text-align:right"><span class="status-pill ${o.status==='Delivered'?'green':''}">${esc(o.status)}</span><b style="display:block;margin-top:8px">${currency(o.total)}</b></div></div><div class="order-items-mini">${o.items.slice(0,6).map(it=>`<img src="${esc(it.image)}" alt="${esc(it.name)}" title="${esc(it.name)}">`).join('')}</div><div class="small muted" style="margin-top:12px">${esc(o.paymentStatus)} · Demo order</div></article>`).join(''):`<div class="empty-state"><div class="empty-icon">${icon('package')}</div><h3>Your first order will show up here.</h3><p>Place a demo order to test the whole store workflow. It will also appear in the admin studio.</p><button class="btn btn-primary" data-route="/categories">Start exploring</button></div>`}</section></div></div></div></section>`;
}
function renderNotFound() { return `<section class="page-content"><div class="container"><div class="empty-state"><div class="empty-icon">${icon('search')}</div><h2>That page wandered off.</h2><p>Let's get you back to a collection worth carrying.</p><button class="btn btn-primary" data-route="/">Back to home ${icon('arrow')}</button></div></div></section>`; }

const adminTabs = [
  ['dashboard','chart','Dashboard'],['products','bag','Products'],['categories','grid','Categories & offers'],['reviews','star','Customer reviews'],['orders','package','Orders'],['messages','mail','Messages'],['customers','users','Customers'],['storefront','settings','Storefront'],
];
function adminTabButton([id, ic, label]) { return `<button class="${state.adminTab===id?'active':''}" data-action="admin-tab" data-tab="${id}" aria-label="${label}">${icon(ic)}<span>${label}</span></button>`; }
function adminShell(content) {
  const u=state.user;
  return `<div class="admin-shell"><div class="admin-container"><div class="admin-topbar"><div class="admin-topbrand"><a href="/admin" data-route="/admin"><img src="/assets/logo.svg" alt="VAYORA"></a><span>Commerce control centre</span></div><div class="admin-top-actions"><div class="admin-who"><div class="avatar">${initials(u?.name)}</div><div><b>${esc(u?.name || 'Store admin')}</b><span>Administrator</span></div></div><button class="btn btn-outline btn-sm" data-route="/" title="View storefront">Storefront</button><button class="btn btn-dark btn-sm" data-action="logout">${icon('logout')} Sign out</button></div></div><div class="admin-layout"><aside class="admin-sidebar"><div class="admin-sidebar-label">Workspace</div><nav class="admin-nav">${adminTabs.map(adminTabButton).join('')}</nav><div class="admin-sidebar-bottom"><span>Store status</span><b>● Demo store online</b></div></aside><div class="admin-main">${content}<div class="admin-footer-note">VAYORA Admin Studio · Changes save to the local demo database · ${state.products.length} product records loaded</div></div></div></div></div>${state.toast?`<div class="toast ${state.toastKind}">${esc(state.toast)}</div>`:''}`;
}
function adminHeader(title, subtitle, action = '') {
  return `<div class="admin-page-head"><div><span class="eyebrow">VAYORA workspace</span><h1>${title}</h1><p>${subtitle}</p></div><div>${action || `<span class="admin-date">${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>`}</div></div>`;
}
function statCard(title, value, sub, ic) { return `<article class="stat-card"><div class="stat-card-head"><span>${title}</span><span class="stat-card-icon">${icon(ic)}</span></div><strong>${value}</strong><small>${sub}</small></article>`; }
function adminOrderRows(orders, limit = 0) {
  const list = limit ? orders.slice(0,limit) : orders;
  if (!list.length) return `<tr><td colspan="6" class="admin-empty">No orders yet. Place a demo order from the customer storefront and it will appear here.</td></tr>`;
  return list.map(o=>`<tr><td><strong>${esc(o.id)}</strong><div class="tiny muted">${new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div></td><td>${esc(o.customerName || o.customerEmail)}<div class="tiny muted">${esc(o.customerEmail)}</div></td><td>${o.items.reduce((s,x)=>s+x.qty,0)} item(s)</td><td><strong>${currency(o.total)}</strong></td><td><span class="status-pill ${o.status==='Delivered'?'green':''}">${esc(o.status)}</span></td><td><div class="admin-actions"><select class="admin-select" style="width:145px;padding:7px;font-size:10px" data-order-status="${esc(o.id)}">${['Order placed','Packed','Shipped','Out for delivery','Delivered','Cancelled'].map(s=>`<option ${o.status===s?'selected':''} value="${s}">${s}</option>`).join('')}</select><button class="admin-icon-btn" data-action="update-order" data-id="${esc(o.id)}">Save</button></div></td></tr>`).join('');
}
function renderAdminDashboard() {
  const d=state.adminData; const revenue=d.orders.filter(o=>o.status!=='Cancelled').reduce((s,o)=>s+Number(o.total||0),0);
  const pending=d.orders.filter(o=>!['Delivered','Cancelled'].includes(o.status)).length;
  const orderDays=[];
  for(let i=6;i>=0;i--){const day=new Date();day.setDate(day.getDate()-i);const key=day.toDateString();orderDays.push({label:day.toLocaleDateString('en-IN',{weekday:'short'}),count:d.orders.filter(o=>new Date(o.createdAt).toDateString()===key).length});}
  const max=Math.max(1,...orderDays.map(x=>x.count));
  const recent=[...d.orders].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return `${adminHeader('Store overview','The important numbers and store activity, all in one view.')}
    <div class="admin-stats">${statCard('Product listings',d.products.length,'Across 12 collections','bag')}${statCard('Customer accounts',d.customers.length,'Registered demo shoppers','users')}${statCard('Orders to manage',pending,`${d.orders.length} total order(s)`,'package')}${statCard('Demo order value',currency(revenue),'Sample sales · not real revenue','chart')}</div>
    <div class="admin-two-col"><section class="admin-panel"><div class="admin-panel-head"><div><h2>Order activity</h2><p>Orders created during the last seven days.</p></div><span class="pill">Demo data</span></div><div class="admin-chart">${orderDays.map(x=>`<div class="chart-col"><div class="chart-bar" style="height:${Math.max(5,Math.round(x.count/max*78))}%" title="${x.count} order(s)"></div><span>${x.label}</span></div>`).join('')}</div><p class="form-note" style="margin-top:12px">The chart updates as demo orders are placed. Sample orders do not represent real sales.</p></section><section class="admin-panel"><div class="admin-panel-head"><div><h2>Quick actions</h2><p>Make changes directly in the portal.</p></div></div><div class="admin-quick-actions"><button data-action="admin-tab" data-tab="products"><b>＋ Add a product</b><span>Create a listing or update its image, stock and price.</span></button><button data-action="admin-tab" data-tab="categories"><b>✳ Manage offers</b><span>Update category discounts and descriptions.</span></button><button data-action="admin-tab" data-tab="reviews"><b>☆ Review moderation</b><span>Publish or hide customer stories.</span></button><button data-action="admin-tab" data-tab="storefront"><b>⚙ Storefront copy</b><span>Change the public homepage messaging.</span></button></div></section></div>
    <section class="admin-panel"><div class="admin-panel-head"><div><h2>Recent orders</h2><p>Update an order's demo fulfilment status below.</p></div><button class="admin-icon-btn" data-action="admin-tab" data-tab="orders">Manage all orders ${icon('arrow')}</button></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Quantity</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody>${adminOrderRows(recent,5)}</tbody></table></div></section>`;
}
function renderAdminProductForm() {
  const p=state.editingProduct; const cats=state.categories;
  return `<section class="admin-panel" id="product-editor"><div class="admin-panel-head"><div><h2>${p?'Edit product listing':'Add a product'}</h2><p>${p?`Editing ${esc(p.name)} · Changes save immediately to the catalogue.`:'Create a new listing without modifying any source code.'}</p></div>${p?`<button class="admin-icon-btn" data-action="cancel-product-edit">${icon('close')} Cancel edit</button>`:''}</div><form data-form="admin-product"><input type="hidden" name="id" value="${esc(p?.id||'')}"><div class="admin-form-grid"><div class="field"><label>Product name *</label><input name="name" required minlength="2" maxlength="100" value="${esc(p?.name||'')}" placeholder="e.g. Urban Weekend Carry"></div><div class="field"><label>Category *</label><select name="category" required>${cats.map(c=>`<option value="${esc(c.slug)}" ${(p?.category||cats[0]?.slug)===c.slug?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label>Price (₹) *</label><input name="price" type="number" min="1" max="1000000" required value="${p?.price??''}" placeholder="1499"></div><div class="field"><label>Discount (%)</label><input name="discount" type="number" min="0" max="80" value="${p?.discount??10}" required></div><div class="field"><label>Stock quantity</label><input name="stock" type="number" min="0" max="100000" value="${p?.stock??10}" required></div><div class="field"><label>Image URL or local asset path</label><input name="image" value="${esc(p?.image||'')}" placeholder="/assets/products-photo-png/college-01.png or https://…"><span class="tiny muted">Use one of the bundled high-resolution product photos or an HTTPS image.</span></div><div class="field field-full"><label>Upload an image (optional)</label><input type="file" name="imageFile" accept="image/png,image/jpeg,image/webp"><span class="tiny muted">PNG, JPG or WEBP, maximum 3 MB. A new upload will replace the image path above.</span><img data-image-preview src="${esc(p?.image||'')}" alt="Image preview" style="${p?.image?'display:block':'display:none'};max-width:90px;max-height:80px;object-fit:cover;border-radius:9px;margin-top:8px"></div><div class="field field-full"><label>Description</label><textarea name="description" maxlength="500" placeholder="Add a concise product description…">${esc(p?.description||'')}</textarea></div><label class="admin-checkbox field-full"><input type="checkbox" name="featured" ${p?.featured?'checked':''}> Feature this product on the signed-in homepage</label></div><div class="admin-form-footer"><span class="muted">Changes are stored in <code>data/store.json</code>.</span><button class="btn btn-primary" type="submit">${p?'Save product changes':'Create product'} ${icon('check')}</button></div></form></section>`;
}
function renderAdminProducts() {
  const d=state.adminData; let products=[...d.products];
  if(state.adminCategoryFilter!=='all') products=products.filter(p=>p.category===state.adminCategoryFilter);
  if(state.adminSearch.trim()) {const q=state.adminSearch.trim().toLowerCase();products=products.filter(p=>`${p.name} ${p.sku} ${p.id}`.toLowerCase().includes(q));}
  const total=products.length; const display=state.adminSearch.trim()||state.adminCategoryFilter!=='all'?products:products.slice(0,60);
  return `${adminHeader('Product catalogue','Manage all listings, prices, stock, descriptions and product images.',`<button class="btn btn-primary btn-sm" data-action="new-product">${icon('plus')} Add product</button>`)}
    ${renderAdminProductForm()}<section class="admin-panel"><div class="admin-panel-head"><div><h2>All product listings</h2><p>Search across all ${d.products.length} products, or filter by collection.</p></div><span class="pill">${d.products.length} listings</span></div><div class="admin-toolbar"><input class="filter-input" type="search" id="admin-product-search" value="${esc(state.adminSearch)}" placeholder="Search name, SKU or ID…"><select id="admin-category-filter" class="admin-select"><option value="all">All categories</option>${d.categories.map(c=>`<option value="${esc(c.slug)}" ${state.adminCategoryFilter===c.slug?'selected':''}>${esc(c.name)}</option>`).join('')}</select><span class="result-count">Showing ${display.length} of ${total}</span></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Offer</th><th>Stock</th><th>Actions</th></tr></thead><tbody>${display.length?display.map(p=>`<tr><td><div class="admin-product-cell"><img src="${esc(p.image)}" alt=""><div><b>${esc(p.name)}</b><span>${esc(p.sku||p.id)}${p.featured?' · Featured':''}</span></div></div></td><td>${esc(categoryOf(p.category)?.short||p.category)}</td><td><strong>${currency(p.price)}</strong><div class="tiny muted">Now ${currency(discounted(p))}</div></td><td><span class="pill">${p.discount||0}% OFF</span></td><td>${p.stock}</td><td><div class="admin-actions"><button class="admin-icon-btn" data-action="edit-product" data-id="${esc(p.id)}">${icon('edit')} Edit</button><button class="admin-icon-btn danger" data-action="delete-product" data-id="${esc(p.id)}" aria-label="Delete ${esc(p.name)}">${icon('trash')}</button></div></td></tr>`).join(''):`<tr><td colspan="6" class="admin-empty">No products matched. Try a shorter search or another category.</td></tr>`}</tbody></table></div>${!state.adminSearch.trim()&&state.adminCategoryFilter==='all'&&total>display.length?`<p class="form-note" style="margin-top:12px">Showing the first ${display.length} listings to keep this page fast. Search by product name, SKU or ID to reach any of the remaining items.</p>`:''}</section>`;
}
function renderAdminCategories() {
  const d=state.adminData;
  return `${adminHeader('Categories & offers','Manage collection descriptions and current demo discounts. Updating a category offer updates its products too.')}
    <section class="admin-panel"><div class="admin-panel-head"><div><h2>Collection settings</h2><p>Changes appear on the customer website right after saving.</p></div><span class="pill">${d.categories.length} categories</span></div><div class="admin-category-grid">${d.categories.map(c=>`<article class="admin-category-card"><img src="${esc(sampleProduct(c.slug)?.image||'/assets/products-photo-png/college-01.png')}" alt=""><div><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><form data-form="admin-category" data-slug="${esc(c.slug)}"><div class="admin-form-grid" style="grid-template-columns:1fr 1fr;gap:7px"><div class="field"><label>Display name</label><input name="name" value="${esc(c.name)}" required></div><div class="field"><label>Discount (%)</label><input name="discount" type="number" min="0" max="60" value="${c.discount}" required></div><div class="field field-full"><label>Collection description</label><input name="description" value="${esc(c.description)}" required></div></div><div style="margin-top:9px"><button class="btn btn-outline btn-sm" type="submit">Save ${icon('check')}</button></div></form></div></article>`).join('')}</div></section>`;
}
function renderAdminReviews() {
  const d=state.adminData;
  return `${adminHeader('Customer reviews','Add new review stories, edit the wording, and publish or hide them from the public website.')}
    <section class="admin-panel"><div class="admin-panel-head"><div><h2>Add a review</h2><p>Use genuine demo copy, set the rating and choose whether it is visible.</p></div></div><form data-form="admin-review"><div class="admin-form-grid"><div class="field"><label>Reviewer name *</label><input name="name" required minlength="2" placeholder="Reviewer name"></div><div class="field"><label>Role / label</label><input name="role" value="Verified customer" placeholder="Verified customer"></div><div class="field"><label>Rating</label><select name="rating"><option value="5">5.0 stars</option><option value="4.5" selected>4.5 stars</option><option value="4">4.0 stars</option><option value="3.5">3.5 stars</option><option value="3">3.0 stars</option></select></div><div class="field"><label>Product name</label><input name="productName" placeholder="Product / collection"></div><div class="field field-full"><label>Review headline</label><input name="title" placeholder="A great everyday carry"></div><div class="field field-full"><label>Review text *</label><textarea name="text" required minlength="8" placeholder="Write the customer review…"></textarea></div><label class="admin-checkbox field-full"><input type="checkbox" name="visible" checked> Publish on the website</label></div><div class="admin-form-footer"><span class="muted">Published reviews appear on the home preview and About page.</span><button class="btn btn-primary" type="submit">Add review ${icon('plus')}</button></div></form></section>
    <section class="admin-panel"><div class="admin-panel-head"><div><h2>Review library</h2><p>${d.reviews.filter(r=>r.visible!==false).length} published · ${d.reviews.filter(r=>r.visible===false).length} hidden</p></div></div>${d.reviews.map(r=>`<article class="admin-review-card"><div><div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap"><strong>${esc(r.name)}</strong><span class="starline">${stars(r.rating)}</span><span class="status-pill ${r.visible===false?'':'green'}">${r.visible===false?'Hidden':'Published'}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p><div class="tiny muted" style="margin-top:7px">${esc(r.role||'')} · ${esc(r.productName||'VAYORA collection')}</div></div><div class="admin-review-actions"><button class="admin-icon-btn" data-action="toggle-review" data-id="${esc(r.id)}" data-visible="${r.visible===false?'true':'false'}">${icon(r.visible===false?'eye':'eyeoff')} ${r.visible===false?'Publish':'Hide'}</button><button class="admin-icon-btn danger" data-action="delete-review" data-id="${esc(r.id)}">${icon('trash')} Delete</button></div></article>`).join('')}</section>`;
}
function renderAdminOrders() {
  const d=state.adminData; const orders=[...d.orders].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return `${adminHeader('Orders & fulfilment','Every sample checkout appears here. Update the status to test the customer order-history workflow.')}
    <section class="admin-panel"><div class="admin-panel-head"><div><h2>Order register</h2><p>Track payment mode, value, buyer and fulfilment status.</p></div><span class="pill">${orders.length} orders</span></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update status</th></tr></thead><tbody>${adminOrderRows(orders)}</tbody></table></div><div class="admin-note">Payments in this project are simulated for demonstration. The order value is a sample order total, not a real transaction or revenue figure.</div></section>`;
}
function renderAdminMessages() {
  const messages=[...(state.adminData.contacts||[])].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return `${adminHeader('Customer messages','Messages submitted through the public Contact page land here in the local database.')}
    <section class="admin-panel"><div class="admin-panel-head"><div><h2>Inbox</h2><p>${messages.filter(m=>m.status==='New').length} new · ${messages.length} total</p></div></div>${messages.length?`<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Received</th><th>Customer</th><th>Subject</th><th>Message</th><th>Status</th><th>Action</th></tr></thead><tbody>${messages.map(m=>`<tr><td>${new Date(m.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}<div class="tiny muted">${new Date(m.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div></td><td><strong>${esc(m.name)}</strong><div class="tiny muted">${esc(m.email)}</div></td><td>${esc(m.subject||'General query')}</td><td style="min-width:220px;max-width:340px;white-space:normal">${esc(m.message)}</td><td><span class="status-pill ${m.status==='New'?'':'green'}">${esc(m.status)}</span></td><td>${m.status==='New'?`<button class="admin-icon-btn" data-action="message-reviewed" data-id="${esc(m.id)}">Mark reviewed</button>`:'—'}</td></tr>`).join('')}</tbody></table></div>`:`<div class="admin-empty">No messages received yet. Send a message through the storefront Contact form to test this workflow.</div>`}</section>`;
}
function renderAdminCustomers() {
  const customers=state.adminData.customers||[];
  return `${adminHeader('Customer accounts','Customer accounts created through Sign up and the published demo shopper credential.')}
    <section class="admin-panel"><div class="admin-panel-head"><div><h2>Registered shoppers</h2><p>Account details are visible to admins; passwords are never shown.</p></div><span class="pill">${customers.length} accounts</span></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Customer</th><th>Email</th><th>Joined</th><th>Orders</th><th>Order value</th></tr></thead><tbody>${customers.map(c=>{const orders=state.adminData.orders.filter(o=>o.userId===c.id);return `<tr><td><div class="admin-product-cell"><div class="avatar">${initials(c.name)}</div><div><b>${esc(c.name)}</b><span>${esc(c.id.slice(0,20))}</span></div></div></td><td>${esc(c.email)}</td><td>${new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td><td>${orders.length}</td><td><strong>${currency(orders.filter(o=>o.status!=='Cancelled').reduce((s,o)=>s+Number(o.total||0),0))}</strong></td></tr>`}).join('')}</tbody></table></div><div class="admin-note">This demo admin view intentionally does not expose passwords or password hashes.</div></section>`;
}
function renderAdminStorefront() {
  const s=state.adminData.settings;
  return `${adminHeader('Storefront settings','Update the customer-facing homepage copy and store contact details without editing source files.')}
    <section class="admin-panel admin-store-settings"><div class="admin-panel-head"><div><h2>Homepage & brand messaging</h2><p>Changes publish on the next storefront refresh.</p></div><span class="pill">Live demo settings</span></div><form data-form="admin-settings"><div class="admin-form-grid"><div class="field"><label>Brand tagline</label><input name="tagline" maxlength="160" value="${esc(s.tagline||'')}" required></div><div class="field"><label>Hero button text</label><input name="heroCta" maxlength="80" value="${esc(s.heroCta||'Explore the collection')}" required></div><div class="field field-full"><label>Announcement strip</label><input name="announcement" maxlength="400" value="${esc(s.announcement||'')}" required></div><div class="field field-full"><label>Homepage headline</label><input name="heroTitle" maxlength="160" value="${esc(s.heroTitle||'')}" required></div><div class="field field-full"><label>Homepage description</label><textarea name="heroSubtitle" maxlength="400" required>${esc(s.heroSubtitle||'')}</textarea></div><div class="field"><label>Support email</label><input name="supportEmail" type="email" value="${esc(s.supportEmail||'')}" required></div><div class="field"><label>Support phone</label><input name="supportPhone" value="${esc(s.supportPhone||'')}" required></div><div class="field"><label>Storewide extra discount (%)</label><input name="storewideDiscount" type="number" min="0" max="50" value="${Number(s.storewideDiscount||0)}" required></div></div><div class="admin-form-footer"><span class="muted">Store name and brand logo are fixed in this demo bundle.</span><button type="submit" class="btn btn-primary">Save storefront settings ${icon('check')}</button></div></form></section>
    <section class="admin-panel"><div class="admin-panel-head"><div><h2>Image management</h2><p>Change individual product images inside Products, or add a new image through the product editor.</p></div></div><p class="small">The 300 locally bundled photographic product images are stored in <code>public/assets/products-photo-png/</code>. On the Products tab, edit any listing to set a different bundled asset path or upload a PNG, JPG or WEBP image. Uploaded files are saved under <code>public/assets/uploads/</code> and linked to the product record.</p></section>`;
}
function renderAdminPage() {
  if (!state.adminData) {
    if (!state._loadingAdmin) { state._loadingAdmin=true; api('/api/admin/state').then(d=>{state.adminData=d;state.categories=d.categories;state.products=d.products;state.reviews=d.reviews.filter(r=>r.visible!==false);state.settings=d.settings;state._loadingAdmin=false;render();}).catch(e=>{state._loadingAdmin=false;showToast(e.message,'error');go('/admin-login');}); }
    return adminShell(`${adminHeader('Loading the workspace','Connecting to the store database…')}<section class="admin-panel"><div class="skeleton" style="height:110px"></div><div class="skeleton" style="height:220px;margin-top:14px"></div></section>`);
  }
  const page = ({dashboard:renderAdminDashboard,products:renderAdminProducts,categories:renderAdminCategories,reviews:renderAdminReviews,orders:renderAdminOrders,messages:renderAdminMessages,customers:renderAdminCustomers,storefront:renderAdminStorefront})[state.adminTab] || renderAdminDashboard;
  return adminShell(page());
}

function animateHomeCounters() {
  const nodes = document.querySelectorAll('[data-counter]');
  nodes.forEach(node => {
    const target = Number(node.dataset.counter || 0);
    const decimals = Number(node.dataset.decimals || 0);
    const suffix = node.dataset.suffix || '';
    const duration = target >= 100 ? 720 : 560;
    const start = performance.now();
    node.textContent = `${decimals ? '0.' + '0'.repeat(decimals) : '0'}${suffix}`;
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      node.textContent = `${value.toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
      else node.textContent = `${target.toFixed(decimals)}${suffix}`;
    };
    requestAnimationFrame(tick);
  });
}

function render() {
  const path = location.pathname;
  if (state.user?.role === 'admin' && !path.startsWith('/admin') && !['/','/about','/contact','/login','/signup'].includes(path)) {
    if (path !== '/admin') { history.replaceState({}, '', '/admin'); return render(); }
  }
  if (path.startsWith('/admin')) {
    if (path === '/admin-login') { app.innerHTML=layout(renderAdminLogin()); return; }
    if (!state.user || state.user.role !== 'admin') { history.replaceState({}, '', '/admin-login'); app.innerHTML=layout(renderAdminLogin()); return; }
    app.innerHTML = renderAdminPage(); return;
  }
  if (isProtected(path) && !state.user) { state.pendingRoute = state.pendingRoute || path + location.search; history.replaceState({}, '', '/login'); app.innerHTML=layout(renderAuth('login')); return; }
  if (path === '/login' || path === '/signup') { app.innerHTML=layout(renderAuth(path==='/signup'?'signup':'login')); return; }
  if (path === '/categories') { app.innerHTML=layout(renderCategoryIndex()); return; }
  if (path.startsWith('/category/')) { app.innerHTML=layout(renderCategory(decodeURIComponent(path.slice('/category/'.length)))); return; }
  if (path.startsWith('/product/')) { app.innerHTML=layout(renderProduct(decodeURIComponent(path.slice('/product/'.length)))); return; }
  if (path === '/search') { app.innerHTML=layout(renderSearch(new URLSearchParams(location.search).get('q')||'')); return; }
  if (path === '/about') { app.innerHTML=layout(renderAbout()); return; }
  if (path === '/contact') { app.innerHTML=layout(renderContact()); return; }
  if (path === '/wishlist') { app.innerHTML=layout(renderWishlist()); return; }
  if (path === '/cart') { app.innerHTML=layout(renderCart()); return; }
  if (path === '/checkout') { app.innerHTML=layout(renderCheckout()); return; }
  if (path.startsWith('/order-success/')) { app.innerHTML=layout(renderOrderSuccess(decodeURIComponent(path.slice('/order-success/'.length)))); return; }
  if (path === '/profile') { app.innerHTML=layout(renderProfile()); return; }
  app.innerHTML=layout(renderHome());
  animateHomeCounters();
}

async function refreshAfterAdminMutation(message) {
  try { await refreshStore(); await refreshAdmin(); }
  catch (e) { showToast(e.message, 'error'); return; }
  showToast(message || 'Changes saved.');
}
function formObject(form) { return Object.fromEntries(new FormData(form).entries()); }
function setLoading(button, yes, label) { if (!button) return; if (yes) { button.dataset.oldLabel=button.innerHTML; button.disabled=true; button.innerHTML=label || 'Working…'; } else { button.disabled=false; if (button.dataset.oldLabel) button.innerHTML=button.dataset.oldLabel; delete button.dataset.oldLabel; } }


function renderSearchSuggestions(input) {
  const box = input.closest('.searchbox-wrap')?.querySelector('.search-suggestions');
  if (!box) return;
  const raw = input.value.trim();
  if (!raw) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
  const q = raw.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = q.split(' ').filter(Boolean);
  const normalized = value => String(value || '').toLowerCase();
  const categoryScore = c => {
    const text = normalized([c.name, c.short, c.slug, c.description].join(' '));
    let score = 0;
    if (text.includes(q)) score += 12;
    for (const token of tokens) if (text.includes(token)) score += token.length > 2 ? 4 : 1;
    if (tokens.some(token => ['bag','bags','backpack','backpacks'].includes(token))) score += 2;
    return score;
  };
  const productScore = p => {
    const category = categoryOf(p.category);
    const text = normalized([p.name, category?.name, category?.short, p.description, p.sku].join(' '));
    let score = 0;
    if (normalized(p.name).includes(q)) score += 18;
    if (normalized(category?.name).includes(q) || normalized(category?.short).includes(q) || normalized(p.category).includes(q)) score += 12;
    if (text.includes(q)) score += 8;
    for (const token of tokens) if (text.includes(token)) score += token.length > 2 ? 3 : 1;
    if (tokens.some(token => ['bag','bags','backpack','backpacks'].includes(token))) score += p.featured ? 3 : 1;
    if (p.featured) score += 1;
    score += Number(p.rating || 0) / 10;
    return score;
  };
  const matchesCategories = [...state.categories].map(c => ({item:c,score:categoryScore(c)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  const matchesProducts = [...state.products].map(p => ({item:p,score:productScore(p)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  const rows = [];
  const addCategory = c => rows.push(`<button type="button" class="suggestion-row" role="option" data-suggest-route="/category/${esc(c.slug)}"><span class="suggestion-icon">${icon('grid')}</span><span><b>${esc(c.name)}</b><small>Bag collection</small></span><span class="suggestion-arrow" aria-hidden="true">↗</span></button>`);
  const addProduct = p => rows.push(`<button type="button" class="suggestion-row" role="option" data-suggest-route="${esc(productHref(p))}"><img src="${esc(p.image)}" alt=""><span><b>${esc(p.name)}</b><small>${esc(categoryOf(p.category)?.name || p.category)} · ${currency(discounted(p))}</small></span><span class="suggestion-arrow" aria-hidden="true">↗</span></button>`);
  matchesCategories.slice(0,2).forEach(x=>addCategory(x.item));
  matchesProducts.forEach(x=>{if(rows.length<5)addProduct(x.item);});
  // Always show five useful bag suggestions, even when the typed phrase has no exact match.
  if(rows.length<5) {
    const fallback = [...state.products].filter(p=>!rows.some(row=>row.includes(`data-suggest-route="${productHref(p)}"`))).sort((a,b)=>Number(b.featured)-Number(a.featured)||Number(b.rating||0)-Number(a.rating||0));
    fallback.forEach(p=>{if(rows.length<5)addProduct(p);});
  }
  box.innerHTML = `<div class="suggestion-heading">${matchesCategories.length || matchesProducts.length ? `Suggestions for “${esc(raw)}”` : `Popular bags related to “${esc(raw)}”`}</div>${rows.slice(0,5).join('')}<button type="button" class="suggestion-see-all" data-suggest-query="${esc(raw)}">See all results for “${esc(raw)}” →</button>`;
  box.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}

document.addEventListener('input', event => {
  if (event.target.matches('[data-live-search]')) renderSearchSuggestions(event.target);
});
document.addEventListener('focusin', event => {
  if (event.target.matches('[data-live-search]') && event.target.value.trim()) renderSearchSuggestions(event.target);
});
document.addEventListener('click', event => {
  const suggestion = event.target.closest('[data-suggest-route],[data-suggest-query]');
  if (suggestion) {
    event.preventDefault();
    const input = suggestion.closest('.searchbox-wrap')?.querySelector('[data-live-search]');
    if (input) input.setAttribute('aria-expanded', 'false');
    if (suggestion.dataset.suggestRoute) go(suggestion.dataset.suggestRoute);
    else go(`/search?q=${encodeURIComponent(suggestion.dataset.suggestQuery || input?.value || '')}`);
    return;
  }
  if (!event.target.closest('.searchbox-wrap')) document.querySelectorAll('.search-suggestions').forEach(box => { box.hidden = true; });
});

app.addEventListener('click', async (event) => {
  const routeEl = event.target.closest('[data-route]');
  if (routeEl && !event.target.closest('[data-action]')) {
    event.preventDefault(); go(routeEl.getAttribute('data-route')); return;
  }
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;
  const action=actionEl.dataset.action; const id=actionEl.dataset.id;
  if (action === 'mobile-menu') { state.mobileNav=!state.mobileNav; render(); return; }
  if (action === 'scroll-samples') { event.preventDefault(); document.getElementById('sample-collections')?.scrollIntoView({behavior:'smooth'}); return; }
  if (action === 'logout') { state.user=null;state.token='';state.pendingRoute='';state.profileOrders=null;state.adminData=null;saveAuth();showToast('You have signed out.');go('/');return; }
  if (action === 'fill-demo') {
    const role=actionEl.dataset.role;
    const email=document.querySelector(role==='admin'?'#admin-email':'#auth-email');
    const password=document.querySelector(role==='admin'?'#admin-password':'#auth-password');
    if(email)email.value=role==='admin'?'admin@vayora.demo':'user@vayora.demo';
    if(password)password.value=role==='admin'?'Admin@123':'Vayora@123';
    showToast(`${role==='admin'?'Admin':'Customer'} demo credentials filled.`);return;
  }
  if (action === 'admin-tab') { state.adminTab=actionEl.dataset.tab||'dashboard';state.editingProduct=null;state.adminSearch='';state.adminCategoryFilter='all';render();return; }
  if (action === 'new-product') { state.editingProduct=null; render(); document.getElementById('product-editor')?.scrollIntoView({behavior:'smooth',block:'start'}); return; }
  if (action === 'cancel-product-edit') { state.editingProduct=null;render();return; }
  if (action === 'edit-product') { state.editingProduct=state.adminData.products.find(p=>p.id===id)||null;render();document.getElementById('product-editor')?.scrollIntoView({behavior:'smooth',block:'start'});return; }
  if (action === 'delete-product') {
    const p=state.adminData?.products.find(x=>x.id===id); if(!p)return;
    if(!window.confirm(`Delete “${p.name}” from the catalogue? This cannot be undone.`))return;
    try{await api(`/api/admin/products/${encodeURIComponent(id)}`,{method:'DELETE'});state.editingProduct=null;await refreshAfterAdminMutation('Product deleted.');}catch(e){showToast(e.message,'error');}return;
  }
  if (action === 'checkout-add-address') {
    const extra = document.getElementById('checkout-extra-address');
    if (extra) { extra.hidden = false; actionEl.disabled = true; extra.scrollIntoView({behavior:'smooth',block:'nearest'}); }
    return;
  }
  if (action === 'checkout-remove-address') {
    const extra = document.getElementById('checkout-extra-address');
    if (extra) { extra.hidden = true; extra.querySelectorAll('input').forEach(input=>{ if(input.type==='radio') input.checked=false; else input.value=''; }); }
    const add = document.querySelector('[data-action=checkout-add-address]'); if(add) add.disabled=false;
    const primary = document.querySelector('[name=deliveryAddressChoice][value=primary]'); if(primary) primary.checked=true;
    ['ship-address1','ship-city','ship-district','ship-state','ship-pincode'].forEach(id=>{const el=document.getElementById(id);if(el)el.required=true;});
    ['ship-alt-address1','ship-alt-city','ship-alt-district','ship-alt-state','ship-alt-pincode'].forEach(id=>{const el=document.getElementById(id);if(el)el.required=false;});
    return;
  }
  if (action === 'add-profile-address') {
    const form = document.getElementById('profile-form');
    if (!form) return;
    const current = Object.fromEntries(new FormData(form).entries());
    current.photo = state.profileDraft?.photo || current.photoSaved || '';
    current.addressCount = Math.min(10, (Number(current.addressCount) || 1) + 1);
    state.profileDraft = current;
    render();
    document.querySelector('.profile-address-block:last-child')?.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  if (action === 'product-view') {
    const image=document.getElementById('detail-main-image');
    const stage=document.getElementById('detail-image-stage');
    if(!image || !stage)return;
    const view=actionEl.dataset.view||'front';
    image.classList.remove('view-detail','view-finish','view-alternate');
    stage.classList.remove('is-zoomed');
    if(view==='detail') image.classList.add('view-detail');
    if(view==='finish') image.classList.add('view-finish');
    if(view==='alternate') image.classList.add('view-alternate');
    const labels={front:'Front view · product photograph',detail:'Detail zoom · illustrative crop',finish:'Finish detail · illustrative crop',alternate:'Alternate visual preview · mirrored demo view'};
    const label=document.getElementById('gallery-view-label'); if(label) label.textContent=labels[view]||labels.front;
    document.querySelectorAll('.detail-thumb').forEach(btn=>btn.classList.toggle('active',btn===actionEl));
    return;
  }
  if (action === 'product-zoom') { actionEl.classList.toggle('is-zoomed'); return; }
  if (action === 'product-variant') { const variant=productOf(id); if(variant) go(productHref(variant)); return; }
  if (action === 'buy-now-detail') {
    if(!state.user){state.pendingRoute=location.pathname;go('/login');return;}
    const p=productOf(id); if(!p)return; if(p.stock<1){showToast('This demo product is out of stock.','error');return;}
    const qty=Math.max(1,Math.min(20,Number(document.getElementById('product-quantity-select')?.value)||state.productQty||1));
    state.productQty=qty; state.cart[id]=Math.min(20,(Number(state.cart[id])||0)+qty);saveCart();go('/checkout');return;
  }
  if (action === 'bundle-add') {
    if(!state.user){state.pendingRoute=location.pathname;go('/login');return;}
    const ids=(actionEl.dataset.ids||'').split(',').filter(Boolean);
    ids.forEach(pid=>{const product=productOf(pid);if(product&&product.stock>0)state.cart[pid]=Math.min(20,(Number(state.cart[pid])||0)+1);});
    saveCart();go('/cart');return;
  }
  if (action === 'wishlist-toggle') {
    if(!state.user){state.pendingRoute=location.pathname;go('/login');return;}
    if(state.wishlist.includes(id)){state.wishlist=state.wishlist.filter(x=>x!==id);showToast('Removed from your wishlist.');}
    else{state.wishlist.unshift(id);showToast('Saved to your wishlist.');}
    saveWishlist();render();return;
  }
  if (action === 'add-cart' || action === 'add-cart-detail') {
    if(!state.user){state.pendingRoute=location.pathname;go('/login');return;}
    const p=productOf(id); if(!p)return; if(p.stock<1){showToast('This demo product is out of stock.','error');return;}
    const qty=action==='add-cart-detail'?Math.max(1,Math.min(20,Number(document.getElementById('product-quantity-select')?.value)||state.productQty||1)):1;
    state.cart[id]=Math.min(20,(Number(state.cart[id])||0)+qty);saveCart();showToast(`${p.name} added to your cart.`);render();return;
  }
  if (action === 'qty-up') { state.productQty=Math.min(20,state.productQty+1);render();return; }
  if (action === 'qty-down') { state.productQty=Math.max(1,state.productQty-1);render();return; }
  if (action === 'cart-qty') {
    const next=(Number(state.cart[id])||1)+Number(actionEl.dataset.delta||0);
    if(next<=0) delete state.cart[id]; else state.cart[id]=Math.min(20,next);
    saveCart();render();return;
  }
  if (action === 'remove-cart') { delete state.cart[id];saveCart();showToast('Item removed from your cart.');render();return; }
  if (action === 'clear-cart') { if(window.confirm('Clear all items from your cart?')){state.cart={};saveCart();showToast('Your cart is empty.');render();}return; }
  if (action === 'clear-category-filter') { const input=document.getElementById('category-filter'); if(input)input.value='';go(location.pathname);return; }
  if (action === 'search-all') {go('/categories');return;}
  if (action === 'toggle-review') {
    const r=state.adminData.reviews.find(x=>x.id===id);if(!r)return;
    try{await api(`/api/admin/reviews/${encodeURIComponent(id)}`,{method:'PUT',body:{visible:actionEl.dataset.visible==='true'}});await refreshAfterAdminMutation(actionEl.dataset.visible==='true'?'Review published.':'Review hidden from the website.');}catch(e){showToast(e.message,'error');}return;
  }
  if (action === 'delete-review') {
    const r=state.adminData.reviews.find(x=>x.id===id);if(!r)return;
    if(!window.confirm(`Delete the review by ${r.name}?`))return;
    try{await api(`/api/admin/reviews/${encodeURIComponent(id)}`,{method:'DELETE'});await refreshAfterAdminMutation('Review deleted.');}catch(e){showToast(e.message,'error');}return;
  }
  if (action === 'update-order') {
    const select=document.querySelector(`[data-order-status="${CSS.escape(id)}"]`);if(!select)return;
    try{await api(`/api/admin/orders/${encodeURIComponent(id)}`,{method:'PATCH',body:{status:select.value}});await refreshAfterAdminMutation(`Order ${id} updated to “${select.value}”.`);}catch(e){showToast(e.message,'error');}return;
  }
  if (action === 'message-reviewed') {
    try{await api('/api/admin/contacts',{method:'PATCH',body:{id,status:'Reviewed'}});await refreshAfterAdminMutation('Message marked as reviewed.');}catch(e){showToast(e.message,'error');}return;
  }
});

app.addEventListener('submit', async (event) => {
  const form=event.target.closest('form[data-form]'); if(!form)return;
  event.preventDefault(); const type=form.dataset.form; const button=form.querySelector('button[type="submit"]');
  if(type==='search') { const q=new FormData(form).get('q')||'';go(`/search?q=${encodeURIComponent(String(q).trim())}`);return; }
  if(type==='newsletter') { form.reset(); showToast('Thanks for your interest — newsletter sign-up is a demo preview only.'); return; }
  if(type==='login'||type==='signup'||type==='admin-login') {
    const data=formObject(form); const signup=type==='signup'; const role=type==='admin-login'?'admin':'customer';
    setLoading(button,true,signup?'Creating account…':'Signing in…');
    try {
      const result=await api(signup?'/api/auth/signup':'/api/auth/login',{method:'POST',body:signup?data:{email:data.email,password:data.password,role},auth:false});
      state.user=result.user;state.token=result.token;saveAuth();state.profileOrders=null;state.adminData=null;
      if(state.user.role==='admin'){state.pendingRoute='';state.adminTab='dashboard';showToast('Welcome to the VAYORA admin studio.');go('/admin');}
      else{const target=state.pendingRoute||'/';state.pendingRoute='';showToast(signup?'Your account is ready. Welcome to VAYORA!':'Signed in successfully.');go(target);}
    } catch(e) { setLoading(button,false); showToast(e.message,'error'); }
    return;
  }
  if(type==='contact') {
    const data=formObject(form);setLoading(button,true,'Sending message…');
    try{const result=await api('/api/contact',{method:'POST',body:data,auth:false});form.reset();setLoading(button,false);showToast(result.message||'Message sent.');}
    catch(e){setLoading(button,false);showToast(e.message,'error');}return;
  }
  if(type==='profile') {
    const data=formObject(form);
    const photo = state.profileDraft?.photo || data.photoSaved || '';
    delete data.profilePhoto; delete data.photoSaved;
    data.photo = photo; data.addressCount = Math.max(1, Number(data.addressCount) || 1);
    const all = getJson('vayoraProfileDetails', {});
    const oldEmail = String(state.user?.email || '').toLowerCase();
    const newEmail = String(data.email || oldEmail).toLowerCase();
    all[newEmail] = data;
    if(oldEmail !== newEmail) delete all[oldEmail];
    localStorage.setItem('vayoraProfileDetails', JSON.stringify(all));
    state.profileDraft = data;
    state.user = {...state.user, name: `${data.firstName || ''} ${data.lastName || ''}`.trim(), email: data.email || state.user?.email};
    saveAuth();
    showToast('Your profile and address book have been saved.');
    render(); return;
  }
  if(type==='checkout') {
    const data=formObject(form); const items=allCartLines().map(x=>({id:x.product.id,qty:x.qty}));
    const useAlternate=data.deliveryAddressChoice==='alternate';
    const first=String(data.firstName||'').trim(), last=String(data.lastName||'').trim();
    const address1=useAlternate?String(data.altAddress1||'').trim():String(data.address1||'').trim();
    const address2=useAlternate?String(data.altAddress2||'').trim():String(data.address2||'').trim();
    const landmark=useAlternate?String(data.altLandmark||'').trim():String(data.landmark||'').trim();
    const city=useAlternate?String(data.altCity||'').trim():String(data.city||'').trim();
    const district=useAlternate?String(data.altDistrict||'').trim():String(data.district||'').trim();
    const shipState=useAlternate?String(data.altState||'').trim():String(data.state||'').trim();
    const pincode=useAlternate?String(data.altPincode||'').trim():String(data.pincode||'').trim();
    if(useAlternate && (!address1 || !city || !district || !shipState || !/^[0-9]{6}$/.test(pincode))) { showToast('Complete the selected alternate delivery address, including its 6-digit PIN code.','error'); return; }
    const address=[address1,address2,landmark?`Landmark: ${landmark}`:''].filter(Boolean).join(', ');
    const payload={items,shipping:{name:`${first} ${last}`.trim(),email:data.email,phone:data.phone,address,city,district,state:shipState,pincode,addressType:useAlternate?'Alternate':data.addressType},paymentMethod:data.paymentMethod};
    setLoading(button,true,'Placing demo order…');
    try{const result=await api('/api/orders',{method:'POST',body:payload});state.lastOrder=result.order;localStorage.setItem(LS.order,JSON.stringify(result.order));state.cart={};saveCart();state.profileOrders=null;showToast('Demo order placed.');go(`/order-success/${encodeURIComponent(result.order.id)}`);}
    catch(e){setLoading(button,false);showToast(e.message,'error');}return;
  }
  if(type==='admin-product') {
    const data=formObject(form);const id=data.id;const file=form.querySelector('input[name="imageFile"]')?.files?.[0];setLoading(button,true,'Saving listing…');
    try{
      let image=data.image;
      if(file){if(file.size>3*1024*1024)throw new ApiError('Please use an image smaller than 3 MB.');const valid=['image/png','image/jpeg','image/webp'];if(!valid.includes(file.type))throw new ApiError('Upload a PNG, JPG or WEBP image.');const dataUrl=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=()=>reject(new ApiError('Could not read the selected image.'));fr.readAsDataURL(file);});const uploaded=await api('/api/admin/upload',{method:'POST',body:{dataUrl}});image=uploaded.image;}
      const payload={name:data.name,category:data.category,price:Number(data.price),discount:Number(data.discount),stock:Number(data.stock),description:data.description||'',featured:form.querySelector('[name="featured"]').checked};if(image)payload.image=image;
      if(id) await api(`/api/admin/products/${encodeURIComponent(id)}`,{method:'PUT',body:payload}); else await api('/api/admin/products',{method:'POST',body:payload});
      state.editingProduct=null;setLoading(button,false);await refreshAfterAdminMutation(id?'Product updated successfully.':'New product added to the catalogue.');
    }catch(e){setLoading(button,false);showToast(e.message,'error');}return;
  }
  if(type==='admin-category') {
    const data=formObject(form);const slug=form.dataset.slug;setLoading(button,true,'Saving…');
    try{await api(`/api/admin/categories/${encodeURIComponent(slug)}`,{method:'PUT',body:{name:data.name,description:data.description,discount:Number(data.discount)}});setLoading(button,false);await refreshAfterAdminMutation(`${data.name} collection settings saved.`);}catch(e){setLoading(button,false);showToast(e.message,'error');}return;
  }
  if(type==='admin-review') {
    const data=formObject(form);data.rating=Number(data.rating);data.visible=form.querySelector('[name="visible"]').checked;setLoading(button,true,'Adding review…');
    try{await api('/api/admin/reviews',{method:'POST',body:data});form.reset();setLoading(button,false);await refreshAfterAdminMutation('Customer review added.');}catch(e){setLoading(button,false);showToast(e.message,'error');}return;
  }
  if(type==='admin-settings') {
    const data=formObject(form);data.storewideDiscount=Number(data.storewideDiscount);setLoading(button,true,'Publishing…');
    try{await api('/api/admin/settings',{method:'PUT',body:data});setLoading(button,false);await refreshAfterAdminMutation('Storefront messaging saved.');}catch(e){setLoading(button,false);showToast(e.message,'error');}return;
  }
});

app.addEventListener('change', (event) => {
  if(event.target.name === 'deliveryAddressChoice') {
    const useAlternate = event.target.value === 'alternate';
    const primaryIds = ['ship-address1','ship-city','ship-district','ship-state','ship-pincode'];
    const alternateIds = ['ship-alt-address1','ship-alt-city','ship-alt-district','ship-alt-state','ship-alt-pincode'];
    primaryIds.forEach(id=>{const el=document.getElementById(id);if(el)el.required=!useAlternate;});
    alternateIds.forEach(id=>{const el=document.getElementById(id);if(el)el.required=useAlternate;});
    return;
  }
  if(event.target.id === 'profile-photo' && event.target.files?.[0]) {
    const file = event.target.files[0];
    if(!file.type.startsWith('image/')) { showToast('Choose an image file for your profile photo.','error'); event.target.value=''; return; }
    if(file.size > 5*1024*1024) { showToast('Please choose a profile photo smaller than 5 MB.','error'); event.target.value=''; return; }
    const reader = new FileReader();
    reader.onload = () => {
      state.profileDraft = {...(state.profileDraft || {}), photo: String(reader.result || '')};
      const avatar = document.querySelector('.profile-photo-avatar');
      if(avatar) avatar.innerHTML = `<img src="${String(reader.result || '')}" alt="Your profile photo">`;
      const hidden = document.querySelector('[name="photoSaved"]'); if(hidden) hidden.value = String(reader.result || '');
      showToast('Photo selected. Save your profile to keep it.');
    };
    reader.readAsDataURL(file); return;
  }
  if(event.target.matches('[data-catalog-filter]')) {
    const params = new URLSearchParams(location.search);
    const key = event.target.dataset.catalogFilter || '';
    if(event.target.value) params.set(key,event.target.value); else params.delete(key);
    params.set('q',document.getElementById('category-filter')?.value||'');
    params.set('sort',document.getElementById('category-sort')?.value||'featured');
    go(`${location.pathname}?${params.toString()}`); return;
  }
  if(event.target.id==='category-sort'||event.target.id==='category-filter') {
    const params = new URLSearchParams(location.search);
    const q=document.getElementById('category-filter')?.value||'';
    const sort=document.getElementById('category-sort')?.value||'featured';
    if(q) params.set('q',q); else params.delete('q');
    params.set('sort',sort);
    go(`${location.pathname}?${params.toString()}`);return;
  }
  if(event.target.id==='product-quantity-select') { state.productQty=Math.max(1,Math.min(20,Number(event.target.value)||1)); return; }
  if(event.target.id==='admin-category-filter') {state.adminCategoryFilter=event.target.value;state.adminSearch=document.getElementById('admin-product-search')?.value||'';render();return;}
  if(event.target.name==='imageFile'&&event.target.files?.[0]) {
    const file=event.target.files[0];if(file.size>3*1024*1024){event.target.value='';showToast('Please use an image smaller than 3 MB.','error');return;}
    const url=formImagePreviewUrl(file); const form=event.target.closest('form');let prev=form?.querySelector('[data-image-preview]');if(prev){prev.src=url;prev.style.display='block';}
  }
});
function formImagePreviewUrl(file) { try{return URL.createObjectURL(file);}catch{return '';} }
app.addEventListener('input', (event) => {
  if(event.target.id==='admin-product-search') {state.adminSearch=event.target.value;const start=event.target.selectionStart;const end=event.target.selectionEnd;render();const n=document.getElementById('admin-product-search');if(n){n.focus();n.setSelectionRange(start,end);}return;}
});
window.addEventListener('popstate', () => { state.mobileNav=false;render(); });

(async function boot(){
  try{await refreshStore();}
  catch(e){app.innerHTML=`<main class="noscript" style="max-width:660px;margin:80px auto;padding:25px"><img src="/assets/logo.svg" style="width:180px"><h1 style="font-size:31px">VAYORA can't reach its backend yet.</h1><p>${esc(e.message)}</p><p>From the project folder, run <code>node server.js</code> and refresh this page.</p></main>`;return;}
  if(state.user?.role==='admin'&&state.token){try{await refreshAdmin();}catch{state.user=null;state.token='';saveAuth();}}
  render();
  startHomeReviewRotation();
})();