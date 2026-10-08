import fs from 'fs';

// 1. Update SignIn.tsx to set sessionStorage
const signInFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignIn.tsx';
let signInContent = fs.readFileSync(signInFile, 'utf8');
if (!signInContent.includes('sessionStorage.setItem')) {
  signInContent = signInContent.replace(
    `setSuccess('Login successful! Redirecting...');`,
    `setSuccess('Login successful! Redirecting...');\n    sessionStorage.setItem('guestAuthenticated', 'true');\n    // Dispatch event so Layout updates immediately\n    window.dispatchEvent(new Event('authChange'));`
  );
  fs.writeFileSync(signInFile, signInContent);
}

// 2. Update SignUp.tsx to set sessionStorage
const signUpFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignUp.tsx';
let signUpContent = fs.readFileSync(signUpFile, 'utf8');
if (!signUpContent.includes('sessionStorage.setItem')) {
  signUpContent = signUpContent.replace(
    `setSuccess('Registration successful! Logging you in...');`,
    `setSuccess('Registration successful! Logging you in...');\n    sessionStorage.setItem('guestAuthenticated', 'true');\n    window.dispatchEvent(new Event('authChange'));`
  );
  fs.writeFileSync(signUpFile, signUpContent);
}

// 3. Update App.tsx with GuestGuard
const appFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');
if (!appContent.includes('GuestGuard')) {
  appContent = appContent.replace(
    `const AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => (`,
    `const GuestGuard: React.FC<{ children: ReactNode }> = ({ children }) => (\n  sessionStorage.getItem('guestAuthenticated') === 'true' ? <>{children}</> : <Navigate to="/signin" replace />\n);\n\nconst AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => (`
  );
  appContent = appContent.replace(
    `<Route path="profile" element={<Profile />} />`,
    `<Route path="profile" element={<GuestGuard><Profile /></GuestGuard>} />`
  );
  fs.writeFileSync(appFile, appContent);
}

// 4. Update GuestLayout to conditionally render navbar links
const layoutFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/layouts/GuestLayout.tsx';
let layoutContent = fs.readFileSync(layoutFile, 'utf8');
if (!layoutContent.includes('isAuthenticated')) {
  // Add state to GuestLayout
  layoutContent = layoutContent.replace(
    `const GuestLayout: React.FC = () => {\n  const [scrolled, setScrolled] = useState(false);`,
    `const GuestLayout: React.FC = () => {\n  const [scrolled, setScrolled] = useState(false);\n  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('guestAuthenticated') === 'true');\n\n  useEffect(() => {\n    const handleAuthChange = () => setIsAuthenticated(sessionStorage.getItem('guestAuthenticated') === 'true');\n    window.addEventListener('authChange', handleAuthChange);\n    return () => window.removeEventListener('authChange', handleAuthChange);\n  }, []);\n\n  const handleLogout = () => {\n    sessionStorage.removeItem('guestAuthenticated');\n    setIsAuthenticated(false);\n    navigate('/');\n  };`
  );
  
  // Replace the buttons
  layoutContent = layoutContent.replace(
    `<Button \n                onClick={() => navigate('/signin')}\n                sx={navItemStyle}\n              >\n                Sign In\n              </Button>\n              <Button \n                onClick={() => navigate('/profile')}\n                sx={navItemStyle}\n              >\n                Profile\n              </Button>`,
    `{!isAuthenticated ? (\n                <Button \n                  onClick={() => navigate('/signin')}\n                  sx={navItemStyle}\n                >\n                  Sign In\n                </Button>\n              ) : (\n                <>\n                  <Button \n                    onClick={() => navigate('/profile')}\n                    sx={navItemStyle}\n                  >\n                    Profile\n                  </Button>\n                  <Button \n                    onClick={handleLogout}\n                    sx={navItemStyle}\n                  >\n                    Logout\n                  </Button>\n                </>\n              )}`
  );
  fs.writeFileSync(layoutFile, layoutContent);
}

console.log('Added authentication logic!');
