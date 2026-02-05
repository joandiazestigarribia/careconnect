export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'creditCard',
  'credit_card',
  'cvv',
  'ssn',
  'access_token',
  'refresh_token',
  'authorization',
  'apiKey',
  'api_key',
];

export function sanitizeSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeSensitiveData(item));
  }

  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_FIELDS.some(
      (field) => key.toLowerCase() === field.toLowerCase()
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
