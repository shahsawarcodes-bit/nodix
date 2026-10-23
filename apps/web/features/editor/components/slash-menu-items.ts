import { createElement, type ReactElement } from "react";
import {
  CheckSquare,
  ChevronRightSquare,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  TextQuote,
  Type,
  FileText,
  Image as ImageIcon,
  FileUp
} from "lucide-react";
import type { BlockType } from "@workspace/types";

export interface SlashCommandDefinition {
  type: BlockType;
  label: string;
  shortcut?: string | undefined;
  keywords: string[];
  renderIcon: () => ReactElement;
}

export const SLASH_COMMANDS: readonly SlashCommandDefinition[] = [
  {
    type: "text",
    label: "Text",
    keywords: ["text", "paragraph", "plain"],
    renderIcon: () => createElement(Type, { className: "size-4" })
  },
  {
    type: "h1",
    label: "Heading 1",
    shortcut: "#",
    keywords: ["h1", "heading1", "title", "large"],
    renderIcon: () => createElement(Heading1, { className: "size-4" })
  },
  {
    type: "h2",
    label: "Heading 2",
    shortcut: "##",
    keywords: ["h2", "heading2", "section", "medium"],
    renderIcon: () => createElement(Heading2, { className: "size-4" })
  },
  {
    type: "h3",
    label: "Heading 3",
    shortcut: "###",
    keywords: ["h3", "heading3", "subheading", "small"],
    renderIcon: () => createElement(Heading3, { className: "size-4" })
  },
  {
    type: "bulleted_list",
    label: "Bulleted list",
    shortcut: "-",
    keywords: ["bulleted", "list", "bullet", "unordered"],
    renderIcon: () => createElement(List, { className: "size-4" })
  },
  {
    type: "numbered_list",
    label: "Numbered list",
    shortcut: "1.",
    keywords: ["numbered", "list", "ordered", "numbers"],
    renderIcon: () => createElement(ListOrdered, { className: "size-4" })
  },
  {
    type: "todo",
    label: "To-do list",
    shortcut: "[]",
    keywords: ["todo", "task", "check", "checkbox"],
    renderIcon: () => createElement(CheckSquare, { className: "size-4" })
  },
  {
    type: "toggle",
    label: "Toggle list",
    shortcut: ">",
    keywords: ["toggle", "collapse", "expand", "accordion"],
    renderIcon: () => createElement(ChevronRightSquare, { className: "size-4" })
  },
  {
    type: "quote",
    label: "Quote",
    shortcut: '"',
    keywords: ["quote", "citation", "blockquote"],
    renderIcon: () => createElement(TextQuote, { className: "size-4" })
  },
  {
    type: "code",
    label: "Code",
    shortcut: "```",
    keywords: ["code", "snippet", "monospace", "pre"],
    renderIcon: () => createElement(Code2, { className: "size-4" })
  },
  {
    type: "divider",
    label: "Divider",
    shortcut: "---",
    keywords: ["divider", "separator", "horizontal", "rule", "line"],
    renderIcon: () => createElement(Minus, { className: "size-4" })
  },
  {
    type: "link_to_page",
    label: "Link to page",
    keywords: ["link", "page", "subpage", "reference"],
    renderIcon: () => createElement(FileText, { className: "size-4" })
  },
  {
    type: "image",
    label: "Image",
    keywords: ["image", "photo", "picture", "media", "upload"],
    renderIcon: () => createElement(ImageIcon, { className: "size-4" })
  },
  {
    type: "file",
    label: "File",
    keywords: ["file", "attachment", "download", "pdf", "doc", "upload"],
    renderIcon: () => createElement(FileUp, { className: "size-4" })
  }
];
