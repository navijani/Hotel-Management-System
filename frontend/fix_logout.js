import fs from 'fs';

// 1. Remove duplicate Logout from GuestLayout.tsx
const layoutFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/layouts/GuestLayout.tsx';
let layoutContent = fs.readFileSync(layoutFile, 'utf8');

// Match the first Logout block
const regex = /\{isSignedIn && \(\s*<Button onClick=\{[^\}]+\}\s*sx=\{navItemStyle\}>\s*Logout\s*<\/Button>\s*\)\}/;
if (regex.test(layoutContent)) {
  layoutContent = layoutContent.replace(regex, '');
  fs.writeFileSync(layoutFile, layoutContent);
  console.log('Removed duplicate Logout from GuestLayout');
}

// 2. Add Logout button to Profile.tsx
const profileFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/Profile.tsx';
let profileContent = fs.readFileSync(profileFile, 'utf8');

if (!profileContent.includes('Logout')) {
  profileContent = profileContent.replace(
    `Edit Profile\n              </Button>`,
    `Edit Profile\n              </Button>\n              <Button variant="outlined" color="error" fullWidth sx={{ mt: 2, borderRadius: 8, textTransform: 'none', borderColor: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#fff' } }} onClick={() => { sessionStorage.removeItem('guestAuthenticated'); sessionStorage.removeItem('guestSignedIn'); window.dispatchEvent(new Event('guestAuthChanged')); window.location.href = '/'; }}>\n                Logout\n              </Button>`
  );
  fs.writeFileSync(profileFile, profileContent);
  console.log('Added Logout button to Profile');
}
