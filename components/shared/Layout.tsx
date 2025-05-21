import React from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Papayapp', 
  description = 'Secure Ethereum wallet with phone and email authentication' 
}) => {
  return (
    <div className="layout">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <div className="logo-container">
          <img src="/logo_eth_cali.png" alt="Papayapp Logo" className="logo" />
        </div>
        <h1>{title}</h1>
      </header>

      <main className="main">
        {children}
      </main>

      <footer className="footer">
        <p>Powered by ETH Cali</p>
      </footer>

      <style jsx>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        
        .header {
          padding: 1.5rem 1rem;
          text-align: center;
          border-bottom: 1px solid #eee;
        }
        
        .logo-container {
          margin-bottom: 0.5rem;
        }
        
        .logo {
          width: 100px;
          height: auto;
        }
        
        h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }
        
        .main {
          flex: 1;
          padding: 1.5rem 1rem;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .footer {
          padding: 1.5rem 1rem;
          text-align: center;
          border-top: 1px solid #eee;
          font-size: 0.875rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Layout; 