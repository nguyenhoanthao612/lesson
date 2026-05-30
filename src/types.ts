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
}

export interface TableCell {
  value: string;
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
}

export interface LessonPage {
  id: string;
  title: string;
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
