import fs from 'fs';

const file = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/Book.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Grid container spacing=\{3\}>\s*<Grid size=\{\{ xs: 12, sm: 6 \}\}>\s*<DatePicker\s*label="Check-Out Date"/;

const replacement = `<Grid container spacing={3}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DatePicker
                              label="Check-In Date"
                              value={formData.checkInDate}
                              onChange={(newValue) => setFormData({ ...formData, checkInDate: newValue })}
                              shouldDisableDate={shouldDisableDate}
                              disablePast
                              slots={{ day: CustomPickerDay }}
                              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DatePicker
                              label="Check-Out Date"`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Restored Check-In DatePicker successfully!');
} else {
  console.log('Regex did not match!');
}
