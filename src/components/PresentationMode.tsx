/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  BookOpen, 
  List, 
  Youtube,
  AlertCircle,
  Award,
  HelpCircle,
  Grid,
  Sparkles,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react";
import { Lesson, LessonPage, ContentBlock, BlockType } from "../types";

interface PresentationModeProps {
  lesson: Lesson;
  onExit: () => void;
  initialPageIndex?: number;
}

export default function PresentationMode({
  lesson,
  onExit,
  initialPageIndex = 0
}: PresentationModeProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(initialPageIndex);
  
  // Presentation preferences
  const [zoomLevel, setZoomLevel] = useState<number>(100); // Percentage: 80% - 150%
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false); // Dark Mode / Light Mode toggle for projector styles
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNavOverlay, setShowNavOverlay] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const activePage = lesson.pages[currentPageIndex] || lesson.pages[0];

  // Key event listeners for real teaching control (arrows, space, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
        case "Backspace":
        case "PageUp":
          e.preventDefault();
          handlePrev();
          break;
        case "Escape":
          e.preventDefault();
          onExit();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPageIndex]);

  // Fullscreen tracker listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleNext = () => {
    if (currentPageIndex < lesson.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleZoom = (amount: number) => {
    setZoomLevel((prev) => Math.min(180, Math.max(80, prev + amount)));
  };

  const toggleNativeFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Error enabling standard fullscreen mode", err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      id="ic3-pitchdeck-mode"
      className={`fixed inset-0 z-50 flex flex-col font-sans transition-colors duration-300 ${
        isHighContrast 
          ? "bg-slate-900 text-white" 
          : "bg-gray-150 text-gray-900"
      }`}
    >
      
      {/* Presentation Top Control Banner - Styled elegantly, hides only if requested */}
      {showNavOverlay && (
        <div 
          id="presentation-header-nav"
          className={`flex items-center justify-between px-6 py-4.5 border-b shadow-md relative z-10 select-none ${
            isHighContrast 
              ? "bg-slate-950 border-slate-800 text-white" 
              : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">
                Classroom Presentation Live Session
              </span>
              <h2 className="text-sm font-bold truncate max-w-sm md:max-w-md">
                {lesson.title}
              </h2>
            </div>
          </div>

          {/* Core slide state tracking */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="font-semibold">Slide {currentPageIndex + 1} of {lesson.pages.length}</span>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentPageIndex + 1) / lesson.pages.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Projector Adjustments (Contrast, Zoom, Fullscreen) */}
          <div className="flex items-center gap-2">
            
            {/* Theme Adaptor (Projector High Contrast Contrast) */}
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`p-2 rounded-lg transition-all border ${
                isHighContrast 
                  ? "border-slate-800 hover:bg-slate-900 text-amber-400" 
                  : "border-gray-200 hover:bg-gray-50 text-indigo-600"
              }`}
              title={isHighContrast ? "Switch to standard Light Style" : "Switch to Contrast Dark Projector Style"}
            >
              {isHighContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Zoom Controllers for Classroom Desks */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-gray-700 select-none scale-90 md:scale-100">
              <button
                onClick={() => handleZoom(-10)}
                className="p-1.5 hover:bg-white rounded-md text-xs transition-all"
                title="Zoom Text Size Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1.5 min-w-[40px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => handleZoom(10)}
                className="p-1.5 hover:bg-white rounded-md text-xs transition-all"
                title="Zoom Text Size In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Native Fullscreen toggle */}
            <button
              onClick={toggleNativeFullscreen}
              className={`p-2 rounded-lg border transition-all ${
                isHighContrast 
                  ? "border-slate-800 hover:bg-slate-900" 
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              title="Toggle Native Browser Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-gray-200 mx-1" />

            {/* Termination button */}
            <button
              id="presentation-btn-quit"
              onClick={onExit}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Exit [Esc]
            </button>
          </div>
        </div>
      )}

      {/* Main Slide Presentation Canvas */}
      <div 
        id="presentation-slide-canvas"
        className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto select-none"
      >
        <div 
          className={`w-full max-w-5xl rounded-2xl shadow-xl border p-8 md:p-14 transition-all duration-300 select-text ${
            isHighContrast 
              ? "bg-slate-950 border-slate-800 text-slate-100 shadow-slate-950/50" 
              : "bg-white border-gray-100 text-gray-800 shadow-gray-200/50"
          }`}
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
        >
          {/* Active Side Heading/Title */}
          <div className="border-b pb-4 mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-2">
            <h1 className="text-2xl md:text-4xl font-sans italic font-semibold tracking-tight text-slate-900 dark:text-white">
              {activePage.title || "Untitled Slide Page"}
            </h1>
            <span className={`text-[9px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full ${
              isHighContrast ? "border-slate-800 text-slate-400" : "border-gray-250 text-gray-400"
            }`}>
              IC3 Course Segment
            </span>
          </div>

          {/* Blocks rendering core list */}
          <div className="space-y-6 md:space-y-8" id="active-slide-contents-block">
            {(!activePage.blocks || activePage.blocks.length === 0) ? (
              <p className="text-sm text-gray-400 italic text-center py-10">
                This slide is empty. Turn off slide show and add content in the builder.
              </p>
            ) : (
              activePage.blocks.map((block) => (
                <div key={block.id} className="transition-all animate-fadeIn">
                  
                  {block.type === BlockType.HEADING && (
                    <h3 className="text-xl md:text-2xl font-sans italic text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 pl-3">
                      {block.headingText}
                    </h3>
                  )}

                  {block.type === BlockType.PARAGRAPH && (
                    <p className="text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                      {block.paragraphText}
                    </p>
                  )}

                  {block.type === BlockType.BULLET_LIST && (
                    <ul className="space-y-3 pl-6">
                      {(block.listItems || []).map((bullet, idx) => (
                        <li key={idx} className="list-disc text-base md:text-lg text-gray-700 dark:text-slate-350 marker:text-blue-500">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}

                  {block.type === BlockType.IMAGE && block.mediaUrl && (
                    <div className="space-y-3">
                      <div className="max-h-[380px] w-full rounded-2xl overflow-hidden shadow-md border border-gray-100 flex items-center justify-center bg-gray-50">
                        <img
                          src={block.mediaUrl}
                          alt={block.mediaCaption || "Syllabus illustration"}
                          referrerPolicy="no-referrer"
                          className="max-h-[380px] w-auto max-w-full object-contain"
                        />
                      </div>
                      {block.mediaCaption && (
                        <p className="text-xs text-center text-gray-400 italic">
                          {block.mediaCaption}
                        </p>
                      )}
                    </div>
                  )}

                  {block.type === BlockType.YOUTUBE && block.youtubeId && (
                    <div className="aspect-video w-full max-w-xl mx-auto rounded-2xl overflow-hidden shadow-lg bg-black">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${block.youtubeId}`}
                        title="Teaching assist illustration video"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {block.type === BlockType.DEFINITION_BOX && (
                    <div className={`border-l-4 border-blue-600 p-6 rounded-r-3xl shadow-sm ${
                      isHighContrast ? "bg-blue-950/20" : "bg-blue-50/50"
                    }`}>
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block mb-1">
                        Syllabus Concept Definition
                      </span>
                      <h4 className="text-lg font-sans italic font-bold text-blue-950 dark:text-blue-200">
                        {block.definitionTerm}
                      </h4>
                      <p className="text-sm md:text-base text-blue-900 dark:text-blue-100 mt-2 leading-relaxed font-sans">
                        {block.definitionText}
                      </p>
                    </div>
                  )}

                  {block.type === BlockType.IMPORTANT_NOTE && (
                    <div className={`border-l-4 border-amber-500 p-6 rounded-r-3xl shadow-sm ${
                      isHighContrast ? "bg-amber-950/20" : "bg-amber-50/50"
                    }`}>
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
                        Exam Verification Target
                      </span>
                      <p className="text-sm md:text-base text-amber-950 dark:text-amber-105 leading-relaxed font-sans italic font-semibold">
                        {block.noteText}
                      </p>
                    </div>
                  )}

                  {block.type === BlockType.EXAMPLE_BOX && (
                    <div className={`border-l-4 border-indigo-600 p-6 rounded-r-3xl shadow-sm ${
                      isHighContrast ? "bg-indigo-950/20" : "bg-indigo-50/50"
                    }`}>
                      <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">
                        Applied Lab Work Prototype
                      </span>
                      <h4 className="text-base font-sans italic font-bold text-indigo-950 dark:text-indigo-200">
                        {block.exampleTitle}
                      </h4>
                      <pre className="text-xs md:text-sm bg-slate-900 text-emerald-400 p-4 rounded-2xl mt-3 overflow-x-auto font-mono text-left font-semibold border border-slate-800 select-all">
                        <code>{block.exampleText}</code>
                      </pre>
                    </div>
                  )}

                  {block.type === BlockType.PRACTICE_ACTIVITY && (
                    <div className={`border-l-4 border-teal-600 p-5 rounded-r-3xl shadow-sm ${
                      isHighContrast ? "bg-teal-950/20" : "bg-teal-50/50"
                    }`}>
                      <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block mb-1">
                        Student Sandbox Practice Assignment
                      </span>
                      <h4 className="text-base font-sans italic font-bold text-teal-950 dark:text-teal-200">
                        {block.activityTitle}
                      </h4>
                      <p className="text-sm md:text-base text-teal-900 dark:text-teal-100 mt-2 leading-relaxed font-sans">
                        {block.activityText}
                      </p>
                    </div>
                  )}

                  {block.type === BlockType.TABLE && block.tableHeaders && (
                    <div className="space-y-2">
                      <div className="overflow-x-auto rounded-2xl border border-gray-150 shadow-sm">
                        <table className="w-full text-left text-sm md:text-base divide-y divide-gray-150">
                          <thead className={isHighContrast ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-700"}>
                            <tr>
                              {block.tableHeaders.map((head, idx) => (
                                <th key={idx} className="p-4 font-bold">
                                  {head}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className={`divide-y divide-gray-100 ${
                            isHighContrast ? "bg-slate-950 text-slate-300" : "bg-white text-gray-700"
                          }`}>
                            {(block.tableRows || []).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/5 hover-contrast">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-4 whitespace-pre-wrap select-text">
                                    {cell.value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Presenter Bottom Slide Selector bar */}
      <div 
        id="presentation-footer-bar"
        className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 select-none ${
          isHighContrast 
            ? "bg-slate-950 border-slate-800 text-white" 
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPageIndex === 0}
            className={`px-3 py-2 border rounded-lg hover:shadow-xs transition-all flex items-center gap-1 font-bold text-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
              isHighContrast ? "border-slate-850 hover:bg-slate-900" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous [Backsp]
          </button>
          
          <span className="text-xs font-semibold px-2">
            Slide {currentPageIndex + 1} of {lesson.pages.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPageIndex === lesson.pages.length - 1}
            className={`px-4 py-2 border rounded-lg hover:shadow-xs transition-all flex items-center gap-1 font-bold text-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
              isHighContrast ? "border-slate-850 hover:bg-slate-900" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            Next [Space] <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Drawer Link Dropdown */}
        <div className="flex items-center gap-3 font-sans text-xs">
          <span>Jump to slide:</span>
          <select
            value={currentPageIndex}
            onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
            className={`border rounded-lg px-2 py-1.5 focus:outline-hidden ${
              isHighContrast 
                ? "bg-slate-900 border-slate-850 text-white" 
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            {lesson.pages.map((p, idx) => (
              <option key={p.id} value={idx}>
                {idx + 1}. {p.title || `Slide ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Shorthand Instructions Overlay */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-gray-400">
          <span>Keyboard Actions:</span>
          <span className="bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">Space / Right</span>
          <span>Next</span>
          <span className="bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">Backsp / Left</span>
          <span>Prev</span>
          <span className="bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">Escape</span>
          <span>Exit</span>
        </div>
      </div>

    </div>
  );
}
