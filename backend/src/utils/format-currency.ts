// Convert dollars to cents when saving
export function convertToCents(amount: number) {
  return Math.round(amount * 100);
}

// Convert cents to dollers when retrieving
export function convertToDollerUnit(amount: number) {
  return amount / 100;
}
