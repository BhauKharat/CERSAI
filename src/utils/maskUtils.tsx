// utils/maskUtils.ts

// export const maskEmail = (email: string): string => {
//   if (!email.includes('@')) return email;
//   const [user, domain] = email.split('@');
//   const maskedUser = user[0] + 'XXXX';
//   return `${maskedUser}@${domain}`;
// };

export const maskEmail = (email: string): string => {
  if (!email.includes('@')) return email;
  const [user, domain] = email.split('@');

  if (user.length <= 3) {
    // For very short usernames, show first char + XXX
    return `${user[0]}XXXX@${domain}`;
  } else if (user.length <= 6) {
    // For medium usernames, show first 2 chars + XXX + last char
    return `${user.slice(0, 2)}XXXX${user.slice(-1)}@${domain}`;
  } else {
    // For long usernames, show first 3 chars + XXX + last 2 chars
    return `${user.slice(0, 3)}XXXX${user.slice(-2)}@${domain}`;
  }
};

export const maskMobile = (mobile: string): string => {
  if (mobile.length < 6) return mobile;
  return mobile.slice(0, 0) + 'XXXX' + mobile.slice(-4);
};
