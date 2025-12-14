export interface HeaderType {
  'Content-Type': string;
  Authorization: string;
  [key: string]: string | number | undefined;
}

export type ErrorsCallback = (error: string) => void;
