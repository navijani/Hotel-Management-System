import fs from 'fs';

// 1. Update App.tsx
const appFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');

if (!appContent.includes('import Profile')) {
  appContent = appContent.replace(
    "import SignUp from './pages/guest/SignUp';",
    "import SignUp from './pages/guest/SignUp';\nimport Profile from './pages/guest/Profile';"
  );
  
  appContent = appContent.replace(
    '<Route path="signup" element={<SignUp />} />',
    '<Route path="signup" element={<SignUp />} />\n            <Route path="profile" element={<Profile />} />'
  );
  fs.writeFileSync(appFile, appContent);
}

// 2. Update SignIn.tsx
const signInFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignIn.tsx';
let signInContent = fs.readFileSync(signInFile, 'utf8');
signInContent = signInContent.replace(
  `setTimeout(() => {\n      navigate('/');\n    }, 1500);`,
  `setTimeout(() => {\n      navigate('/profile');\n    }, 1500);`
);
fs.writeFileSync(signInFile, signInContent);

// 3. Update SignUp.tsx
const signUpFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignUp.tsx';
let signUpContent = fs.readFileSync(signUpFile, 'utf8');
signUpContent = signUpContent.replace(
  `setTimeout(() => {\n      navigate('/');\n    }, 2000);`,
  `setTimeout(() => {\n      navigate('/profile');\n    }, 2000);`
);
fs.writeFileSync(signUpFile, signUpContent);

// 4. Update GuestLayout to show Profile instead of Sign In (mock auth state for demo)
// Wait, I will just keep Sign In but maybe add Profile? Let's just change Sign In to a link to Profile for now, 
// or keep both. I'll change "Sign In" to "Sign In" but add "Profile".
const layoutFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/layouts/GuestLayout.tsx';
let layoutContent = fs.readFileSync(layoutFile, 'utf8');
if (!layoutContent.includes('/profile')) {
  layoutContent = layoutContent.replace(
    `<Button \n                onClick={() => navigate('/signin')}\n                sx={navItemStyle}\n              >\n                Sign In\n              </Button>`,
    `<Button \n                onClick={() => navigate('/signin')}\n                sx={navItemStyle}\n              >\n                Sign In\n              </Button>\n              <Button \n                onClick={() => navigate('/profile')}\n                sx={navItemStyle}\n              >\n                Profile\n              </Button>`
  );
  fs.writeFileSync(layoutFile, layoutContent);
}

console.log('Added Profile routing and redirects!');
