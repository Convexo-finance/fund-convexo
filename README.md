# ETH Cali Wallet.

A secure and easy-to-use Ethereum wallet application built with Next.js and Privy for authentication. This wallet allows users to access web3 easily using embedded wallets, supporting multiple tokens on the Optimism network.

## 🌟 Features

### 🔐 **Easy Authentication**
- Login with email or phone via Privy
- Automatic embedded wallet creation
- Export private keys functionality
- Secure authentication flow

### 💰 **Multi-Token Support**
- **ETH**: Native Ethereum on Optimism
- **USDC**: USD Coin (Native Circle USDC)
- **PAPAYOS**: Custom token support with contract `0xfeEF2ce2B94B8312EEB05665e2F03efbe3B0a916`

### 🚀 **Advanced Features**
- Real-time balance fetching from Optimism blockchain
- Direct blockchain transactions via embedded wallets
- QR code scanning for easy address input
- Transaction history with Etherscan integration
- Responsive design with dark/light mode support
- Beautiful modern UI with TailwindCSS

### 🔗 **Network Support**
- Optimism Mainnet (Chain ID: 10)
- Optimistic Etherscan integration
- Real-time price data from CoinGecko

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ETHcali/ethcaliwallet.git
   cd ethcaliwallet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
ethcaliwallet/
├── components/
│   ├── shared/           # Reusable UI components
│   └── wallet/           # Wallet-specific components
├── pages/
│   ├── api/             # Backend API endpoints
│   ├── index.tsx        # Landing page
│   └── simple-wallet.tsx # Main wallet interface
├── hooks/               # Custom React hooks
│   ├── useTokenBalances.ts
│   └── useTokenPrices.ts
├── utils/               # Utility functions
│   ├── api.ts
│   └── tokenUtils.ts
├── types/               # TypeScript definitions
├── lib/                 # Core library functions
├── public/              # Static assets
│   └── ppytoken.jpg     # PAPAYOS token logo
└── styles/              # CSS and styling
```

## 💳 Supported Tokens

| Token | Contract Address | Decimals | Network |
|-------|------------------|----------|---------|
| **ETH** | Native | 18 | Optimism |
| **USDC** | `0x0b2c639c533813f4aa9d7837caf62653d097ff85` | 6 | Optimism |
| **PAPAYOS** | `0xfeEF2ce2B94B8312EEB05665e2F03efbe3B0a916` | 18 | Optimism |

## 🔧 Key Technologies

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: TailwindCSS with dark mode support
- **Authentication**: Privy (Email/Phone)
- **Blockchain**: Viem, Optimism
- **Embedded Wallets**: Privy Embedded Wallets
- **Deployment**: Vercel

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel link
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_PRIVY_APP_ID`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Live Demo
🌐 **[papayapp.vercel.app](https://papayapp.vercel.app)**

## 🔐 Security Features

- **Embedded Wallets**: Secure key management via Privy
- **Direct Blockchain Access**: Direct transactions to Optimism network
- **Private Key Export**: Users can export their private keys when needed
- **Contract Verification**: All token contracts verified on Etherscan
- **Secure Transactions**: Proper ABI encoding and validation

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [https://github.com/ETHcali/ethcaliwallet](https://github.com/ETHcali/ethcaliwallet)
- **Live Demo**: [https://papayapp.vercel.app](https://papayapp.vercel.app)
- **ETH CALI**: [Learn more about ETH CALI](https://ethcali.org)

## 💡 About ETH CALI

This wallet is proudly sponsored by ETH CALI, making web3 accessible to everyone through gas-free transactions and easy-to-use interfaces.

---

**Built with ❤️ by the ETH CALI community** 
