import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardContent, Grid, Button, CircularProgress, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // We'll fetch this from the backend later
    setLoading(true);
    axios.get('http://localhost:5000/api/rooms')
      .then(response => {
        setRooms(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to load rooms:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>Available Rooms</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {rooms.map((room: any) => (
              <Grid key={room.RoomID} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Room {room.RoomNumber}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Type ID: {room.RoomTypeID}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Status: {room.Status}
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ mt: 'auto', fontWeight: 'bold' }}>
                      ${room.Price || 120} / night
                    </Typography>
                    <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={() => navigate('/book')}>
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {rooms.length === 0 && (
              <Typography variant="body1" sx={{ mt: 2, ml: 2 }}>
                No rooms currently available or backend is not connected.
              </Typography>
            )}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Rooms;
