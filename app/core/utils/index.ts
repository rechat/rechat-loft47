export const toISOWithOffset = (date: Date) => {
  const tzOffset = -date.getTimezoneOffset(); // in minutes
  const sign = tzOffset >= 0 ? '+' : '-';
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const hours = pad(tzOffset / 60);
  const minutes = pad(tzOffset % 60);
  const iso = date.toISOString().slice(0, -1); // remove 'Z'
  return `${iso}${sign}${hours}:${minutes}`;
}

export const getBuyersNames = (roles: IDealRole[]) => {
  const buyersNames = roles.filter(role => role.role === 'Buyer').map(role => role.legal_full_name)
  return buyersNames.join(', ')
}

export const getSellersNames = (roles: IDealRole[]) => {
  const sellersNames = roles.filter(role => role.role === 'Seller').map(role => role.legal_full_name)
  return sellersNames.join(', ')
}

// export const getMainAgent = (roles: IDealRole[]) => {
//   const mainAgent = roles.filter(role => role.role === 'Main Agent')
//   return mainAgent
// }
