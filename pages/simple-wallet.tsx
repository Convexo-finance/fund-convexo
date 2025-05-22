import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Loading from '../components/shared/Loading';

export default function SimpleWallet() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="container">
      <Loading fullScreen={true} text="Redirecting to ETH CALI Wallet..." />
      
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
      `}</style>
    </div>
  );
} 