import fs from 'fs';

const appFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');

appContent = appContent.replace(
  "import Book from './pages/guest/Book';",
  "import Book from './pages/guest/Book';\nimport SignIn from './pages/guest/SignIn';"
);

appContent = appContent.replace(
  '<Route path="portal" element={<AccessPortal />} />',
  '<Route path="portal" element={<AccessPortal />} />\n            <Route path="signin" element={<SignIn />} />'
);

fs.writeFileSync(appFile, appContent);

const layoutFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/layouts/GuestLayout.tsx';
let layoutContent = fs.readFileSync(layoutFile, 'utf8');

layoutContent = layoutContent.replace(
  `<Button \n                onClick={() => navigate('/portal')}\n                sx={navItemStyle}\n              >\n                Staff\n              </Button>`,
  `<Button \n                onClick={() => navigate('/signin')}\n                sx={navItemStyle}\n              >\n                Sign In\n              </Button>\n              <Button \n                onClick={() => navigate('/portal')}\n                sx={navItemStyle}\n              >\n                Staff\n              </Button>`
);

fs.writeFileSync(layoutFile, layoutContent);
console.log('Done!');
