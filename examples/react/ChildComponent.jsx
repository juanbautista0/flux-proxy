import React, { useState } from 'react';
import { FluxProxy } from 'flux-proxy';

// Child component that requests data from the parent
const ChildComponent = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to request data from the parent
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use FluxProxy to request data
      const [response, responseError] = await FluxProxy.childClient.getData('products');
      
      if (responseError) {
        setError(responseError.message);
      } else {
        setData(response);
      }
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="child-container">
      <h1>Flux-Proxy - Child Component (React)</h1>
      
      <button 
        onClick={fetchData} 
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Request Data'}
      </button>
      
      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}
      
      {data && (
        <div className="data">
          <h3>Data received:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ChildComponent;