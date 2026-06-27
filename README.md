# 🎌 Figure World — Premium Anime & Action Figures Store

A modern, dark-themed React e-commerce website for selling anime, sci-fi, and superhero action figures. Built with React + Vite + plain CSS, using a small backend catalog for shared products and LocalStorage for per-visitor cart/admin state.

---

## ✨ Features

### 🛍 Customer-facing
- **Home** with cinematic hero, category tiles, featured & limited-edition sections
- **Shop** with search, category filter, sort, and responsive product grid
- **Product Details** with image gallery, quantity selector, related products
- **Cart** with quantity controls, totals, and WhatsApp checkout
- **404 Not Found** page
- Mobile-friendly navbar with hamburger menu
- Smooth animations, hover effects, neon/gold gradients

### 🔐 Admin Panel (`/admin`)
- Frontend-only password protection (`admin123`)
- **Add / Edit / Delete products**
- **Add / Delete categories**
- **Upload multiple images** (saved through backend storage)
- **Delete individual images** before saving
- Tabbed UI for Products & Categories

### 💬 WhatsApp Order System
On checkout, generates a pre-formatted WhatsApp message with:
- Customer name, phone, address
- Each product name, quantity, unit price
- Grand total
- Opens `wa.me/...` link in a new tab

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- **Node.js 18+** and npm (or pnpm/yarn)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open the URL Vite prints (usually http://localhost:5173)
```

### Build for production
```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```

---

## ⚙️ Configuration

### 1. Change the WhatsApp number
Open `src/utils/whatsapp.js` and replace:
```js
export const WHATSAPP_NUMBER = '91XXXXXXXXXX'
```
with your real number — **include the country code, no `+`, no spaces** (e.g. `919876543210`).

### 2. Change the admin password
Open `src/context/ShopContext.jsx`, find:
```js
if (password === 'admin123') { ... }
```
and replace `admin123` with your password.

⚠️ **This is NOT secure** — anyone reading the JS source can see the password. This is purely a demo gate.

### 3. Manage products
Open `/admin`, add categories, then add products. Products and categories are loaded from the backend catalog.

---

## 📂 Project Structure

```
figure-world/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                # React entry
    ├── App.jsx                 # Routes
    ├── index.css               # All styles (dark anime premium theme)
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   └── ProductCard.jsx
    ├── context/
    │   └── ShopContext.jsx     # Global state + catalog API logic
    ├── pages/
    │   ├── Home.jsx
    │   ├── Shop.jsx
    │   ├── ProductDetails.jsx
    │   ├── Cart.jsx
    │   ├── Admin.jsx
    │   └── NotFound.jsx
    └── utils/
        ├── storage.js          # LocalStorage helpers
        └── whatsapp.js         # Order message builder
```

---

## 🌐 Deploy to Netlify or Vercel

This is a Vite app with Netlify functions for the shared catalog and uploads.

### Netlify
1. Push the repo to GitHub
2. On Netlify: **New site → Import from Git**
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add a redirect for SPA routing — create `public/_redirects` with:
   ```
   /*    /index.html   200
   ```

### Vercel
1. Push to GitHub
2. **Import Project** on vercel.com
3. Framework preset: **Vite**
4. Done — Vercel auto-detects everything.

---

## ⚠️ Important: How Storage Works Here

Products and categories come from the backend catalog. Visitor-specific state still lives in the browser:

| What | Where it's stored | Who can see it |
|------|---------|---------------|
| **Products/categories** | Backend catalog | ✅ Everyone, on any device |
| **Cart items** | Visitor's browser LocalStorage | ❌ Only on that same browser/device |
| **Admin login state** | Visitor's browser LocalStorage | ❌ Only on that same browser/device |

### 🔑 Key implication
If you, the site owner, add a product through `/admin`, other visitors can see it after the catalog saves successfully.

---

## 🔐 Admin Access

- URL: `https://yourdomain.com/admin`
- Password: `admin123`
- ⚠️ **This is a fake security layer.** The password is in plain JS and anyone can:
  1. Read it from DevTools, or
  2. Just set `localStorage.fw_admin_auth = "true"` to bypass it.
- Use this only for demos, personal use, or as a starting point. For real security, you need a backend with proper authentication.

---

## 🎨 Design Notes

- **Theme**: Dark base (`#06060c`), neon pink + purple + gold accents
- **Fonts**: Orbitron (headings), Bebas Neue (hero), Inter (body)
- **Animations**: Hover lifts, gradient text, glowing orbs, pulse rings
- **Responsive**: Mobile-first; hamburger nav on screens ≤ 900px

---

## 📜 License

Free to use, modify, and ship. No attribution required.

Enjoy! 🚀
