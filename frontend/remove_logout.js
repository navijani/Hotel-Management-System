import fs from 'fs';

const file = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/layouts/GuestLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<Button 
                      onClick={() => { sessionStorage.removeItem('guestAuthenticated'); window.sessionStorage.removeItem('guestSignedIn'); window.dispatchEvent(new Event('authChange')); window.dispatchEvent(new Event('guestAuthChanged')); window.location.href = '/'; }}
                      sx={navItemStyle}
                    >
                      Logout
                    </Button>`;

if (content.includes(target)) {
  content = content.replace(target, '');
  fs.writeFileSync(file, content);
  console.log('Removed Logout button completely from Navbar');
} else {
  // Try regex in case of whitespace differences
  const regex = /<Button\s+onClick=\{\(\) => \{ sessionStorage\.removeItem\('guestAuthenticated'\); window\.sessionStorage\.removeItem\('guestSignedIn'\); window\.dispatchEvent\(new Event\('authChange'\)\); window\.dispatchEvent\(new Event\('guestAuthChanged'\)\); window\.location\.href = '\/'; \}\}\s+sx=\{navItemStyle\}\s*>\s*Logout\s*<\/Button>/g;
  if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync(file, content);
    console.log('Removed Logout button completely from Navbar using regex');
  } else {
    console.log('Could not find Logout button in Navbar');
  }
}
