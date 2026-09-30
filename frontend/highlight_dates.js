import fs from 'fs';

const filePath = 'C:\\Users\\94713\\Desktop\\flutter\\hotel management system\\Hotel Management System\\frontend\\src\\pages\\guest\\Book.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add PickersDay import if not exists
if (!content.includes('PickersDay')) {
  content = content.replace(
    `import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';`,
    `import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';\nimport { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';`
  );
}

// Add CustomDay component just before the Book component
if (!content.includes('const CustomPickersDay')) {
  const customDay = `
function CustomPickersDay(props: PickersDayProps<Dayjs> & { bookedDates: {start: Dayjs, end: Dayjs}[] }) {
  const { day, bookedDates, ...other } = props;
  
  const isBooked = bookedDates.some(range => 
    day.isSame(range.start, 'day') || day.isSame(range.end, 'day') || 
    (day.isAfter(range.start, 'day') && day.isBefore(range.end, 'day'))
  );

  return (
    <PickersDay 
      {...other} 
      day={day} 
      sx={{
        ...(isBooked && {
          backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
          color: '#ef4444 !important',
          textDecoration: 'line-through',
          fontWeight: 'bold',
        })
      }} 
    />
  );
}

const Book: React.FC = () => {`;
  content = content.replace('const Book: React.FC = () => {', customDay);
}

// Inject slots into the DatePickers
const dp1 = `<DatePicker
                            label="Check-In Date"
                            value={formData.checkInDate}
                            onChange={(newValue) => setFormData({ ...formData, checkInDate: newValue })}
                            shouldDisableDate={shouldDisableDate}
                            disablePast
                            slots={{ day: CustomPickersDay }}
                            slotProps={{ day: { bookedDates } as any }}
                            sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                          />`;
                          
const dp2 = `<DatePicker
                            label="Check-Out Date"
                            value={formData.checkOutDate}
                            onChange={(newValue) => setFormData({ ...formData, checkOutDate: newValue })}
                            shouldDisableDate={(date) => {
                              if (shouldDisableDate(date)) return true;
                              if (formData.checkInDate && date.isBefore(formData.checkInDate.add(1, 'day'), 'day')) return true;
                              return false;
                            }}
                            disablePast
                            slots={{ day: CustomPickersDay }}
                            slotProps={{ day: { bookedDates } as any }}
                            sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                          />`;

content = content.replace(/<DatePicker[\s\S]*?label="Check-In Date"[\s\S]*?\/>/, dp1);
content = content.replace(/<DatePicker[\s\S]*?label="Check-Out Date"[\s\S]*?\/>/, dp2);

fs.writeFileSync(filePath, content);
console.log('Book.tsx updated to highlight dates!');
