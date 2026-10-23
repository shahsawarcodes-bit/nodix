"use client";

import { useCallback, type ReactElement } from "react";
import { generateKeyBetween } from "fractional-indexing";
import type { Block, BlockType } from "@workspace/types";
import { useBlockDrag } from "../hooks/useBlockDrag";
import { useEditor } from "../state";
import { BlockGutter } from "./BlockGutter";
import { BlockList } from "./BlockList";
import { BlockMenu } from "./BlockMenu";
import { DropIndicator } from "./DropIndicator";
import { SlashMenu } from "./SlashMenu";
import { useReadOnly } from "./ReadOnlyContext";
import {
  BulletedListBlock,
  CodeBlock,
  DividerBlock,
  HeadingBlock,
  NumberedListBlock,
  QuoteBlock,
  TextBlock,
  TodoBlock,
  ToggleBlock,
  LinkToPageBlock,
  ImageBlock,
  FileBlock,
  DatabaseBlock
} from "./blocks";

export interface BlockRendererProps {
  block: Block;
  index?: number;
}

export const BlockRenderer = ({ block, index }: BlockRendererProps): ReactElement => {
  const {
    blocks,
    dragState,
    slashMenuBlockId,
    setSlashMenuBlockId,
    activeMenuBlockId,
    setActiveMenuBlockId,
    createAndInsertBlock,
    convertBlockType,
    getBlockChildren,
    activeCollaborators,
    setFocusedBlockId
  } = useEditor();

  const { handlePointerDown, wasDragging } = useBlockDrag();

  const handleAddBelow = useCallback((): void => {
    const siblings = blocks
      .filter((b) => (b.parentId ?? null) === (block.parentId ?? null))
      .sort((a, b) => a.pos.localeCompare(b.pos, undefined, { numeric: true }));

    const idx = siblings.findIndex((b) => b.id === block.id);
    const nextSibling = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
    const newPos = generateKeyBetween(block.pos, nextSibling?.pos ?? null);

    void createAndInsertBlock(
      {
        pageId: block.pageId,
        parentId: block.parentId,
        type: "text",
        text: "",
        pos: newPos
      },
      true
    );
  }, [blocks, block.id, block.pageId, block.parentId, block.pos, createAndInsertBlock]);

  const handleSelectSlashCommand = useCallback(
    async (type: BlockType): Promise<void> => {
      await convertBlockType(block.id, type);
    },
    [block.id, convertBlockType]
  );

  const renderBlockContent = (): ReactElement => {
    switch (block.type) {
      case "text":
        return <TextBlock block={block} />;
      case "h1":
        return <HeadingBlock block={block} level={1} />;
      case "h2":
        return <HeadingBlock block={block} level={2} />;
      case "h3":
        return <HeadingBlock block={block} level={3} />;
      case "todo":
        return <TodoBlock block={block} />;
      case "toggle":
        return <ToggleBlock block={block} />;
      case "bulleted_list":
        return <BulletedListBlock block={block} />;
      case "numbered_list":
        return <NumberedListBlock block={block} index={index ?? 1} />;
      case "quote":
        return <QuoteBlock block={block} />;
      case "code":
        return <CodeBlock block={block} />;
      case "divider":
        return <DividerBlock block={block} />;
      case "link_to_page":
        return <LinkToPageBlock block={block} />;
      case "image":
        return <ImageBlock block={block} />;
      case "file":
        return <FileBlock block={block} />;
      case "database":
        return <DatabaseBlock block={block} />;
      default:
        return <TextBlock block={block} />;
    }
  };

  const isReadOnly = useReadOnly();
  const isDragged = !isReadOnly && dragState.isDragging && dragState.draggedBlockId === block.id;
  const isDropTarget = !isReadOnly && dragState.isDragging && dragState.dropTarget?.blockId === block.id;
  const dropPosition = dragState.dropTarget?.position;
  const children = getBlockChildren(block.id);

  const blockCollaborators = activeCollaborators.filter((c) => c.activeBlockId === block.id);
  const primaryCollab = blockCollaborators[0];

  return (
    <div
      id={`block-${block.id}`}
      data-editor-block-id={block.id}
      onFocus={() => {
        if (!isReadOnly) {
          setFocusedBlockId(block.id);
        }
      }}
      className={`group relative transition-all duration-150 rounded-sm ${
        isDragged ? "opacity-40" : "opacity-100"
      }`}
      style={
        primaryCollab
          ? {
              borderLeft: `3px solid ${primaryCollab.color}`,
              paddingLeft: "4px"
            }
          : undefined
      }
    >
      {/* Live Collaborator Floating Badges / Cursors */}
      {blockCollaborators.length > 0 && (
        <div className="absolute -top-3.5 right-2 z-20 flex items-center gap-1.5 pointer-events-none select-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          {blockCollaborators.map((c) => (
            <div
              key={c.clientId}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs tracking-tight"
              style={{ backgroundColor: c.color }}
            >
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Drop Indicator */}
      {!isReadOnly && isDropTarget && dropPosition && <DropIndicator position={dropPosition} />}

      {/* Hover Gutter */}
      {!isReadOnly && (
        <BlockGutter
          blockId={block.id}
          isTopAligned={
            block.type === "database" ||
            block.type === "code" ||
            block.type === "image" ||
            block.type === "file"
          }
          onAddBelow={handleAddBelow}
          onOpenMenu={() => {
            if (wasDragging()) return;
            setActiveMenuBlockId(activeMenuBlockId === block.id ? null : block.id);
          }}
          onDragPointerDown={(e) => handlePointerDown(e, block)}
        />
      )}

      {/* Block Content */}
      <div className="relative">{renderBlockContent()}</div>

      {/* Slash Menu */}
      {!isReadOnly && slashMenuBlockId === block.id && (
        <SlashMenu
          onSelectType={(type) => void handleSelectSlashCommand(type)}
          onClose={() => setSlashMenuBlockId(null)}
        />
      )}

      {/* Block Menu */}
      {!isReadOnly && activeMenuBlockId === block.id && (
        <BlockMenu block={block} onClose={() => setActiveMenuBlockId(null)} />
      )}

      {/* Render children for non-toggle blocks that have nested items */}
      {block.type !== "toggle" && children.length > 0 && (
        <div className="pl-6 border-l border-gray-100 ml-3">
          <BlockList pageId={block.pageId} parentId={block.id} />
        </div>
      )}
    </div>
  );
};
