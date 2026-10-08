import fs from 'fs';

const sync = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/sessionStorage.setItem\('guestAuthenticated', 'true'\);/g, "sessionStorage.setItem('guestAuthenticated', 'true'); sessionStorage.setItem('guestSignedIn', 'true'); window.dispatchEvent(new Event('guestAuthChanged'));");
  fs.writeFileSync(file, content);
};

sync('C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignIn.tsx');
sync('C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignUp.tsx');
console.log('Synced auth state updates');
