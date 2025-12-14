export const getIdentifierType = (input: string): 'EMAIL' | 'MOBILE' => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^\+?[1-9]\d{6,14}$/;

  if (mobileRegex.test(input)) return 'MOBILE';
  if (emailRegex.test(input)) return 'EMAIL';

  throw new Error(
    'Invalid format. Please enter a valid email or mobile number.'
  );
};
