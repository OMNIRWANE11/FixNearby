export function getTelLink(phone) {
  if (!phone) return '#';
  const cleanNumber = phone.replace(/[^\d+]/g, '');
  return `tel:${cleanNumber}`;
}

export function getWhatsAppLink(phone, options = {}) {
  if (!phone) return '#';
  // Strip + and spaces for WhatsApp API URL
  const cleanNumber = phone.replace(/[^\d]/g, '');
  
  const {
    category = 'General Emergency',
    problem = 'Urgent Repair',
    lat = null,
    lng = null,
    requestId = 'N/A'
  } = options;

  let message = `Emergency request via FixNearby:\nCategory: ${category}\nProblem: ${problem}`;
  
  if (lat && lng) {
    message += `\nMy location:\nhttps://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`;
  }
  
  message += `\nRequest ID: ${requestId}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

