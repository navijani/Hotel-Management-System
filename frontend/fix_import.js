import fs from 'fs';

const file = 'C:/Users/94713/Desktop/flutter/hotel management system/Hotel Management System/frontend/src/pages/guest/Book.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { PickerDay, PickerDayProps } from '@mui/x-date-pickers';", "import { PickerDay } from '@mui/x-date-pickers';");
content = content.replace(/props: PickerDayProps<Dayjs>/g, "props: any");

fs.writeFileSync(file, content);
console.log('Fixed imports!');
