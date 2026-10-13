import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const reveal = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.12); opacity: 1; }
`;

const fill = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

const GuestLoadingScreen: React.FC = () => (
  <Box
    role="status"
    aria-live="polite"
    aria-label="Loading Paradise Resorts"
    sx={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      px: 3,
      color: '#fff',
      background: 'radial-gradient(circle at 50% 40%, #253047 0%, #121827 47%, #090e19 100%)',
    }}
  >
    <Box sx={{ position: 'absolute', width: { xs: 350, md: 560 }, height: { xs: 350, md: 560 }, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 0 0 80px rgba(212,175,55,0.025), 0 0 0 160px rgba(212,175,55,0.015)', animation: `${breathe} 3s ease-in-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }} />

    <Box sx={{ position: 'relative', textAlign: 'center', width: '100%', maxWidth: 520, animation: `${reveal} 0.7s ease-out both`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}>
      <Box sx={{ width: 52, height: 52, mx: 'auto', mb: 4, border: '1px solid rgba(212,175,55,0.8)', transform: 'rotate(45deg)', display: 'grid', placeItems: 'center' }}>
        <Box sx={{ width: 20, height: 20, bgcolor: '#d4af37' }} />
      </Box>
      <Typography sx={{ color: '#d4af37', fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.35em', mb: 1.5 }}>
        WELCOME TO PARADISE
      </Typography>
      <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: { xs: '2.4rem', sm: '3.5rem' }, lineHeight: 1.15, letterSpacing: '0.02em', mb: 1 }}>
        Paradise <Box component="span" sx={{ color: '#d4af37' }}>Resorts</Box>
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.68)', fontSize: { xs: '0.9rem', sm: '1rem' }, letterSpacing: '0.08em', mb: 5 }}>
        Your extraordinary stay begins here
      </Typography>
      <Box sx={{ height: 2, maxWidth: 260, mx: 'auto', bgcolor: 'rgba(255,255,255,0.14)', overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ width: '100%', height: '100%', bgcolor: '#d4af37', transformOrigin: 'left', animation: `${fill} 3s linear both`, '@media (prefers-reduced-motion: reduce)': { animation: 'none', transform: 'scaleX(1)' } }} />
      </Box>
      <Typography sx={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.73rem', letterSpacing: '0.18em', textTransform: 'uppercase', mt: 2 }}>
        Preparing your experience
      </Typography>
    </Box>
  </Box>
);

export default GuestLoadingScreen;
