export function formatDistance(km) {
  if (km == null) return '-- km';
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${Number(km).toFixed(1)} km`;
}

export function formatEta(minutes) {
  if (minutes == null) return '-- min';
  if (minutes <= 1) return 'Under 1 min';
  return `${minutes} min`;
}

export function formatDateTime(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatPhoneDisplay(phone) {
  if (!phone) return '';
  return phone;
}

