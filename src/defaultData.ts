/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lesson, IC3Category, BlockType } from "./types";

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: "lesson-hardware-1",
    title: "Introduction to Computer Hardware",
    description: "An essential guide to understanding internal and external computer components under the IC3 GS6 Computing Fundamentals syllabus.",
    category: IC3Category.COMPUTING_FUNDAMENTALS,
    topic: "Computer Hardware",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60",
    createdAt: Date.now() - 3600000 * 24 * 3, // 3 days ago
    updatedAt: Date.now() - 3600000 * 24 * 3,
    authorId: "system-demo",
    authorEmail: "demo-teacher@ic3platform.edu",
    pages: [
      {
        id: "hw-page-1",
        title: "Introduction & Core Architecture",
        blocks: [
          {
            id: "hw-b1",
            type: BlockType.HEADING,
            headingText: "Understanding Computer Hardware (IC3 GS6)"
          },
          {
            id: "hw-b2",
            type: BlockType.PARAGRAPH,
            paragraphText: "Computer hardware refers to the physical elements that make up a computer system. Hardware components can be broadly categorized into internal components (which reside inside the system unit) and external components (peripherals used for input, output, or storage)."
          },
          {
            id: "hw-b3",
            type: BlockType.DEFINITION_BOX,
            definitionTerm: "Von Neumann Architecture",
            definitionText: "A theoretical design for an electronic digital computer with subsystems consisting of a processing unit (CPU), a control unit, memory, external mass storage, and input and output mechanisms."
          },
          {
            id: "hw-b4",
            type: BlockType.IMPORTANT_NOTE,
            noteText: "For the IC3 GS6 Exam, you must be able to identify the difference between primary memory (RAM) which is volatile, and secondary memory (SSD/HDD) which is non-volatile."
          }
        ]
      },
      {
        id: "hw-page-2",
        title: "Memory: RAM vs. ROM",
        blocks: [
          {
            id: "hw-b5",
            type: BlockType.HEADING,
            headingText: "Memory Classifications"
          },
          {
            id: "hw-b6",
            type: BlockType.PARAGRAPH,
            paragraphText: "To understand how computing devices execute programs, we must identify the two core types of silicon-based memory integrated into modern motherboards:"
          },
          {
            id: "hw-b7",
            type: BlockType.TABLE,
            tableHeaders: ["Feature", "RAM (Random Access Memory)", "ROM (Read-Only Memory)"],
            tableRows: [
              [
                { value: "Volatility" },
                { value: "Volatile (loses data when powered off)" },
                { value: "Non-volatile (retains data permanently)" }
              ],
              [
                { value: "Purpose" },
                { value: "Holds currently running applications and active OS assets" },
                { value: "Holds firmware instructions such as the system BIOS/UEFI boot setup" }
              ],
              [
                { value: "Read/Write Access" },
                { value: "Can be read from and written to at ultra-high speeds" },
                { value: "Typically read-only during standard operations" }
              ]
            ]
          },
          {
            id: "hw-b8",
            type: BlockType.EXAMPLE_BOX,
            exampleTitle: "Execution Sequence",
            exampleText: "When you press the power button, ROM boots the computer (UEFI), then loads the Operating System from the SSD storage into RAM where it stays during active use."
          }
        ]
      },
      {
        id: "hw-page-3",
        title: "Self-Review Challenge",
        blocks: [
          {
            id: "hw-b9",
            type: BlockType.HEADING,
            headingText: "Classroom Practice Activity"
          },
          {
            id: "hw-b10",
            type: BlockType.PRACTICE_ACTIVITY,
            activityTitle: "Review Question: Spot the Core Component",
            activityText: "Instruction: Have students open up their classroom PCs. Ask them to locate the modular RAM slots and SSD ports, and answer: 'If a computer turns on but immediately restarts with a series of warning beeps, which component is most likely loose or corrupted?'"
          }
        ]
      }
    ]
  },
  {
    id: "lesson-keyapps-1",
    title: "VLOOKUP & Formulas in Microsoft Excel",
    description: "Mastering standard Excel functions, relative/absolute referencing, and logical lookup operations for Key Applications certification.",
    category: IC3Category.KEY_APPLICATIONS,
    topic: "Microsoft Excel",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60",
    createdAt: Date.now() - 3600000 * 24 * 1, // 1 day ago
    updatedAt: Date.now() - 3600000 * 12, // 12 hours ago
    authorId: "system-demo",
    authorEmail: "demo-teacher@ic3platform.edu",
    pages: [
      {
        id: "excel-page-1",
        title: "Introduction to Excel Lookup Functions",
        blocks: [
          {
            id: "ex-b1",
            type: BlockType.HEADING,
            headingText: "Lookup Formulas & Referencing Rules"
          },
          {
            id: "ex-b2",
            type: BlockType.PARAGRAPH,
            paragraphText: "VLOOKUP (Vertical Lookup) is one of Excel's most requested database formulas. It allows a user to scan down a left-hand column to find a key value and retrieve relative details in a corresponding row position."
          },
          {
            id: "ex-b3",
            type: BlockType.DEFINITION_BOX,
            definitionTerm: "VLOOKUP Arguments",
            definitionText: "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup]). Tip: Set [range_lookup] to FALSE for exact matches, and TRUE for approximate matches."
          },
          {
            id: "ex-b4",
            type: BlockType.IMPORTANT_NOTE,
            noteText: "VLOOKUP can ONLY scan from left to right. The lookup column must always be the first column in the defined table array!"
          }
        ]
      },
      {
        id: "excel-page-2",
        title: "Excel Hands-On Worksheet",
        blocks: [
          {
            id: "ex-b5",
            type: BlockType.HEADING,
            headingText: "Student Excel Data Set Table"
          },
          {
            id: "ex-b6",
            type: BlockType.TABLE,
            tableHeaders: ["ID", "Student Name", "Grade", "Certification Status"],
            tableRows: [
              [
                { value: "EX-101" },
                { value: "Marcus Aurelius" },
                { value: "A" },
                { value: "Certified" }
              ],
              [
                { value: "EX-102" },
                { value: "Hypatia of Alexandria" },
                { value: "A+" },
                { value: "Certified" }
              ],
              [
                { value: "EX-103" },
                { value: "Alan Turing" },
                { value: "S" },
                { value: "Certified (Distinction)" }
              ]
            ]
          },
          {
            id: "ex-b7",
            type: BlockType.PRACTICE_ACTIVITY,
            activityTitle: "Practice Formula Sandbox",
            activityText: "Using the table above, construct a VLOOKUP formula to fetch Hypatia's status: =VLOOKUP('EX-102', A2:D4, 4, FALSE). Write this on physical whiteboards or type it into an active Excel sheet."
          }
        ]
      }
    ]
  },
  {
    id: "lesson-online-1",
    title: "Phishing Scams & Cybersecurity Guards",
    description: "An intensive breakdown of social engineering attacks, digital watermarks, security protocols, and safety practices in Living Online.",
    category: IC3Category.LIVING_ONLINE,
    topic: "Cybersecurity",
    thumbnailUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60",
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
    updatedAt: Date.now() - 3600000 * 2,
    authorId: "system-demo",
    authorEmail: "demo-teacher@ic3platform.edu",
    pages: [
      {
        id: "cyber-page-1",
        title: "Recognizing Social Engineering",
        blocks: [
          {
            id: "cy-b1",
            type: BlockType.HEADING,
            headingText: "Living Online: Protecting the Digital Workspace"
          },
          {
            id: "cy-b2",
            type: BlockType.PARAGRAPH,
            paragraphText: "Email remains the primary entry point for organization breaches. Cybersecurity threats come in various forms, but Phishing relies on manipulating personal psychology rather than guessing firewall systems."
          },
          {
            id: "cy-b3",
            type: BlockType.DEFINITION_BOX,
            definitionTerm: "Spear Phishing",
            definitionText: "A highly personalized attack technique where hackers target specific individuals or businesses using pre-compiled background information to increase success rates."
          },
          {
            id: "cy-b4",
            type: BlockType.IMPORTANT_NOTE,
            noteText: "Critical IC3 Knowledge: Ensure the domain in the link matched the genuine host, inspect email headers for mismatched domains, and never supply multi-factor login authorization codes (OTP) over call or unknown messaging channels."
          }
        ]
      }
    ]
  }
];

export const DEFAULT_RESOURCES = [
  {
    id: "res-1",
    title: "IC3 GS6 Computing Fundamentals Review PDF",
    fileName: "ic3_gs6_computing_fundamentals_study_guide.pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "pdf",
    category: IC3Category.COMPUTING_FUNDAMENTALS,
    createdAt: Date.now() - 3600000 * 12
  },
  {
    id: "res-2",
    title: "Office Applications Quick Interface Chart",
    fileName: "excel_word_ppt_ribbon_cheatsheet.png",
    fileUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    fileType: "image",
    category: IC3Category.KEY_APPLICATIONS,
    createdAt: Date.now() - 3600000 * 10
  }
];
