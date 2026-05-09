# Evolvv E-Commerce

Modern premium streetwear storefront for **Evolvv** with a black-and-white luxury aesthetic, responsive storefront pages, JWT auth, MongoDB models, Stripe checkout, Cloudinary uploads, wishlist/reviews APIs, and an admin panel.

## Folder Structure

```txt
evolvv-commerce/
├─ app/
│  ├─ api/
│  │  ├─ auth/login
│  │  ├─ auth/signup
│  │  ├─ cart
│  │  ├─ checkout
│  │  ├─ orders
│  │  ├─ products
│  │  ├─ reviews
│  │  ├─ upload
│  │  └─ wishlist
│  ├─ about
│  ├─ admin
│  ├─ cart
│  ├─ checkout
│  ├─ login
│  ├─ product/[id]
│  ├─ shop
│  └─ signup
├─ components/
├─ lib/
├─ models/
├─ public/
├─ scripts/
└─ README.md
```

## Tech Stack

- Next.js App Router and React
- Tailwind CSS
- MongoDB with Mongoose
- JWT auth stored in an HTTP-only cookie
- Stripe Checkout
- Cloudinary image upload
- Framer Motion for smooth storefront animation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

3. Fill in:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/evolvv
JWT_SECRET=replace-with-a-long-random-secret
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. Seed sample products and an admin:

```bash
npm run seed
```

Default admin:

```txt
Email: admin@evolvv.com
Password: ChangeMe123!
```

5. Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Logo

The navbar logo is placed at the top right as requested. A clean temporary mark is included at `public/evolvv-logo.svg`. To use your provided logo, replace that file or update the image path in `components/Navbar.jsx`.

## Key Pages

- `/` - homepage with hero, featured products, and smooth reveal sections
- `/shop` - product grid with search, category, size, and price filters
- `/product/evolvv-void-hoodie` - product detail with size selector and add to cart
- `/cart` - live cart quantity and price updates
- `/checkout` - address form and Stripe Checkout handoff
- `/login` and `/signup` - JWT auth
- `/admin` - add/edit/delete products, upload product images, and view orders

## Deployment

### MongoDB Atlas

1. Create an Atlas cluster.
2. Create a database user.
3. Add your production IP access rule, or use Vercel's recommended network access settings.
4. Copy the connection string into `MONGODB_URI`.

### Stripe

1. Create Stripe API keys.
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Set `NEXT_PUBLIC_APP_URL` to the production Vercel URL.

### Cloudinary

1. Create a Cloudinary account.
2. Copy cloud name, API key, and API secret into Vercel environment variables.

### Vercel

1. Push the project to GitHub.
2. Import it in Vercel.
3. Add every variable from `.env.example`.
4. Deploy.
5. Run the seed script locally against Atlas once, or create products from `/admin` after logging in as an admin.

## Notes

- The storefront shows bundled sample products before MongoDB is configured, so the UI is immediately reviewable.
- After MongoDB is connected and products exist, the shop hydrates from `/api/products`.
- Stripe checkout requires valid Stripe keys and a reachable MongoDB connection.
