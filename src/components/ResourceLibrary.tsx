/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  File as FileIcon, 
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  BookOpen
} from "lucide-react";
import { FileResource, IC3Category } from "../types";

interface ResourceLibraryProps {
  resources: FileResource[];
  onAddResource: (title: string, fileName: string, fileUrl: string, fileType: "image" | "pdf" | "video" | "other", category: IC3Category) => void;
  onDeleteResource: (id: string) => void;
  onBack: () => void;
}

export default function ResourceLibrary({
  resources,
  onAddResource,
  onDeleteResource,
  onBack
}: ResourceLibraryProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IC3Category | "ALL">("ALL");

  // Create Resource Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState<"image" | "pdf" | "video" | "other">("pdf");
  const [category, setCategory] = useState<IC3Category>(IC3Category.COMPUTING_FUNDAMENTALS);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  // Previewer modal state
  const [previewResource, setPreviewResource] = useState<FileResource | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    // Extract smart fileName if not provided
    const resolvedFileName = fileName.trim() || fileUrl.substring(fileUrl.lastIndexOf("/") + 1) || "ic3_syllabus_handout.file";
    
    onAddResource(
      title,
      resolvedFileName,
      fileUrl,
      fileType,
      category
    );

    // Reset Form
    setTitle("");
    setFileType("pdf");
    setCategory(IC3Category.COMPUTING_FUNDAMENTALS);
    setFileUrl("");
    setFileName("");
    setIsModalOpen(false);
  };

  // Populate sample link for speed testing
  const handleTypeSelectInModal = (type: "image" | "pdf" | "video" | "other") => {
    setFileType(type);
    if (type === "pdf") {
      setFileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
      setFileName("ic3_gs6_computing_fundamentals_cheat_sheet.pdf");
    } else if (type === "image") {
      setFileUrl("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60");
      setFileName("office_suite_workspace_schematic.png");
    } else if (type === "video") {
      setFileUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
      setFileName("windows_operating_system_tutorial.mp4");
    } else {
      setFileUrl("https://example.com/handout.docx");
      setFileName("excel_gradesheet_practice.docx");
    }
  };

  // Filtered resources
  const filteredResources = resources.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || res.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case "video":
        return <VideoIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6" id="ic3-resources-platform">
      
      {/* Top action layout bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 md:p-8 border border-slate-100 rounded-[1.5rem] shadow-xs">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] bg-indigo-50 text-indigo-700 font-bold uppercase tracking-widest font-sans">
            📁 Handouts & Guidelines
          </span>
          <h1 className="text-2xl font-serif font-semibold text-slate-900 mt-1">
            IC3 Lesson Supplements & Handouts
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Register and display reference files, PDF study sheets, exam checklists, and visual connectivity diagrams right beside your slide decks.
          </p>
        </div>

        <div className="flex items-center gap-3 font-sans">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-slate-205 text-slate-700 hover:bg-slate-55 rounded-full text-xs font-bold transition-all select-none cursor-pointer"
          >
            Back to Registry
          </button>
          <button
            id="resources-btn-upload"
            onClick={() => {
              setIsModalOpen(true);
              handleTypeSelectInModal("pdf"); // auto trigger smart link defaults
            }}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer font-sans"
          >
            <Plus className="w-3.5 h-3.5" /> New Handout Link
          </button>
        </div>
      </div>

      {/* Categories filter banner and Search field */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Course divisions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white shadow-md font-sans"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-sans"
            }`}
          >
            All Supplement Categories
          </button>
          <button
            onClick={() => setSelectedCategory(IC3Category.COMPUTING_FUNDAMENTALS)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === IC3Category.COMPUTING_FUNDAMENTALS
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-3xs font-sans"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-sans"
            }`}
          >
            Computing Fundamentals
          </button>
          <button
            onClick={() => setSelectedCategory(IC3Category.KEY_APPLICATIONS)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === IC3Category.KEY_APPLICATIONS
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-3xs font-sans"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-sans"
            }`}
          >
            Key Applications
          </button>
          <button
            onClick={() => setSelectedCategory(IC3Category.LIVING_ONLINE)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === IC3Category.LIVING_ONLINE
                ? "bg-teal-50 text-teal-700 border border-teal-200 shadow-3xs font-sans"
                : "bg-white border border-slate-205 text-slate-705 hover:bg-slate-50 font-sans"
            }`}
          >
            Living Online
          </button>
        </div>

        {/* Local library Search field */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="resources-search-field"
            type="text"
            placeholder="Search resources by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-805 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-505 font-sans"
          />
        </div>
      </div>

      {/* Grid of Supplements */}
      {filteredResources.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">No Supplements Loaded</h4>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? "No matches found. Check your spelling or filters." : "Choose 'Upload Supplement' above to load your first classroom reference manual."}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("ALL"); }}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="resources-cards-grid">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              id={`resource-item-card-${res.id}`}
              className="bg-white border border-gray-100 hover:border-gray-200 rounded-xl shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    {getIconForType(res.fileType)}
                  </div>
                  
                  {/* Category Stamp */}
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    res.category === IC3Category.COMPUTING_FUNDAMENTALS ? "bg-blue-50/70 text-blue-700" :
                    res.category === IC3Category.KEY_APPLICATIONS ? "bg-indigo-50/70 text-indigo-700" : "bg-teal-50/70 text-teal-700"
                  }`}>
                    {res.category === IC3Category.COMPUTING_FUNDAMENTALS ? "Core Hardware" :
                     res.category === IC3Category.KEY_APPLICATIONS ? "Productivity" : "Online Connection"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-sm leading-tight lines-clamp-2">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-gray-450 truncate font-mono max-w-[240px]">
                    {res.fileName}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium">
                <span className="text-[10px] text-gray-400">
                  Type: {res.fileType.toUpperCase()}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewResource(res)}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-bold"
                    title="Preview supplementation"
                  >
                    <ChevronRight className="w-3.5 h-3.5" /> Open
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete '${res.title}' from the supplement registry?`)) {
                        onDeleteResource(res.id);
                      }
                    }}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors cursor-pointer"
                    title="Delete reference"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUPPLEMENT CREATOR REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold font-sans">Register Course Supplement Handout</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 font-sans text-left">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Handout Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MS Word Keyboard Shortcuts Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Supplement Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => handleTypeSelectInModal(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white"
                  >
                    <option value="pdf">Document (PDF)</option>
                    <option value="image">Image Diagram</option>
                    <option value="video">Short Class Video</option>
                    <option value="other">Worksheet (DOCX/XLSX)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">IC3 Curriculum Group</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IC3Category)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white"
                  >
                    <option value={IC3Category.COMPUTING_FUNDAMENTALS}>Computing Fundamentals</option>
                    <option value={IC3Category.KEY_APPLICATIONS}>Key Applications</option>
                    <option value={IC3Category.LIVING_ONLINE}>Living Online</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Original File Name</label>
                <input
                  type="text"
                  placeholder="e.g. shortcuts_cheatsheet.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">File URL link (Sync Target)</label>
                  <span className="text-[9px] text-gray-400 font-medium">Auto-populated default demo supplied</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-850 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="resources-btn-register-submit"
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer"
                >
                  Register Supplement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL STUDENT RESOURCE HANDOUT PREVIEW MODAL */}
      {previewResource && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-gray-100 overflow-hidden flex flex-col">
            
            {/* Nav ribbon */}
            <div className="bg-slate-950 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 rounded-md">
                  {getIconForType(previewResource.fileType)}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white font-sans">{previewResource.title}</h3>
                  <span className="text-[9px] text-slate-400 font-mono leading-none tracking-wider uppercase">
                    {previewResource.fileName} • {previewResource.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewResource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> External link
                </a>
                <button
                  onClick={() => setPreviewResource(null)}
                  className="text-slate-400 hover:text-white hover:bg-slate-900 p-1.5 rounded-lg transition-all"
                >
                  ✕ Close Preview
                </button>
              </div>
            </div>

            {/* Sandbox Media window */}
            <div className="flex-1 bg-slate-900 flex items-center justify-center overflow-hidden p-2 relative select-text">
              {previewResource.fileType === "image" && (
                <img
                  src={previewResource.fileUrl}
                  alt={previewResource.title}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              )}

              {previewResource.fileType === "video" && (
                <video
                  src={previewResource.fileUrl}
                  controls
                  autoPlay
                  className="max-h-full max-w-full rounded-lg"
                />
              )}

              {previewResource.fileType === "pdf" && (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(previewResource.fileUrl)}&embedded=true`}
                  className="w-full h-full bg-white rounded-lg"
                  title="PDF Supplement viewer helper"
                />
              )}

              {previewResource.fileType === "other" && (
                <div className="text-center text-white space-y-4 max-w-md p-6 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-yellow-500">
                    <FileIcon className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Rich Document Supplement File</h5>
                    <p className="text-xs text-gray-400 leading-relaxed mt-2">
                      Office files (.docx, .xlsx, .pptx) should be opened directly in Microsoft 365 or Google Docs for editing. Click the download selector to fetch the worksheet copy onto students desktop environments.
                    </p>
                  </div>
                  <a
                    href={previewResource.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Homework copy
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
