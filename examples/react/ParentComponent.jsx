import React, { useEffect, useState } from 'react';
import { FluxProxy } from 'flux-proxy';

// Parent component that loads an iframe and handles communication
const ParentComponent = () => {
  const [logs, setLogs] = useState([]);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Function to handle data requests from the child iframe
  const handleData = async (message) => {
    const newLog = `Request received: ${JSON.stringify(message)}`;
    setLogs(prevLogs => [...prevLogs, newLog]);
    
    // Simulate a response based on the requested collection
    if (message.collection === 'products') {
      return [
        { id: 1, name: 'Product A', price: 100 },
        { id: 2, name: 'Product B', price: 200 }
      ];
    }
    
    return { message: 'Data not found' };
  };

  // Set up the message listener when the component mounts
  useEffect(() => {
    const messageHandler = (event) => {
      // Use FluxProxy to process the message
      FluxProxy.parentClient.onMessage(
        event.data,
        window,
        handleData
      );
    };
    
    window.addEventListener('message', messageHandler);
    
    // Clean up the listener when the component unmounts
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <div className="parent-container">
      <h1>Flux-Proxy - Parent Component (React)</h1>
      
      <button onClick={() => setIframeLoaded(true)}>
        Load iframe
      </button>
      
      {iframeLoaded && (
        <iframe 
          src="/child.html" 
          title="Child Frame"
          style={{ width: '100%', height: '300px', border: '1px solid #ccc' }}
        />
      )}
      
      <div className="logs">
        <h3>Communication log:</h3>
        {logs.map((log, index) => (
          <div key={index} className="log-entry">{log}</div>
        ))}
      </div>
    </div>
  );
};

export default ParentComponent;