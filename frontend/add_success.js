import fs from 'fs';

const signUpFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignUp.tsx';
let signUpContent = fs.readFileSync(signUpFile, 'utf8');

if (!signUpContent.includes('success')) {
  signUpContent = signUpContent.replace(
    'const [error, setError] = useState(\'\');',
    'const [error, setError] = useState(\'\');\n  const [success, setSuccess] = useState(\'\');'
  );

  signUpContent = signUpContent.replace(
    `    // Simulate sign up\n    console.log('Signing up with', formData);\n    navigate('/signin');`,
    `    // Simulate sign up and auto-login\n    console.log('Signing up with', formData);\n    setSuccess('Registration successful! Logging you in...');\n    setTimeout(() => {\n      navigate('/');\n    }, 2000);`
  );

  signUpContent = signUpContent.replace(
    `{error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}`,
    `{error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}\n          {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>{success}</Alert>}`
  );
  
  fs.writeFileSync(signUpFile, signUpContent);
}

const signInFile = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/SignIn.tsx';
let signInContent = fs.readFileSync(signInFile, 'utf8');

if (!signInContent.includes('success')) {
  signInContent = signInContent.replace(
    'const [error, setError] = useState(\'\');',
    'const [error, setError] = useState(\'\');\n  const [success, setSuccess] = useState(\'\');'
  );

  signInContent = signInContent.replace(
    `    // Simulate sign in\n    console.log('Signing in with', email, password);\n    navigate('/');`,
    `    // Simulate sign in\n    console.log('Signing in with', email, password);\n    setSuccess('Login successful! Redirecting...');\n    setTimeout(() => {\n      navigate('/');\n    }, 1500);`
  );

  signInContent = signInContent.replace(
    `{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}`,
    `{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}\n          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}`
  );
  
  fs.writeFileSync(signInFile, signInContent);
}

console.log('Added success states to SignUp and SignIn!');
