import { PrivyProvider } from '@privy-io/react-auth';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';

function MyApp({ Component, pageProps }: AppProps) {
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  return (
    <ThemeProvider>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['email', 'google', 'apple', 'farcaster', 'telegram', 'passkey'],
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
        <Component {...pageProps} />
      </PrivyProvider>
    </ThemeProvider>
  );
}

export default MyApp;