import React from 'react';
import { AuthForm } from './components/AuthForm';
import { AgeDetector } from './components/AgeDetector';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <AgeDetector />;
}

export default App;