/**
 * Example of using Flux-Proxy in Node.js (child process)
 * 
 * This example shows how to use Flux-Proxy for communication between processes in Node.js
 * as a child process that requests data from the parent process.
 */

const { FluxProxy } = require('flux-proxy');

// Adapter to use FluxProxy with Node.js processes
const processAdapter = {
  postMessage: (payload, target) => {
    if (process.send) {
      process.send(payload);
    }
  }
};

// Function to request data from the parent process
async function fetchConfig() {
  console.log('Requesting configuration from parent process...');
  
  try {
    // Use FluxProxy to request data
    const [data, error] = await FluxProxy.childClient.getData('config');
    
    if (error) {
      console.error('Error getting configuration:', error.message);
      return;
    }
    
    console.log('Configuration received:', data);
    
    // Do something with the configuration
    if (data.port) {
      console.log(`Configuring server on port ${data.port}...`);
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

// Set up the message listener
process.on('message', (data) => {
  console.log('Message received from parent process:', data);
});

// Request data after a short delay
setTimeout(fetchConfig, 1000);

console.log('Child process started.');