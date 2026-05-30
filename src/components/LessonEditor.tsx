/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Play, 
  Heading as HeadingIcon, 
  AlignLeft, 
  List, 
  Image as ImageIcon, 
  Youtube, 
  BookOpen, 
  AlertCircle, 
  Award, 
  Grid, 
  HelpCircle,
  ChevronRight,
  Eye,
  Save
} from "lucide-react";
import { Lesson, LessonPage, ContentBlock, BlockType, IC3Category } from "../types";

interface LessonEditorProps {
  lesson: Lesson;
  onSave: (updatedLesson: Lesson) => void;
  onBack: () => void;
  onPresent: (lesson: Lesson) => void;
}

export default function LessonEditor({
  lesson,
  onSave,
  onBack,
  onPresent
}: LessonEditorProps) {
  // Active state
  const [editedLesson, setEditedLesson] = useState<Lesson>({ ...lesson });
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const activePage = editedLesson.pages[activePageIndex] || editedLesson.pages[0];

  // Helper to trigger save up
  const triggerSave = (newLesson: Lesson) => {
    setEditedLesson(newLesson);
    onSave(newLesson);
    setAlertMessage("Progress auto-saved successfully!");
    setTimeout(() => setAlertMessage(null), 2500);
  };

  // Lesson Level Details Edit
  const handleMetaChange = (field: keyof Lesson, value: any) => {
    const updated = { ...editedLesson, [field]: value };
    triggerSave(updated);
  };

  // --- Slide Page management ---
  const handleAddPage = () => {
    const newPage: LessonPage = {
      id: `page-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `Slide ${editedLesson.pages.length + 1}`,
      blocks: [
        {
          id: `block-${Date.now()}-head`,
          type: BlockType.HEADING,
          headingText: "New Section Slide"
        },
        {
          id: `block-${Date.now()}-para`,
          type: BlockType.PARAGRAPH,
          paragraphText: "Type content overview here."
        }
      ]
    };
    const updatedPages = [...editedLesson.pages, newPage];
    const updated = { ...editedLesson, pages: updatedPages };
    setActivePageIndex(updatedPages.length - 1);
    triggerSave(updated);
  };

  const handleDeletePage = (index: number) => {
    if (editedLesson.pages.length <= 1) {
      alert("A lesson must have at least one slide page.");
      return;
    }
    const updatedPages = editedLesson.pages.filter((_, i) => i !== index);
    const updated = { ...editedLesson, pages: updatedPages };
    setActivePageIndex(Math.max(0, index - 1));
    triggerSave(updated);
  };

  const handleMovePage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === editedLesson.pages.length - 1) return;

    const updatedPages = [...editedLesson.pages];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    
    // Swap
    const temp = updatedPages[index];
    updatedPages[index] = updatedPages[targetIdx];
    updatedPages[targetIdx] = temp;

    const updated = { ...editedLesson, pages: updatedPages };
    setActivePageIndex(targetIdx);
    triggerSave(updated);
  };

  const handlePageTitleChange = (newTitle: string) => {
    const updatedPages = [...editedLesson.pages];
    updatedPages[activePageIndex] = {
      ...activePage,
      title: newTitle
    };
    const updated = { ...editedLesson, pages: updatedPages };
    triggerSave(updated);
  };

  // --- Block-level additions ---
  const handleAddBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type
    };

    // Populate standard dummy defaults for speed editing
    switch (type) {
      case BlockType.HEADING:
        newBlock.headingText = "Important Subheading Topic";
        break;
      case BlockType.PARAGRAPH:
        newBlock.paragraphText = "The hardware control unit direct operations of processors and links input-output systems together.";
        break;
      case BlockType.BULLET_LIST:
        newBlock.listItems = ["First key syllabus objective", "Second review indicator", "Third exam focus item"];
        break;
      case BlockType.IMAGE:
        newBlock.mediaUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60";
        newBlock.mediaCaption = "Silicon circuitry and hardware peripherals.";
        break;
      case BlockType.YOUTUBE:
        newBlock.youtubeId = "dQw4w9WgXcQ"; // Default video
        break;
      case BlockType.DEFINITION_BOX:
        newBlock.definitionTerm = "Key Concept Name";
        newBlock.definitionText = "This standard defines the vocabulary, functions, or parameters for the GS6 certificate.";
        break;
      case BlockType.IMPORTANT_NOTE:
        newBlock.noteText = "Make sure students identify the distinction on absolute reference symbols ($) before taking practice exam 1.";
        break;
      case BlockType.EXAMPLE_BOX:
        newBlock.exampleTitle = "Sample VLOOKUP syntax";
        newBlock.exampleText = "=VLOOKUP(F5, D2:E30, 2, FALSE)";
        break;
      case BlockType.PRACTICE_ACTIVITY:
        newBlock.activityTitle = "Class Practice Sandbox Challenge";
        newBlock.activityText = "Construct an HTML wireframe or run the command 'ls -la' in your terminal environment.";
        break;
      case BlockType.TABLE:
        newBlock.tableHeaders = ["Name", "Feature", "GS6 Reference"];
        newBlock.tableRows = [
          [
            { value: "SATA" },
            { value: "Connector used for SSD storage modules" },
            { value: "Computing Fundamentals" }
          ],
          [
            { value: "Absolute ($)" },
            { value: "Anchors cells while cloning formulas" },
            { value: "Key Applications" }
          ]
        ];
        break;
    }

    const updatedPages = [...editedLesson.pages];
    updatedPages[activePageIndex] = {
      ...activePage,
      blocks: [...(activePage.blocks || []), newBlock]
    };

    const updated = { ...editedLesson, pages: updatedPages };
    triggerSave(updated);
  };

  // --- Block-level modifications ---
  const handleUpdateBlock = (blockId: string, fields: Partial<ContentBlock>) => {
    const updatedPages = [...editedLesson.pages];
    const page = updatedPages[activePageIndex];
    const updatedBlocks = page.blocks.map((b) => {
      if (b.id === blockId) {
        return { ...b, ...fields };
      }
      return b;
    });

    updatedPages[activePageIndex] = {
      ...page,
      blocks: updatedBlocks
    };

    const updated = { ...editedLesson, pages: updatedPages };
    triggerSave(updated);
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedPages = [...editedLesson.pages];
    const page = updatedPages[activePageIndex];
    const updatedBlocks = page.blocks.filter((b) => b.id !== blockId);

    updatedPages[activePageIndex] = {
      ...page,
      blocks: updatedBlocks
    };

    const updated = { ...editedLesson, pages: updatedPages };
    triggerSave(updated);
  };

  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    const updatedPages = [...editedLesson.pages];
    const page = updatedPages[activePageIndex];
    const idx = page.blocks.findIndex(b => b.id === blockId);

    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === page.blocks.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const blocksCopy = [...page.blocks];
    
    // Swap
    const temp = blocksCopy[idx];
    blocksCopy[idx] = blocksCopy[targetIdx];
    blocksCopy[targetIdx] = temp;

    updatedPages[activePageIndex] = {
      ...page,
      blocks: blocksCopy
    };

    const updated = { ...editedLesson, pages: updatedPages };
    triggerSave(updated);
  };

  // Bullet items updater
  const handleUpdateBullet = (blockId: string, bulletIndex: number, newValue: string) => {
    const page = editedLesson.pages[activePageIndex];
    const block = page.blocks.find(b => b.id === blockId);
    if (!block || !block.listItems) return;

    const newListItems = [...block.listItems];
    newListItems[bulletIndex] = newValue;

    handleUpdateBlock(blockId, { listItems: newListItems });
  };

  const handleAddBulletItem = (blockId: string) => {
    const page = editedLesson.pages[activePageIndex];
    const block = page.blocks.find(b => b.id === blockId);
    if (!block) return;

    const newListItems = [...(block.listItems || []), "New syllabus review detail"];
    handleUpdateBlock(blockId, { listItems: newListItems });
  };

  const handleDeleteBulletItem = (blockId: string, bulletIndex: number) => {
    const page = editedLesson.pages[activePageIndex];
    const block = page.blocks.find(b => b.id === blockId);
    if (!block || !block.listItems) return;

    const newListItems = block.listItems.filter((_, i) => i !== bulletIndex);
    handleUpdateBlock(blockId, { listItems: newListItems });
  };

  // Table items updaters
  const handleUpdateTableHeader = (blockId: string, colIndex: number, value: string) => {
    const page = editedLesson.pages[activePageIndex];
    const block = page.blocks.find(b => b.id === blockId);
    if (!block || !block.tableHeaders) return;

    const headersCopy = [...block.tableHeaders];
    headersCopy[colIndex] = value;

    handleUpdateBlock(blockId, { tableHeaders: headersCopy });
  };

  const handleUpdateTableCell = (blockId: string, rowIndex: number, colIndex: number, value: string) => {
    const page = editedLesson.pages[activePageIndex];
    const block = page.blocks.find(b => b.id === blockId);
    if (!block || !block.tableRows) return;

    const rowsCopy = JSON.parse(JSON.stringify(block.tableRows));
    rowsCopy[rowIndex][colIndex].value = value;

    handleUpdateBlock(blockId, { tableRows: rowsCopy });
  };

  const handleAddTableColumn = (blockId: string) => {
    const page = editedLesson.pages[activePageIndex];
    const block = page.blocks.find(b => b.id === blockId);
    if (!block) return;

    const headers = [...(block.tableHeaders || ["Col A"])];
    headers.push(`Header ${headers.length + 1}`);

    const rows = block.tableRows ? JSON.parse(JSON.stringify(block.tableRows)) : [];
    const updatedRows = rows.map((row: any) => {
      return [...row, { value: "New Cell Value" }];
    });

    handleUpdateBlock(blockId, {
      tableHeaders: headers,
      tableRows: updatedRows
    });
  };

  const handleAddTableRow = (blockId: string) => {
    const page = editedLesson.pages[activePageIndex];
    const block = page.blocks.find(b => b.id === blockId);
    if (!block || !block.tableHeaders) return;

    const newEmptyRow = block.tableHeaders.map(() => ({ value: "Enter Row Info" }));
    const rowsCopy = block.tableRows ? JSON.parse(JSON.stringify(block.tableRows)) : [];
    rowsCopy.push(newEmptyRow);

    handleUpdateBlock(blockId, { tableRows: rowsCopy });
  };

  const handleDeleteTableRow = (blockId: string, rowIndex: number) => {
    const page = editedLesson.pages[activePageIndex];
    const block = page.blocks.find(b => b.id === blockId);
    if (!block || !block.tableRows) return;

    const rowsCopy = block.tableRows.filter((_, i) => i !== rowIndex);
    handleUpdateBlock(blockId, { tableRows: rowsCopy });
  };

  return (
    <div className="flex flex-col gap-6" id="ic3-lesson-builder-root">
      
      {/* Editor Header Navigation Bar */}
      <div 
        id="editor-top-actions-bar"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-100 rounded-xl shadow-xs"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 border border-gray-100 hover:bg-gray-50 text-gray-700 rounded-lg transition-all cursor-pointer"
            title="Go Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-sans">
                Active Deck Editor
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500 font-sans font-medium">
                {editedLesson.category}
              </span>
            </div>
            <h1 className="text-xl font-sans font-bold text-gray-900 leading-tight">
              {editedLesson.title}
            </h1>
          </div>
        </div>

        {/* Global actions: launch presentation directly or manually Force-Save */}
        <div className="flex items-center gap-3">
          {alertMessage && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md font-medium border border-emerald-100 animate-pulse font-sans">
              {alertMessage}
            </span>
          )}
          <button
            onClick={() => triggerSave(editedLesson)}
            className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer font-sans"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
          <button
            id="editor-teach-now"
            onClick={() => onPresent(editedLesson)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer font-sans"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Teach Deck (F5)
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div 
        id="lesson-editor-workspace"
        className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start"
      >
        
        {/* Left Side: slide thumbnails reordering panel */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h4 className="font-bold text-sm text-gray-900">Slide Navigator</h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 font-bold rounded-full font-sans">
              {editedLesson.pages.length} Slides
            </span>
          </div>

          {/* Draggable/Reorderable lists layout */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {editedLesson.pages.map((p, idx) => (
              <div
                key={p.id}
                id={`thumbnail-slide-${p.id}`}
                onClick={() => setActivePageIndex(idx)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col relative group ${
                  activePageIndex === idx
                    ? "bg-blue-500 text-white border-blue-500 shadow-xs"
                    : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${
                    activePageIndex === idx ? "text-blue-100" : "text-gray-400"
                  }`}>
                    SLIDE {idx + 1}
                  </span>
                  
                  {/* Sorting / Delete icons layer */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMovePage(idx, "up"); }}
                      disabled={idx === 0}
                      className={`p-0.5 rounded-sm transition-all ${
                        activePageIndex === idx ? "text-white hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title="Move slide up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMovePage(idx, "down"); }}
                      disabled={idx === editedLesson.pages.length - 1}
                      className={`p-0.5 rounded-sm transition-all ${
                        activePageIndex === idx ? "text-white hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title="Move slide down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePage(idx); }}
                      className={`p-0.5 rounded-sm transition-all ${
                        activePageIndex === idx ? "text-red-200 hover:bg-white/10" : "text-red-500 hover:bg-red-50"
                      }`}
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h5 className="font-bold text-xs mt-1.5 truncate">
                  {p.title || "Untitled Slide"}
                </h5>
                
                <span className={`text-[9px] mt-1 ${
                  activePageIndex === idx ? "text-blue-200" : "text-gray-400"
                }`}>
                  {p.blocks?.length || 0} interactive elements
                </span>
              </div>
            ))}
          </div>

          <button
            id="editor-btn-add-page"
            onClick={handleAddPage}
            className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg border border-dashed border-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
          >
            <Plus className="w-3.5 h-3.5" /> Add Blank Slide
          </button>
        </div>

        {/* Center/Right 3 Columns Panel: Active Slide Canvas Edit Board */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden lg:col-span-3">
          
          {/* Active slide meta settings */}
          <div className="bg-gray-50/50 border-b border-gray-100 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Active Header Title</label>
                <input
                  id="slide-title-editor-idx"
                  type="text"
                  value={activePage.title}
                  onChange={(e) => handlePageTitleChange(e.target.value)}
                  placeholder="e.g. Memory Concepts"
                  className="w-full text-base font-bold text-gray-850 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              {/* Master Deck Metadata modification options */}
              <div className="space-y-1 font-sans">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lesson Deck Category & Topic</label>
                <div className="flex gap-2">
                  <select
                    value={editedLesson.category}
                    onChange={(e) => handleMetaChange("category", e.target.value as IC3Category)}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 bg-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value={IC3Category.COMPUTING_FUNDAMENTALS}>{IC3Category.COMPUTING_FUNDAMENTALS}</option>
                    <option value={IC3Category.KEY_APPLICATIONS}>{IC3Category.KEY_APPLICATIONS}</option>
                    <option value={IC3Category.LIVING_ONLINE}>{IC3Category.LIVING_ONLINE}</option>
                  </select>
                  <input
                    type="text"
                    value={editedLesson.topic}
                    onChange={(e) => handleMetaChange("topic", e.target.value)}
                    placeholder="Topic Tag"
                    className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Interactive Block list workspace on active slide page */}
            {(!activePage.blocks || activePage.blocks.length === 0) ? (
              <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center space-y-3">
                <div className="h-10 w-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <Grid className="w-5 h-5 animate-pulse" />
                </div>
                <h5 className="font-bold text-gray-800 text-sm">Slide holds zero teaching blocks</h5>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  No elements have been inserted. Select from the tool suite below to add headings, notes, lists, or tables.
                </p>
              </div>
            ) : (
              <div className="space-y-6" id="editor-page-blocks-list">
                {activePage.blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    id={`block-wrapper-${block.id}`}
                    className="border border-gray-100 hover:border-blue-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all relative group bg-white"
                  >
                    
                    {/* Block Toolbar Action Overlay (Hover visible) */}
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1 shadow-sm transition-all z-10">
                      <button
                        onClick={() => handleMoveBlock(block.id, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded-sm text-gray-450 hover:bg-gray-50 disabled:opacity-30"
                        title="Move Block Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveBlock(block.id, "down")}
                        disabled={idx === activePage.blocks.length - 1}
                        className="p-1 rounded-sm text-gray-450 hover:bg-gray-50 disabled:opacity-30"
                        title="Move Block Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="h-4 w-px bg-gray-100 mx-1" />
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1 rounded-sm text-red-500 hover:bg-red-50"
                        title="Delete Block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Block Content Selector Switch */}
                    <div className="space-y-3">
                      
                      {/* Heading Block */}
                      {block.type === BlockType.HEADING && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-sans">
                            <HeadingIcon className="w-2.5 h-2.5" /> SECTION HEADER
                          </span>
                          <input
                            type="text"
                            value={block.headingText || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { headingText: e.target.value })}
                            className="w-full text-lg font-bold text-gray-900 border-b border-transparent focus:border-blue-300 focus:outline-hidden py-1 font-sans"
                            placeholder="Type Heading Content..."
                          />
                        </div>
                      )}

                      {/* Paragraph Block */}
                      {block.type === BlockType.PARAGRAPH && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-sans">
                            <AlignLeft className="w-2.5 h-2.5" /> PARAGRAPH
                          </span>
                          <textarea
                            rows={3}
                            value={block.paragraphText || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { paragraphText: e.target.value })}
                            className="w-full text-sm text-gray-700 bg-gray-50/50 hover:bg-gray-50 border border-gray-150 rounded-lg p-3 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-all font-sans"
                            placeholder="Enter descriptive instructional lecture notes..."
                          />
                        </div>
                      )}

                      {/* Bullet List Block */}
                      {block.type === BlockType.BULLET_LIST && (
                        <div className="space-y-3 font-sans">
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <List className="w-2.5 h-2.5" /> BULLET LIST
                          </span>
                          <div className="space-y-2">
                            {(block.listItems || []).map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full shrink-0" />
                                <input
                                  type="text"
                                  value={bullet}
                                  onChange={(e) => handleUpdateBullet(block.id, bIdx, e.target.value)}
                                  className="flex-1 text-sm border-b border-gray-100 focus:border-blue-500 focus:outline-hidden py-0.5 text-gray-700"
                                  placeholder="Rule detail content..."
                                />
                                <button
                                  onClick={() => handleDeleteBulletItem(block.id, bIdx)}
                                  className="text-red-500 hover:bg-red-50 p-1 rounded-md"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleAddBulletItem(block.id)}
                            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add bullet point
                          </button>
                        </div>
                      )}

                      {/* Image Block */}
                      {block.type === BlockType.IMAGE && (
                        <div className="space-y-3 font-sans">
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" /> IMAGE MEDIA BLOCK
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400">GRAPHICS URL</label>
                                <input
                                  type="text"
                                  value={block.mediaUrl || ""}
                                  onChange={(e) => handleUpdateBlock(block.id, { mediaUrl: e.target.value })}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg p-2 bg-gray-50 focus:bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400">IMAGE CAPTION</label>
                                <input
                                  type="text"
                                  value={block.mediaCaption || ""}
                                  onChange={(e) => handleUpdateBlock(block.id, { mediaCaption: e.target.value })}
                                  placeholder="Optional instructional description..."
                                  className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg p-2 bg-gray-50 focus:bg-white"
                                />
                              </div>
                            </div>
                            <div className="h-32 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center relative">
                              {block.mediaUrl ? (
                                <img
                                  src={block.mediaUrl}
                                  alt="Preview"
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* YouTube block */}
                      {block.type === BlockType.YOUTUBE && (
                        <div className="space-y-3 font-sans">
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Youtube className="w-2.5 h-2.5" /> YOUTUBE VIDEO PROXY
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                              <label className="text-[10px] font-bold text-gray-400">YOUTUBE VIDEO ID</label>
                              <input
                                type="text"
                                value={block.youtubeId || ""}
                                onChange={(e) => handleUpdateBlock(block.id, { youtubeId: e.target.value })}
                                placeholder="dQw4w9WgXcQ"
                                className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg p-2 bg-gray-50"
                              />
                              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                                Enter the 11 character token following "?v=" in the YouTube address bar.
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <div className="aspect-video w-full max-w-sm rounded-lg bg-black overflow-hidden flex items-center justify-center mx-auto text-white text-xs">
                                {block.youtubeId ? (
                                  <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${block.youtubeId}`}
                                    title="YouTube preview"
                                    allowFullScreen
                                  />
                                ) : (
                                  "Video not loaded."
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Definition Box */}
                      {block.type === BlockType.DEFINITION_BOX && (
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-2 font-sans">
                          <span className="text-[9px] font-bold text-blue-600 block uppercase">
                            🎓 KEY IC3 VOCABULARY DEFINITION
                          </span>
                          <input
                            type="text"
                            value={block.definitionTerm || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { definitionTerm: e.target.value })}
                            className="bg-transparent border-b border-dashed border-blue-200 text-sm font-bold text-blue-900 focus:outline-hidden py-0.5 w-full"
                            placeholder="Vocabulary term..."
                          />
                          <textarea
                            rows={2}
                            value={block.definitionText || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { definitionText: e.target.value })}
                            className="bg-transparent border border-transparent focus:border-blue-200 rounded-md text-xs text-blue-800 p-1 resize-none w-full focus:outline-hidden"
                            placeholder="Exact syllabus definition..."
                          />
                        </div>
                      )}

                      {/* Important Note Box */}
                      {block.type === BlockType.IMPORTANT_NOTE && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-2 font-sans">
                          <span className="text-[9px] font-bold text-amber-700 block uppercase flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 fill-amber-500 text-white" /> EXAM PREPARATION WARNING
                          </span>
                          <textarea
                            rows={2}
                            value={block.noteText || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { noteText: e.target.value })}
                            className="bg-transparent border border-transparent focus:border-amber-200 rounded-md text-xs text-amber-900 p-1 resize-none w-full focus:outline-hidden font-medium"
                            placeholder="Critically verified concept details..."
                          />
                        </div>
                      )}

                      {/* Example Box */}
                      {block.type === BlockType.EXAMPLE_BOX && (
                        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl space-y-2 font-sans">
                          <span className="text-[9px] font-bold text-indigo-700 block uppercase flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> APPLIED EXTREME DEMONSTRATION
                          </span>
                          <input
                            type="text"
                            value={block.exampleTitle || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { exampleTitle: e.target.value })}
                            className="bg-transparent border-b border-dashed border-indigo-200 text-sm font-bold text-indigo-900 focus:outline-hidden py-0.5 w-full"
                            placeholder="Demonstration title..."
                          />
                          <textarea
                            rows={3}
                            value={block.exampleText || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { exampleText: e.target.value })}
                            className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-lg mt-2 focus:outline-hidden"
                            placeholder="Type command lines, Excel block coordinates, or formatted code lists..."
                          />
                        </div>
                      )}

                      {/* Practice Activity Box */}
                      {block.type === BlockType.PRACTICE_ACTIVITY && (
                        <div className="bg-teal-50 border-l-4 border-teal-600 p-4 rounded-r-xl space-y-2 font-sans">
                          <span className="text-[9px] font-bold text-teal-700 block uppercase flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> INTERACTIVE LABORATORY WORK
                          </span>
                          <input
                            type="text"
                            value={block.activityTitle || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { activityTitle: e.target.value })}
                            className="bg-transparent border-b border-dashed border-teal-200 text-sm font-bold text-teal-900 focus:outline-hidden py-0.5 w-full"
                            placeholder="Class task header..."
                          />
                          <textarea
                            rows={2}
                            value={block.activityText || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { activityText: e.target.value })}
                            className="bg-transparent border border-transparent focus:border-teal-200 rounded-md text-xs text-teal-800 p-1 resize-none w-full focus:outline-hidden"
                            placeholder="Active sandbox workspace instructions..."
                          />
                        </div>
                      )}

                      {/* Tables */}
                      {block.type === BlockType.TABLE && (
                        <div className="space-y-3 font-sans">
                          <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Grid className="w-2.5 h-2.5" /> DATA STRUCTURE SPREADSHEET TABLE
                          </span>
                          <div className="overflow-x-auto border border-gray-100 rounded-lg bg-white">
                            <table className="w-full text-left text-xs border-collapse divide-y divide-gray-150">
                              <thead className="bg-gray-50">
                                <tr>
                                  {(block.tableHeaders || []).map((header, hIdx) => (
                                    <th key={hIdx} className="p-3">
                                      <input
                                        type="text"
                                        value={header}
                                        onChange={(e) => handleUpdateTableHeader(block.id, hIdx, e.target.value)}
                                        className="bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-hidden text-xs font-bold text-gray-700 py-0.5 w-full"
                                      />
                                    </th>
                                  ))}
                                  <th className="p-2 w-10">
                                    <button
                                      onClick={() => handleAddTableColumn(block.id)}
                                      className="p-1 rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all"
                                      title="Add Column"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {(block.tableRows || []).map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-gray-50/50">
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-3">
                                        <input
                                          type="text"
                                          value={cell.value}
                                          onChange={(e) => handleUpdateTableCell(block.id, rIdx, cIdx, e.target.value)}
                                          className="bg-transparent focus:bg-white border border-transparent focus:border-blue-200 font-normal text-gray-600 py-0.5 w-full"
                                        />
                                      </td>
                                    ))}
                                    <td className="p-2 text-center">
                                      <button
                                        onClick={() => handleDeleteTableRow(block.id, rIdx)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md"
                                        title="Delete Row"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <button
                            onClick={() => handleAddTableRow(block.id)}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[11px] font-semibold text-gray-600 rounded-md border border-gray-150 flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Add Row
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick-add Element toolbar options at the page footer */}
            <div id="editor-quick-add-blocks" className="space-y-3 pt-6 border-t border-gray-100 font-sans">
              <h5 className="font-bold text-xs text-gray-400 uppercase tracking-wider">
                Insert Slide Components Suite
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.HEADING)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <HeadingIcon className="w-5 h-5 text-blue-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Heading</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Modular Subchapter Titles</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.PARAGRAPH)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <AlignLeft className="w-5 h-5 text-purple-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Paragraph</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Descriptions and Notes</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.BULLET_LIST)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <List className="w-5 h-5 text-indigo-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Bullet List</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Exam reviews/Shorthand</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.TABLE)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <Grid className="w-5 h-5 text-violet-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Excel Grid</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Full Editable Table</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.IMAGE)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Media Image</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Custom Photo Graphic link</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.YOUTUBE)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <Youtube className="w-5 h-5 text-red-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">YouTube Embed</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Review videos/Syllabus</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.DEFINITION_BOX)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-blue-500 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Vocab Box</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Vocabulary concept blocks</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.IMPORTANT_NOTE)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <AlertCircle className="w-5 h-5 text-amber-500 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Exam Note</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Crucial warnings/Protips</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.EXAMPLE_BOX)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <Award className="w-5 h-5 text-indigo-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Execution Sandbox</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Excel Formulas/Code references</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.PRACTICE_ACTIVITY)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <HelpCircle className="w-5 h-5 text-teal-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Class Lab</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Student review exercises</p>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
