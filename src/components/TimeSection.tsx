import { useEffect, useState } from 'react';

export const TimeSection = () => {
  const [time, setTime] = useState('00:00');
  const [date, setDate] = useState('Monday, January 1');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));

      setDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      <div className="text-6xl font-light text-white text-shadow">{time}</div>
      <div className="text-2xl opacity-80 text-white mt-4">{date}</div>
    </div>
  );
};
