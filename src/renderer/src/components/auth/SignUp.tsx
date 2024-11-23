import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from '@renderer/hooks/use-toast';

interface SignUpProps {
  onSuccess: () => void;
  onBack: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast()

  // For password confirmation
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error handling
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);

    // TODO: Validation Checks

    // Supabase Sign Up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      console.error('Error logging in:', error)
      toast({
        title: "Error logging in",
        description: error.message,
      })
    } else {
      // Account created, proceed to main interface or email confirmation step
      onSuccess();
    }
  };

  return (
    <div className="signup-form">
      <h2>Create Account</h2>
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
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button onClick={handleSignUp}>Submit</Button>
      <Button variant="link" onClick={onBack}>
        Back
      </Button>
    </div>
  );
};

export default SignUp;
