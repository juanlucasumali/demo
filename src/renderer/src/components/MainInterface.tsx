import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from './ui/button';

const MainInterface: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="main-interface">
      <h1>Welcome to the Main Interface</h1>
      <Button onClick={handleLogout}>Log Out</Button>
      {/* Implement the rest of your main interface here */}
    </div>
  );
};

export default MainInterface;
