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
  Moon,
  Check
} from "lucide-react";
import { Lesson, LessonPage, ContentBlock, BlockType } from "../types";

// Rich Text parsing helper for bolding, italics, and highlighting
function renderRichText(text: string | null | undefined): React.ReactNode {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|==.*?==)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-inherit">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("==") && part.endsWith("==")) {
      return (
        <mark key={i} className="bg-amber-100 dark:bg-amber-950/50 text-amber-900 border border-amber-200/50 dark:text-amber-100 px-1 py-0.5 rounded text-inherit">
          {part.slice(2, -2)}
        </mark>
      );
    }
    return part;
  });
}

interface PresentationModeProps {
  lesson: Lesson;
  onExit: (currentPageIndex?: number) => void;
  initialPageIndex?: number;
}

export default function PresentationMode({
  lesson,
  onExit,
  initialPageIndex = 0
}: PresentationModeProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(initialPageIndex);
  
  // Interactive Questions Interactive Solver States
  const [qAnswers, setQAnswers] = useState<Record<string, any>>({});
  
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
          onExit(currentPageIndex);
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
              <div className="flex items-center gap-2 mt-0.5 min-w-0">
                <h2 className="text-sm font-bold truncate max-w-sm md:max-w-md">
                  {lesson.title}
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-450/15 dark:text-amber-400 rounded-full border border-amber-500/20 shrink-0">
                  {(() => {
                    const currentPage = lesson.pages[currentPageIndex];
                    return currentPage?.topic?.trim() || lesson.topic || "General Topic";
                  })()}
                </span>
              </div>
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
              onClick={() => onExit(currentPageIndex)}
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
                      {renderRichText(block.headingText)}
                    </h3>
                  )}

                  {block.type === BlockType.PARAGRAPH && (
                    <p className="text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                      {renderRichText(block.paragraphText)}
                    </p>
                  )}

                  {block.type === BlockType.BULLET_LIST && (
                    <ul className="space-y-3 pl-6">
                      {(block.listItems || []).map((bullet, idx) => (
                        <li key={idx} className="list-disc text-base md:text-lg text-gray-700 dark:text-slate-350 marker:text-blue-500">
                          {renderRichText(bullet)}
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
                          {renderRichText(block.mediaCaption)}
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
                        {renderRichText(block.definitionTerm)}
                      </h4>
                      <p className="text-sm md:text-base text-blue-900 dark:text-blue-100 mt-2 leading-relaxed font-sans">
                        {renderRichText(block.definitionText)}
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
                        {renderRichText(block.noteText)}
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
                        {renderRichText(block.exampleTitle)}
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
                        {renderRichText(block.activityTitle)}
                      </h4>
                      <p className="text-sm md:text-base text-teal-900 dark:text-teal-100 mt-2 leading-relaxed font-sans">
                        {renderRichText(block.activityText)}
                      </p>
                    </div>
                  )}

                  {block.type === BlockType.QUESTION_SINGLE && (
                    <div className={`p-6 rounded-3xl shadow-sm border ${
                      isHighContrast ? "bg-slate-900/50 border-slate-800" : "bg-blue-50/20 border-blue-100"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider">
                          IC3 Assessment: Single Answer
                        </span>
                      </div>
                      <h4 className="text-base md:text-lg font-sans font-bold text-gray-900 dark:text-slate-100 mb-4 select-text">
                        {renderRichText(block.questionText)}
                      </h4>

                      {/* Display Choices */}
                      <div className="space-y-2.5 max-w-xl">
                        {(block.questionOptions || []).map((option, idx) => {
                          const ansState = qAnswers[block.id] || {};
                          const isSelected = ansState.selectedIndex === idx;
                          const isChecked = ansState.checked;
                          const isCorrectOption = block.correctOptionIndex === idx;

                          let choiceStyle = isHighContrast 
                            ? "bg-slate-950 border-slate-850 text-slate-350 hover:bg-slate-900" 
                            : "bg-white border-gray-255 text-gray-700 hover:bg-gray-50";

                          if (isSelected) {
                            choiceStyle = "bg-blue-600 text-white border-blue-700 font-semibold";
                          }

                          if (isChecked) {
                            if (isCorrectOption) {
                              choiceStyle = "bg-emerald-600 text-white border-emerald-650 font-semibold";
                            } else if (isSelected) {
                              choiceStyle = "bg-red-600 text-white border-red-650 font-semibold";
                            } else {
                              choiceStyle = "opacity-45 bg-gray-100 dark:bg-slate-950 border-gray-150 text-gray-400";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              disabled={isChecked}
                              onClick={() => {
                                setQAnswers({
                                  ...qAnswers,
                                  [block.id]: { selectedIndex: idx, checked: false }
                                });
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm flex items-center justify-between transition-all cursor-[pointer] ${choiceStyle}`}
                            >
                              <span>{renderRichText(option)}</span>
                              {isChecked && isCorrectOption && (
                                <span className="bg-white/20 p-1 rounded-full"><Check className="w-3.5 h-3.5" /></span>
                              )}
                              {isChecked && isSelected && !isCorrectOption && (
                                <span className="bg-white/20 p-1 rounded-full"><X className="w-3.5 h-3.5" /></span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Controls and Feedback block */}
                      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                        <div className="text-xs">
                          {qAnswers[block.id]?.checked && (
                            <div className="flex items-center gap-2">
                              {qAnswers[block.id].selectedIndex === block.correctOptionIndex ? (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Sparkles className="w-4 h-4 animate-bounce" /> Correct answer chosen!
                                </span>
                              ) : (
                                <span className="font-bold text-red-600 dark:text-red-400">
                                  Incorrect selection. The correct option was: {renderRichText(block.questionOptions?.[block.correctOptionIndex || 0])}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const ansState = qAnswers[block.id] || {};
                              if (ansState.selectedIndex === undefined) return;
                              setQAnswers({
                                ...qAnswers,
                                [block.id]: { ...ansState, checked: true }
                              });
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Check Answer
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQAnswers({
                                ...qAnswers,
                                [block.id]: {}
                              });
                            }}
                            className="px-3 py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Retry
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === BlockType.QUESTION_MULTIPLE && (
                    <div className={`p-6 rounded-3xl shadow-sm border ${
                      isHighContrast ? "bg-slate-900/50 border-slate-800" : "bg-purple-50/20 border-purple-100"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-purple-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider">
                          IC3 Assessment: Multiple Answer
                        </span>
                      </div>
                      <h4 className="text-base md:text-lg font-sans font-bold text-gray-900 dark:text-slate-100 mb-4 select-text">
                        {block.questionText}
                      </h4>

                      {/* Display choices */}
                      <div className="space-y-2.5 max-w-xl">
                        {(block.questionOptions || []).map((option, idx) => {
                          const ansState = qAnswers[block.id] || {};
                          const selectedIndices = ansState.selectedIndices || [];
                          const isSelected = selectedIndices.includes(idx);
                          const isChecked = ansState.checked;
                          const isCorrect = (block.correctOptionIndices || []).includes(idx);

                          let choiceStyle = isHighContrast 
                            ? "bg-slate-950 border-slate-850 text-slate-350 hover:bg-slate-900" 
                            : "bg-white border-gray-255 text-gray-700 hover:bg-gray-50";

                          if (isSelected) {
                            choiceStyle = "bg-purple-600 text-white border-purple-750 font-semibold";
                          }

                          if (isChecked) {
                            if (isCorrect) {
                              choiceStyle = "bg-emerald-600 text-white border-emerald-650 font-semibold";
                            } else if (isSelected) {
                              choiceStyle = "bg-red-600 text-white border-red-650 font-semibold";
                            } else {
                              choiceStyle = "opacity-45 bg-gray-100 dark:bg-slate-950 border-gray-150 text-gray-400";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              disabled={isChecked}
                              onClick={() => {
                                let nextIndices = [...selectedIndices];
                                if (isSelected) {
                                  nextIndices = nextIndices.filter((val) => val !== idx);
                                } else {
                                  nextIndices.push(idx);
                                }
                                setQAnswers({
                                  ...qAnswers,
                                  [block.id]: { selectedIndices: nextIndices, checked: false }
                                });
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm flex items-center justify-between transition-all cursor-[pointer] ${choiceStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                                  isSelected ? "bg-white text-purple-650 border-white" : "border-gray-300"
                                }`}>
                                  {isSelected && "✓"}
                                </span>
                                <span>{renderRichText(option)}</span>
                              </div>
                              {isChecked && isCorrect && (
                                <span className="bg-white/20 p-1 rounded-full"><Check className="w-3.5 h-3.5" /></span>
                              )}
                              {isChecked && isSelected && !isCorrect && (
                                <span className="bg-white/20 p-1 rounded-full"><X className="w-3.5 h-3.5" /></span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Controls and Feedback block */}
                      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                        <div className="text-xs">
                          {qAnswers[block.id]?.checked && (
                            <div className="space-y-1">
                              <span className="font-bold block dark:text-white">Correction Key:</span>
                              <div className="flex flex-wrap gap-2">
                                {(block.questionOptions || []).map((opt, idx) => {
                                  if ((block.correctOptionIndices || []).includes(idx)) {
                                    return (
                                      <span key={idx} className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                                        ✓ {renderRichText(opt)}
                                      </span>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const ansState = qAnswers[block.id] || {};
                              setQAnswers({
                                ...qAnswers,
                                [block.id]: { ...ansState, checked: true }
                              });
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Check Answers
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQAnswers({
                                ...qAnswers,
                                [block.id]: {}
                              });
                            }}
                            className="px-3 py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Retry
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === BlockType.QUESTION_DRAG_DROP && (
                    <div className={`p-6 rounded-3xl shadow-sm border ${
                      isHighContrast ? "bg-slate-900/50 border-slate-800" : "bg-emerald-50/15 border-emerald-100"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider">
                          IC3 Matching Challenge: Classification Board
                        </span>
                      </div>
                      <h4 className="text-base md:text-lg font-sans font-bold text-gray-900 dark:text-slate-100 mb-4 select-text">
                        {renderRichText(block.questionText)}
                      </h4>

                      {/* Display columns and Drag card pools */}
                      {(() => {
                        const pairs = block.dragDropPairs || [];
                        const uniqueZones = Array.from(new Set(pairs.map(p => p.zone)));
                        const ansState = qAnswers[block.id] || {};
                        const mappings = ansState.mappings || {}; // maps pair.id -> selectedZone string
                        const activeItem = ansState.activeItemId || null; // id of item being matched
                        const isChecked = ansState.checked;

                        // Unassigned cards (whose ID is not in mapping values, or mapping is empty)
                        const unassignedPairs = pairs.filter(p => !mappings[p.id]);

                        return (
                          <div className="space-y-6">
                            {/* Unassigned Pool Grid */}
                            {!isChecked && (
                              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-150 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-gray-400 block uppercase mb-3">
                                  Available Syllabus Cards (Select a card, then tap a destination zone)
                                </span>
                                {unassignedPairs.length === 0 ? (
                                  <p className="text-xs text-emerald-600 font-semibold dark:text-emerald-400">
                                    ✓ All network & computing components assigned to board!
                                  </p>
                                ) : (
                                  <div className="flex flex-wrap gap-2.5">
                                    {unassignedPairs.map(p => {
                                      const isBeingMoved = activeItem === p.id;
                                      return (
                                        <button
                                          key={p.id}
                                          type="button"
                                          onClick={() => {
                                            setQAnswers({
                                              ...qAnswers,
                                              [block.id]: { ...ansState, activeItemId: p.id }
                                            });
                                          }}
                                          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold border shadow-2xs transition-all cursor-[pointer] ${
                                            isBeingMoved 
                                              ? "bg-blue-600 border-blue-600 text-white scale-105 ring-2 ring-blue-500/50" 
                                              : isHighContrast
                                                ? "bg-slate-900 border-slate-750 text-slate-300 hover:border-slate-600"
                                                : "bg-white border-gray-250 text-gray-700 hover:border-blue-400 hover:bg-slate-50"
                                          }`}
                                        >
                                          {renderRichText(p.item)}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Classification Board columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {uniqueZones.map((zone, zIdx) => {
                                // Find cards mapped to this zone
                                const itemsInThisZone = pairs.filter(p => mappings[p.id] === zone);

                                const clickableTargetStyle = !isChecked && activeItem
                                  ? "border-blue-400 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500 ring-2 ring-dashed"
                                  : "border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30";

                                return (
                                  <div
                                    key={zIdx}
                                    onClick={() => {
                                      if (isChecked || !activeItem) return;
                                      // Map activeItem to this zone
                                      const updatedMappings = { ...mappings, [activeItem]: zone };
                                      setQAnswers({
                                        ...qAnswers,
                                        [block.id]: { mappings: updatedMappings, activeItemId: null, checked: false }
                                      });
                                    }}
                                    className={`p-4 rounded-2xl border min-h-[140px] flex flex-col transition-all relative select-none ${
                                      !isChecked ? "cursor-[pointer] " : ""
                                    }${clickableTargetStyle}`}
                                  >
                                    <h5 className="font-bold text-[10px] md:text-xs text-gray-500 dark:text-slate-400 border-b border-gray-150 pb-2 mb-3 uppercase tracking-wider">
                                      {renderRichText(zone)}
                                    </h5>

                                    <div className="flex-1 space-y-2">
                                      {itemsInThisZone.map(itemPair => {
                                        const isPairCorrect = itemPair.zone === zone;
                                        let cardDecoration = isHighContrast 
                                          ? "bg-slate-900 border-slate-800 text-slate-300"
                                          : "bg-white border-gray-255 text-gray-700";

                                        if (isChecked) {
                                          cardDecoration = isPairCorrect 
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300" 
                                            : "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-800 dark:text-red-300";
                                        }

                                        return (
                                          <div
                                            key={itemPair.id}
                                            className={`p-2.5 rounded-xl border text-xs font-semibold shadow-3xs flex items-center justify-between ${cardDecoration}`}
                                          >
                                            <span className="truncate">{renderRichText(itemPair.item)}</span>
                                            {!isChecked && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const nextMappings = { ...mappings };
                                                  delete nextMappings[itemPair.id];
                                                  setQAnswers({
                                                    ...qAnswers,
                                                    [block.id]: { ...ansState, mappings: nextMappings, activeItemId: null }
                                                  });
                                                }}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded-md ml-1"
                                                title="Unassign Card"
                                              >
                                                ✕
                                              </button>
                                            )}
                                            {isChecked && (
                                              <span className="text-[10px] font-bold ml-1">
                                                {isPairCorrect ? "✓ Correct" : "✗ Error"}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {!isChecked && activeItem && (
                                      <span className="absolute inset-x-0 bottom-2 text-[8px] text-blue-500 text-center font-bold animate-pulse">
                                        TAP ZONE TO ASSIGN
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Verification feedback footer */}
                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                              <div className="text-xs">
                                {isChecked && (
                                  <div>
                                    {(() => {
                                      const correctMatches = pairs.filter(p => mappings[p.id] === p.zone).length;
                                      return (
                                        <p className="font-semibold text-gray-800 dark:text-gray-300">
                                          Accuracy Score: <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{correctMatches} / {pairs.length}</span> networking classifications correct.
                                        </p>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQAnswers({
                                      ...qAnswers,
                                      [block.id]: { mappings, checked: true }
                                    });
                                  }}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-[pointer] transition-all"
                                >
                                  Check Mapping Grid
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQAnswers({
                                      ...qAnswers,
                                      [block.id]: {}
                                    });
                                  }}
                                  className="px-3 py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 text-xs font-bold rounded-lg cursor-[pointer] transition-all flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" /> Reset Grid
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {block.type === BlockType.QUESTION_HOTSPOT && (
                    <div className={`p-6 rounded-3xl shadow-sm border ${
                      isHighContrast ? "bg-slate-900/50 border-slate-800" : "bg-amber-50/15 border-amber-100"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-amber-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider">
                          IC3 Diagnostic: Interactive Diagram Hotspot
                        </span>
                      </div>
                      <h4 className="text-base md:text-lg font-sans font-bold text-gray-900 dark:text-slate-100 mb-4 select-text">
                        {renderRichText(block.questionText)}
                      </h4>

                      {(() => {
                        const hotspots = block.hotspots || [];
                        const ansState = qAnswers[block.id] || {};
                        const selectedHsId = ansState.selectedHotspotId || null;
                        const isChecked = ansState.checked;

                        const selectedHs = hotspots.find(h => h.id === selectedHsId);

                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Clickable Image Diagram Container */}
                            <div className="lg:col-span-2 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-black relative select-none">
                              <img 
                                src={block.hotspotImageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format"}
                                alt="Hotspot Graphic"
                                className="object-cover w-full h-[280px] md:h-[350px] opacity-85"
                                referrerPolicy="no-referrer"
                              />

                              {/* Clickable Regions overlay */}
                              {hotspots.map((hs, idx) => {
                                const isRegionSelected = selectedHsId === hs.id;
                                
                                let indicatorClass = "border-amber-400 bg-amber-500/10 hover:bg-amber-500/30 scale-100";
                                if (isRegionSelected) {
                                  indicatorClass = "border-blue-500 bg-blue-500/35 ring-4 ring-blue-500/40 scale-110";
                                }

                                if (isChecked) {
                                  indicatorClass = hs.isCorrect
                                    ? "border-emerald-500 bg-emerald-500/40 ring-4 ring-emerald-500/50 scale-115"
                                    : isRegionSelected 
                                      ? "border-red-500 bg-red-500/40 ring-4 ring-red-500/50 scale-115"
                                      : "opacity-35 bg-transparent border-gray-500 pointer-events-none";
                                }

                                return (
                                  <button
                                    key={hs.id || idx}
                                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                                    disabled={isChecked}
                                    onClick={() => {
                                      setQAnswers({
                                        ...qAnswers,
                                        [block.id]: { selectedHotspotId: hs.id, checked: false }
                                      });
                                    }}
                                    className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-3 flex items-center justify-center transition-all duration-200 cursor-pointer ${indicatorClass}`}
                                    title={isChecked ? hs.label : `Target #${idx+1}`}
                                  >
                                    <span className="bg-white/90 text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-xs">
                                      {idx + 1}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Hotspot details/results pane */}
                            <div className="space-y-4 flex flex-col justify-between">
                              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-4 rounded-2xl flex-1 space-y-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                  Diagnostic Targets Available (Select a target circle on diagram)
                                </span>
                                
                                <div className="space-y-2">
                                  {hotspots.map((h, i) => (
                                    <div 
                                      key={h.id || i}
                                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                                        selectedHsId === h.id 
                                          ? "bg-amber-500/10 border-amber-300 dark:bg-amber-950/20 text-gray-900 dark:text-white" 
                                          : "bg-slate-50 border-gray-150 dark:bg-slate-950 dark:border-slate-800 text-gray-500"
                                      }`}
                                    >
                                      <span className="font-bold flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[9px]">
                                        {i + 1}
                                      </span>
                                      <span>{isChecked ? renderRichText(h.label) : `Hardware Peripheral Zone Target #${i + 1}`}</span>
                                    </div>
                                  ))}
                                </div>

                                {selectedHs && (
                                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                      Active Region Selection
                                    </span>
                                    <p className="font-bold text-xs text-gray-800 dark:text-slate-100">
                                      ✓ Currently highlighting Target #{hotspots.indexOf(selectedHs) + 1}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Actions footer component */}
                              <div className="space-y-3">
                                {isChecked && selectedHs && (
                                  <div className={`p-3 rounded-xl border font-sans text-xs font-semibold ${
                                    selectedHs.isCorrect
                                      ? "bg-emerald-50 border-emerald-250 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                                      : "bg-red-50 border-red-250 text-red-800 dark:bg-red-950/30 dark:text-red-300"
                                  }`}>
                                    <div className="flex items-center gap-1.5 font-bold text-sm mb-1">
                                      {selectedHs.isCorrect ? "✓ Matches Perfectly!" : "✗ Diagnostic Error"}
                                    </div>
                                    <p className="text-xs font-normal leading-normal">
                                      {selectedHs.isCorrect 
                                        ? "Pristine alignment coordinate chosen. This motherboard segment correctly represents the high-speed graphic interface slots (PCIe)."
                                        : `Selected sector is "${selectedHs.label}", which is incorrect for this challenge statement. Try again!`}
                                    </p>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={!selectedHsId}
                                    onClick={() => {
                                      setQAnswers({
                                        ...qAnswers,
                                        [block.id]: { selectedHotspotId: selectedHsId, checked: true }
                                      });
                                    }}
                                    className="px-4 py-2 flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-45 text-white text-xs font-bold rounded-lg cursor-[pointer] transition-all disabled:pointer-events-none"
                                  >
                                    Verify Selection
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQAnswers({
                                        ...qAnswers,
                                        [block.id]: {}
                                      });
                                    }}
                                    className="px-3 py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 text-xs font-bold rounded-lg cursor-[pointer] transition-all flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Reset Area
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {block.type === BlockType.QUESTION_VIDEO && (
                    <div className={`p-6 rounded-3xl shadow-sm border ${
                      isHighContrast ? "bg-slate-900/50 border-slate-800" : "bg-red-50/15 border-red-100"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-red-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider">
                          IC3 Interactive: Video-based Challenge
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Video Player block */}
                        <div className="lg:col-span-3 space-y-2">
                          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-lg relative">
                            <iframe
                              src={`https://www.youtube.com/embed/${block.videoYoutubeId || "dQw4w9WgXcQ"}?enablejsapi=1&autoplay=0`}
                              title="Syllabus Demo Video"
                              className="w-full h-full object-cover"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                          {block.videoTimestamp !== undefined && block.videoTimestamp > 0 && (
                            <div className="flex items-center justify-between text-[11px] text-gray-450 dark:text-slate-400 font-sans px-1">
                              <span>Syllabus Target Marker: <b>at {block.videoTimestamp}s</b></span>
                              <span className="text-red-500 animate-pulse font-semibold">● Pause and Answer checkpoint</span>
                            </div>
                          )}
                                    {/* Interactive Questionnaire panel */}
                        {(() => {
                          const ansState = qAnswers[block.id] || {};
                          const isChecked = ansState.checked;
                          return (
                            <div className="lg:col-span-2 space-y-3.5 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest block mb-1">
                                  Checkpoint Question
                                </span>
                                <h4 className="text-sm md:text-base font-sans font-bold text-gray-900 dark:text-slate-100 leading-normal mb-3 select-text">
                                  {renderRichText(block.videoQuestionText)}
                                </h4>

                                <div className="space-y-2">
                                  {(block.videoOptions || []).map((option, idx) => {
                                    const isSelected = ansState.selectedIndex === idx;
                                    const isCorrectOption = block.videoCorrectOptionIndex === idx;

                                    let choiceStyle = isHighContrast 
                                      ? "bg-slate-950 border-slate-850 text-slate-350 hover:bg-slate-900" 
                                      : "bg-white border-gray-255 text-gray-700 hover:bg-gray-50";

                                    if (isSelected) {
                                      choiceStyle = "bg-red-650 text-white border-red-650 font-semibold";
                                    }

                                    if (isChecked) {
                                      if (isCorrectOption) {
                                        choiceStyle = "bg-emerald-600 text-white border-emerald-650 font-semibold";
                                      } else if (isSelected) {
                                        choiceStyle = "bg-red-600 text-white border-red-650 font-semibold";
                                      } else {
                                        choiceStyle = "opacity-45 bg-gray-100 dark:bg-slate-950 border-gray-150 text-gray-400";
                                      }
                                    }

                                    return (
                                      <button
                                        key={idx}
                                        disabled={isChecked}
                                        onClick={() => {
                                          setQAnswers({
                                            ...qAnswers,
                                            [block.id]: { selectedIndex: idx, checked: false }
                                          });
                                        }}
                                        className={`w-full text-left p-3 rounded-xl border text-[11px] md:text-xs flex items-center justify-between transition-all cursor-[pointer] ${choiceStyle}`}
                                      >
                                        <span>{renderRichText(option)}</span>
                                        {isChecked && isCorrectOption && (
                                          <span className="bg-white/20 p-0.5 rounded-full"><Check className="w-3 h-3" /></span>
                                        )}
                                        {isChecked && isSelected && !isCorrectOption && (
                                          <span className="bg-white/20 p-0.5 rounded-full"><X className="w-3 h-3" /></span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Options submission panel */}
                              <div>
                                {isChecked && (
                                  <div className="mb-3 text-[11px]">
                                    {qAnswers[block.id]?.selectedIndex === block.videoCorrectOptionIndex ? (
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        ✓ Perfect! Excellent visual diagnosis.
                                      </span>
                                    ) : (
                                      <span className="font-bold text-red-600 dark:text-red-400">
                                        ✗ Question Incorrect. Keep practicing! Correct answer: {renderRichText(block.videoOptions?.[block.videoCorrectOptionIndex || 0])}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (ansState.selectedIndex === undefined) return;
                                      setQAnswers({
                                        ...qAnswers,
                                        [block.id]: { ...ansState, checked: true }
                                      });
                                    }}
                                    className="px-4 py-2 flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-[pointer] transition-all"
                                  >
                                    Check Video Response
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQAnswers({
                                        ...qAnswers,
                                        [block.id]: {}
                                      });
                                    }}
                                    className="px-3 py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 text-xs font-bold rounded-lg cursor-[pointer] transition-all flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Retry
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}                  </div>
                      </div>
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
        <div className="flex flex-wrap items-center gap-4 font-sans text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-500 dark:text-slate-400">Jump to Topic:</span>
            <select
              value={(() => {
                const currentPage = lesson.pages[currentPageIndex];
                return currentPage?.topic?.trim() || lesson.topic || "General Topic";
              })()}
              onChange={(e) => {
                const selectedTopic = e.target.value;
                // Find first page index that matches chosen topic
                const targetIdx = lesson.pages.findIndex(p => {
                  const t = p.topic?.trim() || lesson.topic || "General Topic";
                  return t === selectedTopic;
                });
                if (targetIdx !== -1) {
                  setCurrentPageIndex(targetIdx);
                }
              }}
              className={`border rounded-lg px-2 py-1.5 focus:outline-hidden text-xs font-bold ${
                isHighContrast 
                  ? "bg-slate-900 border-slate-800 text-white" 
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              {(() => {
                const uniqueTopics: string[] = [];
                lesson.pages.forEach(p => {
                  const t = p.topic?.trim() || lesson.topic || "General Topic";
                  if (!uniqueTopics.includes(t)) {
                    uniqueTopics.push(t);
                  }
                });
                return uniqueTopics.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ));
              })()}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-500 dark:text-slate-400">Jump to Slide:</span>
            <select
              value={currentPageIndex}
              onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
              className={`border rounded-lg px-2 py-1.5 focus:outline-hidden text-xs font-semibold ${
                isHighContrast 
                  ? "bg-slate-900 border-slate-800 text-white" 
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
