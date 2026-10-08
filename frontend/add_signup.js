import fs from 'fs';

const signUpFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignUp.tsx';
let signUpContent = fs.readFileSync(signUpFile, 'utf8');

signUpContent = signUpContent.replace(/<Grid item xs=\{12\} sm=\{6\}>/g, '<Grid size={{ xs: 12, sm: 6 }}>');
signUpContent = signUpContent.replace(/<Grid item xs=\{12\}>/g, '<Grid size={{ xs: 12 }}>');

fs.writeFileSync(signUpFile, signUpContent);

const appFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');

if (!appContent.includes('import SignUp')) {
  appContent = appContent.replace(
    "import SignIn from './pages/guest/SignIn';",
    "import SignIn from './pages/guest/SignIn';\nimport SignUp from './pages/guest/SignUp';"
  );
  
  appContent = appContent.replace(
    '<Route path="signin" element={<SignIn />} />',
    '<Route path="signin" element={<SignIn />} />\n            <Route path="signup" element={<SignUp />} />'
  );
  fs.writeFileSync(appFile, appContent);
}

const signInFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignIn.tsx';
let signInContent = fs.readFileSync(signInFile, 'utf8');

signInContent = signInContent.replace(
  '<Box component="span" sx={{ color: \'#d4af37\', fontWeight: 600, cursor: \'pointer\' }}>Sign Up</Box>',
  '<Box component="span" onClick={() => navigate(\'/signup\')} sx={{ color: \'#d4af37\', fontWeight: 600, cursor: \'pointer\' }}>Sign Up</Box>'
);

fs.writeFileSync(signInFile, signInContent);

console.log('Fixed Grid and added routing!');
