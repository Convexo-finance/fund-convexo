import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Loading from '@/components/shared/Loading';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/simple-wallet');
  }, [router]);

  return (
    <div className="container">
      <img 
        src="/logo_eth_cali.png" 
        alt="Papayapp Logo" 
        className="logo"
      />
      <h2>Papayapp</h2>
      <p>Redirecting to wallet page...</p>
      <Loading size="medium" text="" />
      
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        
        .logo {
          width: 120px;
          height: auto;
          margin-bottom: 1.5rem;
        }
        
        h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        
        p {
          margin-bottom: 1.5rem;
          color: #666;
        }
      `}</style>
    </div>
  );
} 