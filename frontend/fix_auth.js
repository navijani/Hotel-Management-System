import fs from 'fs';

const file = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/layouts/GuestLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/{!isAuthenticated \? \(/g, '{!isSignedIn ? (');
content = content.replace(/onClick={handleLogout}/g, "onClick={() => { sessionStorage.removeItem('guestAuthenticated'); window.sessionStorage.removeItem('guestSignedIn'); window.dispatchEvent(new Event('authChange')); window.dispatchEvent(new Event('guestAuthChanged')); window.location.href = '/'; }}");

fs.writeFileSync(file, content);
console.log('Fixed isAuthenticated error');
