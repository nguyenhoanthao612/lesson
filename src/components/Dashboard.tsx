/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BookOpen, 
  Layers, 
  FolderOpen, 
  Plus, 
  Play, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Trash2, 
  Search, 
  ArrowRight, 
  Cpu, 
  FileCheck, 
  Globe
} from "lucide-react";
import { Lesson, IC3Category } from "../types";
import { getCategoryImagePlaceholder } from "../firebase";

interface DashboardProps {
  lessons: Lesson[];
  resourcesCount: number;
  onCreateLesson: (title: string, description: string, category: IC3Category, topic: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onPresentLesson: (lesson: Lesson) => void;
  onDuplicateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onNavigateToResources: () => void;
}

export default function Dashboard({
  lessons,
  resourcesCount,
  onCreateLesson,
  onEditLesson,
  onPresentLesson,
  onDuplicateLesson,
  onDeleteLesson,
  onNavigateToResources
}: DashboardProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IC3Category | "ALL">("ALL");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // New Lesson Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IC3Category>(IC3Category.COMPUTING_FUNDAMENTALS);
  const [topic, setTopic] = useState("");

  const topicsForCategory = {
    [IC3Category.COMPUTING_FUNDAMENTALS]: [
      "Computer Hardware",
      "Software",
      "Operating Systems",
      "File Management",
      "Security"
    ],
    [IC3Category.KEY_APPLICATIONS]: [
      "Microsoft Word",
      "Microsoft Excel",
      "Microsoft PowerPoint"
    ],
    [IC3Category.LIVING_ONLINE]: [
      "Internet",
      "Email",
      "Online Communication",
      "Digital Citizenship",
      "Cybersecurity"
    ]
  };

  // Handle changing category in the "Create Lesson" modal to pre-populate first topic
  const handleCategoryChangeInModal = (cat: IC3Category) => {
    setCategory(cat);
    setTopic(topicsForCategory[cat][0]);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateLesson(title, description, category, topic || topicsForCategory[category][0]);
    setIsModalOpen(false);
    // Reset fields
    setTitle("");
    setDescription("");
    setCategory(IC3Category.COMPUTING_FUNDAMENTALS);
    setTopic(topicsForCategory[IC3Category.COMPUTING_FUNDAMENTALS][0]);
  };

  // Filtered Lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "ALL" || lesson.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Derived Stats
  const totalLessons = lessons.length;
  const totalSlides = lessons.reduce((sum, l) => sum + (l.pages?.length || 0), 0);

  const getCategoryCount = (cat: IC3Category) => {
    return lessons.filter(l => l.category === cat).length;
  };

  return (
    <div className="space-y-8" id="ic3-dashboard-root">
      {/* Welcome Hero Banner */}
      <div 
        id="dashboard-hero-banner"
        className="relative bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-lg overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-850 pointer-events-none opacity-90" />
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-indigo-900 rounded-full blur-3xl opacity-15 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md text-blue-200">
            🏫 IC3 Certification GS6 Ready
          </span>
          <h1 className="text-3xl md:text-5xl font-sans font-semibold tracking-tight text-white leading-tight">
            Replace slides with elegant, <span className="italic font-sans text-blue-300">interactive web supplements</span> and lessons.
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            Create, manage, and present modern lessons with live hardware specs, productivity sheets, and connectivity modules optimized for classroom displays and projectors.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              id="action-btn-create-lesson-hero"
              onClick={() => {
                setCategory(IC3Category.COMPUTING_FUNDAMENTALS);
                setTopic(topicsForCategory[IC3Category.COMPUTING_FUNDAMENTALS][0]);
                setIsModalOpen(true);
              }}
              className="px-6 py-2 bg-white text-slate-950 font-bold rounded-full text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-blue-600" /> Create New Lesson
            </button>
            <button
              id="action-btn-library-hero"
              onClick={onNavigateToResources}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-755 text-white font-bold rounded-full text-xs transition-all flex items-center gap-2 border border-slate-705 cursor-pointer"
            >
              Browse Supplements Library <ArrowRight className="w-3.5 h-3.5 text-blue-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Stats Bar */}
      <div 
        id="dashboard-stats-grid"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm flex items-center gap-5 hover:border-slate-200 hover:shadow-md transition-all duration-300">
          <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Decks</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{totalLessons}</span>
              <span className="text-xs text-slate-400 font-medium">Lessons</span>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm flex items-center gap-5 hover:border-slate-200 hover:shadow-md transition-all duration-300">
          <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl">
            <Layers className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Projector Pages</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{totalSlides}</span>
              <span className="text-xs text-slate-400 font-medium">Slides</span>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm flex items-center gap-5 hover:border-slate-200 hover:shadow-md transition-all duration-300">
          <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl">
            <FolderOpen className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Class Material</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{resourcesCount}</span>
              <span className="text-xs text-slate-400 font-medium">Supplements</span>
            </div>
          </div>
        </div>
      </div>

      {/* IC3 Structure Badges & Filtering */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">IC3 GS6 Categories</h2>
            <p className="text-xs text-slate-500">Filter your lesson registry by global standards domain tracks</p>
          </div>
          
          {/* Global Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="dashboard-search-input"
              type="text"
              placeholder="Search lessons & indices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <button
            id="filter-category-all"
            onClick={() => setSelectedCategory("ALL")}
            className={`p-6 rounded-[1.5rem] text-left border cursor-pointer transition-all duration-300 ${
              selectedCategory === "ALL"
                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                : "bg-white border-slate-100 text-slate-800 hover:border-slate-200 hover:shadow-sm"
            }`}
          >
            <span className={`text-[9.5px] font-bold uppercase tracking-widest ${selectedCategory === "ALL" ? "text-slate-300" : "text-slate-400"}`}>System Core</span>
            <h4 className="font-sans italic font-semibold text-base mt-2">All Course Decks</h4>
            <p className={`text-xs mt-1.5 ${selectedCategory === "ALL" ? "text-slate-300" : "text-slate-500"}`}>{lessons.length} active plans ready</p>
          </button>

          <button
            id="filter-category-cf"
            onClick={() => setSelectedCategory(IC3Category.COMPUTING_FUNDAMENTALS)}
            className={`p-6 rounded-[1.5rem] text-left border cursor-pointer transition-all duration-300 ${
              selectedCategory === IC3Category.COMPUTING_FUNDAMENTALS
                ? "bg-blue-50/80 border-blue-200 text-blue-900 shadow-sm"
                : "bg-white border-slate-100 text-slate-800 hover:border-slate-200 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[9px] uppercase tracking-widest">
              <Cpu className="w-3.5 h-3.5" /> Hardware & OS
            </div>
            <h4 className="font-sans italic font-semibold text-base mt-2 text-blue-950">Computing Fundamentals</h4>
            <p className="text-xs text-blue-800/70 mt-1.5">{getCategoryCount(IC3Category.COMPUTING_FUNDAMENTALS)} lesson guides</p>
          </button>

          <button
            id="filter-category-ka"
            onClick={() => setSelectedCategory(IC3Category.KEY_APPLICATIONS)}
            className={`p-6 rounded-[1.5rem] text-left border cursor-pointer transition-all duration-300 ${
              selectedCategory === IC3Category.KEY_APPLICATIONS
                ? "bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-sm"
                : "bg-white border-slate-100 text-slate-800 hover:border-slate-200 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[9px] uppercase tracking-widest">
              <FileCheck className="w-3.5 h-3.5" /> Productivity Software
            </div>
            <h4 className="font-sans italic font-semibold text-base mt-2 text-indigo-950">Key Applications</h4>
            <p className="text-xs text-indigo-805/70 mt-1.5">{getCategoryCount(IC3Category.KEY_APPLICATIONS)} lesson guides</p>
          </button>

          <button
            id="filter-category-lo"
            onClick={() => setSelectedCategory(IC3Category.LIVING_ONLINE)}
            className={`p-6 rounded-[1.5rem] text-left border cursor-pointer transition-all duration-300 ${
              selectedCategory === IC3Category.LIVING_ONLINE
                ? "bg-teal-50/80 border-teal-200 text-teal-900 shadow-sm"
                : "bg-white border-slate-100 text-slate-800 hover:border-slate-200 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-1.5 text-teal-600 font-bold text-[9px] uppercase tracking-widest">
              <Globe className="w-3.5 h-3.5" /> Connectivity & Citizen
            </div>
            <h4 className="font-sans italic font-semibold text-base mt-2 text-teal-950">Living Online</h4>
            <p className="text-xs text-teal-800/70 mt-1.5">{getCategoryCount(IC3Category.LIVING_ONLINE)} lesson guides</p>
          </button>
        </div>
      </div>

      {/* Catalog & Lesson Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Course Slide Decks</h3>
            <p className="text-xs text-slate-500">Pick an educational guide item to present or customize</p>
          </div>
          <button
            id="btn-trigger-new-lesson"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create Lesson
          </button>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">No Lessons Found</h4>
              <p className="text-xs text-slate-500">
                {searchQuery ? "No matches found for your current query. Try adjusting your search criteria." : "Get started by building your first syllabus lesson!"}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("ALL"); }}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <div 
                key={lesson.id}
                id={`lesson-card-${lesson.id}`}
                className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-xs hover:border-slate-205 hover:shadow-lg transition-all duration-300 flex flex-col group relative"
              >
                {/* Image Header with Category Badge */}
                <div className="h-44 w-full relative bg-slate-50 overflow-hidden">
                  <img
                    src={lesson.thumbnailUrl || getCategoryImagePlaceholder(lesson.category)}
                    alt={lesson.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                  
                  {/* Category Badge overlay */}
                  <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-xs ${
                    lesson.category === IC3Category.COMPUTING_FUNDAMENTALS ? "bg-blue-600" :
                    lesson.category === IC3Category.KEY_APPLICATIONS ? "bg-indigo-600" : "bg-teal-600"
                  }`}>
                    {lesson.category}
                  </span>

                  {/* Topic overlay */}
                  <span className="absolute bottom-3 left-3 text-xs font-semibold text-slate-100">
                    Topic: {lesson.topic}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col space-y-2">
                  <h4 className="font-sans italic font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-base line-clamp-1">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
                    {lesson.description || "No summary provided. Open lesson editor to write custom educational curriculum blocks."}
                  </p>
                  
                  {/* Footer info */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-450">
                    <span className="font-semibold">{lesson.pages?.length || 0} modular slides</span>
                    <span>Mod: {new Date(lesson.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Primary Action Row with Edit & Present */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    id={`btn-present-${lesson.id}`}
                    onClick={() => onPresentLesson(lesson)}
                    className="flex-1 py-1.5.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Teach Lesson (F5)
                  </button>
                  <button
                    id={`btn-edit-${lesson.id}`}
                    onClick={() => onEditLesson(lesson)}
                    className="p-1.5.5 bg-white border border-slate-200 text-slate-705 hover:bg-slate-50 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                    title="Edit Lesson Content"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Context Options Dropdown */}
                  <div className="relative">
                    <button
                      id={`btn-options-${lesson.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === lesson.id ? null : lesson.id);
                      }}
                      className="p-1.5.5 bg-white border border-slate-205 text-slate-500 hover:bg-slate-50 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {activeDropdown === lesson.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveDropdown(null)} 
                        />
                        <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-slate-105 rounded-lg shadow-xl z-20 overflow-hidden divide-y divide-slate-100">
                          <button
                            id={`btn-dropdown-duplicate-${lesson.id}`}
                            onClick={() => {
                              onDuplicateLesson(lesson);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate Deck
                          </button>
                          <button
                            id={`btn-dropdown-delete-${lesson.id}`}
                            onClick={() => {
                              if (window.confirm("Are you sure you want to permanently delete this lesson and its static contents?")) {
                                onDeleteLesson(lesson.id);
                              }
                              setActiveDropdown(null);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-semibold text-red-650 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete Lesson
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE NEW LESSON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
              <h3 className="font-sans font-semibold text-lg">Launch New IC3 GS6 Lesson Plan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lesson Title</label>
                <input
                  id="modal-input-title"
                  type="text"
                  required
                  placeholder="e.g., Working with tables in Word"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Executive Description Summary</label>
                <textarea
                  id="modal-input-description"
                  rows={2}
                  placeholder="Summarize what standards this lesson plan covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">IC3 Curriculum Domain</label>
                  <select
                    id="modal-select-category"
                    value={category}
                    onChange={(e) => handleCategoryChangeInModal(e.target.value as IC3Category)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value={IC3Category.COMPUTING_FUNDAMENTALS}>{IC3Category.COMPUTING_FUNDAMENTALS}</option>
                    <option value={IC3Category.KEY_APPLICATIONS}>{IC3Category.KEY_APPLICATIONS}</option>
                    <option value={IC3Category.LIVING_ONLINE}>{IC3Category.LIVING_ONLINE}</option>
                  </select>
                </div>

                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">IC3 Course Topic</label>
                  <select
                    id="modal-select-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    {topicsForCategory[category].map((top) => (
                      <option key={top} value={top}>{top}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-submit-create"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer"
                >
                  Create & Launch Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
