'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const PORT = Number(process.env.PORT || 4173);
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'vayora-local-demo-secret-change-for-real-deployments';

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function passHash(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}
function addDemoUser(db, email, password, role, name) {
  const normalized = email.toLowerCase();
  if (db.users.some((u) => u.email === normalized)) return;
  const salt = crypto.randomBytes(16).toString('hex');
  db.users.push({ id: `user-${crypto.randomUUID()}`, name, email: normalized, role, salt, passwordHash: passHash(password, salt), createdAt: new Date().toISOString() });
}
function loadDb() {
  let db;
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } else {
    db = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    addDemoUser(db, 'user@vayora.demo', 'Vayora@123', 'customer', 'Demo Shopper');
    addDemoUser(db, 'admin@vayora.demo', 'Admin@123', 'admin', 'VAYORA Admin');
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.orders)) db.orders = [];
  if (!Array.isArray(db.contacts)) db.contacts = [];
  // Ensure the published demo credentials remain available in a reset database.
  addDemoUser(db, 'user@vayora.demo', 'Vayora@123', 'customer', 'Demo Shopper');
  addDemoUser(db, 'admin@vayora.demo', 'Admin@123', 'admin', 'VAYORA Admin');
  saveDb(db);
  return db;
}
let db = loadDb();
function saveDb(next = db) {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2));
  fs.renameSync(tmp, DB_FILE);
}
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}
function signToken(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest();
  let received;
  try { received = Buffer.from(sig, 'base64url'); } catch { return null; }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.id || data.exp < Date.now()) return null;
    const user = db.users.find((u) => u.id === data.id && u.role === data.role);
    return user || null;
  } catch { return null; }
}
function currentUser(req) {
  const auth = req.headers.authorization || '';
  return verifyToken(auth.startsWith('Bearer ') ? auth.slice(7) : '');
}
function requireUser(req, res, role) {
  const user = currentUser(req);
  if (!user) { sendJson(res, 401, { error: 'Please sign in to continue.' }); return null; }
  if (role && user.role !== role) { sendJson(res, 403, { error: 'This area is available to administrators only.' }); return null; }
  return user;
}
function sendJson(res, status, value) {
  const out = JSON.stringify(value);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(out), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(out);
}
function readBody(req, maxBytes = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let chunks = [], size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) { reject(Object.assign(new Error('Request is too large.'), { status: 413 })); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(Object.assign(new Error('Request body must be valid JSON.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}
function text(v, max = 500) { return String(v ?? '').trim().slice(0, max); }
function num(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function uid(prefix) { return `${prefix}-${crypto.randomUUID()}`; }
function safeImage(value) {
  const v = text(value, 1500);
  return v.startsWith('/assets/') || /^https:\/\//i.test(v) ? v : '';
}
function notFound(res, message = 'Not found.') { sendJson(res, 404, { error: message }); }
function badRequest(res, message) { sendJson(res, 400, { error: message }); }
function adminState() {
  return {
    categories: db.categories,
    products: db.products,
    reviews: db.reviews,
    settings: db.settings,
    orders: [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    customers: db.users.filter((u) => u.role === 'customer').map(publicUser),
    contacts: [...db.contacts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  };
}

async function api(req, res, url) {
  const pathname = url.pathname;
  const method = req.method.toUpperCase();
  if (method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' }); return res.end(); }
  if (pathname === '/api/health' && method === 'GET') return sendJson(res, 200, { ok: true, brand: 'VAYORA', products: db.products.length });

  if (pathname === '/api/bootstrap' && method === 'GET') {
    return sendJson(res, 200, {
      categories: db.categories,
      products: db.products,
      reviews: db.reviews.filter((r) => r.visible !== false),
      settings: db.settings,
      counts: { products: db.products.length, categories: db.categories.length }
    });
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await readBody(req);
    const email = text(body.email, 180).toLowerCase();
    const password = String(body.password || '');
    const requestedRole = body.role === 'admin' ? 'admin' : 'customer';
    const user = db.users.find((u) => u.email === email && u.role === requestedRole);
    if (!user || passHash(password, user.salt) !== user.passwordHash) return sendJson(res, 401, { error: 'Email, password or account type does not match.' });
    return sendJson(res, 200, { token: signToken(user), user: publicUser(user) });
  }

  if (pathname === '/api/auth/signup' && method === 'POST') {
    const body = await readBody(req);
    const name = text(body.name, 90);
    const email = text(body.email, 180).toLowerCase();
    const password = String(body.password || '');
    if (name.length < 2) return badRequest(res, 'Please enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest(res, 'Please enter a valid email address.');
    if (password.length < 8) return badRequest(res, 'Use a password with at least 8 characters.');
    if (db.users.some((u) => u.email === email)) return sendJson(res, 409, { error: 'An account with this email already exists. Please sign in.' });
    const salt = crypto.randomBytes(16).toString('hex');
    const user = { id: uid('user'), name, email, role: 'customer', salt, passwordHash: passHash(password, salt), createdAt: new Date().toISOString() };
    db.users.push(user); saveDb();
    return sendJson(res, 201, { token: signToken(user), user: publicUser(user) });
  }

  if (pathname === '/api/contact' && method === 'POST') {
    const body = await readBody(req);
    const contact = { id: uid('contact'), name: text(body.name, 100), email: text(body.email, 180), subject: text(body.subject, 160), message: text(body.message, 1800), createdAt: new Date().toISOString(), status: 'New' };
    if (!contact.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) || contact.message.length < 8) return badRequest(res, 'Please complete your name, a valid email, and a message.');
    db.contacts.push(contact); saveDb();
    return sendJson(res, 201, { ok: true, message: 'Thanks — your message has been sent to the demo store team.' });
  }

  if (pathname === '/api/orders' && method === 'POST') {
    const user = requireUser(req, res, 'customer'); if (!user) return;
    const body = await readBody(req);
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (!rawItems.length) return badRequest(res, 'Your cart is empty.');
    if (rawItems.length > 100) return badRequest(res, 'Too many different items in one order.');
    const items = [];
    for (const line of rawItems) {
      const product = db.products.find((p) => p.id === line.id);
      const qty = Math.max(1, Math.min(20, Math.floor(num(line.qty, 1))));
      if (!product) return badRequest(res, 'One of the products in your cart is no longer available.');
      if (product.stock < qty) return badRequest(res, `${product.name} has only ${product.stock} available.`);
      const effectiveDiscount = Math.min(80, Number(product.discount || 0) + Number(db.settings.storewideDiscount || 0));
      const unitPrice = Math.round(product.price * (100 - effectiveDiscount) / 100);
      items.push({ id: product.id, name: product.name, image: product.image, qty, unitPrice, lineTotal: unitPrice * qty });
    }
    const subtotal = items.reduce((sum, p) => sum + p.lineTotal, 0);
    const shipping = subtotal >= 1999 ? 0 : 99;
    const order = {
      id: `VY${Date.now().toString().slice(-8)}${crypto.randomInt(10, 99)}`,
      userId: user.id, customerName: text(body.shipping?.name || user.name, 100), customerEmail: user.email, deliveryEmail: text(body.shipping?.email || user.email, 180),
      phone: text(body.shipping?.phone, 30), address: text(body.shipping?.address, 240), addressType: text(body.shipping?.addressType || 'Home', 30), city: text(body.shipping?.city, 90), district: text(body.shipping?.district, 90), state: text(body.shipping?.state, 90), pincode: text(body.shipping?.pincode, 12),
      items, subtotal, shipping, total: subtotal + shipping,
      paymentMethod: ['UPI', 'Card', 'Net Banking', 'Cash on delivery'].includes(body.paymentMethod) ? body.paymentMethod : 'UPI',
      paymentStatus: body.paymentMethod === 'Cash on delivery' ? 'Pay on delivery' : 'Demo payment successful',
      status: 'Order placed', isDemo: true, createdAt: new Date().toISOString()
    };
    if (order.phone.length < 8 || order.address.length < 8 || order.city.length < 2 || order.pincode.length < 4) return badRequest(res, 'Please complete the delivery address and contact details.');
    for (const line of items) { const product = db.products.find((p) => p.id === line.id); product.stock -= line.qty; }
    db.orders.push(order); saveDb();
    return sendJson(res, 201, { order });
  }

  if (pathname === '/api/orders' && method === 'GET') {
    const user = requireUser(req, res); if (!user) return;
    const own = user.role === 'admin' ? db.orders : db.orders.filter((o) => o.userId === user.id);
    return sendJson(res, 200, { orders: [...own].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  }

  if (pathname.startsWith('/api/orders/') && method === 'GET') {
    const user = requireUser(req, res); if (!user) return;
    const order = db.orders.find((o) => o.id === decodeURIComponent(pathname.split('/').pop()));
    if (!order || (user.role !== 'admin' && order.userId !== user.id)) return notFound(res, 'Order not found.');
    return sendJson(res, 200, { order });
  }

  if (pathname.startsWith('/api/admin/')) {
    const admin = requireUser(req, res, 'admin'); if (!admin) return;
    if (pathname === '/api/admin/state' && method === 'GET') return sendJson(res, 200, adminState());

    if (pathname === '/api/admin/products' && method === 'POST') {
      const body = await readBody(req);
      const category = db.categories.find((c) => c.slug === body.category);
      const name = text(body.name, 100);
      const price = Math.round(num(body.price, 0));
      if (!category || name.length < 2 || price < 1) return badRequest(res, 'Enter a product name, valid category and price.');
      const item = { id: uid(category.slug), name, category: category.slug, price, discount: Math.max(0, Math.min(80, Math.round(num(body.discount, category.discount)))), rating: Math.max(0, Math.min(5, num(body.rating, 4.5))), reviewCount: Math.max(0, Math.floor(num(body.reviewCount, 0))), sku: text(body.sku || `VY-${category.slug.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`, 50), description: text(body.description || `${name}: made for the everyday carry.`, 500), color: text(body.color || '#F4C928', 30), image: safeImage(body.image) || '/assets/products-photo-png/college-01.png', featured: Boolean(body.featured), stock: Math.max(0, Math.floor(num(body.stock, 10))) };
      db.products.unshift(item); saveDb(); return sendJson(res, 201, { product: item });
    }

    const prodMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
    if (prodMatch && method === 'PUT') {
      const body = await readBody(req); const product = db.products.find((p) => p.id === decodeURIComponent(prodMatch[1]));
      if (!product) return notFound(res, 'Product not found.');
      if (body.category && !db.categories.some((c) => c.slug === body.category)) return badRequest(res, 'Choose a valid category.');
      if (body.name !== undefined) product.name = text(body.name, 100);
      if (body.category !== undefined) product.category = body.category;
      if (body.price !== undefined) product.price = Math.max(1, Math.round(num(body.price, product.price)));
      if (body.discount !== undefined) product.discount = Math.max(0, Math.min(80, Math.round(num(body.discount, product.discount))));
      if (body.stock !== undefined) product.stock = Math.max(0, Math.floor(num(body.stock, product.stock)));
      if (body.description !== undefined) product.description = text(body.description, 500);
      if (body.featured !== undefined) product.featured = Boolean(body.featured);
      if (body.image !== undefined) { const image = safeImage(body.image); if (!image) return badRequest(res, 'Image must be a local /assets/ path or an HTTPS URL.'); product.image = image; }
      saveDb(); return sendJson(res, 200, { product });
    }
    if (prodMatch && method === 'DELETE') {
      const id = decodeURIComponent(prodMatch[1]); const before = db.products.length;
      db.products = db.products.filter((p) => p.id !== id);
      if (before === db.products.length) return notFound(res, 'Product not found.');
      saveDb(); return sendJson(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/reviews' && method === 'POST') {
      const body = await readBody(req); const rating = num(body.rating, 5);
      if (text(body.name, 90).length < 2 || text(body.text, 1000).length < 8 || rating < 1 || rating > 5) return badRequest(res, 'Enter a reviewer name, review text and a rating from 1 to 5.');
      const review = { id: uid('review'), name: text(body.name, 90), role: text(body.role || 'Verified customer', 80), rating: Math.round(rating * 10) / 10, title: text(body.title || 'A great everyday carry', 120), text: text(body.text, 1000), productName: text(body.productName || 'VAYORA collection', 100), productId: text(body.productId, 80), visible: body.visible !== false };
      db.reviews.unshift(review); saveDb(); return sendJson(res, 201, { review });
    }
    const reviewMatch = pathname.match(/^\/api\/admin\/reviews\/([^/]+)$/);
    if (reviewMatch && method === 'PUT') {
      const body = await readBody(req); const review = db.reviews.find((r) => r.id === decodeURIComponent(reviewMatch[1]));
      if (!review) return notFound(res, 'Review not found.');
      for (const key of ['name','role','title','text','productName','productId']) if (body[key] !== undefined) review[key] = text(body[key], key === 'text' ? 1000 : 140);
      if (body.rating !== undefined) review.rating = Math.max(1, Math.min(5, num(body.rating, review.rating)));
      if (body.visible !== undefined) review.visible = Boolean(body.visible);
      saveDb(); return sendJson(res, 200, { review });
    }
    if (reviewMatch && method === 'DELETE') {
      const id = decodeURIComponent(reviewMatch[1]); const before = db.reviews.length; db.reviews = db.reviews.filter((r) => r.id !== id);
      if (before === db.reviews.length) return notFound(res, 'Review not found.'); saveDb(); return sendJson(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/settings' && method === 'PUT') {
      const body = await readBody(req);
      for (const key of ['tagline','announcement','heroTitle','heroSubtitle','heroCta','supportEmail','supportPhone']) if (body[key] !== undefined) db.settings[key] = text(body[key], key.includes('Subtitle') || key === 'announcement' ? 400 : 160);
      if (body.storewideDiscount !== undefined) db.settings.storewideDiscount = Math.max(0, Math.min(50, Math.round(num(body.storewideDiscount, 0))));
      saveDb(); return sendJson(res, 200, { settings: db.settings });
    }
    const catMatch = pathname.match(/^\/api\/admin\/categories\/([^/]+)$/);
    if (catMatch && method === 'PUT') {
      const body = await readBody(req); const cat = db.categories.find((c) => c.slug === decodeURIComponent(catMatch[1]));
      if (!cat) return notFound(res, 'Category not found.');
      if (body.name !== undefined) cat.name = text(body.name, 90);
      if (body.description !== undefined) cat.description = text(body.description, 400);
      if (body.discount !== undefined) { cat.discount = Math.max(0, Math.min(60, Math.round(num(body.discount, cat.discount)))); for (const p of db.products.filter((p) => p.category === cat.slug)) p.discount = cat.discount; }
      saveDb(); return sendJson(res, 200, { category: cat });
    }
    const orderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
    if (orderMatch && method === 'PATCH') {
      const body = await readBody(req); const order = db.orders.find((o) => o.id === decodeURIComponent(orderMatch[1]));
      if (!order) return notFound(res, 'Order not found.');
      const allowed = ['Order placed','Packed','Shipped','Out for delivery','Delivered','Cancelled'];
      if (!allowed.includes(body.status)) return badRequest(res, 'Select a supported order status.');
      order.status = body.status; order.updatedAt = new Date().toISOString(); saveDb(); return sendJson(res, 200, { order });
    }
    if (pathname === '/api/admin/contacts' && method === 'GET') return sendJson(res, 200, { contacts: db.contacts });
    if (pathname === '/api/admin/contacts' && method === 'PATCH') {
      const body = await readBody(req); const contact = db.contacts.find((c) => c.id === body.id);
      if (!contact) return notFound(res, 'Message not found.'); contact.status = text(body.status || 'Reviewed', 30); saveDb(); return sendJson(res, 200, { contact });
    }

    if (pathname === '/api/admin/upload' && method === 'POST') {
      const body = await readBody(req, 5 * 1024 * 1024);
      const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.dataUrl || ''));
      if (!match) return badRequest(res, 'Upload a PNG, JPG or WEBP image. SVG uploads are disabled for safety.');
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 3 * 1024 * 1024) return badRequest(res, 'Please use an image smaller than 3 MB.');
      const ext = match[1] === 'image/png' ? 'png' : match[1] === 'image/webp' ? 'webp' : 'jpg';
      const uploadDir = path.join(PUBLIC_DIR, 'assets', 'uploads'); fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      return sendJson(res, 201, { image: `/assets/uploads/${filename}` });
    }
    return notFound(res, 'Admin endpoint not found.');
  }

  return notFound(res, 'API endpoint not found.');
}

const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.json':'application/json; charset=utf-8' };
function serveStatic(req, res, url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { pathname = '/'; }
  if (pathname === '/') pathname = '/index.html';
  const resolved = path.resolve(PUBLIC_DIR, `.${pathname}`);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep) && resolved !== path.join(PUBLIC_DIR, 'index.html')) { res.writeHead(403); return res.end('Forbidden'); }
  const file = fs.existsSync(resolved) && fs.statSync(resolved).isFile() ? resolved : path.join(PUBLIC_DIR, 'index.html');
  fs.readFile(file, (err, content) => {
    if (err) { res.writeHead(500); return res.end('Unable to load the page.'); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else if (['GET','HEAD'].includes(req.method.toUpperCase())) serveStatic(req, res, url);
    else { res.writeHead(405, { 'Content-Type':'text/plain; charset=utf-8' }); res.end('Method not allowed'); }
  } catch (error) {
    if (res.headersSent || res.writableEnded) return;
    sendJson(res, error.status || 500, { error: error.status ? error.message : 'Something went wrong on the demo server.' });
    if (!error.status) console.error(error);
  }
});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\nVAYORA demo store is running at http://localhost:${PORT}`);
  console.log('Customer: user@vayora.demo / Vayora@123');
  console.log('Admin:    admin@vayora.demo / Admin@123\n');
});
