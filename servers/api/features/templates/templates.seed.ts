import type { TemplateBlock } from "@workspace/types";
import { TemplateModel } from "./templates.model.js";

export interface SeedTemplate {
  name: string;
  description: string;
  icon: string;
  category: string;
  coverImage?: string | null;
  blocks: TemplateBlock[];
}

export const INITIAL_TRACKER_TASKS = [
  {
    id: "task-1",
    title: "Add task",
    dueDate: "May 10, 2026 12:00 PM",
    dueDateIso: "2026-05-10",
    note: "",
    status: "Done",
    category: "Work",
    iconType: "check"
  },
  {
    id: "task-2",
    title: "Make it a default property",
    dueDate: "May 9, 2026 1:00 PM",
    dueDateIso: "2026-05-09",
    note: "",
    status: "Done",
    category: "",
    iconType: "check"
  },
  {
    id: "task-3",
    title: "",
    dueDate: "May 9, 2026 12:00 PM",
    dueDateIso: "2026-05-09",
    note: "",
    status: "Not started",
    category: "",
    iconType: "db"
  },
  {
    id: "task-4",
    title: "",
    dueDate: "May 9, 2026 12:00 PM",
    dueDateIso: "2026-05-09",
    note: "",
    status: "In progress",
    category: "",
    iconType: "db"
  },
  {
    id: "task-5",
    title: "Read my book",
    dueDate: "May 9, 2026 3:30 PM",
    dueDateIso: "2026-05-09",
    note: "",
    status: "Not started",
    category: "",
    iconType: "check"
  },
  {
    id: "task-6",
    title: "Scout on Linkedin",
    dueDate: "May 8, 2026 12:00 PM",
    dueDateIso: "2026-05-08",
    note: "",
    status: "Not started",
    category: "",
    image: "linkedin",
    iconType: "check"
  },
  {
    id: "task-7",
    title: "Add task to database",
    dueDate: "May 15, 2026 3:30 PM",
    dueDateIso: "2026-05-15",
    note: "",
    status: "Not started",
    category: "",
    iconType: "check"
  },
  {
    id: "task-8",
    title: "",
    dueDate: "May 9, 2026 12:00 PM",
    dueDateIso: "2026-05-09",
    note: "",
    status: "Not started",
    category: "",
    iconType: "db"
  }
];

export const DEFAULT_TEMPLATES: SeedTemplate[] = [
  {
    name: "Simple Task Tracker",
    description: "Track tasks with table overview, status board, and calendar views.",
    icon: "📋",
    category: "Work",
    coverImage: "/task-tracker-cover.jpg",
    blocks: [
      {
        type: "database",
        pos: "a0",
        text: "Simple Task Tracker",
        props: {
          tasks: INITIAL_TRACKER_TASKS
        }
      }
    ]
  },
  {
    name: "Simple Project Tracker",
    description: "Track your tasks from To Do to Done.",
    icon: "📋",
    category: "Work",
    blocks: [
      { type: "h2", text: "📋 Simple Project Tracker", pos: "a0" },
      { type: "text", text: "A simple space to manage your project tasks.", pos: "a1" },
      { type: "h3", text: "To Do", pos: "a2" },
      { type: "todo", text: "Add your first task here", props: { checked: false }, pos: "a3" },
      { type: "todo", text: "Add another task", props: { checked: false }, pos: "a4" },
      { type: "h3", text: "Doing", pos: "a5" },
      { type: "todo", text: "Task currently in progress", props: { checked: false }, pos: "a6" },
      { type: "h3", text: "Done", pos: "a7" },
      { type: "todo", text: "Completed task", props: { checked: true }, pos: "a8" }
    ]
  },
  {
    name: "Weekly Planner",
    description: "Plan your week, Monday to Sunday.",
    icon: "📅",
    category: "Personal",
    blocks: [
      { type: "h1", text: "📅 My Weekly Planner", pos: "a0" },
      { type: "text", text: "Plan out your week to stay productive.", pos: "a1" },
      { id: "mon", type: "toggle", text: "Monday", props: { open: true }, pos: "a2" },
      { type: "todo", text: "Task 1", props: { checked: false }, parentId: "mon", pos: "a0" },
      { id: "tue", type: "toggle", text: "Tuesday", props: { open: false }, pos: "a3" },
      { type: "todo", text: "Task 1", props: { checked: false }, parentId: "tue", pos: "a0" },
      { id: "wed", type: "toggle", text: "Wednesday", props: { open: false }, pos: "a4" },
      { type: "todo", text: "Task 1", props: { checked: false }, parentId: "wed", pos: "a0" },
      { id: "thu", type: "toggle", text: "Thursday", props: { open: false }, pos: "a5" },
      { type: "todo", text: "Task 1", props: { checked: false }, parentId: "thu", pos: "a0" },
      { id: "fri", type: "toggle", text: "Friday", props: { open: false }, pos: "a6" },
      { type: "todo", text: "Task 1", props: { checked: false }, parentId: "fri", pos: "a0" },
      { id: "sat", type: "toggle", text: "Saturday", props: { open: false }, pos: "a7" },
      { type: "todo", text: "Task 1", props: { checked: false }, parentId: "sat", pos: "a0" },
      { id: "sun", type: "toggle", text: "Sunday", props: { open: false }, pos: "a8" },
      { type: "todo", text: "Task 1", props: { checked: false }, parentId: "sun", pos: "a0" }
    ]
  },
  {
    name: "Today's Focus",
    description: "The 3-bucket method for daily productivity.",
    icon: "🎯",
    category: "Personal",
    blocks: [
      { type: "h1", text: "🎯 Today's Focus", pos: "a0" },
      { type: "h2", text: "🔥 Must Do Today", pos: "a1" },
      { type: "todo", text: "Most important task", props: { checked: false }, pos: "a2" },
      { type: "todo", text: "Second priority task", props: { checked: false }, pos: "a3" },
      { type: "h2", text: "⏳ Later This Week", pos: "a4" },
      { type: "todo", text: "Task to do if time permits", props: { checked: false }, pos: "a5" },
      { type: "h2", text: "✅ Done", pos: "a6" },
      { type: "todo", text: "Completed task", props: { checked: true }, pos: "a7" }
    ]
  }
];

export const ensureDefaultTemplates = async (): Promise<void> => {
  const count = await TemplateModel.countDocuments();
  if (count === 0) {
    await TemplateModel.insertMany(DEFAULT_TEMPLATES);
    return;
  }

  // Refresh if templates are from previous seed
  const existing = await TemplateModel.findOne({ name: "Simple Task Tracker" });
  if (!existing) {
    await TemplateModel.deleteMany({});
    await TemplateModel.insertMany(DEFAULT_TEMPLATES);
  }
};
