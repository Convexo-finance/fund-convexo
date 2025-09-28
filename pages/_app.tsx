import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { mainnet, optimism, base } from 'viem/chains';
import { publicProvider } from 'wagmi/providers/public';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { BASE_SEPOLIA } from '../config/contracts';

// Configure wagmi
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [BASE_SEPOLIA, mainnet, optimism, base],
  [publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [],
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Following Privy docs: must have valid App ID
  if (!PRIVY_APP_ID || PRIVY_APP_ID === 'your_privy_app_id_here') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Setup Required</h2>
          <p className="mb-4">Add your Privy App ID to <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>:</p>
          <code className="block bg-gray-100 p-2 text-sm mb-4">NEXT_PUBLIC_PRIVY_APP_ID=clp_your_app_id</code>
          <p className="text-sm text-gray-600">
            Get your App ID from: <a href="https://dashboard.privy.io" target="_blank" className="text-blue-600 underline">dashboard.privy.io</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['email', 'google', 'passkey', 'wallet'],
          appearance: {
            theme: 'light',
            accentColor: '#6B21A8', // Purple color for Convexo
            logo: '/logo_convexo.png',
          },
          embeddedWallets: {
            createOnLogin: 'all-users',
            showWalletUIs: true
          },
          // Use Base Sepolia as default for dApp testing
          defaultChain: BASE_SEPOLIA,
          supportedChains: [BASE_SEPOLIA, mainnet, optimism, base]
        }}
      >
        <WagmiConfig config={wagmiConfig}>
          <Component {...pageProps} />
        </WagmiConfig>
      </PrivyProvider>
    </ThemeProvider>
  );
}

export default MyApp;