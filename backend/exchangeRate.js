const RATE_URL = 'https://api.frankfurter.dev/v2/rate/USD/LKR';
const CACHE_MS = 60 * 60 * 1000;

let cachedRate = null;

export async function getUsdLkrRate() {
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_MS) return cachedRate;

  let response;
  try {
    response = await fetch(RATE_URL, { signal: AbortSignal.timeout(8000) });
  } catch {
    throw new Error('Exchange-rate service is unavailable. Please try again later.');
  }
  if (!response.ok) throw new Error('Exchange-rate service is unavailable. Please try again later.');

  const data = await response.json();
  const rate = Number(data.rate);
  if (data.base !== 'USD' || data.quote !== 'LKR' || !Number.isFinite(rate) || rate <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
    throw new Error('Exchange-rate service returned an invalid USD/LKR rate.');
  }

  cachedRate = { rate, date: data.date, fetchedAt: Date.now(), source: 'Frankfurter' };
  return cachedRate;
}

export function quoteRoomCharge(pricePerNight, discountPercent, nights, rate) {
  const nightlyUsd = Math.round(Number(pricePerNight) * (1 - Number(discountPercent || 0) / 100) * 100) / 100;
  if (!Number.isFinite(nightlyUsd) || nightlyUsd <= 0 || !Number.isInteger(nights) || nights < 1 || !Number.isFinite(rate) || rate <= 0) {
    throw new Error('Invalid room price, stay dates, or exchange rate.');
  }
  return {
    nightlyUsd,
    subtotalUsd: Math.round(nightlyUsd * nights * 100) / 100,
    amountLkr: Math.round(nightlyUsd * nights * rate * 100) / 100,
  };
}
