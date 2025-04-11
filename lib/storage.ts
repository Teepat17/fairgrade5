import { openDB } from 'idb';

interface GradingSession {
  id: string;
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

// Initialize the database
async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveGradingSession(session: GradingSession) {
  const db = await initDB();
  await db.put(STORE_NAME, session);
}

export async function getGradingSession(id: string) {
  const db = await initDB();
  return db.get(STORE_NAME, id);
}

export async function getAllGradingSessions(): Promise<GradingSession[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function deleteGradingSession(id: string) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

// Function to convert File to base64
export async function fileToBase64(file: File): Promise<string> {
  const db = await initDB();
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