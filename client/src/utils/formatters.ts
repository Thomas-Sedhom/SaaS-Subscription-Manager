export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value ?? 0));
}

export function formatDate(value) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

export function formatCardExpiry(month, year) {
  if (!month || !year) {
    return 'N/A';
  }

  const normalizedMonth = String(month).padStart(2, '0');
  const normalizedYear = String(year).slice(-2);
  return `${normalizedMonth}/${normalizedYear}`;
}

export function formatPaymentMethodLabel(paymentMethod) {
  if (!paymentMethod) {
    return 'Saved card';
  }

  const holder = paymentMethod.cardholderName?.trim();
  const last4 = paymentMethod.last4;

  if (holder && last4) {
    return `${holder} ending in ${last4}`;
  }

  if (last4) {
    return `Card ending in ${last4}`;
  }

  if (holder) {
    return holder;
  }

  return 'Saved card';
}
