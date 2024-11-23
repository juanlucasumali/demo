import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from '@renderer/hooks/use-toast';

interface LoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast()

  // Error handling
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Incorrect email or password.');
      console.error('Error logging in:', error)
      toast({
        title: "Error logging in",
        description: error.message,
      })
    } else {
      // User logged in, proceed to main interface
      onSuccess();
    }
  };

  return (
    <div className="login-form">
      <h2>Log In</h2>
      {error && <p className="error-message">{error}</p>}
      <Input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleLogin}>Submit</Button>
      <Button variant="link" onClick={onBack}>
        Back
      </Button>
    </div>
  );
};

export default Login;
