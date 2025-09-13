"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ShareButton from "@/components/ui/share-button";

type LinkNode = {
  id: string;
  url: string;
  title: string;
  domain: string;
  image?: string;
  x: number;
  y: number;
};

const BOARD_SIZE = 20000;
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

// Real page thumbnail (Chrome-like preview) via Microlink
function previewImageUrl(u: string) {
  const base = "https://api.microlink.io";
  const qs = new URLSearchParams({
    url: u,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    "viewport.width": "1200",
    "viewport.height": "630",
  });
  return `${base}/?${qs.toString()}`;
}

// Quick fallback for domain/title from the URL itself
function urlToPreview(u: string) {
  try {
    const parsed = new URL(u);
    const domain = parsed.hostname.replace(/^www\./, "");
    const path =
      parsed.pathname && parsed.pathname !== "/"
        ? decodeURIComponent(parsed.pathname.replace(/\/$/, ""))
        : "";
    const title = path.split("/").filter(Boolean).slice(-1)[0] || domain || u;
    return { domain, title };
  } catch {
    return { domain: u, title: u };
  }
}

export default function Board2D() {
  const [nodes, setNodes] = useState<LinkNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [isClearingBookmarks, setIsClearingBookmarks] = useState(false);
  const [isUpdatingPosition, setIsUpdatingPosition] = useState<string | null>(
    null
  );
  const [isEnriching, setIsEnriching] = useState<string | null>(null);
  const [isDeletingBookmark, setIsDeletingBookmark] = useState<string | null>(
    null
  );
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load bookmarks from database on component mount
  useEffect(() => {
    async function loadBookmarks() {
      try {
        const response = await fetch("/api/bookmarks");
        if (response.ok) {
          const bookmarks = await response.json();
          setNodes(
            bookmarks.map(
              (bookmark: {
                id: string;
                url: string;
                title: string | null;
                domain: string;
                imageUrl: string | null;
                x: number;
                y: number;
              }) => ({
                id: bookmark.id,
                url: bookmark.url,
                title: bookmark.title || bookmark.domain,
                domain: bookmark.domain,
                image: bookmark.imageUrl,
                x: bookmark.x,
                y: bookmark.y,
              })
            )
          );
          toast.success(
            `Loaded ${bookmarks.length} bookmark${
              bookmarks.length !== 1 ? "s" : ""
            }`
          );
        } else {
          toast.error("Failed to load bookmarks");
        }
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
        toast.error("Failed to load bookmarks");
      } finally {
        setIsLoading(false);
      }
    }
    loadBookmarks();
  }, []);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", onNodeDragMove);
      document.removeEventListener("mouseup", onNodeDragEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const [url, setUrl] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });

  const draggingIdRef = useRef<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const nodeStartRef = useRef({ x: 0, y: 0 });

  const screenToBoard = useCallback(
    (px: number, py: number) => ({
      x: (px - offset.x) / scale,
      y: (py - offset.y) / scale,
    }),
    [offset.x, offset.y, scale]
  );

  // Center view on the board once
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOffset({
      x: rect.width / 2 - BOARD_SIZE / 2,
      y: rect.height / 2 - BOARD_SIZE / 2,
    });
  }, []);

  // Paste to populate input field
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const text = e.clipboardData?.getData("text");
      if (!text) return;
      try {
        const url = new URL(text.trim()).toString();
        setUrl(url);
      } catch {}
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  // Zoom
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const currentEl = wrapperRef.current;
      if (!currentEl) return;
      const rect = currentEl.getBoundingClientRect();
      const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const before = screenToBoard(mouse.x, mouse.y);
      const next = clamp(scale * (e.deltaY < 0 ? 1.1 : 0.9), 0.3, 2.5);
      setScale(next);
      setOffset({ x: mouse.x - before.x * next, y: mouse.y - before.y * next });
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, offset, screenToBoard]);

  // Pan (only when clicking the blank board)
  function onPanStart(e: React.MouseEvent) {
    // Don't pan if we're dragging a node
    if (draggingIdRef.current) return;
    if (e.target !== contentRef.current) return;

    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...offset };

    // Add cursor style
    document.body.style.cursor = "grabbing";
  }

  function onPanMove(e: React.MouseEvent) {
    if (!isPanningRef.current) return;
    setOffset({
      x: offsetStartRef.current.x + (e.clientX - panStartRef.current.x),
      y: offsetStartRef.current.y + (e.clientY - panStartRef.current.y),
    });
  }

  function onPanEnd() {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      document.body.style.cursor = "";
    }
  }

  // Drag nodes
  function onNodeDragStart(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    draggingIdRef.current = id;
    setDraggedNodeId(id);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    const n = nodes.find((n) => n.id === id)!;
    nodeStartRef.current = { x: n.x, y: n.y };

    // Add cursor style and prevent text selection
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    // Add event listeners
    document.addEventListener("mousemove", onNodeDragMove, { passive: false });
    document.addEventListener("mouseup", onNodeDragEnd, { once: true });
  }

  function onNodeDragMove(e: MouseEvent) {
    e.preventDefault();
    const id = draggingIdRef.current;
    if (!id) return;

    const dx = (e.clientX - dragStartRef.current.x) / scale;
    const dy = (e.clientY - dragStartRef.current.y) / scale;
    const newX = Math.round(nodeStartRef.current.x + dx);
    const newY = Math.round(nodeStartRef.current.y + dy);

    setNodes((curr) =>
      curr.map((n) =>
        n.id === id
          ? {
              ...n,
              x: newX,
              y: newY,
            }
          : n
      )
    );
  }

  async function onNodeDragEnd(e: MouseEvent) {
    e.preventDefault();
    const id = draggingIdRef.current;

    // Clean up cursor and event listeners first
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", onNodeDragMove);
    setDraggedNodeId(null);

    if (id) {
      const node = nodes.find((n) => n.id === id);
      if (node) {
        setIsUpdatingPosition(id);
        try {
          const response = await fetch(`/api/bookmarks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x: node.x, y: node.y }),
          });

          if (response.ok) {
            toast.success("Position saved");
          } else {
            toast.error("Failed to save position");
          }
        } catch (error) {
          console.error("Failed to save bookmark position:", error);
          toast.error("Failed to save position");
        } finally {
          setIsUpdatingPosition(null);
        }
      }
    }
    draggingIdRef.current = null;
  }

  // Add a link node (with real visual thumbnail)
  async function addUrl(u: string) {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const center = screenToBoard(rect.width / 2, rect.height / 2);

    const { domain, title } = urlToPreview(u);
    const x = Math.round(center.x);
    const y = Math.round(center.y);

    setIsAddingBookmark(true);
    try {
      // Create bookmark in database
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: u,
          domain,
          title,
          x,
          y,
          imageUrl: previewImageUrl(u),
        }),
      });

      if (response.ok) {
        const bookmark = await response.json();
        const newNode: LinkNode = {
          id: bookmark.id,
          url: bookmark.url,
          title: bookmark.title || domain,
          domain: bookmark.domain,
          image: bookmark.imageUrl,
          x: bookmark.x,
          y: bookmark.y,
        };

        setNodes((n) => [...n, newNode]);
        toast.success("Bookmark added successfully!");

        // Optional: upgrade title/desc/image via your /api/scrape route
        enrichNode(bookmark.id, u);
      } else {
        toast.error("Failed to create bookmark");
      }
    } catch (error) {
      console.error("Error creating bookmark:", error);
      toast.error("Failed to create bookmark");
    } finally {
      setIsAddingBookmark(false);
    }
  }

  async function enrichNode(id: string, link: string) {
    setIsEnriching(id);
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(link)}`);
      const meta = await res.json();

      // Update local state
      setNodes((curr) =>
        curr.map((n) =>
          n.id === id
            ? {
                ...n,
                title: meta.title ?? n.title,
                domain: meta.domain ?? n.domain,
                image: meta.imageUrl ?? n.image, // keep screenshot if OG missing
              }
            : n
        )
      );

      // Update database with enriched metadata
      try {
        const response = await fetch(`/api/bookmarks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: meta.title,
            description: meta.description,
            imageUrl: meta.imageUrl,
          }),
        });

        if (response.ok) {
          toast.success("Bookmark metadata updated");
        }
      } catch (error) {
        console.error("Failed to update bookmark metadata:", error);
        toast.error("Failed to update bookmark metadata");
      }
    } catch (error) {
      console.error("Failed to enrich bookmark:", error);
      toast.error("Failed to enrich bookmark");
    } finally {
      setIsEnriching(null);
    }
  }

  function recenter() {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setScale(1);
    setOffset({
      x: rect.width / 2 - BOARD_SIZE / 2,
      y: rect.height / 2 - BOARD_SIZE / 2,
    });
  }

  function showClearConfirmation() {
    setConfirmDialog({
      isOpen: true,
      title: "Clear All Bookmarks",
      description:
        "Are you sure you want to delete all bookmarks? This action cannot be undone.",
      onConfirm: clearAllBookmarks,
    });
  }

  function showDeleteBookmarkConfirmation(
    bookmarkId: string,
    bookmarkTitle: string
  ) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Bookmark",
      description: `Are you sure you want to delete "${bookmarkTitle}"? This action cannot be undone.`,
      onConfirm: () => deleteBookmark(bookmarkId),
    });
  }

  async function clearAllBookmarks() {
    setIsClearingBookmarks(true);
    try {
      const response = await fetch("/api/bookmarks/clear", {
        method: "DELETE",
      });
      if (response.ok) {
        setNodes([]);
        toast.success("All bookmarks cleared");
      } else {
        toast.error("Failed to clear bookmarks");
      }
    } catch (error) {
      console.error("Error clearing bookmarks:", error);
      toast.error("Failed to clear bookmarks");
    } finally {
      setIsClearingBookmarks(false);
    }
  }

  async function deleteBookmark(bookmarkId: string) {
    setIsDeletingBookmark(bookmarkId);
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNodes((prev) => prev.filter((node) => node.id !== bookmarkId));
        toast.success("Bookmark deleted");
      } else {
        toast.error("Failed to delete bookmark");
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast.error("Failed to delete bookmark");
    } finally {
      setIsDeletingBookmark(null);
    }
  }

  if (isLoading) {
    return (
      <div className="h-full w-full bg-white text-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading your bookmarks...</div>
          <div className="text-sm text-zinc-500 mt-2">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white text-zinc-900">
      {/* hint */}
      {/* <div className="pointer-events-none fixed left-4 top-4 z-50 rounded-xl border border-zinc-200 bg-white/90 p-3 text-xs text-zinc-700 shadow">
        <div className="font-semibold">Linkyard – 2D Board</div>
        <div>
          Paste or type a URL • Press Enter or click Add • Drag cards • Wheel to
          zoom • Drag background to pan
        </div>
      </div> */}

      {/* controls */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white/90 p-2 shadow">
        <div className="flex items-center gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && url) {
                await addUrl(url);
                setUrl("");
              }
            }}
            placeholder="Paste or type a link…"
            className="w-[420px] rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={async () => {
              if (url) {
                await addUrl(url);
                setUrl("");
              }
            }}
            disabled={isAddingBookmark || !url}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAddingBookmark ? (
              <>
                <LoadingSpinner size="sm" />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </button>
          <button
            onClick={recenter}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          >
            Recenter
          </button>
          <button
            onClick={showClearConfirmation}
            disabled={isClearingBookmarks || nodes.length === 0}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isClearingBookmarks ? (
              <>
                <LoadingSpinner size="sm" />
                Clearing...
              </>
            ) : (
              "Clear"
            )}
          </button>
          <ShareButton />
        </div>
      </div>

      {/* board */}
      <div
        ref={wrapperRef}
        className="h-full w-full overflow-hidden"
        onMouseDown={onPanStart}
        onMouseMove={onPanMove}
        onMouseUp={onPanEnd}
      >
        <div
          ref={contentRef}
          className="relative"
          style={{
            width: BOARD_SIZE,
            height: BOARD_SIZE,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            background: "#fff",
          }}
        >
          {nodes.map((n) => (
            <div
              key={n.id}
              className={`absolute transition-all duration-200 ${
                draggedNodeId === n.id ? "z-50" : "z-10"
              }`}
              style={{
                transform: `translate(${n.x}px, ${n.y}px)`,
                ...(draggedNodeId === n.id && {
                  filter: "drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))",
                }),
              }}
            >
              <div
                onMouseDown={(e) => onNodeDragStart(n.id, e)}
                className="w-60 select-none rounded-2xl border border-zinc-200 bg-white p-3 text-left shadow hover:shadow-lg cursor-grab active:cursor-grabbing relative transition-shadow duration-200"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showDeleteBookmarkConfirmation(n.id, n.title);
                  }}
                  disabled={isDeletingBookmark === n.id}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 z-10"
                  title="Delete bookmark"
                >
                  {isDeletingBookmark === n.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "×"
                  )}
                </button>
                {/* Visual preview */}
                <div className="mb-2 w-60 overflow-hidden rounded-xl bg-zinc-100">
                  <div className="aspect-[16/9] w-60">
                    {n.image ? (
                      <img
                        src={n.image}
                        className="h-full w-full object-cover"
                        alt=""
                        onError={(e) => {
                          (
                            e.currentTarget as HTMLImageElement
                          ).src = `https://www.google.com/s2/favicons?domain=${n.domain}&sz=128`;
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        No preview
                      </div>
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className="line-clamp-2 text-sm font-semibold">
                  {n.title}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <a
                    href={n.url}
                    target="_blank"
                    className="rounded-lg bg-indigo-600 px-2 py-1 font-medium text-white"
                  >
                    Open
                  </a>
                  <div className="flex items-center gap-2">
                    {isUpdatingPosition === n.id && (
                      <LoadingSpinner size="sm" />
                    )}
                    {isEnriching === n.id && <LoadingSpinner size="sm" />}
                    <span className="rounded-lg border border-zinc-200 px-2 py-1 text-zinc-500 hover:text-zinc-700 transition-colors">
                      Drag
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
