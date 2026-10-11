# VAYORA — Carry Beyond

A responsive full-stack bag-shopping demo in a yellow / white / black / grey visual system. The storefront uses plain HTML, CSS and browser JavaScript with a zero-dependency Node.js backend; no database service or framework install is required.

## Run locally

1. Install Node.js 18 or newer.
2. Extract this folder and open a terminal inside `vayora-store`.
3. Run `npm start` (or `node server.js`).
4. Open **http://localhost:4173**.

The local server serves the customer site, admin portal, assets, and API. Admin changes are persisted in `data/store.json`.

## Demo credentials

**Customer**
- Email: `user@vayora.demo`
- Password: `Vayora@123`

**Admin**
- URL: **http://localhost:4173/admin-login**
- Email: `admin@vayora.demo`
- Password: `Admin@123`

## What's included

- **300 locally bundled, photo-style bag product images** across 12 categories with 25 distinct designs per category.
- Photographic widescreen travel hero, a continuously scrolling category rail, five featured bag cards, a seamless marquee of five customer-review cards (pauses on hover), customer stories, and an infinitely scrolling brand marquee directly above the dark footer.
- Responsive header, search, product/category pages, wishlist, cart, demo checkout, profile and order history.
- Admin dashboard for products, uploaded product imagery, prices, discounts, stock, category copy/offers, customer reviews, order status, customers, contact enquiries, and storefront messaging.
- Yellow / white / charcoal / grey theme, Manrope + DM Sans typography, custom logo and favicon.
- About page with a Chinnamanur Agraharam location, neighbourhood map/directions, town notes, shop promises, and the customer-owner message.
- Product photography is bundled locally so the catalog does not rely on remote image URLs; the Google Fonts request has system fallbacks.

## Image management

Open **Admin studio → Products → Add a product** (or edit any product). Use a bundled image path such as `/assets/products-photo-png/travel-01.png`, provide an HTTPS image URL, or upload PNG/JPG/WEBP (up to 3 MB). Uploaded files are saved under `public/assets/uploads/`.

## Demo checkout notice

Payments are simulated and no real card/UPI transactions, emails, or shipping labels are created. Do not enter real payment details.

## Project structure

```text
vayora-store/
  server.js
  package.json
  data/seed.json
  data/store.json
  public/
    index.html
    css/styles.css
    js/app.js
    assets/logo.svg
    assets/favicon.svg
    assets/products-photo-png/   # 300 transparent-background product PNGs
    assets/photos/           # campaign photography
```

## Before production

This project is a demo prototype, not production-ready commerce software. Before public deployment, use HTTPS, a production database, stronger authentication/session protections, request rate limiting, secure secrets, real payment-provider integration, and a proper email/shipping workflow.
