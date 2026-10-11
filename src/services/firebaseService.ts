import { testConnection, auth, db } from './firebaseClient';
import firebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  mode: 'demo' | 'firebase';
  error?: string;
  projectId?: string;
}

export function getStoredFirebaseConfig() {
  return firebaseConfig;
}

export function initFirebaseIfConfigured() {
  return { app: null, db, auth };
}

export async function testFirebaseConnection(): Promise<boolean> {
  return await testConnection();
}

export function getFirebaseStatus(): FirebaseConnectionStatus {
  return {
    isConfigured: true,
    isConnected: true,
    mode: 'firebase',
    projectId: firebaseConfig.projectId,
  };
}

export function saveCustomFirebaseConfig(config: Record<string, string>): void {
  localStorage.setItem('gcc_firebase_custom_config', JSON.stringify(config));
}

export function clearCustomFirebaseConfig(): void {
  localStorage.removeItem('gcc_firebase_custom_config');
}
