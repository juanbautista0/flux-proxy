/**
 * Example of using Flux-Proxy in Node.js (parent process)
 * 
 * This example shows how to use Flux-Proxy for communication between processes in Node.js
 * using fork() to create a child process.
 */

const { fork } = require('child_process');
const { FluxProxy } = require('flux-proxy');

// Create a child process
const childProcess = fork('./child-process.js');

// Function to handle data requests from the child process
const handleData = async (message) => {
  console.log('Request received from child process:', message);
  
  // Simulate a response based on the requested collection
  if (message.collection === 'config') {
    return {
      port: 3000,
      host: 'localhost',
      timeout: 5000,
      debug: true
    };
  }
  
  return { message: 'Data not found' };
};

// Adapter to use FluxProxy with Node.js processes
const processAdapter = {
  postMessage: (payload, target) => {
    childProcess.send(payload);
  }
};

// Listen for messages from the child process
childProcess.on('message', (data) => {
  // Use FluxProxy to process the message
  FluxProxy.parentClient.onMessage(
    data,
    processAdapter,
    handleData
  );
});

console.log('Parent process started. Waiting for messages from child process...');

// Keep the process active
process.stdin.resume();