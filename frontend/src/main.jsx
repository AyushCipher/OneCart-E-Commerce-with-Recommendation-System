import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from './context/AuthContext.jsx'
import UserContext from './context/UserContext.jsx'
import ShopContext from './context/ShopContext.jsx'
import ReviewContext from './context/ReviewContext.jsx'

// Filter out Firebase COOP warnings - they are non-blocking and don't affect functionality
const originalWarn = console.warn;
console.warn = function(...args) {
  // Suppress Cross-Origin-Opener-Policy warnings from Firebase
  if (args.some(arg => 
    typeof arg === 'string' && arg.includes('Cross-Origin-Opener-Policy')
  )) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthContext>
      <UserContext>
        <ShopContext>
          <ReviewContext>
            <App />
          </ReviewContext>
        </ShopContext>
      </UserContext>
    </AuthContext>

  </BrowserRouter>
  
)

