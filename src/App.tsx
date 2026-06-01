/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  subscribeToAuth, 
  subscribeToLessons, 
  subscribeToResources, 
  loginWithGoogle, 
  loginWithCredentials,
  logoutUser, 
  saveLesson, 
  deleteLesson, 
  duplicateLesson, 
  createNewLesson, 
  saveResource, 
  deleteResource 
} from "./firebase";
import { Lesson, FileResource, IC3Category } from "./types";
import Dashboard from "./components/Dashboard";
import LessonEditor from "./components/LessonEditor";
import PresentationMode from "./components/PresentationMode";
import ResourceLibrary from "./components/ResourceLibrary";
import { 
  Laptop, 
  LogOut, 
  BookOpen, 
  FolderOpen, 
  Sparkles, 
  Lock, 
  Layers, 
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<FileResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Router States
  const [currentView, setCurrentView] = useState<"dashboard" | "resources">("dashboard");
  const [activeLessonForEdit, setActiveLessonForEdit] = useState<Lesson | null>(null);
  const [activeLessonForPresent, setActiveLessonForPresent] = useState<Lesson | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Email and password states
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);

  // Initialize auth tracking and real-time document listeners
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to lesson updates if logged in
  useEffect(() => {
    if (!user) return;
    const unsubscribeLessons = subscribeToLessons((updatedLessons) => {
      setLessons(updatedLessons);
    });
    return () => unsubscribeLessons();
  }, [user]);

  // Listen to resource additions if logged in
  useEffect(() => {
    if (!user) return;
    const unsubscribeResources = subscribeToResources((updatedResources) => {
      setResources(updatedResources);
    });
    return () => unsubscribeResources();
  }, [user]);

  // Trigger brief alert notifications
  const triggerNotification = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Auth Action Handlers
  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      triggerNotification("Instructor authenticated successfully!", "success");
    } catch (err) {
      console.error("Auth Failure:", err);
      triggerNotification("Authenticating aborted or timed out.", "info");
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const loggedUser = await loginWithCredentials(emailInput, passwordInput);
      setUser(loggedUser);
      triggerNotification("Instructor authenticated with credentials successfully!", "success");
    } catch (err: any) {
      console.error("Credentials Auth Failure:", err);
      setAuthError(err?.message || "Failed to authenticate with credentials.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      // Reset navigation
      setCurrentView("dashboard");
      setActiveLessonForEdit(null);
      setActiveLessonForPresent(null);
      triggerNotification("Logged out successfully.");
    } catch (err) {
      console.error("Logout aborted:", err);
    }
  };

  // Lesson actions forwarding
  const handleCreateLesson = async (title: string, description: string, category: IC3Category, topic: string) => {
    if (!user) return;
    const authorCredentials = { uid: user.uid, email: user.email || "teacher@ic3platform.com" };
    try {
      const newlyCreated = await createNewLesson(title, description, category, topic, authorCredentials);
      setLessons((prev) => [newlyCreated, ...prev]);
      setActiveLessonForEdit(newlyCreated);
      triggerNotification("Brand new lesson generated. Load template modules below!", "success");
    } catch (err) {
      console.error("Failed to generate lesson blueprint:", err);
    }
  };

  const handleSaveLesson = async (updated: Lesson) => {
    try {
      await saveLesson(updated);
    } catch (err) {
      console.error("Save failure caught", err);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await deleteLesson(id);
      triggerNotification("Lesson blueprint purged from registry.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateLesson = async (lesson: Lesson) => {
    try {
      const dup = await duplicateLesson(lesson);
      triggerNotification(`Cloned slide deck successfully: '${dup.title}'`);
    } catch (err) {
      console.error(err);
    }
  };

  // FileResource actions forwarding
  const handleAddResource = async (
    title: string, 
    fileName: string, 
    fileUrl: string, 
    fileType: "image" | "pdf" | "video" | "other", 
    category: IC3Category
  ) => {
    const newRes: FileResource = {
      id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      fileName,
      fileUrl,
      fileType,
      category,
      createdAt: Date.now()
    };
    try {
      await saveResource(newRes);
      triggerNotification(`Supplement '${title}' catalogued successfully.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await deleteResource(id);
      triggerNotification("Supplement handout removed.");
    } catch (err) {
      console.error(err);
    }
  };

  // LOADING INITIAL SPLASH
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans space-y-4 select-none animate-pulse">
        <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl">
          <Laptop className="w-10 h-10 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-sans font-extrabold text-gray-700 tracking-tight">IC3 GS6 Teaching Hub</h2>
          <p className="text-[11px] text-gray-400 font-medium">Synchronizing resources, slides, and syllabus guides...</p>
        </div>
      </div>
    );
  }

  // FORCE PRESENTATION SCREEN OVERLAY (No standard site frames)
  if (user && activeLessonForPresent) {
    return (
      <PresentationMode
        lesson={activeLessonForPresent}
        onExit={() => setActiveLessonForPresent(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" id="ic3-platform-wrapper">
      
      {/* Dynamic toast alert */}
      {notification && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white text-xs font-semibold py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Auth Screen layout if unauthenticated */}
      {!user ? (
        <div className="flex-1 flex max-w-6xl mx-auto w-full p-6 md:p-12 items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-w-4xl w-full">
            
            {/* Promo banner panel */}
            <div className="lg:col-span-5 bg-gradient-to-b from-blue-600 to-indigo-700 p-8 text-white flex flex-col justify-between text-left relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="space-y-2">
                <div className="h-8 w-8 bg-white/10 backdrop-blur-md text-white rounded-lg flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-blue-200 pt-3">IC3 Syllabus</h3>
                <h2 className="text-2xl font-bold tracking-tight">GS6 Teacher Workspace</h2>
              </div>

              <div className="space-y-4 pt-10">
                <p className="text-xs text-blue-100/90 leading-relaxed md:block hidden">
                  A high-fidelity tool belt replacing standard presentation files. Maintain complete lesson scripts, edit notes live, present fullscreen on projectors, and hand out exam review sheets securely.
                </p>
                <div className="space-y-2 text-[11px] font-semibold text-blue-200">
                  <div className="flex items-center gap-2"><div className="h-1 w-1 bg-white rounded-full" /> Hardware & Core Computing</div>
                  <div className="flex items-center gap-2"><div className="h-1 w-1 bg-white rounded-full" /> Spreadsheet & Document Apps</div>
                  <div className="flex items-center gap-2"><div className="h-1 w-1 bg-white rounded-full" /> Living Online & Cybersecurity</div>
                </div>
              </div>

              <div className="text-[9px] text-blue-300 font-medium pt-8">
                Official Classroom Companion Platform v1.2
              </div>
            </div>

            {/* Auth panel */}
            <div className="lg:col-span-7 p-10 flex flex-col justify-center space-y-5 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 font-sans mx-auto lg:mx-0 w-fit">
                <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Access Gated
              </span>

              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-sans font-semibold tracking-tight text-slate-900">
                  Welcome to IC3 Instructor Hub
                </h1>
                <p className="text-xs text-slate-500 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Sign in with your educational credentials to access global syllabus standards, slide decks, and reference manuals.
                </p>
              </div>

              {/* Form container for credentials */}
              <form onSubmit={handleCredentialsLogin} className="space-y-3.5 text-left">
                {authError && (
                  <div className="p-3 text-xs bg-red-50 text-red-650 border border-red-100 rounded-xl font-semibold">
                    ⚠️ {authError}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. instructor@example.com"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 disabled:bg-slate-300 text-white font-sans font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  {authSubmitting ? "Verifying..." : "Sign In with Credentials"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-[9px] text-slate-300 font-bold uppercase tracking-widest">or continue with</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Action sign-in container */}
              <div className="space-y-3">
                <button
                  id="btn-login-instructor"
                  type="button"
                  onClick={handleLogin}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Sparkles className="w-4 h-4 fill-current text-blue-200 pointer-events-none" /> Continue with Google Auth
                </button>
              </div>

              {/* Informative Help Guide block */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 text-left">
                <div className="p-0.5 text-slate-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-705">Accessing the Workspace?</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Please key in your secure instructor credentials above to authenticate and access the IC3 course slides, worksheets, and resources.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Authenticated Master Layout Canvas with Editorial Sidebar Split */
        <div className="flex-1 flex flex-col md:flex-row min-h-screen">
          {/* Main Global Sidebar Navigation (Hidden only during slideshow shows) */}
          {!activeLessonForPresent && (
            <aside 
              id="platform-global-sidebar"
              className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-205 flex flex-col select-none"
            >
              <div className="p-6 md:p-8 flex flex-col h-full">
                {/* Platform Logo Brand */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-200">
                    <span className="text-white font-sans text-xs">IC3</span>
                  </div>
                  <div>
                    <h1 className="text-md font-bold tracking-tight text-blue-900 leading-none">GS6 Platform</h1>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Instructor Hub</span>
                  </div>
                </div>

                {/* Main Section Navigation Options */}
                {!activeLessonForEdit ? (
                  <nav className="space-y-1.5 flex-1">
                    <button
                      onClick={() => setCurrentView("dashboard")}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                        currentView === "dashboard"
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setCurrentView("resources")}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                        currentView === "resources"
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <FolderOpen className="w-4 h-4" />
                      Supplements
                    </button>
                  </nav>
                ) : (
                  <div className="flex-1 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Currently Editing</span>
                      <p className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">{activeLessonForEdit.title}</p>
                    </div>
                    <button
                      onClick={() => setActiveLessonForEdit(null)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-950 border border-slate-200 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                    >
                      ← Exit Editor
                    </button>
                  </div>
                )}

                {/* Profile Area */}
                <div className="mt-auto pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 md:-mx-8 md:-mb-8 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={user.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=60"}
                      alt={user.displayName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full bg-blue-105 object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || "Educator"}</p>
                      <p className="text-[9px] text-slate-500 truncate italic underline">Instructor Account</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 border border-slate-205 hover:bg-white text-slate-600 hover:text-red-650 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-transparent"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Active Primary Workplace Screen Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Elegant Path Indicator Header */}
            {!activeLessonForPresent && (
              <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between select-none">
                <div>
                  <h2 className="text-xl font-light text-slate-400">
                    <span className="text-slate-900 font-semibold">Overview</span> / {activeLessonForEdit ? "Editor" : currentView === "resources" ? "Resources" : "Dashboard"}
                  </h2>
                </div>
              </header>
            )}

            {/* Content panel */}
            <div className="flex-1 p-6 md:p-10">
              {activeLessonForEdit ? (
                <LessonEditor
                  lesson={activeLessonForEdit}
                  onSave={(updated) => {
                    handleSaveLesson(updated);
                    // also update current local array reference
                    setLessons((curr) => curr.map((l) => (l.id === updated.id ? updated : l)));
                  }}
                  onBack={() => setActiveLessonForEdit(null)}
                  onPresent={(lesson) => setActiveLessonForPresent(lesson)}
                />
              ) : currentView === "resources" ? (
                <ResourceLibrary
                  resources={resources}
                  onAddResource={(title, fileName, fileUrl, fileType, category) => {
                    handleAddResource(title, fileName, fileUrl, fileType, category);
                  }}
                  onDeleteResource={(id) => handleDeleteResource(id)}
                  onBack={() => setCurrentView("dashboard")}
                />
              ) : (
                <Dashboard
                  lessons={lessons}
                  resourcesCount={resources.length}
                  onCreateLesson={handleCreateLesson}
                  onEditLesson={(lesson) => setActiveLessonForEdit(lesson)}
                  onPresentLesson={(lesson) => setActiveLessonForPresent(lesson)}
                  onDuplicateLesson={handleDuplicateLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onNavigateToResources={() => setCurrentView("resources")}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Classroom footer stamp (Hides only when presenting) */}
      {!activeLessonForPresent && (
        <footer className="bg-white border-t border-gray-150 py-5 select-none font-sans text-center text-xs text-gray-400">
          <div className="max-w-7xl mx-auto px-4 leading-relaxed space-y-1.5">
            <p className="font-semibold text-gray-550">IC3 GS6 Modern Teaching Platform</p>
            <p className="text-[10px]">
              Replacing PowerPoint slide shows with interactive classroom tools. Direct projector optimization • Native Fullscreen Engine • Zoom Adjustments.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
