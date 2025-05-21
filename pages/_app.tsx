import { PrivyProvider } from '@privy-io/react-auth';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import SmartWalletsProvider from '@/components/SmartWalletsProvider';

function MyApp({ Component, pageProps }: AppProps) {
  // App ID from the Privy Dashboard (using environment variable)
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmavjopg6021ilh0ng5vnr5gc";

  return (
    <>
      <Head>
        <title>Papayapp - Web3 Wallet</title>
        <meta name="description" content="Login with phone or email and access your Ethereum wallet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['email', 'sms'],
          appearance: {
            theme: 'light',
            accentColor: '#4B66F3',
            logo: '/logo_eth_cali.png',
          },
          embeddedWallets: {
            createOnLogin: 'all-users',
            showWalletUIs: true
          }
        }}
      >
        <SmartWalletsProvider>
          <Component {...pageProps} />
        </SmartWalletsProvider>
      </PrivyProvider>
    </>
  );
}

export default MyApp; 