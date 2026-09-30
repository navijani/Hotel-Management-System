import fs from 'fs';

const adminRoomsPath = 'C:\\Users\\94713\\Desktop\\flutter\\hotel management system\\Hotel Management System\\frontend\\src\\pages\\system-admin\\Rooms.tsx';
let content = fs.readFileSync(adminRoomsPath, 'utf8');

const newMockRooms = `const mockRooms: any[] = [
  { room_id: 1, room_number: '101', type: 'Deluxe Ocean View', capacity: 2, price_per_night: 250, status: 'Available', image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop', description: 'Elegantly appointed space featuring premium amenities and stunning ocean views.', bed_type: 'King Bed', room_size: '450 sqft', amenities: 'Free WiFi, Balcony' },
  { room_id: 2, room_number: '102', type: 'Premium Suite', capacity: 4, price_per_night: 450, status: 'Available', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop', description: 'Spacious suite with separate living area and exclusive lounge access.', bed_type: '2 Queen Beds', room_size: '600 sqft', amenities: 'Free WiFi, Lounge Access' },
  { room_id: 3, room_number: '103', type: 'Standard Garden', capacity: 2, price_per_night: 150, status: 'Occupied', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop', description: 'Cozy room with beautiful views of our award-winning gardens.', bed_type: 'Queen Bed', room_size: '350 sqft', amenities: 'Free WiFi' },
  { room_id: 4, room_number: '104', type: 'Executive Suite', capacity: 2, price_per_night: 550, status: 'Available', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop', description: 'Luxurious suite featuring panoramic city views and private dining area.', bed_type: 'King Bed', room_size: '750 sqft', amenities: 'Free WiFi, Mini Bar, Lounge Access' },
  { room_id: 5, room_number: '105', type: 'Family Room', capacity: 4, price_per_night: 200, status: 'Available', image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop', description: 'Spacious accommodation perfect for family getaways with interconnected rooms.', bed_type: '2 Queen Beds', room_size: '500 sqft', amenities: 'Free WiFi, TV, Kitchenette' },
  { room_id: 6, room_number: '106', type: 'Presidential Suite', capacity: 2, price_per_night: 1200, status: 'Occupied', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop', description: 'The ultimate luxury experience with a private terrace and personal butler service.', bed_type: 'King Bed', room_size: '1200 sqft', amenities: 'Free WiFi, Private Pool, Butler' },
  { room_id: 7, room_number: '107', type: 'Standard City View', capacity: 2, price_per_night: 130, status: 'Available', image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop', description: 'Comfortable room overlooking the vibrant city skyline.', bed_type: 'Queen Bed', room_size: '300 sqft', amenities: 'Free WiFi' },
  { room_id: 8, room_number: '108', type: 'Deluxe Twin', capacity: 2, price_per_night: 180, status: 'Available', image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop', description: 'Elegant twin room ideal for friends or colleagues traveling together.', bed_type: '2 Twin Beds', room_size: '400 sqft', amenities: 'Free WiFi, Balcony' },
  { room_id: 9, room_number: '109', type: 'Penthouse Suite', capacity: 4, price_per_night: 850, status: 'Available', image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop', description: 'Top-floor suite offering spectacular 360-degree views and luxury furnishings.', bed_type: 'King Bed', room_size: '900 sqft', amenities: 'Free WiFi, Jacuzzi, Lounge Access' },
  { room_id: 10, room_number: '110', type: 'Cozy Single', capacity: 1, price_per_night: 90, status: 'Occupied', image_url: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1000&auto=format&fit=crop', description: 'A snug and comfortable space tailored for solo travelers.', bed_type: 'Single Bed', room_size: '200 sqft', amenities: 'Free WiFi' },
  { room_id: 11, room_number: '201', type: 'Oceanfront Villa', capacity: 4, price_per_night: 650, status: 'Available', image_url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000&auto=format&fit=crop', description: 'Private villa steps away from the beach with your own plunge pool.', bed_type: 'King Bed', room_size: '800 sqft', amenities: 'Free WiFi, Plunge Pool, Beach Access' },
  { room_id: 12, room_number: '202', type: 'Honeymoon Suite', capacity: 2, price_per_night: 500, status: 'Available', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop', description: 'Romantic suite designed for couples, featuring a spa bath and ocean views.', bed_type: 'King Bed', room_size: '550 sqft', amenities: 'Free WiFi, Spa Bath, Balcony' },
  { room_id: 13, room_number: '203', type: 'Business Studio', capacity: 2, price_per_night: 220, status: 'Occupied', image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000&auto=format&fit=crop', description: 'Modern studio equipped with a spacious work desk and high-speed internet.', bed_type: 'Queen Bed', room_size: '450 sqft', amenities: 'High-speed WiFi, Work Desk' }
];`;

content = content.replace(/const mockRooms: Room\[\] = \[[\s\S]*?\];/, newMockRooms);

// Update interface if needed, but we use any[] now so it's ok.
content = content.replace(
  /image_url: '',\n\s*description: \(room as any\).description \|\| '',/g,
  `image_url: (room as any).image_url || (room as any).image || '',\n        description: (room as any).description || '',`
);

// Update modal UI to show existing image
const oldUI = `<Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Room Photo (Optional)</Typography>
              <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', justifyContent: 'flex-start' }}>
                {imageFile ? imageFile.name : 'Upload Image File'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Grid>`;

const newUI = `<Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Room Photo (Optional)</Typography>
              <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', justifyContent: 'flex-start' }}>
                {imageFile ? imageFile.name : 'Upload Image File'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              {!imageFile && formData.image_url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Current Image:</Typography>
                  <Box 
                    component="img" 
                    src={formData.image_url} 
                    alt="Room preview" 
                    sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2, mt: 1 }} 
                  />
                </Box>
              )}
            </Grid>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(adminRoomsPath, content);
console.log("Updated Rooms.tsx");
