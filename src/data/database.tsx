import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import type { PropsWithChildren } from 'react';

import { migrateDatabase } from './migrations';

export const DATABASE_NAME = 'immersion.db';

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await migrateDatabase(db);
}

export function ImmersionDatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase} useSuspense>
      {children}
    </SQLiteProvider>
  );
}
