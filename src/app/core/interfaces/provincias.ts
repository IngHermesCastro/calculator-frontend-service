// src/app/core/interfaces/provincias.ts
export interface Provincia {
    id: string;
    name: string;
    cities: {
      id: string;
      name: string;
    }[];
  }
  