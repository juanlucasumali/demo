import React from 'react';
import { Button } from '../ui/button';

interface WelcomeScreenProps {
  onSelect: (option: 'login' | 'signup') => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelect }) => {
  return (
    <div className="welcome-screen">
      <h1>Welcome to Demo</h1>
      <Button onClick={() => onSelect('login')}>Log In</Button>
      <Button onClick={() => onSelect('signup')}>Create Account</Button>
    </div>
  );
};

export default WelcomeScreen;
