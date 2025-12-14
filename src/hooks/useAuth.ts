/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

export interface User {
  // Define user properties as needed
  [key: string]: any;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // Add login/logout logic here
  return { user, setUser };
}
