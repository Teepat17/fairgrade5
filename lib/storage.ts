import { openDB } from 'idb';

interface GradingSession {
  id: string;
  userId: string;
  subject: string;
  sessionName: string;
  studentFiles: string[]; // base64 strings
  rubricFile: string | null; // base64 string
  useTemplateRubric: boolean;
  results: any[];
  createdAt: string;
}

const DB_NAME = 'fairgrade_db';
const STORE_NAME = 'grading_sessions';
const DB_VERSION = 3; // Increment version to trigger upgrade

// Initialize the database
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // If store doesn't exist, create it
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId', 'userId');
      } else {
        // Get the store directly from the upgrade transaction
        const store = db.transaction(STORE_NAME).objectStore(STORE_NAME);
        
        // Check if index exists, if not create it
        if (!store.indexNames.contains('userId')) {
          // Delete the old store and recreate it with the index
          db.deleteObjectStore(STORE_NAME);
          const newStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          newStore.createIndex('userId', 'userId');
        }
      }
    },
    blocked(currentVersion, blockedVersion, event) {
      console.log(
        `Database upgrade blocked. Current version: ${currentVersion}, blocked version: ${blockedVersion}. Please close other tabs/windows.`
      );
    },
    blocking(currentVersion, blockedVersion, event) {
      console.log(
        `Database is being blocked. Current version: ${currentVersion}, blocking version: ${blockedVersion}.`
      );
    },
    terminated() {
      console.log('Database connection terminated unexpectedly.');
    },
  });
}

// Delete and recreate database if there are issues
async function resetDatabase() {
  try {
    const req = indexedDB.deleteDatabase(DB_NAME);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        console.log('Database deleted successfully');
        resolve(initDB());
      };
      req.onerror = () => {
        console.error('Could not delete database');
        reject(new Error('Could not delete database'));
      };
      req.onblocked = () => {
        console.log('Database deletion blocked. Please close all other tabs/windows using the database.');
      };
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

export async function saveGradingSession(session: GradingSession) {
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const db = await initDB();
      await db.put(STORE_NAME, session);
      return;
    } catch (error) {
      console.error(`Error saving session (attempt ${retries + 1}):`, error);
      retries++;

      if (retries === maxRetries) {
        // On last retry, attempt database reset
        try {
          const db = await resetDatabase();
          await db.put(STORE_NAME, session);
          return;
        } catch (resetError) {
          console.error('Final error after database reset:', resetError);
          throw resetError;
        }
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export async function getGradingSession(id: string) {
  try {
    const db = await initDB();
    return db.get(STORE_NAME, id);
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
}

export async function getAllGradingSessions(userId: string): Promise<GradingSession[]> {
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      
      try {
        const index = store.index('userId');
        return await index.getAll(userId);
      } catch (indexError) {
        // If index doesn't exist, fall back to filtering all records
        console.warn('userId index not found, falling back to manual filtering');
        const allSessions = await store.getAll();
        return allSessions.filter(session => session.userId === userId);
      }
    } catch (error) {
      console.error(`Error getting all sessions (attempt ${retries + 1}):`, error);
      retries++;

      if (retries === maxRetries) {
        // On last retry, attempt database reset
        try {
          const db = await resetDatabase();
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const index = store.index('userId');
          return await index.getAll(userId);
        } catch (resetError) {
          console.error('Final error after database reset:', resetError);
          throw resetError;
        }
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Failed to get grading sessions after multiple retries');
}

export async function deleteGradingSession(id: string, userId: string) {
  try {
    const db = await initDB();
    const session = await db.get(STORE_NAME, id);
    if (!session || session.userId !== userId) {
      throw new Error('Unauthorized to delete this session');
    }
    await db.delete(STORE_NAME, id);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

// Function to convert File to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Function to convert base64 to File
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
} 