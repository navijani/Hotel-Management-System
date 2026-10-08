import fs from 'fs';

const filePath = 'C:\\Users\\94713\\Desktop\\flutter\\hotel management system\\Hotel Management System\\frontend\\src\\pages\\guest\\Book.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove the external CustomPickerDay
content = content.replace(/function CustomPickerDay[\s\S]*?return \([\s\S]*?\);\r?\n\}/, '');

// Insert it inside Book component
const innerComponent = `const Book: React.FC = () => {
  const CustomPickerDay = (props: PickerDayProps<Dayjs>) => {
    const { day, ...other } = props;
    const isBooked = day && bookedDates.some(range => 
      day.isSame(range.start, 'day') || day.isSame(range.end, 'day') || 
      (day.isAfter(range.start, 'day') && day.isBefore(range.end, 'day'))
    );
    return (
      <PickerDay 
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
  };`;

content = content.replace('const Book: React.FC = () => {', innerComponent);

fs.writeFileSync(filePath, content);
console.log('Moved CustomPickerDay inside Book.tsx');
