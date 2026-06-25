import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate, className = '' }) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false
    };
  };
  const [time, setTime] = useState(calc);

  useEffect(() => {
    const timer = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (time.expired) return null;

  const Box = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 dark:bg-gray-700 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold text-lg font-mono">{String(value).padStart(2, '0')}</div>
      <span className="text-[10px] text-gray-500 mt-0.5 uppercase">{label}</span>
    </div>
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Box value={time.days} label="days" />
      <span className="text-lg font-bold text-amber-500 mt-[-1rem]">:</span>
      <Box value={time.hours} label="hrs" />
      <span className="text-lg font-bold text-amber-500 mt-[-1rem]">:</span>
      <Box value={time.minutes} label="min" />
      <span className="text-lg font-bold text-amber-500 mt-[-1rem]">:</span>
      <Box value={time.seconds} label="sec" />
    </div>
  );
}
