
# 6ixlab (Catalog Only, Free)

A free, no-backend product catalog built with **Next.js 14 + Tailwind**.  
Deploy to **Vercel** for free — no payment system, no maintenance.

## Quick Start
```bash
# 1) Install deps
npm i

# 2) Run locally
npm run dev

# 3) Build
npm run build

# 4) Start production server
npm start
```

## Deploy (Free)
- Create a GitHub repo, push this project.
- On **Vercel**, click "New Project" → import the repo → Deploy.
- You get a free HTTPS URL like `https://yourproject.vercel.app/`.
- Optional: attach your custom domain later.

## Edit Products
Open `app/page.tsx` and modify the `PRODUCTS` array (name, price, images, etc.).  
Place your product images in `/public/images/` then reference with `/images/yourfile.jpg`.

## Notes
- This is **catalog only** (no checkout/payment).
- All assets are local. Tailwind is included.
- Images are SVG placeholders — replace with real photos (1200×1500 suggested).
!!!+!