import { useState, useEffect } from 'react';
import { t } from '../utils/i18n';

const formatTimeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t(count === 1 ? 'time_year_ago' : 'time_years_ago', { count });
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t(count === 1 ? 'time_month_ago' : 'time_months_ago', { count });
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t(count === 1 ? 'time_day_ago' : 'time_days_ago', { count });
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t(count === 1 ? 'time_hour_ago' : 'time_hours_ago', { count });
  }
  interval = seconds / 60;
  if (interval > 1) {
    const count = Math.floor(interval);
    return t(count === 1 ? 'time_minute_ago' : 'time_minutes_ago', { count });
  }
  return t('time_just_now');
}

export const useTimeSince = (dateString: string) => {
  const date = new Date(dateString);
  const [timeSince, setTimeSince] = useState(() => formatTimeSince(date));

  useEffect(() => {
    // Set initial value immediately
    setTimeSince(formatTimeSince(date));

    const interval = setInterval(() => {
      setTimeSince(formatTimeSince(date));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [dateString]);

  return timeSince;
};
