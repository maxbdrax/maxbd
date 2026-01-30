
import React from 'react';
import ReactDOM from 'react-dom/client';

// JavaScript ফাইলটি রান হওয়া মাত্রই স্ট্যাটিক এইচটিএমএল লোডারটি মুছে ফেলবে
// এটি ইম্পোর্টের আগে রাখা হয়েছে যাতে কোনো ইম্পোর্ট ফেইল করলেও লোডার আটকে না থাকে
const loader = document.getElementById('initial-loader');
if (loader) {
  loader.remove();
}

import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Mounting error:", error);
}
