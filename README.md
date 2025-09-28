# Convexo - International Crowdfunding Platform

Una fintech de crowdfunding internacional que conecta empresas de capital físico intensivo con infraestructura financiera internacional para inversionistas globales.

## 🏗️ Architecture

### **Three Pillars:**
1. **🔗 Blockchain** → Riel financiero transparente y auditable
2. **🤖 AI** → Analiza datos financieros en indicadores claros (EBITDA, CAC, LTV, Runway)
3. **🌍 Branch Internacional** → Cumplimiento tributario internacional para capital extranjero

## 🚀 Platform Overview

### **🏠 Homepage** (`/`)
- Platform selection with clear differentiation
- Routes users to appropriate platform based on their role
- Statistics and feature highlights

### **🏢 Enterprise Platform** (`/enterprises`)
**For companies seeking funding and capital**

#### **4 Core Modules:**
1. **👤 Profile** - Privy user info, wallet address, USDC balance
2. **🔍 Verification** - Complete KYB verification via Sumsub simulation
3. **📊 Financial** - AI scoring with comprehensive financial analysis
4. **💰 Funding** - Cash-in/cash-out operations with real-time rates

#### **KYB Verification Features:**
- Company legal information collection
- Representative verification
- Document upload (11 required documents)
- Sumsub integration simulation
- AML screening and compliance

#### **Financial Analysis:**
- Income statement data collection
- Business model evaluation
- AI-powered scoring with 17+ indicators:
  - EBITDA, Margen Bruto, ROE, ROA
  - Runway, CAC, LTV, Churn
  - YoY Growth, Capital Gap
- Automated recommendations

#### **Funding Operations:**
- **Cash In**: COP → USDC (Google API rate)
- **Cash Out**: USDC → COP (Google API rate - 1%)
- Real-time exchange rate updates
- Balance validation and transaction history

### **💼 Investor Platform** (`/investors`)
**For individual investors seeking high-yield opportunities**

#### **Simple Flow:**
1. **👤 Profile** - Account and wallet information
2. **🆔 Verification** - Veriff AI passport verification
3. **💰 Investments** - Vault deposits and withdrawals
4. **📈 Portfolio** - Performance tracking and analytics

## 🛠️ Technical Stack

### **Frontend:**
- **Next.js 14** - React framework with SSR/SSG
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Privy** - Embedded wallet authentication

### **Blockchain:**
- **Base Sepolia** - Testnet for development
- **USDC** - Primary stablecoin for operations
- **Viem** - Ethereum library for contract interactions

### **Smart Contracts (Base Sepolia):**
- **ConvexoVault**: `0xd61bc1202D0B920D80b69762B78B4ce05dF03D1C`
- **LoanNoteNFT**: `0x0B6962F7468BA68A8715ccb67233B54c8dEb5b73`
- **Collector**: `0xf489d4c235895750Cf6EC06C7B26187aD5Ef1207`
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## 🔧 Setup & Development

### **Prerequisites:**
- Node.js ≥18.x
- npm ≥8.x
- Privy App ID

### **Environment Variables:**
Create `.env.local` in the project root:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

### **Installation:**
```bash
# Clone the repository
git clone https://github.com/Ekinoxis-evm/fund-convexo-tws2025.git
cd fund-convexo-tws2025

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Build & Deploy:**
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment & Routing

### **Vercel Configuration:**
The app is designed for deployment on Vercel with the following URL structure:

- **Main domain**: `convexus.xyz` → Homepage with platform selection
- **Enterprise path**: `convexus.xyz/enterprises` → Enterprise platform
- **Investor path**: `convexus.xyz/investors` → Investor platform

### **Domain Setup in Vercel:**
1. Deploy the repository to Vercel
2. Configure custom domain: `convexus.xyz`
3. The routing is handled automatically by Next.js pages

## 📱 User Flows

### **Enterprise Journey:**
1. **Homepage** → Select "Para Empresas"
2. **Login** → Privy embedded wallet creation
3. **Profile** → View account and wallet info
4. **KYB Verification** → Complete Sumsub verification
5. **Financial Analysis** → Submit data for AI scoring
6. **Funding Operations** → Cash-in/cash-out with rates

### **Investor Journey:**
1. **Homepage** → Select "Para Inversionistas" 
2. **Login** → Privy embedded wallet creation
3. **Profile** → View account and wallet info
4. **Verification** → Veriff passport verification
5. **Investments** → Vault operations (coming soon)
6. **Portfolio** → Performance tracking (coming soon)

## 🔐 Security & Compliance

### **Authentication:**
- **Privy embedded wallets** for secure authentication
- **Multi-factor authentication** support
- **Social login** options (email, Google, passkey)

### **Verification:**
- **Enterprise KYB** via Sumsub integration
- **Investor KYC** via Veriff AI verification
- **AML screening** and compliance checks

### **Blockchain Security:**
- **Base Sepolia testnet** for safe development
- **USDC transactions** with proper validation
- **Contract interaction** through Privy provider

## 📊 Features

### **AI Financial Scoring:**
Comprehensive analysis including:
- **Profitability**: EBITDA, Margins, ROE, ROA
- **Liquidity**: Current Ratio, Runway
- **Growth**: YoY Growth, Revenue per Employee
- **Efficiency**: CAC, LTV, Churn Rate
- **Risk**: Capital Gap, Debt/Equity Ratio

### **Funding Operations:**
- **Real-time rates** from Google Finance API
- **Multi-currency support** (USD, COP, USDC)
- **Fee structure**: Cash-out operations include 1% fee
- **Balance validation** and transaction history

### **Document Management:**
- **Secure uploads** with file validation
- **Document status tracking** throughout verification
- **Compliance requirements** for different jurisdictions

## 🛣️ Roadmap

### **Phase 1 (Current):**
- ✅ Platform architecture and user flows
- ✅ Privy authentication integration
- ✅ KYB/KYC verification workflows
- ✅ Financial scoring system
- ✅ Basic funding operations

### **Phase 2 (Next):**
- 🔄 Live contract integration on Base Sepolia
- 🔄 Real Sumsub and Veriff API integration
- 🔄 Google Finance API for live rates
- 🔄 Database integration for data persistence

### **Phase 3 (Future):**
- 🔄 Mainnet deployment
- 🔄 Advanced portfolio analytics
- 🔄 Multi-chain support
- 🔄 Mobile app development

## 📞 Support

For technical support or business inquiries:
- **Email**: ops@convexo.xyz
- **Platform**: Submit through dashboard
- **Documentation**: [Privy Docs](https://docs.privy.io)

## 📄 License

This project is proprietary to Convexo. All rights reserved.

---

**Built with ❤️ by the Convexo Team**  
*Connecting enterprises with global capital through blockchain innovation*