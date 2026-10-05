import React, { useEffect, useState } from 'react';
import { 
  Typography, Box, Card, CardContent, Grid, Button, 
  CircularProgress, Container, CardMedia, Chip, Divider 
, TextField, MenuItem, Slider, Collapse, Paper, InputAdornment} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
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
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop',
    Description: 'Elegantly appointed space featuring premium amenities and stunning ocean views.',
    BedType: 'King Bed',
    RoomSize: '450 sqft',
    Amenities: 'Free WiFi, Balcony'
  },
  {
    RoomID: 'm2',
    RoomNumber: '102',
    RoomTypeID: 'Premium Suite',
    Status: 'Available',
    Price: 450,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
    Description: 'Spacious suite with separate living area and exclusive lounge access.',
    BedType: '2 Queen Beds',
    RoomSize: '600 sqft',
    Amenities: 'Free WiFi, Lounge Access'
  },
  {
    RoomID: 'm3',
    RoomNumber: '103',
    RoomTypeID: 'Standard Garden',
    Status: 'Occupied',
    Price: 150,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop',
    Description: 'Cozy room with beautiful views of our award-winning gardens.',
    BedType: 'Queen Bed',
    RoomSize: '350 sqft',
    Amenities: 'Free WiFi'
  },
  {
    RoomID: 'm4',
    RoomNumber: '104',
    RoomTypeID: 'Executive Suite',
    Status: 'Available',
    Price: 550,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
    Description: 'Luxurious suite featuring panoramic city views and private dining area.',
    BedType: 'King Bed',
    RoomSize: '750 sqft',
    Amenities: 'Free WiFi, Mini Bar, Lounge Access'
  },
  {
    RoomID: 'm5',
    RoomNumber: '105',
    RoomTypeID: 'Family Room',
    Status: 'Available',
    Price: 200,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop',
    Description: 'Spacious accommodation perfect for family getaways with interconnected rooms.',
    BedType: '2 Queen Beds',
    RoomSize: '500 sqft',
    Amenities: 'Free WiFi, TV, Kitchenette'
  },
  {
    RoomID: 'm6',
    RoomNumber: '106',
    RoomTypeID: 'Presidential Suite',
    Status: 'Occupied',
    Price: 1200,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
    Description: 'The ultimate luxury experience with a private terrace and personal butler service.',
    BedType: 'King Bed',
    RoomSize: '1200 sqft',
    Amenities: 'Free WiFi, Private Pool, Butler'
  },
  {
    RoomID: 'm7',
    RoomNumber: '107',
    RoomTypeID: 'Standard City View',
    Status: 'Available',
    Price: 130,
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop',
    Description: 'Comfortable room overlooking the vibrant city skyline.',
    BedType: 'Queen Bed',
    RoomSize: '300 sqft',
    Amenities: 'Free WiFi'
  },
  {
    RoomID: 'm8',
    RoomNumber: '108',
    RoomTypeID: 'Deluxe Twin',
    Status: 'Available',
    Price: 180,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop',
    Description: 'Elegant twin room ideal for friends or colleagues traveling together.',
    BedType: '2 Twin Beds',
    RoomSize: '400 sqft',
    Amenities: 'Free WiFi, Balcony'
  },
  {
    RoomID: 'm9',
    RoomNumber: '109',
    RoomTypeID: 'Penthouse Suite',
    Status: 'Available',
    Price: 850,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop',
    Description: 'Top-floor suite offering spectacular 360-degree views and luxury furnishings.',
    BedType: 'King Bed',
    RoomSize: '900 sqft',
    Amenities: 'Free WiFi, Jacuzzi, Lounge Access'
  },
  {
    RoomID: 'm10',
    RoomNumber: '110',
    RoomTypeID: 'Cozy Single',
    Status: 'Occupied',
    Price: 90,
    image: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1000&auto=format&fit=crop',
    Description: 'A snug and comfortable space tailored for solo travelers.',
    BedType: 'Single Bed',
    RoomSize: '200 sqft',
    Amenities: 'Free WiFi'
  },
  {
    RoomID: 'm11',
    RoomNumber: '201',
    RoomTypeID: 'Oceanfront Villa',
    Status: 'Available',
    Price: 650,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000&auto=format&fit=crop',
    Description: 'Private villa steps away from the beach with your own plunge pool.',
    BedType: 'King Bed',
    RoomSize: '800 sqft',
    Amenities: 'Free WiFi, Plunge Pool, Beach Access'
  },
  {
    RoomID: 'm12',
    RoomNumber: '202',
    RoomTypeID: 'Honeymoon Suite',
    Status: 'Available',
    Price: 500,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
    Description: 'Romantic suite designed for couples, featuring a spa bath and ocean views.',
    BedType: 'King Bed',
    RoomSize: '550 sqft',
    Amenities: 'Free WiFi, Spa Bath, Balcony'
  },
  {
    RoomID: 'm13',
    RoomNumber: '203',
    RoomTypeID: 'Business Studio',
    Status: 'Occupied',
    Price: 220,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000&auto=format&fit=crop',
    Description: 'Modern studio equipped with a spacious work desk and high-speed internet.',
    BedType: 'Queen Bed',
    RoomSize: '450 sqft',
    Amenities: 'High-speed WiFi, Work Desk'
  }
];

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [minCapacity, setMinCapacity] = useState<number>(1);


  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/rooms')
      .then(response => {
        // Map backend snake_case to pascal case if needed
        const fetchedRooms = response.data.map((r: any) => ({
          RoomID: r.room_id || r.RoomID,
          RoomNumber: r.room_number || r.RoomNumber || 'TBD',
          RoomTypeID: r.type || r.RoomTypeID || 'Standard',
          Status: r.status || r.current_status || r.Status || 'Available',
          Price: r.price_per_night || r.Price || 120,
          Discount: Number(r.discount || r.Discount || 0),
          image: r.image || mockRooms[Math.floor(Math.random() * mockRooms.length)].image,
          Description: r.description || 'Elegantly appointed space featuring premium amenities and stunning views.',
          BedType: r.bed_type || 'King Bed',
          RoomSize: r.room_size || '400 sqft',
          Capacity: r.capacity || 2,
          Amenities: r.amenities || 'Free WiFi'
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

  
  const uniqueTypes = Array.from(new Set(rooms.map(r => r.RoomTypeID)));
  
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

      
      {/* Filter Section */}
      <Container maxWidth="lg" sx={{ mt: -6, mb: 4, position: 'relative', zIndex: 10 }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white' }}>
          <TextField 
            placeholder="Search rooms, amenities, or description..." 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mr: 2, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }
            }}
          />
          <Button 
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterListIcon />} 
            onClick={() => setShowFilters(!showFilters)}
            sx={{ borderRadius: 8, whiteSpace: 'nowrap', textTransform: 'none', px: 3, borderColor: '#d4af37', color: showFilters ? 'white' : '#d4af37', bgcolor: showFilters ? '#d4af37' : 'transparent', '&:hover': { bgcolor: showFilters ? '#b5952f' : 'rgba(212, 175, 55, 0.1)', borderColor: '#b5952f' } }}
          >
            Filters
          </Button>
        </Paper>

        <Collapse in={showFilters}>
          <Paper elevation={2} sx={{ p: 4, mt: 2, borderRadius: 3, bgcolor: 'white' }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Room Type</Typography>
                <TextField select fullWidth size="small" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <MenuItem value="All">All Types</MenuItem>
                  {uniqueTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Status</Typography>
                <TextField select fullWidth size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Occupied">Occupied</MenuItem>
                </TextField>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Min Capacity: {minCapacity} Persons</Typography>
                <Slider 
                  value={minCapacity} 
                  onChange={(_, val) => setMinCapacity(val as number)} 
                  step={1} 
                  marks 
                  min={1} 
                  max={10} 
                  valueLabelDisplay="auto"
                  sx={{ color: '#d4af37' }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Max Price: ${maxPrice}</Typography>
                <Slider 
                  value={maxPrice} 
                  onChange={(_, val) => setMaxPrice(val as number)} 
                  step={50} 
                  min={50} 
                  max={2000} 
                  valueLabelDisplay="auto"
                  sx={{ color: '#d4af37' }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Container>

      {/* Rooms Grid */}
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress sx={{ color: '#d4af37' }} />
          </Box>
        ) : (
          
          <Grid container spacing={4}>
            {rooms
              .filter(room => {
                // Apply filters
                if (searchQuery && !room.RoomNumber.toLowerCase().includes(searchQuery.toLowerCase()) && !room.RoomTypeID.toLowerCase().includes(searchQuery.toLowerCase()) && !room.Description.toLowerCase().includes(searchQuery.toLowerCase()) && !room.Amenities.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (statusFilter !== 'All' && room.Status !== statusFilter) return false;
                if (typeFilter !== 'All' && room.RoomTypeID !== typeFilter) return false;
                if (room.Price > maxPrice) return false;
                if (room.Capacity < minCapacity) return false;
                return true;
              })
              // Sort discounted items to the top of the search results
              .sort((a, b) => (b.Discount || 0) - (a.Discount || 0))
              .map((room) => {
              const isAvailable = room.Status === 'Available';
              const discountPercent = room.Discount || 0;
              const discountedPrice = discountPercent > 0 ? Math.round(room.Price * (1 - discountPercent / 100)) : room.Price;

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
                      border: discountPercent > 0 ? '2px solid #d4af37' : '1px solid rgba(0,0,0,0.05)',
                      bgcolor: 'white',
                      position: 'relative',
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
                      {discountPercent > 0 && (
                        <Chip 
                          label={`${discountPercent}% OFF`}
                          sx={{ 
                            position: 'absolute', 
                            top: 16, 
                            left: 16,
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            bgcolor: '#d4af37',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }} 
                        />
                      )}
                      {(room.Status === 'Available' || room.Status === 'Maintenance') && (
                        <Chip 
                          label={room.Status} 
                          sx={{ 
                            position: 'absolute', 
                            top: 16, 
                            right: 16,
                            fontWeight: 600,
                            bgcolor: isAvailable ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 152, 0, 0.9)',
                            color: isAvailable ? '#2e7d32' : 'white',
                            backdropFilter: 'blur(4px)'
                          }} 
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>
                          {room.RoomTypeID}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#d4af37', fontWeight: 'bold', textAlign: 'right' }}>
                          {discountPercent > 0 ? (
                            <>
                              <Typography component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.85em', mr: 1 }}>
                                ${room.Price}
                              </Typography>
                              ${discountedPrice}
                              <Typography component="span" variant="caption" sx={{ color: '#e65100', display: 'block', fontWeight: 'bold' }}>
                                / night ({discountPercent}% off)
                              </Typography>
                            </>
                          ) : (
                            <>
                              ${room.Price}
                              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right' }}>
                                / night
                              </Typography>
                            </>
                          )}
                        </Typography>
                      </Box>
                      
                      <Typography color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>
                        Room {room.RoomNumber} • {room.Description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 2, mb: 3, color: 'text.secondary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BedIcon fontSize="small" />
                          <Typography variant="caption">{room.BedType}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AspectRatioIcon fontSize="small" />
                          <Typography variant="caption">{room.RoomSize}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WifiIcon fontSize="small" />
                          <Typography variant="caption">{room.Amenities}</Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      <Button 
                        variant="contained" 
                        fullWidth 
                        disabled={!isAvailable}
                        onClick={() => navigate('/book', { state: { room: { ...room, Price: discountedPrice, OriginalPrice: room.Price } } })}
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
