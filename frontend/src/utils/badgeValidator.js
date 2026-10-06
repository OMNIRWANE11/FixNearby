export const BADGE_REGEX = /^FN-[A-Z0-9]{5}$/;

export function isValidBadgeCode(code) {
  if (!code || typeof code !== 'string') return false;
  return BADGE_REGEX.test(code.trim().toUpperCase());
}

export function formatBadgeInput(value) {
  if (!value) return '';
  let clean = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!clean.startsWith('FN-') && clean.length > 0) {
    if (clean.startsWith('FN')) {
      clean = 'FN-' + clean.slice(2);
    } else {
      clean = 'FN-' + clean;
    }
  }
  return clean.slice(0, 8); // 'FN-XXXXX' is 8 characters
}

