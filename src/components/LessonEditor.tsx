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
  ChevronDown,
  FolderOpen,
  Folder,
  GripVertical,
  Eye,
  Save,
  CheckCircle,
  CheckSquare,
  Move,
  MapPin,
  Video,
  Bold,
  Italic,
  Highlighter
} from "lucide-react";
import { Lesson, LessonPage, ContentBlock, BlockType, IC3Category } from "../types";

interface FormattingToolbarProps {
  elementId: string;
  value: string;
  onChange: (newVal: string) => void;
  compact?: boolean;
}

function FormattingToolbar({ elementId, value, onChange, compact = false }: FormattingToolbarProps) {
  const handleInsert = (e: React.MouseEvent, type: 'bold' | 'italic' | 'highlight') => {
    e.preventDefault();
    e.stopPropagation();
    
    const el = document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    
    let prefix = "";
    let suffix = "";
    if (type === 'bold') {
      prefix = "**";
      suffix = "**";
    } else if (type === 'italic') {
      prefix = "*";
      suffix = "*";
    } else if (type === 'highlight') {
      prefix = "==";
      suffix = "==";
    }

    const selectedText = value.substring(start, end);
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    const newValue = textBefore + prefix + selectedText + suffix + textAfter;
    onChange(newValue);

    // Focus back and format selection
    setTimeout(() => {
      el.focus();
      const newStart = start + prefix.length;
      const newEnd = end + prefix.length;
      el.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  return (
    <div className="flex items-center gap-1 py-0.5 px-1 bg-gray-50 dark:bg-slate-800 w-fit max-w-full rounded border border-gray-200 dark:border-slate-700/50">
      <button
        type="button"
        onMouseDown={(e) => handleInsert(e, 'bold')}
        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-700 dark:text-gray-300 transition-all font-bold text-xs flex items-center justify-center gap-1.5"
        title="Bold Selection (**text**)"
      >
        <Bold className="w-3 h-3" />
        {!compact && <span className="text-[10px] text-gray-500 font-medium select-none">Bold</span>}
      </button>
      <div className="h-3 w-[1px] bg-gray-300 dark:bg-slate-600" />
      <button
        type="button"
        onMouseDown={(e) => handleInsert(e, 'italic')}
        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-700 dark:text-gray-300 transition-all italic text-xs flex items-center justify-center gap-1.5"
        title="Italic Selection (*text*)"
      >
        <Italic className="w-3 h-3" />
        {!compact && <span className="text-[10px] text-gray-500 font-medium select-none">Italic</span>}
      </button>
      <div className="h-3 w-[1px] bg-gray-300 dark:bg-slate-600" />
      <button
        type="button"
        onMouseDown={(e) => handleInsert(e, 'highlight')}
        className="p-1 hover:bg-amber-100 dark:hover:bg-slate-700 rounded text-gray-700 dark:text-gray-300 transition-all text-xs flex items-center justify-center gap-1.5"
        title="Highlight Selection (==text==)"
      >
        <Highlighter className="w-3 h-3 text-amber-500" />
        {!compact && <span className="text-[10px] text-amber-600 dark:text-amber-450 font-medium select-none">Highlight</span>}
      </button>
    </div>
  );
}

interface LessonEditorProps {
  lesson: Lesson;
  onSave: (updatedLesson: Lesson) => void;
  onBack: () => void;
  onPresent: (lesson: Lesson, initialPageIndex?: number) => void;
  initialPageIndex?: number;
}

export default function LessonEditor({
  lesson,
  onSave,
  onBack,
  onPresent,
  initialPageIndex = 0
}: LessonEditorProps) {
  // Active state
  const [editedLesson, setEditedLesson] = useState<Lesson>({ ...lesson });
  const [activePageIndex, setActivePageIndex] = useState<number>(initialPageIndex);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const activePage = editedLesson.pages[activePageIndex] || editedLesson.pages[0];

  // Topic/Category collapse states
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  // Slide Navigator drag item states
  const [draggedPageIdx, setDraggedPageIdx] = useState<number | null>(null);
  const [dragOverPageIdx, setDragOverPageIdx] = useState<number | null>(null);
  const [dragOverTopicName, setDragOverTopicName] = useState<string | null>(null);

  // Helper to get active slide topic
  const getPageTopic = (page: LessonPage): string => {
    return page.topic?.trim() || editedLesson.topic?.trim() || "General Topic";
  };

  // Helper to group pages dynamically by their topics
  const topicGroups = React.useMemo(() => {
    const groups: { topicName: string; pages: { page: LessonPage; originalIndex: number }[] }[] = [];
    const groupMap: Record<string, typeof groups[0]> = {};

    editedLesson.pages.forEach((page, originalIndex) => {
      const topicName = getPageTopic(page);
      if (!groupMap[topicName]) {
        groupMap[topicName] = { topicName, pages: [] };
        groups.push(groupMap[topicName]);
      }
      groupMap[topicName].pages.push({ page, originalIndex });
    });

    return groups;
  }, [editedLesson.pages, editedLesson.topic]);

  const toggleTopicCollapse = (topicName: string) => {
    setCollapsedTopics(prev => ({
      ...prev,
      [topicName]: !prev[topicName]
    }));
  };

  // Reorders slides within the same topic or inserts next to another page in a different topic
  const reorderPages = (draggedIdx: number, targetIdx: number, targetTopic?: string) => {
    if (draggedIdx === targetIdx && !targetTopic) return;

    const pagesCopy = [...editedLesson.pages];
    const [movedPage] = pagesCopy.splice(draggedIdx, 1);

    if (targetTopic !== undefined) {
      movedPage.topic = targetTopic;
    }

    pagesCopy.splice(targetIdx, 0, movedPage);

    const updated = { ...editedLesson, pages: pagesCopy };
    const updatedActiveIdx = pagesCopy.findIndex(p => p.id === activePage.id);
    setActivePageIndex(updatedActiveIdx !== -1 ? updatedActiveIdx : 0);
    triggerSave(updated);
  };

  // Moves slide to a different topic (placed at the end of that topic's slide list)
  const movePageToTopic = (draggedIdx: number, destTopicName: string) => {
    const pagesCopy = [...editedLesson.pages];
    const [movedPage] = pagesCopy.splice(draggedIdx, 1);

    movedPage.topic = destTopicName;

    // Position of insertion: after the last slide of the target topic
    let lastIndexInTopic = -1;
    for (let i = pagesCopy.length - 1; i >= 0; i--) {
      if (getPageTopic(pagesCopy[i]) === destTopicName) {
        lastIndexInTopic = i;
        break;
      }
    }

    if (lastIndexInTopic !== -1) {
      pagesCopy.splice(lastIndexInTopic + 1, 0, movedPage);
    } else {
      // Append if no slide inside target topic yet
      pagesCopy.push(movedPage);
    }

    const updated = { ...editedLesson, pages: pagesCopy };
    const updatedActiveIdx = pagesCopy.findIndex(p => p.id === activePage.id);
    setActivePageIndex(updatedActiveIdx !== -1 ? updatedActiveIdx : 0);
    triggerSave(updated);
  };

  const handlePageTopicChange = (newTopic: string) => {
    const updatedPages = [...editedLesson.pages];
    updatedPages[activePageIndex] = {
      ...activePage,
      topic: newTopic
    };
    const updated = { ...editedLesson, pages: updatedPages };
    triggerSave(updated);
  };

  // Helper to trigger save up
  const triggerSave = (newLesson: Lesson) => {
    setEditedLesson(newLesson);
    onSave(newLesson);
    setAlertMessage("Progress auto-saved successfully!");
    setTimeout(() => setAlertMessage(null), 2500);
  };

  // Keyboard shortcut listener for Ctrl+M (Save Changes) and F5 (Teach Deck from current slide)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Ctrl+M or Cmd+M to trigger save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        triggerSave(editedLesson);
      }
      
      // Allow F5 to trigger presentation mode from the current active page
      if (e.key === "F5") {
        e.preventDefault();
        onPresent(editedLesson, activePageIndex);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editedLesson, activePageIndex]);

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
      case BlockType.QUESTION_SINGLE:
        newBlock.questionText = "Which port number is standard for accessing web content via secure HTTPS protocol?";
        newBlock.questionOptions = ["Port 21", "Port 80", "Port 443", "Port 3000"];
        newBlock.correctOptionIndex = 2;
        break;
      case BlockType.QUESTION_MULTIPLE:
        newBlock.questionText = "Select ALL standard safety guidelines for strong password enforcement in Living Online domains (Select 3):";
        newBlock.questionOptions = [
          "Include at least one uppercase letter",
          "Share standard root seeds with family",
          "Incorporate special symbols like @ or #",
          "Make the minimum character length at least 8-12 signs",
          "Reuse high-quality security credentials across multiple finance portals"
        ];
        newBlock.correctOptionIndices = [0, 2, 3];
        break;
      case BlockType.QUESTION_DRAG_DROP:
        newBlock.questionText = "Match each network hardware classification or command standard to its native operations category:";
        newBlock.dragDropPairs = [
          { id: "dd-1", item: "SATA Cable", zone: "Internal storage connections" },
          { id: "dd-2", item: "Ping Command", zone: "Verifying ICMP connection status" },
          { id: "dd-3", item: "Fiber Optic", zone: "High-speed light pulse transmission" },
          { id: "dd-4", item: "$ Constant Indicator", zone: "Anchoring active spreadsheet cells" }
        ];
        break;
      case BlockType.QUESTION_HOTSPOT:
        newBlock.questionText = "Click the primary motherboard expansion slot standard used for modern extreme GPUs (PCIe x16).";
        newBlock.hotspotImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80";
        newBlock.hotspots = [
          { id: "hs-1", label: "PCIe x16 Expansion Slot", x: 45, y: 35, radius: 10, isCorrect: true },
          { id: "hs-2", label: "SATA Header standard ports", x: 80, y: 70, radius: 8, isCorrect: false },
          { id: "hs-3", label: "CPU Socket block base", x: 30, y: 65, radius: 12, isCorrect: false }
        ];
        break;
      case BlockType.QUESTION_VIDEO:
        newBlock.videoQuestionText = "Review the excel demonstration video. What is the syntax error in the formula shown?";
        newBlock.videoYoutubeId = "91aO81SOn48";
        newBlock.videoTimestamp = 15;
        newBlock.videoOptions = [
          "Range input did not specify absolute columns",
          "Forgot the enclosing closing parenthesis sign",
          "Misspelled VLOOKUP keyword command entirely",
          "Used comma parameters instead of a range colon symbol"
        ];
        newBlock.videoCorrectOptionIndex = 1;
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
            title="Save Changes (Ctrl+M)"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes <kbd className="text-[9.5px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded border border-gray-200 font-sans ml-1 font-semibold">Ctrl+M</kbd>
          </button>
          <button
            id="editor-teach-now"
            onClick={() => onPresent(editedLesson, activePageIndex)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer font-sans"
            title="Teach Deck from current slide (F5)"
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

          {/* Draggable/Reorderable lists layout with tree topics */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {topicGroups.map((group) => {
              const isCollapsed = !!collapsedTopics[group.topicName];
              const isTopicDragOver = dragOverTopicName === group.topicName;
              
              return (
                <div 
                  key={group.topicName} 
                  className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                    isTopicDragOver 
                      ? "border-blue-400 bg-blue-50/50 scale-[0.99] ring-2 ring-blue-150" 
                      : "border-gray-100 bg-gray-50/10"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverTopicName(group.topicName);
                  }}
                  onDragLeave={() => {
                    setDragOverTopicName(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedPageIdx !== null) {
                      movePageToTopic(draggedPageIdx, group.topicName);
                    }
                    setDragOverTopicName(null);
                  }}
                >
                  {/* Topic Header Row */}
                  <div 
                    className="flex items-center justify-between p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[11px] select-none cursor-pointer select-none transition-colors"
                    onClick={() => toggleTopicCollapse(group.topicName)}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-gray-550 hover:text-gray-800 transition">
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                      {isCollapsed ? (
                        <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      ) : (
                        <FolderOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <span className="truncate" title={group.topicName}>{group.topicName}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 bg-white border border-gray-150 px-1.5 py-0.5 rounded-full shrink-0">
                      {group.pages.length} {group.pages.length === 1 ? 'slide' : 'slides'}
                    </span>
                  </div>

                  {/* Pages list in this topic */}
                  {!isCollapsed && (
                    <div className="p-1.5 space-y-1.5 bg-white">
                      {group.pages.length === 0 ? (
                        <div className="text-[10px] text-gray-400 py-3 text-center italic border border-dashed border-gray-150 rounded-lg">
                          No slides here. Drag slides here!
                        </div>
                      ) : (
                        group.pages.map(({ page: p, originalIndex: idx }) => {
                          const isActive = activePageIndex === idx;
                          const isPageDragOver = dragOverPageIdx === idx;
                          const isBeingDragged = draggedPageIdx === idx;

                          return (
                            <div
                              key={p.id}
                              id={`thumbnail-slide-${p.id}`}
                              draggable={true}
                              onDragStart={(e) => {
                                setDraggedPageIdx(idx);
                                e.dataTransfer.setData("text/plain", `${idx}`);
                                e.currentTarget.style.opacity = "0.5";
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.style.opacity = "1";
                                setDraggedPageIdx(null);
                                setDragOverPageIdx(null);
                                setDragOverTopicName(null);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (draggedPageIdx !== null && draggedPageIdx !== idx) {
                                  setDragOverPageIdx(idx);
                                }
                              }}
                              onDragLeave={() => {
                                setDragOverPageIdx(null);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedPageIdx !== null && draggedPageIdx !== idx) {
                                  reorderPages(draggedPageIdx, idx, group.topicName);
                                }
                                setDragOverPageIdx(null);
                              }}
                              onClick={() => setActivePageIndex(idx)}
                              className={`p-2 rounded-md border text-left transition-all cursor-pointer flex flex-col relative group/slide ${
                                isActive
                                  ? "bg-blue-500 text-white border-blue-500 shadow-3xs"
                                  : isBeingDragged
                                  ? "bg-gray-100 border-gray-250 text-gray-400 opacity-60"
                                  : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                              } ${
                                isPageDragOver
                                  ? "border-b-4 border-blue-600 bg-blue-50/15"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 min-w-0">
                                  <GripVertical className={`w-3 h-3 text-gray-350 shrink-0 ${
                                    isActive ? "text-blue-200" : "text-gray-450"
                                  }`} />
                                  <span className={`text-[8.5px] font-bold tracking-wider shrink-0 uppercase ${
                                    isActive ? "text-blue-105" : "text-gray-400"
                                  }`}>
                                    SLIDE {idx + 1}
                                  </span>
                                </div>

                                {/* Sorting / Delete / Present icons layer */}
                                <div className="opacity-0 group-hover/slide:opacity-100 flex items-center gap-1 transition-all shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onPresent(editedLesson, idx); }}
                                    className={`p-0.5 rounded-sm transition-all ${
                                      isActive ? "text-emerald-100 hover:bg-white/10" : "text-emerald-600 hover:bg-emerald-55"
                                    }`}
                                    title="Teach Deck from this slide"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMovePage(idx, "up"); }}
                                    disabled={idx === 0}
                                    className={`p-0.5 rounded-sm transition-all disabled:opacity-20 ${
                                      isActive ? "text-white hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"
                                    }`}
                                    title="Move slide up"
                                  >
                                    <MoveUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMovePage(idx, "down"); }}
                                    disabled={idx === editedLesson.pages.length - 1}
                                    className={`p-0.5 rounded-sm transition-all disabled:opacity-20 ${
                                      isActive ? "text-white hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"
                                    }`}
                                    title="Move slide down"
                                  >
                                    <MoveDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePage(idx); }}
                                    className={`p-0.5 rounded-sm transition-all ${
                                      isActive ? "text-red-200 hover:bg-white/10" : "text-red-500 hover:bg-red-50"
                                    }`}
                                    title="Delete Slide"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <h5 className="font-bold text-[11px] mt-1 truncate">
                                {p.title || "Untitled Slide"}
                              </h5>

                              <span className={`text-[8.5px] mt-0.5 ${
                                isActive ? "text-blue-200" : "text-gray-400"
                              }`}>
                                {p.blocks?.length || 0} elements
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            id="editor-btn-add-page"
            onClick={handleAddPage}
            className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-lg border border-dashed border-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
          >
            <Plus className="w-3.5 h-3.5" /> Add Blank Slide
          </button>
        </div>

        {/* Center/Right 3 Columns Panel: Active Slide Canvas Edit Board */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden lg:col-span-3">
          
          {/* Active slide meta settings */}
          <div className="bg-gray-50/50 border-b border-gray-100 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider font-sans">Active Header Title</label>
                <input
                  id="slide-title-editor-idx"
                  type="text"
                  value={activePage.title}
                  onChange={(e) => handlePageTitleChange(e.target.value)}
                  placeholder="e.g. Memory Concepts"
                  className="w-full text-sm font-bold text-gray-850 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1 font-sans">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Active Slide Topic / Group</label>
                <input
                  id="slide-topic-editor-idx"
                  list="existing-topics-list"
                  type="text"
                  value={activePage.topic || ""}
                  onChange={(e) => handlePageTopicChange(e.target.value)}
                  placeholder={`e.g. ${editedLesson.topic || "General"}`}
                  className="w-full text-xs font-bold text-gray-850 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <datalist id="existing-topics-list">
                  {Array.from(
                    new Set(
                      editedLesson.pages
                        .map(p => p.topic?.trim())
                        .filter((t): t is string => !!t)
                    )
                  ).map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              {/* Master Deck Metadata modification options */}
              <div className="space-y-1 font-sans">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Lesson Deck Category & Topic</label>
                <div className="flex gap-2">
                  <select
                    value={editedLesson.category}
                    onChange={(e) => handleMetaChange("category", e.target.value as IC3Category)}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-hidden focus:border-blue-500"
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
                    className="w-full text-xs text-gray-750 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-blue-500"
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
                            id={`input-${block.id}-headingText`}
                            type="text"
                            value={block.headingText || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { headingText: e.target.value })}
                            className="w-full text-lg font-bold text-gray-900 border-b border-transparent focus:border-blue-300 focus:outline-hidden py-1 font-sans mb-1"
                            placeholder="Type Heading Content..."
                          />
                          <FormattingToolbar
                            elementId={`input-${block.id}-headingText`}
                            value={block.headingText || ""}
                            onChange={(newVal) => handleUpdateBlock(block.id, { headingText: newVal })}
                            compact
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
                            id={`textarea-${block.id}-paragraphText`}
                            rows={3}
                            value={block.paragraphText || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { paragraphText: e.target.value })}
                            className="w-full text-sm text-gray-700 bg-gray-50/50 hover:bg-gray-50 border border-gray-150 rounded-lg p-3 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-all font-sans mb-1"
                            placeholder="Enter descriptive instructional lecture notes..."
                          />
                          <FormattingToolbar
                            elementId={`textarea-${block.id}-paragraphText`}
                            value={block.paragraphText || ""}
                            onChange={(newVal) => handleUpdateBlock(block.id, { paragraphText: newVal })}
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
                                <div className="flex-1 flex flex-col gap-1">
                                  <input
                                    id={`input-${block.id}-bullet-${bIdx}`}
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => handleUpdateBullet(block.id, bIdx, e.target.value)}
                                    className="w-full text-sm border-b border-gray-100 focus:border-blue-500 focus:outline-hidden py-0.5 text-gray-700 font-sans"
                                    placeholder="Rule detail content..."
                                  />
                                  <FormattingToolbar
                                    elementId={`input-${block.id}-bullet-${bIdx}`}
                                    value={bullet}
                                    onChange={(newVal) => handleUpdateBullet(block.id, bIdx, newVal)}
                                    compact
                                  />
                                </div>
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
                          <div className="space-y-1">
                            <input
                              id={`input-${block.id}-definitionTerm`}
                              type="text"
                              value={block.definitionTerm || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { definitionTerm: e.target.value })}
                              className="bg-white border border-gray-200 rounded-md text-sm font-bold text-blue-900 focus:outline-hidden p-2 w-full"
                              placeholder="Vocabulary term..."
                            />
                            <FormattingToolbar
                              elementId={`input-${block.id}-definitionTerm`}
                              value={block.definitionTerm || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { definitionTerm: newVal })}
                              compact
                            />
                          </div>
                          <div className="space-y-1">
                            <textarea
                              id={`textarea-${block.id}-definitionText`}
                              rows={2}
                              value={block.definitionText || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { definitionText: e.target.value })}
                              className="bg-white border border-gray-200 rounded-md text-xs text-blue-800 p-2 w-full focus:outline-hidden"
                              placeholder="Exact syllabus definition..."
                            />
                            <FormattingToolbar
                              elementId={`textarea-${block.id}-definitionText`}
                              value={block.definitionText || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { definitionText: newVal })}
                              compact
                            />
                          </div>
                        </div>
                      )}

                      {/* Important Note Box */}
                      {block.type === BlockType.IMPORTANT_NOTE && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-2 font-sans">
                          <span className="text-[9px] font-bold text-amber-700 block uppercase flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 fill-amber-500 text-white" /> EXAM PREPARATION WARNING
                          </span>
                          <div className="space-y-1">
                            <textarea
                              id={`textarea-${block.id}-noteText`}
                              rows={2}
                              value={block.noteText || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { noteText: e.target.value })}
                              className="bg-white border border-gray-200 rounded-md text-xs text-amber-900 p-2 w-full focus:outline-hidden font-medium"
                              placeholder="Critically verified concept details..."
                            />
                            <FormattingToolbar
                              elementId={`textarea-${block.id}-noteText`}
                              value={block.noteText || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { noteText: newVal })}
                              compact
                            />
                          </div>
                        </div>
                      )}

                      {/* Example Box */}
                      {block.type === BlockType.EXAMPLE_BOX && (
                        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl space-y-2 font-sans">
                          <span className="text-[9px] font-bold text-indigo-700 block uppercase flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> APPLIED EXTREME DEMONSTRATION
                          </span>
                          <div className="space-y-1">
                            <input
                              id={`input-${block.id}-exampleTitle`}
                              type="text"
                              value={block.exampleTitle || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { exampleTitle: e.target.value })}
                              className="bg-white border border-gray-200 rounded-md text-sm font-bold text-indigo-900 focus:outline-hidden p-2 w-full"
                              placeholder="Demonstration title..."
                            />
                            <FormattingToolbar
                              elementId={`input-${block.id}-exampleTitle`}
                              value={block.exampleTitle || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { exampleTitle: newVal })}
                              compact
                            />
                          </div>
                          <div className="space-y-1">
                            <textarea
                              id={`textarea-${block.id}-exampleText`}
                              rows={3}
                              value={block.exampleText || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { exampleText: e.target.value })}
                              className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-lg mt-2 focus:outline-hidden"
                              placeholder="Type command lines, Excel block coordinates, or formatted code lists..."
                            />
                            <FormattingToolbar
                              elementId={`textarea-${block.id}-exampleText`}
                              value={block.exampleText || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { exampleText: newVal })}
                              compact
                            />
                          </div>
                        </div>
                      )}

                      {/* Practice Activity Box */}
                      {block.type === BlockType.PRACTICE_ACTIVITY && (
                        <div className="bg-teal-50 border-l-4 border-teal-600 p-4 rounded-r-xl space-y-2 font-sans">
                          <span className="text-[9px] font-bold text-teal-700 block uppercase flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> INTERACTIVE LABORATORY WORK
                          </span>
                          <div className="space-y-1">
                            <input
                              id={`input-${block.id}-activityTitle`}
                              type="text"
                              value={block.activityTitle || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { activityTitle: e.target.value })}
                              className="bg-white border border-gray-200 rounded-md text-sm font-bold text-teal-900 focus:outline-hidden p-2 w-full"
                              placeholder="Class task header..."
                            />
                            <FormattingToolbar
                              elementId={`input-${block.id}-activityTitle`}
                              value={block.activityTitle || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { activityTitle: newVal })}
                              compact
                            />
                          </div>
                          <div className="space-y-1">
                            <textarea
                              id={`textarea-${block.id}-activityText`}
                              rows={2}
                              value={block.activityText || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { activityText: e.target.value })}
                              className="bg-white border border-gray-200 rounded-md text-xs text-teal-800 p-2 w-full focus:outline-hidden"
                              placeholder="Active sandbox workspace instructions..."
                            />
                            <FormattingToolbar
                              elementId={`textarea-${block.id}-activityText`}
                              value={block.activityText || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { activityText: newVal })}
                              compact
                            />
                          </div>
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

                      {/* QUESTION_SINGLE Single-answer Multiple-choice */}
                      {block.type === BlockType.QUESTION_SINGLE && (
                        <div className="bg-blue-50/50 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-3 font-sans">
                          <span className="text-[10px] sm:text-xs font-bold text-blue-700 block uppercase flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> SINGLE-ANSWER MULTIPLE-CHOICE QUESTION
                          </span>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Question Text</label>
                            <input
                              id={`input-${block.id}-questionText`}
                              type="text"
                              value={block.questionText || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { questionText: e.target.value })}
                              className="bg-white border border-gray-200 text-sm font-semibold text-gray-800 rounded-lg p-2.5 w-full focus:outline-hidden focus:ring-1 focus:ring-blue-500 mb-1"
                              placeholder="Type the single-answer question stem..."
                            />
                            <FormattingToolbar
                              elementId={`input-${block.id}-questionText`}
                              value={block.questionText || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { questionText: newVal })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-bold text-gray-500 uppercase">Options (Select Radio for Correct Option)</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const opts = [...(block.questionOptions || []), "New Option"];
                                  handleUpdateBlock(block.id, { questionOptions: opts });
                                }}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-150 px-2 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Option
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              {(block.questionOptions || []).map((option, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-single-${block.id}`}
                                    checked={block.correctOptionIndex === oIdx}
                                    onChange={() => handleUpdateBlock(block.id, { correctOptionIndex: oIdx })}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="flex-1 flex flex-col gap-1">
                                    <input
                                      id={`input-${block.id}-questionOptions-${oIdx}`}
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const opts = [...(block.questionOptions || [])];
                                        opts[oIdx] = e.target.value;
                                        handleUpdateBlock(block.id, { questionOptions: opts });
                                      }}
                                      className="bg-white border border-gray-200 text-xs text-gray-700 rounded-md p-2 w-full focus:outline-hidden"
                                      placeholder={`Option ${oIdx + 1} text...`}
                                    />
                                    <FormattingToolbar
                                      elementId={`input-${block.id}-questionOptions-${oIdx}`}
                                      value={option}
                                      onChange={(newVal) => {
                                        const opts = [...(block.questionOptions || [])];
                                        opts[oIdx] = newVal;
                                        handleUpdateBlock(block.id, { questionOptions: opts });
                                      }}
                                      compact
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const opts = (block.questionOptions || []).filter((_, i) => i !== oIdx);
                                      let correctIdx = block.correctOptionIndex;
                                      if (correctIdx === oIdx) correctIdx = 0;
                                      else if (correctIdx !== undefined && correctIdx > oIdx) correctIdx -= 1;
                                      handleUpdateBlock(block.id, { questionOptions: opts, correctOptionIndex: correctIdx });
                                    }}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Remove Option"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QUESTION_MULTIPLE Multiple-choice (Multiple-answer) */}
                      {block.type === BlockType.QUESTION_MULTIPLE && (
                        <div className="bg-purple-50/50 border-l-4 border-purple-600 p-4 rounded-r-xl space-y-3 font-sans">
                          <span className="text-[10px] sm:text-xs font-bold text-purple-700 block uppercase flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> MULTIPLE-CHOICE QUESTION (MULTI-ANSWER)
                          </span>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Question Text</label>
                            <input
                              id={`input-${block.id}-questionText`}
                              type="text"
                              value={block.questionText || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { questionText: e.target.value })}
                              className="bg-white border border-gray-200 text-sm font-semibold text-gray-800 rounded-lg p-2.5 w-full focus:outline-hidden focus:ring-1 focus:ring-purple-500 mb-1"
                              placeholder="Type the multi-answer question stem..."
                            />
                            <FormattingToolbar
                              elementId={`input-${block.id}-questionText`}
                              value={block.questionText || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { questionText: newVal })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-bold text-gray-500 uppercase">Options (Check options that are correct)</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const opts = [...(block.questionOptions || []), "New Choice Option"];
                                  handleUpdateBlock(block.id, { questionOptions: opts });
                                }}
                                className="text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-white border border-purple-150 px-2 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Options
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              {(block.questionOptions || []).map((option, oIdx) => {
                                const indices = block.correctOptionIndices || [];
                                const isChecked = indices.includes(oIdx);
                                return (
                                  <div key={oIdx} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        let nextIndices = [...indices];
                                        if (isChecked) {
                                          nextIndices = nextIndices.filter((val) => val !== oIdx);
                                        } else {
                                          nextIndices.push(oIdx);
                                        }
                                        handleUpdateBlock(block.id, { correctOptionIndices: nextIndices });
                                      }}
                                      className="h-4 w-4 text-purple-650 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                    />
                                    <div className="flex-1 flex flex-col gap-1">
                                      <input
                                        id={`input-${block.id}-questionOptions-${oIdx}`}
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                          const opts = [...(block.questionOptions || [])];
                                          opts[oIdx] = e.target.value;
                                          handleUpdateBlock(block.id, { questionOptions: opts });
                                        }}
                                        className="bg-white border border-gray-200 text-xs text-gray-700 rounded-md p-2 w-full focus:outline-hidden"
                                        placeholder={`Option ${oIdx + 1} text...`}
                                      />
                                      <FormattingToolbar
                                        elementId={`input-${block.id}-questionOptions-${oIdx}`}
                                        value={option}
                                        onChange={(newVal) => {
                                          const opts = [...(block.questionOptions || [])];
                                          opts[oIdx] = newVal;
                                          handleUpdateBlock(block.id, { questionOptions: opts });
                                        }}
                                        compact
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const opts = (block.questionOptions || []).filter((_, i) => i !== oIdx);
                                        const nextIndices = (block.correctOptionIndices || [])
                                          .filter((val) => val !== oIdx)
                                          .map((val) => (val > oIdx ? val - 1 : val));
                                        handleUpdateBlock(block.id, { questionOptions: opts, correctOptionIndices: nextIndices });
                                      }}
                                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                      title="Remove Option"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QUESTION_DRAG_DROP Drag-and-Drop Match */}
                      {block.type === BlockType.QUESTION_DRAG_DROP && (
                        <div className="bg-emerald-50/50 border-l-4 border-emerald-600 p-4 rounded-r-xl space-y-3 font-sans">
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 block uppercase flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> DRAG-AND-DROP MATCHING QUESTION
                          </span>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Instructions Stem</label>
                            <input
                              id={`input-${block.id}-questionText`}
                              type="text"
                              value={block.questionText || ""}
                              onChange={(e) => handleUpdateBlock(block.id, { questionText: e.target.value })}
                              className="bg-white border border-gray-200 text-sm font-semibold text-gray-800 rounded-lg p-2.5 w-full focus:outline-hidden focus:ring-1 focus:ring-emerald-500 mb-1"
                              placeholder="Match each device or standard description..."
                            />
                            <FormattingToolbar
                              elementId={`input-${block.id}-questionText`}
                              value={block.questionText || ""}
                              onChange={(newVal) => handleUpdateBlock(block.id, { questionText: newVal })}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-bold text-gray-500 uppercase">Matching Definitions Pairs</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newPair = { id: `pair-${Date.now()}-${Math.floor(Math.random()*100)}`, item: "New Draggable Item", zone: "Target Container Category" };
                                  const pairs = [...(block.dragDropPairs || []), newPair];
                                  handleUpdateBlock(block.id, { dragDropPairs: pairs });
                                }}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-white border border-emerald-150 px-2 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Mapping Pair
                              </button>
                            </div>

                            <div className="space-y-2">
                              {(block.dragDropPairs || []).map((pair, pIdx) => (
                                <div key={pair.id || pIdx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-gray-150 relative">
                                  <div className="col-span-12 sm:col-span-5 space-y-0.5">
                                    <span className="text-[8px] font-bold text-gray-400 block uppercase">Drag Card</span>
                                    <input
                                      id={`input-${block.id}-dragitem-${pIdx}`}
                                      type="text"
                                      value={pair.item}
                                      onChange={(e) => {
                                        const pairs = [...(block.dragDropPairs || [])];
                                        pairs[pIdx] = { ...pair, item: e.target.value };
                                        handleUpdateBlock(block.id, { dragDropPairs: pairs });
                                      }}
                                      className="bg-gray-50 border border-gray-200 text-xs text-gray-800 rounded-md p-2 w-full focus:outline-hidden"
                                      placeholder="e.g. Fiber Optic Cable"
                                    />
                                    <FormattingToolbar
                                      elementId={`input-${block.id}-dragitem-${pIdx}`}
                                      value={pair.item}
                                      onChange={(newVal) => {
                                        const pairs = [...(block.dragDropPairs || [])];
                                        pairs[pIdx] = { ...pair, item: newVal };
                                        handleUpdateBlock(block.id, { dragDropPairs: pairs });
                                      }}
                                      compact
                                    />
                                  </div>
                                  <div className="hidden sm:flex sm:col-span-1 justify-center text-gray-300">
                                    <span>➔</span>
                                  </div>
                                  <div className="col-span-12 sm:col-span-5 space-y-0.5">
                                    <span className="text-[8px] font-bold text-gray-400 block uppercase">Drop Target</span>
                                    <input
                                      id={`input-${block.id}-dropzone-${pIdx}`}
                                      type="text"
                                      value={pair.zone}
                                      onChange={(e) => {
                                        const pairs = [...(block.dragDropPairs || [])];
                                        pairs[pIdx] = { ...pair, zone: e.target.value };
                                        handleUpdateBlock(block.id, { dragDropPairs: pairs });
                                      }}
                                      className="bg-emerald-50/20 border border-emerald-100 text-xs text-gray-800 rounded-md p-2 w-full focus:outline-hidden"
                                      placeholder="e.g. Living Online Channel"
                                    />
                                    <FormattingToolbar
                                      elementId={`input-${block.id}-dropzone-${pIdx}`}
                                      value={pair.zone}
                                      onChange={(newVal) => {
                                        const pairs = [...(block.dragDropPairs || [])];
                                        pairs[pIdx] = { ...pair, zone: newVal };
                                        handleUpdateBlock(block.id, { dragDropPairs: pairs });
                                      }}
                                      compact
                                    />
                                  </div>
                                  <div className="col-span-12 sm:col-span-1 text-right mt-1 sm:mt-4">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const pairs = (block.dragDropPairs || []).filter((p) => p.id !== pair.id);
                                        handleUpdateBlock(block.id, { dragDropPairs: pairs });
                                      }}
                                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded inline-block"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QUESTION_HOTSPOT Hotspot Interactive */}
                      {block.type === BlockType.QUESTION_HOTSPOT && (
                        <div className="bg-amber-50/50 border-l-4 border-amber-600 p-4 rounded-r-xl space-y-3 font-sans">
                          <span className="text-[10px] sm:text-xs font-bold text-amber-700 block uppercase flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> HOTSPOT COGNITIVE CLICK QUESTION
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Question Instructions</label>
                                <input
                                  id={`input-${block.id}-questionText`}
                                  type="text"
                                  value={block.questionText || ""}
                                  onChange={(e) => handleUpdateBlock(block.id, { questionText: e.target.value })}
                                  className="bg-white border border-gray-200 text-sm font-semibold text-gray-800 rounded-lg p-2.5 w-full focus:outline-hidden mb-1"
                                  placeholder="e.g. Click on the central CPU unit..."
                                />
                                <FormattingToolbar
                                  elementId={`input-${block.id}-questionText`}
                                  value={block.questionText || ""}
                                  onChange={(newVal) => handleUpdateBlock(block.id, { questionText: newVal })}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Diagram Image URL</label>
                                <input
                                  type="text"
                                  value={block.hotspotImageUrl || ""}
                                  onChange={(e) => handleUpdateBlock(block.id, { hotspotImageUrl: e.target.value })}
                                  className="bg-white border border-gray-200 text-xs text-gray-800 rounded-lg p-2.5 w-full focus:outline-hidden"
                                  placeholder="Provide image link..."
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase">Hotspot Regions (Click Diagram to Position Active Region)</label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newHs = { id: `hs-${Date.now()}`, label: `Region #${(block.hotspots || []).length + 1}`, x: 50, y: 50, radius: 10, isCorrect: false };
                                      const hss = [...(block.hotspots || []), newHs];
                                      handleUpdateBlock(block.id, { hotspots: hss });
                                    }}
                                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-white border border-amber-150 px-2 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Add Region
                                  </button>
                                </div>

                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                  {(block.hotspots || []).map((hs, hIdx) => (
                                    <div key={hs.id || hIdx} className="bg-white border border-gray-150 p-2.5 rounded-lg text-xs space-y-2 relative">
                                      <div className="flex items-center justify-between w-full gap-2">
                                        <div className="flex-1 flex flex-col gap-1">
                                          <input
                                            id={`input-${block.id}-hotspots-${hIdx}`}
                                            type="text"
                                            value={hs.label}
                                            onChange={(e) => {
                                              const hss = [...(block.hotspots || [])];
                                              hss[hIdx] = { ...hs, label: e.target.value };
                                              handleUpdateBlock(block.id, { hotspots: hss });
                                            }}
                                            className="font-bold text-gray-700 bg-transparent py-0.5 border-b border-transparent focus:border-gray-200 w-full outline-hidden"
                                          />
                                          <FormattingToolbar
                                            elementId={`input-${block.id}-hotspots-${hIdx}`}
                                            value={hs.label}
                                            onChange={(newVal) => {
                                              const hss = [...(block.hotspots || [])];
                                              hss[hIdx] = { ...hs, label: newVal };
                                              handleUpdateBlock(block.id, { hotspots: hss });
                                            }}
                                            compact
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const hss = (block.hotspots || []).filter((h) => h.id !== hs.id);
                                            handleUpdateBlock(block.id, { hotspots: hss });
                                          }}
                                          className="text-red-400 hover:text-red-600 text-right p-0.5"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-1 cursor-pointer select-none">
                                          <input
                                            type="radio"
                                            name={`correct-hs-${block.id}`}
                                            checked={hs.isCorrect}
                                            onChange={() => {
                                              const hss = (block.hotspots || []).map((h) => ({ ...h, isCorrect: h.id === hs.id }));
                                              handleUpdateBlock(block.id, { hotspots: hss });
                                            }}
                                            className="h-3.5 w-3.5 text-amber-500 cursor-pointer"
                                          />
                                          <span className="text-[10px] text-gray-500">Correct Target</span>
                                        </label>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                          <span>X: {hs.x}%</span>
                                          <span>Y: {hs.y}%</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-gray-400">Position Adjusters:</span>
                                        <input
                                          type="range"
                                          min={5}
                                          max={95}
                                          value={hs.x}
                                          onChange={(e) => {
                                            const hss = [...(block.hotspots || [])];
                                            hss[hIdx] = { ...hs, x: parseInt(e.target.value) };
                                            handleUpdateBlock(block.id, { hotspots: hss });
                                          }}
                                          className="h-1 flex-1 bg-amber-100 accent-amber-500 rounded cursor-pointer"
                                          title="X coordinate"
                                        />
                                        <input
                                          type="range"
                                          min={5}
                                          max={95}
                                          value={hs.y}
                                          onChange={(e) => {
                                            const hss = [...(block.hotspots || [])];
                                            hss[hIdx] = { ...hs, y: parseInt(e.target.value) };
                                            handleUpdateBlock(block.id, { hotspots: hss });
                                          }}
                                          className="h-1 flex-1 bg-amber-100 accent-amber-500 rounded cursor-pointer"
                                          title="Y coordinate"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50 flex flex-col items-center justify-center relative select-none">
                              <span className="text-[8px] font-bold text-gray-400 uppercase mb-2">Interactive Diagram Preview (Click to Position Selected Region)</span>
                              <div 
                                className="relative max-w-full overflow-hidden rounded bg-black cursor-crosshair"
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const tapX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                  const tapY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                                  // Update the last region coordinates
                                  if (block.hotspots && block.hotspots.length > 0) {
                                    const hss = [...block.hotspots];
                                    const activeIndex = hss.length - 1;
                                    hss[activeIndex] = { ...hss[activeIndex], x: tapX, y: tapY };
                                    handleUpdateBlock(block.id, { hotspots: hss });
                                  }
                                }}
                              >
                                <img 
                                  src={block.hotspotImageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format"} 
                                  alt="Hotspot Map"
                                  className="object-cover w-full h-[180px] opacity-90"
                                  referrerPolicy="no-referrer"
                                />
                                {(block.hotspots || []).map((hs, idx) => (
                                  <div
                                    key={hs.id || idx}
                                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                                    className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 flex items-center justify-center font-bold text-[8px] shadow-sm transform transition-all cursor-[pointer] ${
                                      hs.isCorrect 
                                        ? "bg-emerald-500/85 text-white border-white scale-110 ring-2 ring-emerald-500/50" 
                                        : "bg-amber-500/85 text-white border-white"
                                    }`}
                                    title={hs.label}
                                  >
                                    {idx + 1}
                                  </div>
                                ))}
                              </div>
                              <p className="text-[9px] text-gray-450 mt-2 text-center leading-normal">
                                Click on the image above to set the coordinate locations of your currently active (last added) hotspot area region.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QUESTION_VIDEO Video-based Question */}
                      {block.type === BlockType.QUESTION_VIDEO && (
                        <div className="bg-red-50/50 border-l-4 border-red-600 p-4 rounded-r-xl space-y-3 font-sans">
                          <span className="text-[10px] sm:text-xs font-bold text-red-700 block uppercase flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> VIDEO-BASED SYLLABUS CHALLENGE
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-8 space-y-1">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase">YouTube Link (Video ID)</label>
                                  <input
                                    type="text"
                                    value={block.videoYoutubeId || ""}
                                    onChange={(e) => handleUpdateBlock(block.id, { videoYoutubeId: e.target.value })}
                                    className="bg-white border border-gray-200 text-xs text-gray-800 rounded-lg p-2 w-full focus:outline-hidden"
                                    placeholder="e.g. 91aO81SOn48"
                                  />
                                </div>
                                <div className="col-span-4 space-y-1">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase">Trigger Time (s)</label>
                                  <input
                                    type="number"
                                    value={block.videoTimestamp || 0}
                                    onChange={(e) => handleUpdateBlock(block.id, { videoTimestamp: parseInt(e.target.value) || 0 })}
                                    className="bg-white border border-gray-200 text-xs text-gray-800 rounded-lg p-2 w-full focus:outline-hidden"
                                    placeholder="e.g. 15"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Video Question Text</label>
                                <input
                                  id={`input-${block.id}-videoQuestionText`}
                                  type="text"
                                  value={block.videoQuestionText || ""}
                                  onChange={(e) => handleUpdateBlock(block.id, { videoQuestionText: e.target.value })}
                                  className="bg-white border border-gray-200 text-xs font-semibold text-gray-800 rounded-lg p-2.5 w-full focus:outline-hidden mb-1"
                                  placeholder="Type the question content related to the video..."
                                />
                                <FormattingToolbar
                                  elementId={`input-${block.id}-videoQuestionText`}
                                  value={block.videoQuestionText || ""}
                                  onChange={(newVal) => handleUpdateBlock(block.id, { videoQuestionText: newVal })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Interactive Video Choices</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const opts = [...(block.videoOptions || []), "New Choice Option"];
                                    handleUpdateBlock(block.id, { videoOptions: opts });
                                  }}
                                  className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-white border border-red-150 px-2 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-2.5 h-2.5" /> Add Options
                                </button>
                              </div>

                              <div className="space-y-1.5 ml-1 max-h-[160px] overflow-y-auto pr-1">
                                {(block.videoOptions || []).map((option, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-video-${block.id}`}
                                      checked={block.videoCorrectOptionIndex === oIdx}
                                      onChange={() => handleUpdateBlock(block.id, { videoCorrectOptionIndex: oIdx })}
                                      className="h-3.5 w-3.5 text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer"
                                    />
                                    <div className="flex-1 flex flex-col gap-1">
                                      <input
                                        id={`input-${block.id}-videoOptions-${oIdx}`}
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                          const opts = [...(block.videoOptions || [])];
                                          opts[oIdx] = e.target.value;
                                          handleUpdateBlock(block.id, { videoOptions: opts });
                                        }}
                                        className="bg-white border border-gray-250 text-xs text-gray-700 rounded-md p-2 w-full focus:outline-hidden"
                                        placeholder={`Option ${oIdx + 1}`}
                                      />
                                      <FormattingToolbar
                                        elementId={`input-${block.id}-videoOptions-${oIdx}`}
                                        value={option}
                                        onChange={(newVal) => {
                                          const opts = [...(block.videoOptions || [])];
                                          opts[oIdx] = newVal;
                                          handleUpdateBlock(block.id, { videoOptions: opts });
                                        }}
                                        compact
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const opts = (block.videoOptions || []).filter((_, i) => i !== oIdx);
                                        let correctIdx = block.videoCorrectOptionIndex;
                                        if (correctIdx === oIdx) correctIdx = 0;
                                        else if (correctIdx !== undefined && correctIdx > oIdx) correctIdx -= 1;
                                        handleUpdateBlock(block.id, { videoOptions: opts, videoCorrectOptionIndex: correctIdx });
                                      }}
                                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
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

              {/* IC3 Interactive Exam Questions Suite Section */}
              <h5 className="font-bold text-xs text-gray-400 uppercase tracking-wider pt-4 border-t border-gray-100 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Insert IC3 Interactive Exam Questions Suite
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.QUESTION_SINGLE)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Single Choice</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Single-answer assessment</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.QUESTION_MULTIPLE)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <CheckSquare className="w-5 h-5 text-purple-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Multi Choice</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Multi-answer assessment</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.QUESTION_DRAG_DROP)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <Move className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Drag & Drop</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Matching classification card pairings</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.QUESTION_HOTSPOT)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <MapPin className="w-5 h-5 text-amber-500 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Hotspot Diagram</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Interactive click of regions on diagram</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock(BlockType.QUESTION_VIDEO)}
                  className="p-3 bg-white border border-gray-250 hover:border-blue-500 rounded-xl text-left hover:shadow-2xs transition-all cursor-pointer"
                >
                  <Video className="w-5 h-5 text-red-650 mb-1.5" />
                  <h6 className="font-bold text-xs text-gray-800">Video Exam Q</h6>
                  <p className="text-[10px] text-gray-400 mt-1 lines-clamp-1">Video paused keyframe questionnaire</p>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
