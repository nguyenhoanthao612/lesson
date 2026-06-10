/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum IC3Category {
  COMPUTING_FUNDAMENTALS = "Computing Fundamentals",
  KEY_APPLICATIONS = "Key Applications",
  LIVING_ONLINE = "Living Online",
}

export enum BlockType {
  HEADING = "heading",
  PARAGRAPH = "paragraph",
  BULLET_LIST = "bullet_list",
  IMAGE = "image",
  YOUTUBE = "youtube",
  DEFINITION_BOX = "definition_box",
  IMPORTANT_NOTE = "important_note",
  EXAMPLE_BOX = "example_box",
  PRACTICE_ACTIVITY = "practice_activity",
  TABLE = "table",
  // IC3 Question Suite
  QUESTION_SINGLE = "question_single",
  QUESTION_MULTIPLE = "question_multiple",
  QUESTION_DRAG_DROP = "question_drag_drop",
  QUESTION_HOTSPOT = "question_hotspot",
  QUESTION_VIDEO = "question_video",
}

export interface TableCell {
  value: string;
}

export interface DragDropPair {
  id: string;
  item: string;
  zone: string;
}

export interface HotspotArea {
  id: string;
  label: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  radius: number; // circle click radius in pixels/percentage
  isCorrect: boolean;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  headingText?: string;
  paragraphText?: string;
  listItems?: string[];
  mediaUrl?: string;
  mediaCaption?: string;
  youtubeId?: string;
  definitionTerm?: string;
  definitionText?: string;
  noteText?: string;
  exampleTitle?: string;
  exampleText?: string;
  activityTitle?: string;
  activityText?: string;
  tableHeaders?: string[];
  tableRows?: TableCell[][];
  
  // Interactive Question Suite fields
  questionText?: string;
  questionOptions?: string[];
  correctOptionIndex?: number;
  correctOptionIndices?: number[];
  
  // Drag & Drop
  dragDropPairs?: DragDropPair[];
  
  // Hotspots
  hotspotImageUrl?: string;
  hotspots?: HotspotArea[];
  
  // Video-based questions
  videoQuestionText?: string;
  videoYoutubeId?: string;
  videoTimestamp?: number;
  videoOptions?: string[];
  videoCorrectOptionIndex?: number;

  // Free-form 16:9 canvas dimensions and coordinate percentages
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
}

export interface LessonPage {
  id: string;
  title: string;
  topic?: string;
  subtopic?: string;
  blocks: ContentBlock[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: IC3Category;
  topic: string; // e.g., "Computer Hardware", "Microsoft Excel", "Cybersecurity"
  thumbnailUrl: string;
  createdAt: number;
  updatedAt: number;
  pages: LessonPage[];
  authorId: string;
  authorEmail: string;
}

export interface FileResource {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: "image" | "pdf" | "video" | "other";
  category: IC3Category;
  createdAt: number;
}
