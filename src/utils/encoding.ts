// utils/encoding.ts
export const tripleEncodePassword = (password: string): string => {
  let encoded = btoa(password); // 1st level
  encoded = btoa(encoded); // 2nd level
  encoded = btoa(encoded); // 3rd level
  return encoded;
};
