import React from 'react';
import Head from 'next/head';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'ETH CALI Wallet', 
  description = 'A secure and easy-to-use Ethereum wallet to get into web3 easily. Fully open-sourced with gas fees sponsored by ETH CALI.' 
}) => {
  // Define the site URL and image paths for metadata
  const siteUrl = 'https://papayapp.vercel.app';
  const imageUrl = `${siteUrl}/banner_ethcali.jpg`;
  
  return (
    <div className="layout">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/1x1ethcali.png" type="image/png" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={siteUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={imageUrl} />
        
        {/* Additional SEO metadata */}
        <meta name="keywords" content="ethereum, wallet, crypto, blockchain, web3, optimism, ETHCALI" />
        <meta name="author" content="ETH CALI" />
      </Head>

      <header className="header">
        <div className="banner-container">
          <div className="theme-toggle-container">
            <ThemeToggle />
          </div>
          <img src="/logo_eth_cali_blanco.png" alt="ETH CALI Logo" className="logo" />
          <h1>{title}</h1>
        </div>
      </header>

      <main className="main">
        {children}
      </main>

      <footer className="footer">
        <p>Powered by ETH CALI</p>
      </footer>

      <style jsx>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          width: 100%;
          background-color: var(--bg-primary);
          position: relative;
          transition: background-color 0.3s ease;
        }
        
        .header {
          padding: 2rem 1rem;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background-color: var(--header-bg);
          position: relative;
          z-index: 1;
        }
        
        .banner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 1.5rem 0;
        }
        
        .theme-toggle-container {
          position: absolute;
          top: 0;
          right: 0;
        }
        
        .logo {
          width: 150px;
          height: auto;
          margin-bottom: 1rem;
          filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
        }
        
        h1 {
          margin: 0;
          font-size: 1.75rem;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .main {
          flex: 1;
          padding: 1.5rem 1rem;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          background-color: var(--card-bg);
          border-radius: 8px;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 15px var(--card-shadow);
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .footer {
          padding: 1.5rem 1rem;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.9);
          background-color: var(--header-bg);
          position: relative;
          z-index: 1;
        }
        
        /* Responsive styling for mobile devices */
        @media (max-width: 768px) {
          .main {
            padding: 1rem;
            margin: 1rem;
            width: calc(100% - 2rem);
          }
          
          .logo {
            width: 120px;
          }
          
          h1 {
            font-size: 1.5rem;
          }
          
          .banner-container {
            padding: 1rem 0;
          }
        }
        
        @media (max-width: 480px) {
          .header {
            padding: 1.5rem 0.5rem;
          }
          
          .main {
            padding: 0.75rem;
            margin: 0.75rem;
            width: calc(100% - 1.5rem);
          }
          
          .logo {
            width: 100px;
            margin-bottom: 0.75rem;
          }
          
          h1 {
            font-size: 1.2rem;
          }
          
          .footer {
            padding: 1rem 0.5rem;
            font-size: 0.8rem;
          }
          
          .banner-container {
            padding: 0.75rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout; 