import fs from 'fs';

// 1. Update SignUp.tsx to store user data
const signUpFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignUp.tsx';
let signUpContent = fs.readFileSync(signUpFile, 'utf8');

if (!signUpContent.includes('guestUser')) {
  signUpContent = signUpContent.replace(
    `sessionStorage.setItem('guestSignedIn', 'true');`,
    `sessionStorage.setItem('guestSignedIn', 'true');\n    sessionStorage.setItem('guestUser', JSON.stringify({\n      firstName: formData.firstName,\n      lastName: formData.lastName,\n      email: formData.email,\n      phone: formData.phone,\n      joinDate: new Date().toLocaleDateString()\n    }));`
  );
  fs.writeFileSync(signUpFile, signUpContent);
}

// 2. Update Profile.tsx to use stored data
const profileFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/Profile.tsx';
let profileContent = fs.readFileSync(profileFile, 'utf8');

if (!profileContent.includes('sessionStorage.getItem')) {
  profileContent = profileContent.replace(
    `const user = {\n    firstName: 'Guest',\n    lastName: 'User',\n    email: 'guest@example.com',\n    phone: '+1 (555) 123-4567',\n    joinDate: new Date().toLocaleDateString()\n  };`,
    `const storedUser = sessionStorage.getItem('guestUser');\n  const user = storedUser ? JSON.parse(storedUser) : {\n    firstName: 'Guest',\n    lastName: 'User',\n    email: 'guest@example.com',\n    phone: '+1 (555) 123-4567',\n    joinDate: new Date().toLocaleDateString()\n  };`
  );
  fs.writeFileSync(profileFile, profileContent);
}

// 3. Update SignIn.tsx to store basic user data if not exists (so it doesn't crash if signing in without sign up)
const signInFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignIn.tsx';
let signInContent = fs.readFileSync(signInFile, 'utf8');

if (!signInContent.includes('guestUser')) {
  signInContent = signInContent.replace(
    `sessionStorage.setItem('guestSignedIn', 'true');`,
    `sessionStorage.setItem('guestSignedIn', 'true');\n    if (!sessionStorage.getItem('guestUser')) {\n      sessionStorage.setItem('guestUser', JSON.stringify({\n        firstName: email.split('@')[0],\n        lastName: 'Member',\n        email: email,\n        phone: '+1 (555) 000-0000',\n        joinDate: new Date().toLocaleDateString()\n      }));\n    }`
  );
  fs.writeFileSync(signInFile, signInContent);
}

console.log('Added dynamic user data to Profile!');
