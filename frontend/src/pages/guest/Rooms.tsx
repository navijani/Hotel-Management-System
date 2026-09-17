import React, { useEffect, useState } from 'react';
import { 
  Typography, Box, Card, CardContent, Grid, Button, 
  CircularProgress, Container, CardMedia, Chip, Divider 
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BedIcon from '@mui/icons-material/KingBed';
import WifiIcon from '@mui/icons-material/Wifi';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';

const mockRooms = [
  {
    RoomID: 'm1',
    RoomNumber: '101',
    RoomTypeID: 'Deluxe Ocean View',
    Status: 'Available',
    Price: 250,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop'
  },
  {
    RoomID: 'm2',
    RoomNumber: '102',
    RoomTypeID: 'Premium Suite',
    Status: 'Available',
    Price: 450,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop'
  },
  {
    RoomID: 'm3',
    RoomNumber: '103',
    RoomTypeID: 'Standard Garden',
    Status: 'Occupied',
    Price: 150,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop'
  }
];

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/rooms')
      .then(response => {
        // Map backend snake_case to pascal case if needed
        const fetchedRooms = response.data.map((r: any) => ({
          RoomID: r.room_id || r.RoomID,
          RoomNumber: r.room_number || r.RoomNumber || 'TBD',
          RoomTypeID: r.type || r.RoomTypeID || 'Standard',
          Status: r.current_status || r.Status || 'Available',
          Price: r.price_per_night || r.Price || 120,
          image: r.image || mockRooms[Math.floor(Math.random() * mockRooms.length)].image
        }));
        
        if (fetchedRooms.length === 0) {
          setRooms(mockRooms);
        } else {
          setRooms(fetchedRooms);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to load rooms, falling back to mock data:", error);
        setRooms(mockRooms);
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ bgcolor: '#fdfbf7', minHeight: '100vh', pb: 10 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: { xs: 15, md: 20 },
          pb: { xs: 8, md: 10 },
          bgcolor: '#1a1a1a',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          backgroundImage: 'linear-gradient(rgba(26, 26, 26, 0.8), rgba(26, 26, 26, 0.9)), url(https://images.unsplash.com/photo-1542314831-c6a4d1424b91?q=80&w=2000&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 800, 
              fontFamily: '"Playfair Display", serif',
              color: '#d4af37'
            }}
          >
            Our Accommodations
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, color: 'rgba(255,255,255,0.8)' }}>
            Experience unparalleled luxury and comfort. Each of our rooms is meticulously designed 
            to provide a serene sanctuary during your stay.
          </Typography>
        </Container>
      </Box>

      {/* Rooms Grid */}
      <Container maxWidth="lg" sx={{ mt: -5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress sx={{ color: '#d4af37' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {rooms.map((room) => {
              const isAvailable = room.Status === 'Available';
              return (
                <Grid key={room.RoomID} size={{ xs: 12, md: 4 }}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(0,0,0,0.05)',
                      bgcolor: 'white',
                      '&:hover': { 
                        transform: 'translateY(-10px)', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)' 
                      } 
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="260"
                        image={room.image}
                        alt={`Room ${room.RoomNumber}`}
                      />
                      <Chip 
                        label={room.Status} 
                        sx={{ 
                          position: 'absolute', 
                          top: 16, 
                          right: 16,
                          fontWeight: 600,
                          bgcolor: isAvailable ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 0, 0, 0.7)',
                          color: isAvailable ? '#2e7d32' : 'white',
                          backdropFilter: 'blur(4px)'
                        }} 
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>
                          {room.RoomTypeID}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#d4af37', fontWeight: 'bold' }}>
                          ${room.Price}
                          <Typography component="span" variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right' }}>
                            / night
                          </Typography>
                        </Typography>
                      </Box>
                      
                      <Typography color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>
                        Room {room.RoomNumber} • Elegantly appointed space featuring premium amenities and stunning views.
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 2, mb: 3, color: 'text.secondary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BedIcon fontSize="small" />
                          <Typography variant="caption">King Bed</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AspectRatioIcon fontSize="small" />
                          <Typography variant="caption">400 sqft</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WifiIcon fontSize="small" />
                          <Typography variant="caption">Free WiFi</Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      <Button 
                        variant="contained" 
                        fullWidth 
                        disabled={!isAvailable}
                        onClick={() => navigate('/book')}
                        sx={{ 
                          mt: 'auto',
                          py: 1.5,
                          bgcolor: isAvailable ? '#1a1a1a' : '#e0e0e0',
                          color: isAvailable ? 'white' : '#9e9e9e',
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1rem',
                          '&:hover': {
                            bgcolor: isAvailable ? '#d4af37' : '#e0e0e0',
                          }
                        }}
                      >
                        {isAvailable ? 'Book This Room' : 'Currently Unavailable'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Rooms;
