import type { InferSelectModel } from "drizzle-orm";
import type { boards, bookmarks, collections } from "@/db/schema";

export type Board = InferSelectModel<typeof boards>;
export type Bookmark = InferSelectModel<typeof bookmarks>;
export type Collection = InferSelectModel<typeof collections>;

export interface BoardWithRelations {
  board: Board;
  bookmarks: Bookmark[];
  collections: Collection[];
}

