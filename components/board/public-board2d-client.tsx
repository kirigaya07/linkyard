"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type PublicLinkNode = {
  id: string;
  url: string;
  title: string;
  domain: string;
  image?: string;
  x: number;
  y: number;
};

type PublicBoard = {
  id: string;
  name: string;
  createdAt: string;
};

const BOARD_SIZE = 20000;
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

interface PublicBoard2DClientProps {
  shareToken: string;
}

export default function PublicBoard2DClient({
  shareToken,
}: PublicBoard2DClientProps) {
  const [nodes, setNodes] = useState<PublicLinkNode[]>([]);
  const [board, setBoard] = useState<PublicBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });

  const screenToBoard = useCallback(
    (px: number, py: number) => ({
      x: (px - offset.x) / scale,
      y: (py - offset.y) / scale,
    }),
    [offset.x, offset.y, scale]
  );

  // Load board data
  useEffect(() => {
    async function loadBoardData() {
      try {
        console.log("Loading board data for shareToken:", shareToken);
        const response = await fetch(`/api/board/${shareToken}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
          },
        });
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to load board: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data);

        setBoard(data.board);
        setNodes(data.bookmarks || []);
      } catch (error) {
        console.error("Error loading board:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load board"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBoardData();
  }, [shareToken]);

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

  if (isLoading) {
    return (
      <div className="h-full w-full bg-white text-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading board...</div>
          <div className="text-sm text-zinc-500 mt-2">Please wait</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-white text-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">Error</div>
          <div className="text-sm text-zinc-500 mt-2">{error}</div>
          <div className="text-xs text-zinc-400 mt-4">
            ShareToken: {shareToken}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white text-zinc-900">
      {/* Header */}
      <div className="fixed top-4 left-4 z-50 rounded-xl border border-zinc-200 bg-white/90 p-3 text-xs text-zinc-700 shadow">
        <div className="font-semibold">{board?.name || "Shared Board"}</div>
        <div className="text-zinc-500">Shared Board • View Only</div>
        <div className="text-zinc-400 mt-1">
          {nodes.length} bookmark{nodes.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white/90 p-2 shadow">
        <div className="flex items-center gap-2">
          <button
            onClick={recenter}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          >
            Recenter
          </button>
          <div className="text-xs text-zinc-500 px-2">
            Wheel to zoom • Drag background to pan
          </div>
        </div>
      </div>

      {/* Board */}
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
              className="absolute z-10"
              style={{
                transform: `translate(${n.x}px, ${n.y}px)`,
              }}
            >
              <div className="w-60 select-none rounded-2xl border border-zinc-200 bg-white p-3 text-left shadow hover:shadow-lg transition-shadow duration-200">
                {/* Visual preview */}
                <div className="mb-2 w-60 overflow-hidden rounded-xl bg-zinc-100">
                  <div className="aspect-[16/9] w-60 relative">
                    {n.image ? (
                      <Image
                        src={n.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="240px"
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
                    rel="noopener noreferrer"
                    className="rounded-lg bg-indigo-600 px-2 py-1 font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    Open
                  </a>
                  <span className="rounded-lg border border-zinc-200 px-2 py-1 text-zinc-500">
                    {n.domain}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
