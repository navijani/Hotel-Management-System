import fs from 'fs';

const filePath = 'C:\\Users\\94713\\Desktop\\flutter\\hotel management system\\Hotel Management System\\frontend\\src\\pages\\system-admin\\Rooms.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('const [searchQuery, setSearchQuery]')) {
  // Add imports
  content = content.replace(
    /import {([^}]+)} from '@mui\/material';/,
    `import {$1, InputAdornment} from '@mui/material';\nimport SearchIcon from '@mui/icons-material/Search';`
  );

  // Add state hooks
  const stateHooks = `  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRooms = () => {`;
  content = content.replace(/  const fetchRooms = \(\) => \{/, stateHooks);

  // Filter Logic
  const filterLogic = `
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={30} sx={{ my: 4, color: '#4facfe' }} /></TableCell></TableRow>
            ) : rooms.filter(room => {
                if (searchQuery && !room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) && !(room.type || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (statusFilter !== 'All' && room.status !== statusFilter) return false;
                return true;
            }).length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No rooms found.</Typography></TableCell></TableRow>
            ) : (
              rooms.filter(room => {
                if (searchQuery && !room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) && !(room.type || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (statusFilter !== 'All' && room.status !== statusFilter) return false;
                return true;
              }).map((room) => (`;
              
  content = content.replace(/            \{loading \? \([\s\S]*?\) : rooms\.length === 0 \? \([\s\S]*?\) : \(\n\s*rooms\.map\(\(room\) => \(/, filterLogic);

  // UI for Filters
  const filterUI = `
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField 
          placeholder="Search by room number or type..." 
          variant="outlined" 
          size="small" 
          sx={{ flexGrow: 1, bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
        <TextField 
          select 
          size="small" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Available">Available</MenuItem>
          <MenuItem value="Occupied">Occupied</MenuItem>
          <MenuItem value="Maintenance">Maintenance</MenuItem>
        </TextField>
      </Box>

      <TableContainer`;
      
  content = content.replace(/      <TableContainer/, filterUI);
  
  fs.writeFileSync(filePath, content);
  console.log('Successfully added filters to admin/Rooms.tsx');
} else {
  console.log('Filters already exist');
}
