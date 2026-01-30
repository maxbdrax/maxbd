
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// JavaScript ফাইলটি রান হওয়া মাত্রই স্ট্যাটিক এইচটিএমএল লোডারটি মুছে ফেলবে
const loader = document.getElementById('initial-loader');
if (loader) {
  loader.remove();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
