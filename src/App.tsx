import React, { useState } from 'react';
import { AgeDetector } from './components/AgeDetector';
import { Chat } from './components/Chat';

function App() {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return <Chat onBack={() => setShowChat(false)} />;
  }

  return <AgeDetector onChatStart={() => setShowChat(true)} />;
}

export default App;