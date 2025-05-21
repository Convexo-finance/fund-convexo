# Papayapp - ETH Cali Wallet

A simple Ethereum wallet application built with Next.js and Privy for authentication. This application allows users to authenticate with email or phone, access their Ethereum wallet, and use smart accounts on the Optimism network.

## Deployment on Vercel

This project is configured for automatic deployment and monitoring with Vercel:

### Initial Setup

1. Install the Vercel CLI (optional but recommended for local development):
   ```bash
   npm install -g vercel
   ```

2. Link your local project to a Vercel project:
   ```bash
   vercel link
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Environment Variables

These are already configured in vercel.json, but you can override them in the Vercel dashboard:

- `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy App ID
- `NEXT_PUBLIC_BICONOMY_API_KEY`: Your Biconomy API key
- `NEXT_PUBLIC_BICONOMY_PAYMASTER_URL`: Biconomy paymaster URL
- `NEXT_PUBLIC_BICONOMY_PAYMASTER_ID`: Your Biconomy paymaster ID
- `NEXT_PUBLIC_BICONOMY_BUNDLER_URL`: Biconomy bundler URL for Optimism

### Monitoring Your Deployment

1. View deployment status, logs, and analytics in the Vercel dashboard
2. Set up alerts for deployment failures or performance issues

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/papayapp`: Main Next.js application
  - `/components`: React components
  - `/pages`: Next.js pages and routes
  - `/utils`: Utility functions
  - `/types`: TypeScript type definitions
  - `/styles`: CSS and styling

## License

ISC 