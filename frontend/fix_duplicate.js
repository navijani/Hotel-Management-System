import fs from 'fs';

const file = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/layouts/GuestLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

// The duplicate block started with {isSignedIn && (
const startIndex = content.indexOf('{isSignedIn && (');
if (startIndex !== -1) {
  const endIndex = content.indexOf(')}', startIndex) + 2;
  const block = content.substring(startIndex, endIndex);
  if (block.includes('Logout')) {
    content = content.replace(block, '');
    fs.writeFileSync(file, content);
    console.log('Removed duplicate Logout block!');
  }
}
