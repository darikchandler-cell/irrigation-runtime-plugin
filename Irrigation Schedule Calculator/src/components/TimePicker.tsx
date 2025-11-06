import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TimePickerProps {
  value: string; // Format: "HH:MM" in 24-hour format
  onChange: (value: string) => void;
  className?: string;
}

export default function TimePicker({ value, onChange, className = '' }: TimePickerProps) {
  // Parse the 24-hour time value
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: '6', minute: '00', period: 'AM' };
    
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    const period = hour >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    if (hour === 0) hour = 12;
    else if (hour > 12) hour = hour - 12;
    
    return {
      hour: hour.toString(),
      minute: minuteStr || '00',
      period
    };
  };

  // Convert to 24-hour format
  const formatTo24Hour = (hour: string, minute: string, period: string) => {
    let hour24 = parseInt(hour);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  const { hour, minute, period } = parseTime(value);

  const handleHourChange = (newHour: string) => {
    onChange(formatTo24Hour(newHour, minute, period));
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(formatTo24Hour(hour, newMinute, period));
  };

  const handlePeriodChange = (newPeriod: string) => {
    onChange(formatTo24Hour(hour, minute, newPeriod));
  };

  // Generate hours 1-12
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // Generate minutes in 15-minute intervals
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[80px] h-10">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map(h => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[80px] h-10">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map(m => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[80px] h-10">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
