# Gate Frontend

A modern Next.js frontend for Gate.co.id - Indonesia's leading game and digital voucher top-up platform.

## Features

- 🎮 Game & voucher top-up marketplace
- 🌙 Light/Dark mode support
- 🌐 Multi-language (Indonesian & English)
- 💰 Multi-currency support (IDR, MYR, PHP, SGD, THB)
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🔐 User authentication (email/password, Google OAuth)
- 💳 Multiple payment methods (E-Wallet, Virtual Account, QRIS, etc.)
- 📊 User dashboard with transaction history

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State Management:** React Context API

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
# Create .env.local file
cp .env.example .env.local
```

4. Add your logo files:
   - Place `logo.svg` in `public/` directory
   - Place `favicon.ico` in `public/` directory

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── [locale]/              # Locale-based routing (e.g., id-id, sg-en)
│   │   ├── (auth)/            # Authentication pages
│   │   ├── account/           # User dashboard pages
│   │   ├── [slug]/            # Dynamic product detail pages
│   │   ├── invoice/           # Invoice/payment pages
│   │   └── check-transaction/ # Check transaction page
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
├── components/
│   ├── layout/                # Layout components (Header, Footer, Sidebar)
│   ├── modals/                # Modal components
│   └── ui/                    # Reusable UI components
├── contexts/                  # React Context providers
├── lib/                       # Utilities, API functions, locale config
└── types/                     # TypeScript type definitions
```

## URL Structure

URLs follow the pattern: `/{region}-{language}/...`

**Supported Regions:**
- `id` - Indonesia (IDR)
- `my` - Malaysia (MYR)
- `sg` - Singapore (SGD)
- `ph` - Philippines (PHP)
- `th` - Thailand (THB)

**Supported Languages:**
- `id` - Bahasa Indonesia
- `en` - English

**Examples:**
- `/id-id` - Indonesia with Indonesian language
- `/id-en` - Indonesia with English language
- `/sg-en` - Singapore with English language
- `/my-en/mobile-legends` - Malaysia product page in English

## Key Pages

- `/{locale}` - Home page with banners, promos, and product listings
- `/{locale}/login` - User login
- `/{locale}/register` - User registration
- `/{locale}/forgot-password` - Password recovery
- `/{locale}/[slug]` - Product detail and checkout
- `/{locale}/invoice/[invoiceNumber]` - Payment status
- `/{locale}/account` - User profile
- `/{locale}/account/transactions` - Transaction history
- `/{locale}/account/mutations` - Balance mutations
- `/{locale}/account/reports` - Daily reports
- `/{locale}/account/topup` - Balance top-up
- `/{locale}/check-transaction` - Check transaction by invoice number

## API Integration

The frontend integrates with the Gate API v2. See `MAIN_COMPLETE_DOCS.md` for full API documentation.

### Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```env
# API Endpoint
# For local development: http://localhost:8080
# For production: https://gateway.gate.co.id
NEXT_PUBLIC_API_ENDPOINT=http://localhost:8080
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_ENDPOINT` | API base URL | `https://gateway.gate.co.id` |

### Auto Geo-Detection

The application automatically detects the user's location based on IP address:
- Uses headers: `x-vercel-ip-country`, `cf-ipcountry`, `x-geo-country`
- Indonesia visitors → `id-id` (Indonesian language, IDR)
- Singapore visitors → `sg-en` (English, SGD)
- Malaysia visitors → `my-en` (English, MYR)
- Other countries → `id-id` (default)

For testing geo-detection in development, add `?_country=XX` to the URL:
```
http://localhost:3000/?_country=SG  # Test as Singapore
http://localhost:3000/?_country=ID  # Test as Indonesia
http://localhost:3000/?_country=MY  # Test as Malaysia
```

## Customization

### Theme Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#3F83F8',
        600: '#1C64F2',
        // ... customize as needed
      },
      gate: {
        blue: '#1565C0',
        // ... add brand colors
      }
    }
  }
}
```

### Logo

Replace the files in `public/`:
- `logo.svg` - Main logo (recommended: 120x40px)
- `favicon.ico` - Browser favicon (recommended: 32x32px)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- ESLint for code linting
- TypeScript for type safety
- Tailwind CSS for styling

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker**

### Vercel Deployment

```bash
npm install -g vercel
vercel
```

## License

All rights reserved © 2025 PT Gerbang Solusi Digital

## Support

For support, contact:
- Email: support@gate.co.id
- WhatsApp: Check the website footer

