import { usePrivy } from '@privy-io/react-auth';
import Button from './shared/Button';

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { login, ready } = usePrivy();

  const handleLogin = async () => {
    await login();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="login-container">
      <h2>Welcome to Papayapp</h2>
      <p>Login with email or phone to access your wallet</p>
      <Button 
        onClick={handleLogin} 
        variant="primary" 
        size="large"
        disabled={!ready}
      >
        Login with Privy
      </Button>

      <style jsx>{`
        .login-container {
          text-align: center;
          margin: 3rem 0;
          padding: 2rem;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        h2 {
          margin-bottom: 1rem;
          color: #444;
        }
        
        p {
          margin-bottom: 1.5rem;
          color: #666;
        }
      `}</style>
    </div>
  );
} 