export type BlockType =
  | "text"
  | "h1"
  | "h2"
  | "h3"
  | "todo"
  | "toggle"
  | "bulleted_list"
  | "numbered_list"
  | "quote"
  | "code"
  | "divider"
  | "link_to_page"
  | "image"
  | "file"
  | "database";

export interface BlockProps extends Record<string, unknown> {
  url?: string;
  pageId?: string;
  fileName?: string;
  color?: string;
  backgroundColor?: string;
}

export interface Block {
  id: string;
  pageId: string;
  parentId: string | null;
  type: BlockType;
  pos: string;
  props: BlockProps;
  text: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deleted: boolean;
}

export type PermissionRole =
  | "full_access"
  | "can_edit"
  | "can_comment"
  | "can_view";

export type GeneralAccess = "invited" | "public";

export interface Collaborator {
  email: string;
  name?: string;
  role: PermissionRole;
  addedAt?: string | Date;
}

export interface ShareSettings {
  generalAccess: GeneralAccess;
  publicPermission: PermissionRole;
  collaborators: Collaborator[];
}

export interface Page {
  id: string;
  title: string;
  icon: string | null;
  coverImage?: string | null;
  parentId: string | null;
  ownerId?: string | null;
  generalAccess?: GeneralAccess;
  publicPermission?: PermissionRole;
  collaborators?: Collaborator[];
  createdAt: string | Date;
  updatedAt: string | Date;
  deleted: boolean;
}
