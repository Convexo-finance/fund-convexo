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

## Smart Wallet (Account Abstraction)

This application is designed with support for Account Abstraction in mind, but this feature is currently disabled. 

The core wallet functionality works as follows:
1. Users can login with email or phone via Privy
2. Embedded wallets are automatically created
3. Users can send, receive and export their private keys
4. The wallet connects to Optimism mainnet by default

To re-enable Smart Wallet functionality in the future, specific compatible versions of permissionless and viem libraries will be needed, along with proper configuration in the Privy dashboard.

# Papayapp

A simple Ethereum wallet application built with Next.js and Privy for authentication. This application allows users to authenticate with email or phone, access their own wallet, and view balances on the Optimism network.

## Features

- Authentication with email or phone via Privy
- Automatic wallet creation upon login
- Display of wallet address and balances
- Mock ETH and USC (USDC) balance display
- Responsive design with ETH Cali branding

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd papayapp
```

2. Install dependencies:
```bash
npm install
```

3. Add your Privy App ID (or use the default one for testing):
   - Create a `.env.local` file in the project root
   - Add `NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment to Vercel

This project is configured for easy deployment to Vercel:

1. Create a new project on Vercel
2. Connect your repository
3. Set the following environment variables:
   - `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy App ID
   - `NEXT_PUBLIC_BICONOMY_API_KEY`: Your Biconomy API key
   - `NEXT_PUBLIC_BICONOMY_PAYMASTER_URL`: Biconomy paymaster URL
   - `NEXT_PUBLIC_BICONOMY_PAYMASTER_ID`: Your Biconomy paymaster ID
   - `NEXT_PUBLIC_BICONOMY_BUNDLER_URL`: Biconomy bundler URL

   Note: Default values are provided in the vercel.json configuration file, but it's recommended to set your own values in the Vercel dashboard.

4. Deploy! Vercel will automatically build and deploy your application.

## Directory Structure

- `/pages`: Next.js pages
  - `/api`: API endpoints
  - `/simple-wallet.js`: Main wallet interface
  - `/_app.js`: App configuration with Privy provider
- `/public`: Static assets
  - `/logo_eth_cali.png`: Logo image
- `/components`: React components
  - `/shared`: Shared UI components
  - `/wallet`: Wallet-specific components
- `/types`: TypeScript type definitions
- `/utils`: Utility functions

## Technologies Used

- Next.js
- Privy for authentication
- React
- TypeScript
- Vercel for deployment

## License

ISC 