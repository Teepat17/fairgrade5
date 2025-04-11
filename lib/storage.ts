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

const STORAGE_KEY = 'fairgrade_sessions';

export function saveGradingSession(session: GradingSession) {
  const sessions = getAllGradingSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getGradingSession(id: string) {
  const sessions = getAllGradingSessions();
  return sessions.find(session => session.id === id);
}

export function getAllGradingSessions(): GradingSession[] {
  const sessions = localStorage.getItem(STORAGE_KEY);
  return sessions ? JSON.parse(sessions) : [];
}

export function deleteGradingSession(id: string) {
  const sessions = getAllGradingSessions().filter(session => session.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// Function to convert File to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
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