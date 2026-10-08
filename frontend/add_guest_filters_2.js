import fs from 'fs';

const filePath = 'C:\\Users\\94713\\Desktop\\flutter\\hotel management system\\Hotel Management System\\frontend\\src\\pages\\guest\\Rooms.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('const [searchQuery, setSearchQuery]')) {
  content = content.replace(
    `import { \n  Typography, Box, Card, CardContent, Grid, Button, \n  CircularProgress, Container, CardMedia, Chip, Divider \n} from '@mui/material';`,
    `import { \n  Typography, Box, Card, CardContent, Grid, Button, \n  CircularProgress, Container, CardMedia, Chip, Divider, TextField, MenuItem, Slider, Collapse, InputAdornment, Paper \n} from '@mui/material';\nimport SearchIcon from '@mui/icons-material/Search';\nimport FilterListIcon from '@mui/icons-material/FilterList';`
  );

  content = content.replace(
    `RoomSize: r.room_size || '400 sqft',`,
    `RoomSize: r.room_size || '400 sqft',\n          Capacity: r.capacity || 2,`
  );

  const stateHooks = `const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [minCapacity, setMinCapacity] = useState<number>(1);
`;
  content = content.replace(/const \[rooms, setRooms\] = useState<any\[\]>\(\[\]\);\r?\n\s*const \[loading, setLoading\] = useState\(false\);\r?\n\s*const navigate = useNavigate\(\);/, stateHooks);

  const filterLogic = `
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
              .map((room) => {`;
              
  content = content.replace(/<Grid container spacing=\{4\}>\r?\n\s*\{rooms\.map\(\(room\) => \{/, filterLogic);

  const uniqueTypesLogic = `
  const uniqueTypes = Array.from(new Set(rooms.map(r => r.RoomTypeID)));
  
  return (`;
  content = content.replace(/return \(/, uniqueTypesLogic);

  const filterUI = `
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
                  onChange={(e, val) => setMinCapacity(val as number)} 
                  step={1} 
                  marks 
                  min={1} 
                  max={10} 
                  valueLabelDisplay="auto"
                  sx={{ color: '#d4af37' }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Max Price: $\${maxPrice}</Typography>
                <Slider 
                  value={maxPrice} 
                  onChange={(e, val) => setMaxPrice(val as number)} 
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
      <Container maxWidth="lg" sx={{ mt: 2 }}>`;
      
  content = content.replace(/\{\/\* Rooms Grid \*\/\}\r?\n\s*<Container maxWidth="lg" sx=\{\{ mt: -5 \}\}>/, filterUI);
  
  fs.writeFileSync(filePath, content);
  console.log('Successfully added filters to guest/Rooms.tsx');
} else {
  console.log('Filters already exist');
}
