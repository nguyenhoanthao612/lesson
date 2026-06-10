/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  query,
  where,
  orderBy
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { DEFAULT_LESSONS, DEFAULT_RESOURCES } from "./defaultData";
import { Lesson, FileResource, IC3Category, BlockType } from "./types";

// Detect if real Firebase credentials are provided
const isRealFirebaseConfigured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "");

let app: any;
let db: any;
let auth: any;
let googleProvider: any;

if (isRealFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    
    // As per Firebase Integration Skill, test connection early
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.warn("Firebase client is currently offline. Operating in cache mode.");
        }
      }
    };
    testConnection();
  } catch (error) {
    console.error("Failed to initialize active Firebase. Falling back to robust offline storage.", error);
    app = null;
    db = null;
    auth = null;
  }
}

// ==========================================
// ERROR HANDLER (COVERS PILE-3 MANDATE)
// ==========================================
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || "mock-uid",
      email: auth?.currentUser?.email || "demo-teacher@ic3platform.edu",
      emailVerified: auth?.currentUser?.emailVerified || true,
      isAnonymous: auth?.currentUser?.isAnonymous || false,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((p: any) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error Caught:", JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// LOCAL STORAGE OFFLINE DATABASE ENGINE
// ==========================================
class OfflineDatabase {
  private getStorageKey(key: string): string {
    return `ic3_platform_${key}`;
  }

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (!localStorage.getItem(this.getStorageKey("lessons"))) {
      localStorage.setItem(this.getStorageKey("lessons"), JSON.stringify(DEFAULT_LESSONS));
    }
    if (!localStorage.getItem(this.getStorageKey("resources"))) {
      localStorage.setItem(this.getStorageKey("resources"), JSON.stringify(DEFAULT_RESOURCES));
    }
    if (!localStorage.getItem(this.getStorageKey("user"))) {
      // Create user dummy session
      const mockUser = {
        uid: "mock-uid-custom-teacher",
        displayName: "Demo IC3 Instructor",
        email: "demo-teacher@ic3platform.edu",
        photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=60"
      };
      localStorage.setItem(this.getStorageKey("user"), JSON.stringify(mockUser));
    }
  }

  // Auth Operations
  getLoggedInUser() {
    const raw = localStorage.getItem(this.getStorageKey("user"));
    return raw ? JSON.parse(raw) : null;
  }

  loginWithGoogleMock(email?: string) {
    const mockUser = {
      uid: "mock-uid-custom-teacher",
      displayName: "Demo IC3 Instructor",
      email: email || "demo-teacher@ic3platform.edu",
      photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=60"
    };
    localStorage.setItem(this.getStorageKey("user"), JSON.stringify(mockUser));
    return mockUser;
  }

  logoutMock() {
    localStorage.removeItem(this.getStorageKey("user"));
  }

  // Lesson Operations
  getLessons(): Lesson[] {
    const raw = localStorage.getItem(this.getStorageKey("lessons"));
    return raw ? JSON.parse(raw) : [];
  }

  saveLesson(lesson: Lesson) {
    const lessons = this.getLessons();
    const idx = lessons.findIndex(l => l.id === lesson.id);
    if (idx >= 0) {
      lessons[idx] = lesson;
    } else {
      lessons.unshift(lesson);
    }
    localStorage.setItem(this.getStorageKey("lessons"), JSON.stringify(lessons));
  }

  deleteLesson(id: string) {
    const lessons = this.getLessons();
    const filtered = lessons.filter(l => l.id !== id);
    localStorage.setItem(this.getStorageKey("lessons"), JSON.stringify(filtered));
  }

  // Resource Operations
  getResources(): FileResource[] {
    const raw = localStorage.getItem(this.getStorageKey("resources"));
    return raw ? JSON.parse(raw) : [];
  }

  saveResource(resource: FileResource) {
    const res = this.getResources();
    const idx = res.findIndex(r => r.id === resource.id);
    if (idx >= 0) {
      res[idx] = resource;
    } else {
      res.unshift(resource);
    }
    localStorage.setItem(this.getStorageKey("resources"), JSON.stringify(res));
  }

  deleteResource(id: string) {
    const res = this.getResources();
    const filtered = res.filter(r => r.id !== id);
    localStorage.setItem(this.getStorageKey("resources"), JSON.stringify(filtered));
  }
}

export const offlineDb = new OfflineDatabase();

// ==========================================
// UNIFIED DATA HANDLERS & WRAPPERS
// ==========================================

export async function loginWithGoogle(): Promise<{ uid: string; displayName: string | null; email: string | null; photoURL: string | null }> {
  if (isRealFirebaseConfigured && auth) {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return {
        uid: res.user.uid,
        displayName: res.user.displayName,
        email: res.user.email,
        photoURL: res.user.photoURL
      };
    } catch (err) {
      console.error("Google Auth Error:", err);
      throw err;
    }
  } else {
    // Return mock login
    return offlineDb.loginWithGoogleMock();
  }
}

export async function loginWithCredentials(email: string, password: string): Promise<{ uid: string; displayName: string | null; email: string | null; photoURL: string | null }> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error("Please enter both your email address and password.");
  }

  // Try real Firebase Auth first, if configured
  if (isRealFirebaseConfigured && auth) {
    try {
      const res = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const u = {
        uid: res.user.uid,
        displayName: res.user.displayName || trimmedEmail.split("@")[0],
        email: res.user.email,
        photoURL: res.user.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=60"
      };
      localStorage.setItem("ic3_platform_user", JSON.stringify(u));
      return u;
    } catch (err: any) {
      console.warn("Firebase credential sign-in failed, checking auto-registration fallback...", err);
      // Automatically register the instructor email in the real Firebase Auth backend to ensure remote DB synchronization
      if (trimmedEmail === "nguyenhoanthao612@gmail.com" && trimmedPassword === "57717469" && (err.code === "auth/user-not-found" || err.code === "auth/invalid-login-credentials" || err.code === "auth/invalid-credential")) {
        try {
          console.info("Auto-registering teacher credentials on the active Firebase console...");
          const res = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
          const u = {
            uid: res.user.uid,
            displayName: "Nguyen Hoan Thao",
            email: res.user.email,
            photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=60"
          };
          localStorage.setItem("ic3_platform_user", JSON.stringify(u));
          return u;
        } catch (regErr) {
          console.error("Auto-registration of cloud credential failed:", regErr);
        }
      }
    }
  }

  // Fallback to local credential checking (for offline testing)
  if (trimmedEmail === "nguyenhoanthao612@gmail.com" && trimmedPassword === "57717469") {
    const mockUser = {
      uid: "user-nguyenhoanthao612",
      displayName: "Nguyen Hoan Thao",
      email: "nguyenhoanthao612@gmail.com",
      photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=60"
    };
    localStorage.setItem("ic3_platform_user", JSON.stringify(mockUser));
    return mockUser;
  } else {
    throw new Error("Invalid email or password. Use default credentials if offline.");
  }
}

export async function logoutUser(): Promise<void> {
  offlineDb.logoutMock();
  if (isRealFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Failed to sign out of Firebase:", err);
    }
  }
}

// Subscribes to Authentication Changes
export function subscribeToAuth(callback: (user: any | null) => void) {
  // Check if we have a locally stored session (from credentials sign-in)
  const initialUser = offlineDb.getLoggedInUser();
  if (initialUser && initialUser.uid === "user-nguyenhoanthao612") {
    callback(initialUser);
    
    // Simulate periodic listener for changes
    const interval = setInterval(() => {
      const u = offlineDb.getLoggedInUser();
      callback(u);
    }, 2000);
    return () => clearInterval(interval);
  }

  if (isRealFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
      } else {
        // Fallback to local user if it was signed in locally
        const u = offlineDb.getLoggedInUser();
        if (u && u.uid === "user-nguyenhoanthao612") {
          callback(u);
        } else {
          callback(null);
        }
      }
    });
  } else {
    // Offline implementation triggers state with standard delay
    callback(initialUser);
    
    // Simulate periodic listener
    const interval = setInterval(() => {
      const u = offlineDb.getLoggedInUser();
      callback(u);
    }, 2000);
    
    return () => clearInterval(interval);
  }
}

// Get All Lessons: React-friendly subscription or direct fetch
export function subscribeToLessons(callback: (lessons: Lesson[]) => void) {
  const collectionName = "lessons";
  if (isRealFirebaseConfigured && db && auth?.currentUser) {
    const q = query(collection(db, collectionName), orderBy("updatedAt", "desc"));
    return onSnapshot(q, async (snapshot) => {
      const results: Lesson[] = [];
      snapshot.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as Lesson);
      });
      
      // If Firestore lessons collection is empty (e.g. fresh environment),
      // we auto-seed the DEFAULT_LESSONS with the current active user's uid to bypass blank-canvases
      if (results.length === 0) {
        console.info("Firestore lessons database is empty. Auto-seeding default templates...");
        const currentUid = auth.currentUser.uid;
        const currentEmail = auth.currentUser.email || "teacher@ic3platform.com";
        for (const defaultL of DEFAULT_LESSONS) {
          try {
            const seededLesson: Lesson = {
              ...defaultL,
              authorId: currentUid,
              authorEmail: currentEmail,
              updatedAt: Date.now()
            };
            await setDoc(doc(db, "lessons", defaultL.id), seededLesson);
          } catch (err) {
            console.error("Failed to seed default lesson into Firestore:", err);
          }
        }
      } else {
        callback(results);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    });
  } else {
    callback(offlineDb.getLessons());
    
    // Periodically check local storage changes
    const interval = setInterval(() => {
      callback(offlineDb.getLessons());
    }, 1000);
    return () => clearInterval(interval);
  }
}

// Save or Update Lesson
export async function saveLesson(lesson: Lesson): Promise<void> {
  const path = `lessons/${lesson.id}`;
  if (isRealFirebaseConfigured && db && auth?.currentUser) {
    try {
      await setDoc(doc(db, "lessons", lesson.id), {
        ...lesson,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  } else {
    offlineDb.saveLesson({
      ...lesson,
      updatedAt: Date.now()
    });
  }
}

// Create Lesson Subroutine
export async function createNewLesson(title: string, description: string, category: IC3Category, topic: string, author: { uid: string; email: string }): Promise<Lesson> {
  const newLesson: Lesson = {
    id: `lesson-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    description,
    category,
    topic,
    thumbnailUrl: getCategoryImagePlaceholder(category),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: author.uid,
    authorEmail: author.email,
    pages: [
      {
        id: `page-${Date.now()}-1`,
        title: "Introduction Page",
        blocks: [
          {
            id: `block-${Date.now()}-head`,
            type: BlockType.HEADING,
            headingText: `Welcome to ${title}`
          },
          {
            id: `block-${Date.now()}-para`,
            type: BlockType.PARAGRAPH,
            paragraphText: description || "In this lesson, we will cover the foundational core standards expected in the IC3 GS6 exam. Let's begin our review session."
          }
        ]
      }
    ]
  };

  await saveLesson(newLesson);
  return newLesson;
}

// Helper to provide nice default thumbnails based on IC3 syllabus category
export function getCategoryImagePlaceholder(category: IC3Category): string {
  switch (category) {
    case IC3Category.COMPUTING_FUNDAMENTALS:
      return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60";
    case IC3Category.KEY_APPLICATIONS:
      return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60";
    case IC3Category.LIVING_ONLINE:
      return "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60";
    default:
      return "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60";
  }
}

// Delete Lesson
export async function deleteLesson(id: string): Promise<void> {
  const path = `lessons/${id}`;
  if (isRealFirebaseConfigured && db && auth?.currentUser) {
    try {
      await deleteDoc(doc(db, "lessons", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  } else {
    offlineDb.deleteLesson(id);
  }
}

// Duplicate Lesson
export async function duplicateLesson(lesson: Lesson, newTitle?: string): Promise<Lesson> {
  const currentUid = auth?.currentUser?.uid || "mock-uid-custom-teacher";
  const currentEmail = auth?.currentUser?.email || "demo-teacher@ic3platform.edu";

  const duplicated: Lesson = {
    ...JSON.parse(JSON.stringify(lesson)), // Deep clone
    id: `lesson-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: newTitle || `${lesson.title} (Copy)`,
    authorId: currentUid,
    authorEmail: currentEmail,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await saveLesson(duplicated);
  return duplicated;
}

// Subscribe to Resources
export function subscribeToResources(callback: (resources: FileResource[]) => void) {
  const collectionName = "resources";
  if (isRealFirebaseConfigured && db && auth?.currentUser) {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    return onSnapshot(q, async (snapshot) => {
      const results: FileResource[] = [];
      snapshot.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as FileResource);
      });
      
      // If Firestore resources collection is empty, auto-seed default handouts
      if (results.length === 0) {
        console.info("Firestore resources collection is empty. Auto-seeding default guides...");
        for (const defaultR of DEFAULT_RESOURCES) {
          try {
            await setDoc(doc(db, "resources", defaultR.id), defaultR);
          } catch (err) {
            console.error("Failed to seed default resource into Firestore:", err);
          }
        }
      } else {
        callback(results);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    });
  } else {
    callback(offlineDb.getResources());
    const interval = setInterval(() => {
      callback(offlineDb.getResources());
    }, 1000);
    return () => clearInterval(interval);
  }
}

// Add File Resource
export async function saveResource(res: FileResource): Promise<void> {
  const path = `resources/${res.id}`;
  if (isRealFirebaseConfigured && db && auth?.currentUser) {
    try {
      await setDoc(doc(db, "resources", res.id), res);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  } else {
    offlineDb.saveResource(res);
  }
}

// Delete File Resource
export async function deleteResource(id: string): Promise<void> {
  const path = `resources/${id}`;
  if (isRealFirebaseConfigured && db && auth?.currentUser) {
    try {
      await deleteDoc(doc(db, "resources", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  } else {
    offlineDb.deleteResource(id);
  }
}
