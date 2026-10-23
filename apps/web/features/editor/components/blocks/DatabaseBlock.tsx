"use client";

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  type ReactElement,
  type ChangeEvent,
  type KeyboardEvent
} from "react";
import {
  CheckCircle2,
  Circle,
  Database,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Maximize2,
  MoreHorizontal,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Columns3,
  List as ListIcon,
  Trash2,
  ExternalLink,
  MessageSquare,
  Send,
  X,
  Tag,
  Check,
  GripVertical
} from "lucide-react";
import type { Block } from "@workspace/types";
import { useEditor } from "../../state";
import { useReadOnly } from "../ReadOnlyContext";

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  dueDateIso?: string;
  note?: string;
  status: "Not started" | "In progress" | "Done";
  category?: string;
  image?: string;
  iconType?: "check" | "db";
}

export interface DatabaseBlockProps {
  block: Block;
}

const DEFAULT_TASKS: TaskItem[] = [
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

const STATUS_CONFIG = {
  "Not started": {
    label: "Not started",
    pillBg: "bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200/80",
    dotBg: "bg-stone-400",
    boardHeaderBg: "bg-stone-100 text-stone-700",
    boardHeaderDot: "bg-stone-400"
  },
  "In progress": {
    label: "In progress",
    pillBg: "bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200/80",
    dotBg: "bg-sky-500",
    boardHeaderBg: "bg-sky-100 text-sky-800",
    boardHeaderDot: "bg-sky-500"
  },
  Done: {
    label: "Done",
    pillBg: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200/80",
    dotBg: "bg-emerald-500",
    boardHeaderBg: "bg-emerald-100 text-emerald-800",
    boardHeaderDot: "bg-emerald-500"
  }
} as const;

export const DatabaseBlock = ({ block }: DatabaseBlockProps): ReactElement => {
  const { optimisticUpdateBlock } = useEditor();
  const isReadOnly = useReadOnly();

  // Extract tasks from block props or fallback to default tasks
  const tasks: TaskItem[] = useMemo(() => {
    const raw = (block.props?.tasks as TaskItem[] | undefined);
    if (Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
    return DEFAULT_TASKS;
  }, [block.props]);

  // Section 1: Task Overview View State
  const [overviewTab, setOverviewTab] = useState<"All" | "Due today" | "Due this week" | "Category">("All");
  const [overviewSearch, setOverviewSearch] = useState<string>("");
  const [showOverviewSearch, setShowOverviewSearch] = useState<boolean>(false);
  const [sortField, setSortField] = useState<"default" | "date" | "title" | "status">("default");

  // Section 2: Task Status View State
  const [statusTab, setStatusTab] = useState<
    "Board" | "List" | "Not started" | "In Progress" | "Done" | "Overdue" | "Timeline"
  >("Board");
  const [statusSearch, setStatusSearch] = useState<string>("");
  const [showStatusSearch, setShowStatusSearch] = useState<boolean>(false);

  // Section 3: Calendar State
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Section 4: Collapsible Banner State
  const [isMessageBannerOpen, setIsMessageBannerOpen] = useState<boolean>(false);
  const [contactMessage, setContactMessage] = useState<string>("");
  const [messageSent, setMessageSent] = useState<boolean>(false);

  // Active status popover & Detail modal
  const [activeStatusMenuTaskId, setActiveStatusMenuTaskId] = useState<string | null>(null);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskItem | null>(null);

  // Sync tasks changes back to Yjs & backend
  const updateTasks = useCallback(
    (newTasks: TaskItem[]): void => {
      void optimisticUpdateBlock(block.id, {
        props: {
          ...block.props,
          tasks: newTasks
        }
      });
    },
    [block.id, block.props, optimisticUpdateBlock]
  );

  // Drag and drop state for Kanban Board
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskItem["status"] | null>(null);
  const [dropTargetCardId, setDropTargetCardId] = useState<string | null>(null);
  const [cardDropPosition, setCardDropPosition] = useState<"before" | "after" | null>(null);
  const justFinishedCardDragRef = useRef<boolean>(false);

  // Drag and drop state for Table View
  const [draggedRowTaskId, setDraggedRowTaskId] = useState<string | null>(null);
  const [dropTargetRowTaskId, setDropTargetRowTaskId] = useState<string | null>(null);
  const [rowDropPosition, setRowDropPosition] = useState<"before" | "after" | null>(null);

  // Kanban Card Drag Handlers
  const handleCardDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, task: TaskItem): void => {
      if (isReadOnly) return;
      e.stopPropagation();
      e.dataTransfer.setData("text/plain", task.id);
      e.dataTransfer.effectAllowed = "move";
      setDraggedTaskId(task.id);
    },
    [isReadOnly]
  );

  const handleCardDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetTask: TaskItem): void => {
      if (!draggedTaskId || isReadOnly) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      if (draggedTaskId === targetTask.id) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const position: "before" | "after" = e.clientY < midY ? "before" : "after";

      setDropTargetCardId(targetTask.id);
      setCardDropPosition(position);
      setDragOverColumn(targetTask.status);
    },
    [draggedTaskId, isReadOnly]
  );

  const handleCardDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetTask: TaskItem): void => {
      if (!draggedTaskId || isReadOnly) return;
      e.preventDefault();
      e.stopPropagation();

      const currentDraggedId = draggedTaskId;
      const currentDropPos = cardDropPosition || "after";

      setDraggedTaskId(null);
      setDragOverColumn(null);
      setDropTargetCardId(null);
      setCardDropPosition(null);

      justFinishedCardDragRef.current = true;
      setTimeout(() => {
        justFinishedCardDragRef.current = false;
      }, 150);

      if (currentDraggedId === targetTask.id) return;

      const draggedItem = tasks.find((t) => t.id === currentDraggedId);
      if (!draggedItem) return;

      const updatedDraggedItem: TaskItem = {
        ...draggedItem,
        status: targetTask.status
      };

      const withoutDragged = tasks.filter((t) => t.id !== currentDraggedId);
      const targetIdx = withoutDragged.findIndex((t) => t.id === targetTask.id);

      if (targetIdx === -1) {
        updateTasks([...withoutDragged, updatedDraggedItem]);
        return;
      }

      const insertIdx = currentDropPos === "before" ? targetIdx : targetIdx + 1;
      const newTasks = [
        ...withoutDragged.slice(0, insertIdx),
        updatedDraggedItem,
        ...withoutDragged.slice(insertIdx)
      ];

      updateTasks(newTasks);
    },
    [draggedTaskId, cardDropPosition, isReadOnly, tasks, updateTasks]
  );

  const handleColumnDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, colStatus: TaskItem["status"]): void => {
      if (!draggedTaskId || isReadOnly) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOverColumn !== colStatus) {
        setDragOverColumn(colStatus);
      }
    },
    [draggedTaskId, dragOverColumn, isReadOnly]
  );

  const handleColumnDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, colStatus: TaskItem["status"]): void => {
      if (!draggedTaskId || isReadOnly) return;
      e.preventDefault();

      const currentDraggedId = draggedTaskId;
      setDraggedTaskId(null);
      setDragOverColumn(null);
      setDropTargetCardId(null);
      setCardDropPosition(null);

      justFinishedCardDragRef.current = true;
      setTimeout(() => {
        justFinishedCardDragRef.current = false;
      }, 150);

      const draggedItem = tasks.find((t) => t.id === currentDraggedId);
      if (!draggedItem) return;

      const updatedDraggedItem: TaskItem = {
        ...draggedItem,
        status: colStatus
      };

      const withoutDragged = tasks.filter((t) => t.id !== currentDraggedId);

      let lastColIdx = -1;
      for (let i = 0; i < withoutDragged.length; i++) {
        const item = withoutDragged[i];
        if (item && item.status === colStatus) {
          lastColIdx = i;
        }
      }

      if (lastColIdx === -1) {
        updateTasks([...withoutDragged, updatedDraggedItem]);
      } else {
        const newTasks = [
          ...withoutDragged.slice(0, lastColIdx + 1),
          updatedDraggedItem,
          ...withoutDragged.slice(lastColIdx + 1)
        ];
        updateTasks(newTasks);
      }
    },
    [draggedTaskId, isReadOnly, tasks, updateTasks]
  );

  const handleCardDragEnd = useCallback((): void => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    setDropTargetCardId(null);
    setCardDropPosition(null);
    justFinishedCardDragRef.current = true;
    setTimeout(() => {
      justFinishedCardDragRef.current = false;
    }, 150);
  }, []);

  // Table Row Drag Handlers
  const handleRowDragStart = useCallback(
    (e: React.DragEvent<HTMLTableRowElement>, task: TaskItem): void => {
      if (isReadOnly) return;
      e.stopPropagation();
      e.dataTransfer.setData("text/plain", task.id);
      e.dataTransfer.effectAllowed = "move";
      setDraggedRowTaskId(task.id);
    },
    [isReadOnly]
  );

  const handleRowDragOver = useCallback(
    (e: React.DragEvent<HTMLTableRowElement>, targetTask: TaskItem): void => {
      if (!draggedRowTaskId || isReadOnly || draggedRowTaskId === targetTask.id) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const position: "before" | "after" = e.clientY < midY ? "before" : "after";

      setDropTargetRowTaskId(targetTask.id);
      setRowDropPosition(position);
    },
    [draggedRowTaskId, isReadOnly]
  );

  const handleRowDrop = useCallback(
    (e: React.DragEvent<HTMLTableRowElement>, targetTask: TaskItem): void => {
      if (!draggedRowTaskId || isReadOnly) return;
      e.preventDefault();
      e.stopPropagation();

      const currentDraggedId = draggedRowTaskId;
      const currentDropPos = rowDropPosition || "after";

      setDraggedRowTaskId(null);
      setDropTargetRowTaskId(null);
      setRowDropPosition(null);

      if (currentDraggedId === targetTask.id) return;

      const draggedItem = tasks.find((t) => t.id === currentDraggedId);
      if (!draggedItem) return;

      const withoutDragged = tasks.filter((t) => t.id !== currentDraggedId);
      const targetIdx = withoutDragged.findIndex((t) => t.id === targetTask.id);

      if (targetIdx === -1) {
        updateTasks([...withoutDragged, draggedItem]);
        return;
      }

      const insertIdx = currentDropPos === "before" ? targetIdx : targetIdx + 1;
      const newTasks = [
        ...withoutDragged.slice(0, insertIdx),
        draggedItem,
        ...withoutDragged.slice(insertIdx)
      ];

      updateTasks(newTasks);
    },
    [draggedRowTaskId, rowDropPosition, isReadOnly, tasks, updateTasks]
  );

  const handleRowDragEnd = useCallback((): void => {
    setDraggedRowTaskId(null);
    setDropTargetRowTaskId(null);
    setRowDropPosition(null);
  }, []);

  // Add a task
  const handleAddTask = useCallback(
    (defaultStatus: TaskItem["status"] = "Not started", customTitle = ""): void => {
      if (isReadOnly) return;
      const newTask: TaskItem = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: customTitle,
        dueDate: "May 9, 2026 12:00 PM",
        dueDateIso: `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-12`,
        note: "",
        status: defaultStatus,
        category: "",
        iconType: customTitle ? "check" : "db"
      };
      updateTasks([...tasks, newTask]);
    },
    [tasks, updateTasks, isReadOnly, calendarYear, calendarMonth]
  );

  // Toggle task Done / Not started
  const handleToggleDone = useCallback(
    (taskId: string): void => {
      if (isReadOnly) return;
      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus: TaskItem["status"] = t.status === "Done" ? "Not started" : "Done";
          return {
            ...t,
            status: nextStatus,
            iconType: "check" as const
          };
        }
        return t;
      });
      updateTasks(updated);
    },
    [tasks, updateTasks, isReadOnly]
  );

  // Change task status directly
  const handleSetStatus = useCallback(
    (taskId: string, newStatus: TaskItem["status"]): void => {
      if (isReadOnly) return;
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      updateTasks(updated);
      setActiveStatusMenuTaskId(null);
      if (selectedTaskForModal?.id === taskId) {
        setSelectedTaskForModal({ ...selectedTaskForModal, status: newStatus });
      }
    },
    [tasks, updateTasks, isReadOnly, selectedTaskForModal]
  );

  // Update task title inline
  const handleUpdateTitle = useCallback(
    (taskId: string, title: string): void => {
      if (isReadOnly) return;
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, title } : t));
      updateTasks(updated);
    },
    [tasks, updateTasks, isReadOnly]
  );

  // Delete task
  const handleDeleteTask = useCallback(
    (taskId: string): void => {
      if (isReadOnly) return;
      const updated = tasks.filter((t) => t.id !== taskId);
      updateTasks(updated);
      if (selectedTaskForModal?.id === taskId) {
        setSelectedTaskForModal(null);
      }
    },
    [tasks, updateTasks, isReadOnly, selectedTaskForModal]
  );

  // Filtered Overview Tasks
  const filteredOverviewTasks = useMemo(() => {
    let result = [...tasks];

    // Text search
    if (overviewSearch.trim()) {
      const q = overviewSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          t.status.toLowerCase().includes(q)
      );
    }

    // Tabs filter
    if (overviewTab === "Due today") {
      result = result.filter((t) => t.dueDate.includes("May 9"));
    } else if (overviewTab === "Due this week") {
      result = result.filter((t) => t.dueDate.includes("May"));
    } else if (overviewTab === "Category") {
      result.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? ""));
    }

    // Sorting
    if (sortField === "date") {
      result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    } else if (sortField === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortField === "status") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [tasks, overviewSearch, overviewTab, sortField]);

  // Status Board Columns
  const notStartedTasks = useMemo(
    () => tasks.filter((t) => t.status === "Not started"),
    [tasks]
  );
  const inProgressTasks = useMemo(
    () => tasks.filter((t) => t.status === "In progress"),
    [tasks]
  );
  const doneTasks = useMemo(
    () => tasks.filter((t) => t.status === "Done"),
    [tasks]
  );

  // Month navigation
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = (): void => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (): void => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleResetToday = (): void => {
    setCalendarMonth(9); // October
    setCalendarYear(2026);
  };

  // Calendar cells generation (October 2026 starts on Thursday, Oct 1)
  const calendarDays = useMemo(() => {
    const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();

    const cells: Array<{
      day: number;
      isCurrentMonth: boolean;
      dateIso: string;
      label?: string | undefined;
    }> = [];

    // Preceding overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      cells.push({
        day: d,
        isCurrentMonth: false,
        dateIso: `${calendarYear}-${String(calendarMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        dateIso: `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        label: d === 1 ? `${monthNames[calendarMonth]?.substring(0, 3)} 1` : undefined
      });
    }

    // Remaining slots to make multiple of 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        isCurrentMonth: false,
        dateIso: `${calendarYear}-${String(calendarMonth + 2).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      });
    }

    return cells;
  }, [calendarYear, calendarMonth, monthNames]);

  const renderKanbanColumn = (
    colStatus: TaskItem["status"],
    colTasks: TaskItem[],
    headerDotClass: string
  ): ReactElement => {
    const isColOver = dragOverColumn === colStatus && draggedTaskId !== null;

    return (
      <div
        onDragOver={(e) => handleColumnDragOver(e, colStatus)}
        onDrop={(e) => handleColumnDrop(e, colStatus)}
        className={`flex flex-col space-y-2.5 p-2.5 rounded-lg border min-h-[320px] transition-all duration-150 ${
          isColOver
            ? "bg-sky-50/70 border-sky-300 ring-2 ring-sky-300/60 shadow-xs"
            : "bg-stone-50/50 border-stone-200/50"
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between px-1 py-0.5">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${headerDotClass}`} />
            <span className="text-xs font-semibold text-stone-700">{colStatus}</span>
            <span className="text-xs text-stone-400 font-medium">{colTasks.length}</span>
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-2 flex-1">
          {colTasks.length === 0 && (
            <div
              className={`border-2 border-dashed rounded-lg py-8 text-center text-xs font-medium transition-colors ${
                isColOver
                  ? "border-sky-400 text-sky-600 bg-sky-50/50"
                  : "border-stone-200/70 text-stone-400"
              }`}
            >
              Drop cards here
            </div>
          )}

          {colTasks.map((task) => {
            const isBeingDragged = draggedTaskId === task.id;
            const isDropTarget = dropTargetCardId === task.id;

            return (
              <div key={task.id} className="relative">
                {/* Drop line indicator before */}
                {isDropTarget && cardDropPosition === "before" && (
                  <div className="h-1 bg-sky-500 rounded-full my-1 shadow-xs pointer-events-none animate-in fade-in zoom-in-95 duration-100" />
                )}

                <div
                  draggable={!isReadOnly}
                  onDragStart={(e) => handleCardDragStart(e, task)}
                  onDragEnd={handleCardDragEnd}
                  onDragOver={(e) => handleCardDragOver(e, task)}
                  onDrop={(e) => handleCardDrop(e, task)}
                  onClick={() => {
                    if (justFinishedCardDragRef.current) return;
                    setSelectedTaskForModal(task);
                  }}
                  className={`group bg-white rounded-md border p-3 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all space-y-2 cursor-grab active:cursor-grabbing select-none ${
                    isBeingDragged
                      ? "opacity-35 scale-[0.98] border-dashed border-sky-400 bg-sky-50/30"
                      : "border-stone-200/80"
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 shrink-0 mt-0.5 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {task.iconType === "db" ? (
                      <Database className="w-3.5 h-3.5 text-rose-500 fill-rose-100 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          colStatus === "In progress"
                            ? "text-sky-500"
                            : colStatus === "Done"
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }`}
                      />
                    )}
                    <span className="text-xs font-medium text-stone-800 leading-snug">
                      {task.title || "New page"}
                    </span>
                  </div>

                  {task.category && (
                    <div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-900 border border-amber-200/60">
                        {task.category}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-rose-600 font-normal pt-1">
                    <div className="flex items-center gap-1">
                      <span>{task.dueDate}</span>
                      <Clock className="w-2.5 h-2.5 text-rose-500" />
                    </div>
                  </div>
                </div>

                {/* Drop line indicator after */}
                {isDropTarget && cardDropPosition === "after" && (
                  <div className="h-1 bg-sky-500 rounded-full my-1 shadow-xs pointer-events-none animate-in fade-in zoom-in-95 duration-100" />
                )}
              </div>
            );
          })}
        </div>

        {/* Add card button */}
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => handleAddTask(colStatus)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100/70 py-1.5 px-2 rounded transition-colors w-full"
          >
            <Plus className="w-3.5 h-3.5 text-stone-400" />
            <span>New page</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 select-text">
      {/* ---------------------------------------------------- */}
      {/* TOP ACTION: Add New Task Button                     */}
      {/* ---------------------------------------------------- */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => handleAddTask("Not started")}
          disabled={isReadOnly}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-200/90 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5 text-stone-500" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 1: TASK OVERVIEW (Table View)               */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        {/* Rose banner header */}
        <div className="bg-rose-50/70 border border-rose-100/60 text-stone-800 font-semibold px-4 py-2 rounded-md flex items-center justify-between text-base shadow-2xs">
          <span>Task Overview</span>
        </div>

        {/* Navigation Tabs and Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2 text-xs text-stone-600">
          {/* Left Tabs */}
          <div className="flex items-center gap-1">
            {(["All", "Due today", "Due this week", "Category"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setOverviewTab(tab)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-medium transition-colors ${
                  overviewTab === tab
                    ? "bg-stone-100 text-stone-900 shadow-2xs"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                }`}
              >
                <Columns3 className="w-3.5 h-3.5 opacity-70" />
                <span>{tab}</span>
              </button>
            ))}
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2">
            {showOverviewSearch ? (
              <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded px-2 py-0.5">
                <Search className="w-3 h-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={overviewSearch}
                  onChange={(e) => setOverviewSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-28 text-stone-700"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setOverviewSearch("");
                    setShowOverviewSearch(false);
                  }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowOverviewSearch(true)}
                title="Search tasks"
                className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSortField((s) => (s === "default" ? "date" : s === "date" ? "title" : "default"));
              }}
              title={`Sort (Current: ${sortField})`}
              className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700 transition-colors flex items-center gap-1"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortField !== "default" && <span className="text-[10px] capitalize font-medium">{sortField}</span>}
            </button>

            <button
              type="button"
              title="Automations"
              className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              title="More options"
              className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700 transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* New Button */}
            <button
              type="button"
              onClick={() => handleAddTask("Not started")}
              disabled={isReadOnly}
              className="inline-flex items-center gap-1 bg-[#2383e2] hover:bg-[#1b70c4] text-white text-xs font-medium px-2.5 py-1 rounded shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>New</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Notion Table View */}
        <div className="overflow-x-auto rounded border border-stone-200/80 bg-white">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/60 text-stone-500 font-medium">
                <th className="py-2 px-1 w-6 text-center font-normal" />
                <th className="py-2 px-3 min-w-[240px] font-normal flex items-center gap-1.5">
                  <span className="text-stone-400 font-serif">Aa</span>
                  <span>Name of Task</span>
                </th>
                <th className="py-2 px-3 min-w-[170px] font-normal border-l border-stone-200/60">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>Due Date</span>
                  </div>
                </th>
                <th className="py-2 px-3 min-w-[120px] font-normal border-l border-stone-200/60">
                  <div className="flex items-center gap-1.5">
                    <ListIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>Note</span>
                  </div>
                </th>
                <th className="py-2 px-3 min-w-[130px] font-normal border-l border-stone-200/60">
                  <div className="flex items-center gap-1.5">
                    <Circle className="w-3.5 h-3.5 text-stone-400" />
                    <span>Status</span>
                  </div>
                </th>
                <th className="py-2 px-3 min-w-[110px] font-normal border-l border-stone-200/60">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-stone-400" />
                    <span>Category</span>
                  </div>
                </th>
                <th className="py-2 px-3 min-w-[100px] font-normal border-l border-stone-200/60">
                  <span>Image</span>
                </th>
                <th className="py-2 px-2 w-8 border-l border-stone-200/60 text-center text-stone-300">
                  +
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOverviewTasks.map((task) => {
                const statusMeta = STATUS_CONFIG[task.status] || STATUS_CONFIG["Not started"];
                const isRowDragged = draggedRowTaskId === task.id;
                const isRowTarget = dropTargetRowTaskId === task.id;

                return (
                  <tr
                    key={task.id}
                    draggable={!isReadOnly}
                    onDragStart={(e) => handleRowDragStart(e, task)}
                    onDragEnd={handleRowDragEnd}
                    onDragOver={(e) => handleRowDragOver(e, task)}
                    onDrop={(e) => handleRowDrop(e, task)}
                    className={`group/row hover:bg-stone-50/70 transition-colors ${
                      isRowDragged ? "opacity-35 bg-sky-50/50" : ""
                    } ${
                      isRowTarget && rowDropPosition === "before"
                        ? "border-t-2 border-t-sky-500"
                        : isRowTarget && rowDropPosition === "after"
                        ? "border-b-2 border-b-sky-500"
                        : ""
                    }`}
                  >
                    {/* Grip handle cell */}
                    <td className="py-2 px-1 text-center w-6 cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-600">
                      <GripVertical className="w-3.5 h-3.5 mx-auto opacity-0 group-hover/row:opacity-100 transition-opacity" />
                    </td>
                    {/* Name cell */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {/* Icon: check circle or red cylinder */}
                        {task.iconType === "db" ? (
                          <div className="w-4 h-4 rounded text-rose-500 flex items-center justify-center shrink-0">
                            <Database className="w-3.5 h-3.5 text-rose-500 fill-rose-100" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleDone(task.id)}
                            className="text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                            title={task.status === "Done" ? "Mark incomplete" : "Mark done"}
                          >
                            {task.status === "Done" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-300 hover:text-stone-400" />
                            )}
                          </button>
                        )}

                        {/* Title text input */}
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleUpdateTitle(task.id, e.target.value)
                          }
                          placeholder={task.title ? "" : "New page"}
                          disabled={isReadOnly}
                          className="bg-transparent border-none outline-none text-stone-800 text-xs font-medium w-full placeholder:text-stone-400 placeholder:font-normal focus:ring-1 focus:ring-blue-400 rounded px-1 -mx-1"
                        />

                        {/* OPEN button on hover */}
                        <button
                          type="button"
                          onClick={() => setSelectedTaskForModal(task)}
                          className="opacity-0 group-hover/row:opacity-100 ml-auto flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-800 bg-stone-100/90 hover:bg-stone-200 px-1.5 py-0.5 rounded border border-stone-200 transition-opacity whitespace-nowrap"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>OPEN</span>
                        </button>
                      </div>
                    </td>

                    {/* Due Date cell */}
                    <td className="py-2 px-3 border-l border-stone-200/50">
                      <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs">
                        <span>{task.dueDate}</span>
                        <Clock className="w-3 h-3 text-rose-500/80" />
                      </div>
                    </td>

                    {/* Note cell */}
                    <td className="py-2 px-3 border-l border-stone-200/50 text-stone-500">
                      <input
                        type="text"
                        value={task.note ?? ""}
                        placeholder="Empty"
                        onChange={(e) => {
                          const updated = tasks.map((t) =>
                            t.id === task.id ? { ...t, note: e.target.value } : t
                          );
                          updateTasks(updated);
                        }}
                        disabled={isReadOnly}
                        className="bg-transparent border-none outline-none text-stone-700 text-xs w-full placeholder:text-stone-300 focus:ring-1 focus:ring-blue-400 rounded px-1 -mx-1"
                      />
                    </td>

                    {/* Status cell with interactive color change */}
                    <td className="py-2 px-3 border-l border-stone-200/50 relative">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => {
                            if (isReadOnly) return;
                            setActiveStatusMenuTaskId(
                              activeStatusMenuTaskId === task.id ? null : task.id
                            );
                          }}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors shadow-2xs ${statusMeta.pillBg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusMeta.dotBg}`} />
                          <span>{statusMeta.label}</span>
                        </button>

                        {/* Status Select Popover */}
                        {activeStatusMenuTaskId === task.id && (
                          <div
                            className="absolute left-0 top-full mt-1.5 z-30 w-36 bg-white rounded-md shadow-lg border border-stone-200 py-1 animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(["Not started", "In progress", "Done"] as const).map((st) => {
                              const meta = STATUS_CONFIG[st];
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleSetStatus(task.id, st)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left hover:bg-stone-50 transition-colors ${
                                    task.status === st ? "font-semibold bg-stone-50/80" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${meta.dotBg}`} />
                                    <span>{meta.label}</span>
                                  </div>
                                  {task.status === st && (
                                    <Check className="w-3.5 h-3.5 text-blue-600" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category cell */}
                    <td className="py-2 px-3 border-l border-stone-200/50">
                      {task.category ? (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200/60">
                          {task.category}
                        </span>
                      ) : (
                        <span className="text-stone-300 text-xs"></span>
                      )}
                    </td>

                    {/* Image cell */}
                    <td className="py-2 px-3 border-l border-stone-200/50">
                      {task.image === "linkedin" ? (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#0A66C2]">
                          <span>Linked</span>
                          <span className="bg-white text-[#0A66C2] px-0.5 rounded-xs">in</span>
                        </div>
                      ) : (
                        <span className="text-stone-300 text-xs"></span>
                      )}
                    </td>

                    {/* End slot */}
                    <td className="py-2 px-2 border-l border-stone-200/50 text-center"></td>
                  </tr>
                );
              })}

              {/* Bottom "+ New page" row */}
              {!isReadOnly && (
                <tr className="hover:bg-stone-50/60 transition-colors">
                  <td colSpan={7} className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() => handleAddTask("Not started")}
                      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors font-medium"
                    >
                      <Plus className="w-3.5 h-3.5 text-stone-400" />
                      <span>New page</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: TASK STATUS (Kanban Board View)          */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        {/* Rose banner header */}
        <div className="bg-rose-50/70 border border-rose-100/60 text-stone-800 font-semibold px-4 py-2 rounded-md flex items-center justify-between text-base shadow-2xs">
          <span>Task Status</span>
        </div>

        {/* View Navigation Tab Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2 text-xs text-stone-600">
          {/* Left tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                { id: "Board", label: "Board", icon: Columns3 },
                { id: "List", label: "List", icon: ListIcon },
                { id: "Not started", label: "Not started", icon: Columns3 },
                { id: "In Progress", label: "In Progress", icon: Columns3 },
                { id: "Done", label: "Done", icon: Columns3 },
                { id: "Overdue", label: "Overdue", icon: Columns3 },
                { id: "Timeline", label: "Timeline", icon: Columns3 }
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-stone-100 text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2">
            {showStatusSearch ? (
              <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded px-2 py-0.5">
                <Search className="w-3 h-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter cards..."
                  value={statusSearch}
                  onChange={(e) => setStatusSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-28 text-stone-700"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setStatusSearch("");
                    setShowStatusSearch(false);
                  }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowStatusSearch(true)}
                title="Search board"
                className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAddTask("Not started")}
              disabled={isReadOnly}
              className="inline-flex items-center gap-1 bg-[#2383e2] hover:bg-[#1b70c4] text-white text-xs font-medium px-2.5 py-1 rounded shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>New</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(statusTab === "Board" || statusTab === "Not started") &&
            renderKanbanColumn("Not started", notStartedTasks, "bg-stone-400")}
          {(statusTab === "Board" || statusTab === "In Progress") &&
            renderKanbanColumn("In progress", inProgressTasks, "bg-sky-500")}
          {(statusTab === "Board" || statusTab === "Done") &&
            renderKanbanColumn("Done", doneTasks, "bg-emerald-500")}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 3: CALENDAR VIEW                             */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        {/* Calendar Navigation Bar */}
        <div className="flex items-center justify-between border-b border-stone-200/70 pb-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-medium px-2 py-1 bg-stone-100 rounded text-stone-800">
              <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>Calendar</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAddTask("Not started")}
              disabled={isReadOnly}
              className="inline-flex items-center gap-1 bg-[#2383e2] hover:bg-[#1b70c4] text-white text-xs font-medium px-2.5 py-1 rounded shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>New</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Month Title & Controls */}
        <div className="flex items-center justify-between pt-1">
          <h3 className="text-sm font-semibold text-stone-800">
            {monthNames[calendarMonth]} {calendarYear}
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>Manage in Calendar</span>
            </button>
            <div className="flex items-center border border-stone-200 rounded overflow-hidden">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-stone-100 text-stone-600"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetToday}
                className="px-2 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-50 border-x border-stone-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-stone-100 text-stone-600"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar 7-Column Grid */}
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/50 text-center text-xs font-medium text-stone-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1.5 border-r border-stone-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-stone-200">
            {calendarDays.map((cell, idx) => {
              // Check if cell is the highlighted 23rd in October 2026
              const isHighlightedToday =
                cell.isCurrentMonth &&
                cell.day === 23 &&
                calendarMonth === 9 &&
                calendarYear === 2026;

              // Tasks on this date
              const dayTasks = tasks.filter((t) => {
                if (t.dueDateIso && t.dueDateIso.endsWith(String(cell.day).padStart(2, "0"))) {
                  return cell.isCurrentMonth;
                }
                return false;
              });

              return (
                <div
                  key={`${cell.dateIso}-${idx}`}
                  onMouseEnter={() => setHoveredDay(cell.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`relative min-h-[90px] p-1.5 transition-colors group/cell ${
                    cell.isCurrentMonth ? "bg-white" : "bg-stone-50/40 text-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-medium ${
                        isHighlightedToday
                          ? "w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[11px]"
                          : cell.isCurrentMonth
                          ? "text-stone-700"
                          : "text-stone-400"
                      }`}
                    >
                      {cell.label ? cell.label : cell.day}
                    </span>

                    {/* Plus button on hover */}
                    {!isReadOnly && cell.isCurrentMonth && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAddTask(
                            "Not started",
                            `Task for ${monthNames[calendarMonth]} ${cell.day}`
                          )
                        }
                        className="opacity-0 group-hover/cell:opacity-100 p-0.5 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 transition-opacity"
                        title="Add task on this day"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Tasks rendered on this day */}
                  <div className="space-y-1">
                    {dayTasks.map((t) => {
                      const meta = STATUS_CONFIG[t.status];
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTaskForModal(t)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[10px] text-stone-700 font-medium truncate cursor-pointer shadow-2xs"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotBg} shrink-0`} />
                          <span className="truncate">{t.title || "New task"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 4: DATABASE & COLLAPSIBLE ROSE BANNER        */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
          <Database className="w-4 h-4 text-rose-500 fill-rose-100" />
          <span>Database</span>
        </div>

        {/* Collapsible Rose Banner */}
        <div className="rounded-lg border border-rose-200/80 bg-rose-50/70 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setIsMessageBannerOpen(!isMessageBannerOpen)}
            className="w-full flex items-center gap-2 px-4 py-3 text-left font-semibold text-stone-800 text-sm hover:bg-rose-100/50 transition-colors"
          >
            {isMessageBannerOpen ? (
              <ChevronDown className="w-4 h-4 text-stone-700 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-stone-700 shrink-0" />
            )}
            <span>For more information- send a message</span>
          </button>

          {isMessageBannerOpen && (
            <div className="px-6 py-4 border-t border-rose-200/60 bg-white/60 space-y-3 text-xs text-stone-700 animate-in fade-in duration-150">
              <p className="leading-relaxed">
                Welcome to your <strong>Simple Task Tracker</strong> template! This space is designed to help you organize your daily work, sprints, and long-term goals efficiently.
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
                <li>Switch between <strong>Table Overview</strong>, <strong>Kanban Board</strong>, and <strong>Calendar</strong> to view your progress.</li>
                <li>Click on status pills (<em>Not started</em>, <em>In progress</em>, <em>Done</em>) to dynamically update tasks and colors.</li>
                <li>Add notes, categories, and track due dates with alarm notifications.</li>
              </ul>

              {/* Quick message input */}
              <div className="pt-2">
                <label className="block font-medium text-stone-700 mb-1">
                  Have a question or request?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-3 py-1.5 rounded-md border border-stone-200 bg-white text-xs outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!contactMessage.trim()) return;
                      setMessageSent(true);
                      setContactMessage("");
                      setTimeout(() => setMessageSent(false), 3000);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#2383e2] hover:bg-[#1b70c4] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                </div>
                {messageSent && (
                  <p className="text-emerald-600 font-medium mt-1">
                    Thank you! Your message has been received.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* TASK DETAIL MODAL / DRAWER                           */}
      {/* ---------------------------------------------------- */}
      {selectedTaskForModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4"
          onClick={() => setSelectedTaskForModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedTaskForModal.iconType === "db" ? (
                  <Database className="w-4 h-4 text-rose-500 fill-rose-100" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-rose-500" />
                )}
                <span className="text-xs font-medium text-stone-500">Task Details</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForModal(null)}
                className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Name of Task
              </label>
              <input
                type="text"
                value={selectedTaskForModal.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTaskForModal({ ...selectedTaskForModal, title: val });
                  handleUpdateTitle(selectedTaskForModal.id, val);
                }}
                placeholder="Enter task name..."
                disabled={isReadOnly}
                className="w-full text-base font-semibold text-stone-800 border-b border-stone-200 pb-1 outline-none focus:border-blue-500"
              />
            </div>

            {/* Properties grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Status */}
              <div>
                <span className="block text-stone-400 mb-1">Status</span>
                <div className="flex items-center gap-1">
                  {(["Not started", "In progress", "Done"] as const).map((st) => {
                    const isCurrent = selectedTaskForModal.status === st;
                    const meta = STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleSetStatus(selectedTaskForModal.id, st)}
                        className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
                          isCurrent
                            ? `${meta.pillBg} border-stone-400 font-semibold ring-1 ring-stone-300`
                            : "bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dotBg}`} />
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <span className="block text-stone-400 mb-1">Due Date</span>
                <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={selectedTaskForModal.dueDate}
                    onChange={(e) => {
                      const updated = tasks.map((t) =>
                        t.id === selectedTaskForModal.id
                          ? { ...t, dueDate: e.target.value }
                          : t
                      );
                      updateTasks(updated);
                      setSelectedTaskForModal({
                        ...selectedTaskForModal,
                        dueDate: e.target.value
                      });
                    }}
                    className="bg-transparent border border-stone-200 rounded px-2 py-0.5 text-xs text-rose-600 font-medium outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <span className="block text-stone-400 mb-1">Category</span>
                <input
                  type="text"
                  value={selectedTaskForModal.category ?? ""}
                  placeholder="e.g. Work, Personal"
                  onChange={(e) => {
                    const updated = tasks.map((t) =>
                      t.id === selectedTaskForModal.id
                        ? { ...t, category: e.target.value }
                        : t
                    );
                    updateTasks(updated);
                    setSelectedTaskForModal({
                      ...selectedTaskForModal,
                      category: e.target.value
                    });
                  }}
                  className="w-full border border-stone-200 rounded px-2 py-1 text-xs text-stone-800 outline-none"
                />
              </div>

              {/* Note */}
              <div className="col-span-2">
                <span className="block text-stone-400 mb-1">Note</span>
                <textarea
                  rows={3}
                  value={selectedTaskForModal.note ?? ""}
                  placeholder="Add any extra notes or details..."
                  onChange={(e) => {
                    const updated = tasks.map((t) =>
                      t.id === selectedTaskForModal.id
                        ? { ...t, note: e.target.value }
                        : t
                    );
                    updateTasks(updated);
                    setSelectedTaskForModal({
                      ...selectedTaskForModal,
                      note: e.target.value
                    });
                  }}
                  className="w-full border border-stone-200 rounded p-2 text-xs text-stone-800 outline-none resize-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-3">
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTaskForModal.id)}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete task</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTaskForModal(null)}
                className="ml-auto px-4 py-1.5 rounded-md bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
