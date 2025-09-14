"use client";
import React, { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  className?: string;
}

export default function ShareButton({ className = "" }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = async () => {
    setIsLoading(true);
    try {
      if (isShared && shareUrl) {
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard!");
      } else {
        // Generate new share link
        const response = await fetch("/api/board/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate" }),
        });

        if (response.ok) {
          const data = await response.json();
          setShareUrl(data.shareUrl);
          setIsShared(true);
          
          // Copy to clipboard
          await navigator.clipboard.writeText(data.shareUrl);
          toast.success("Share link generated and copied to clipboard!");
        } else {
          toast.error("Failed to generate share link");
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share board");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/board/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });

      if (response.ok) {
        setIsShared(false);
        setShareUrl(null);
        toast.success("Share link revoked");
      } else {
        toast.error("Failed to revoke share link");
      }
    } catch (error) {
      console.error("Error revoking share:", error);
      toast.error("Failed to revoke share link");
    } finally {
      setIsLoading(false);
    }
  };

  // Load current share status on mount
  React.useEffect(() => {
    async function loadShareStatus() {
      try {
        const response = await fetch("/api/board/share");
        if (response.ok) {
          const data = await response.json();
          setIsShared(data.isShared);
          setShareUrl(data.shareUrl);
        }
      } catch (error) {
        console.error("Error loading share status:", error);
      }
    }
    loadShareStatus();
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isShared ? (
        <>
          <button
            onClick={handleShare}
            disabled={isLoading}
            className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Copying...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )}
          </button>
          <button
            onClick={handleRevoke}
            disabled={isLoading}
            className="rounded-xl border border-red-300 text-red-600 px-3 py-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Revoke
          </button>
        </>
      ) : (
        <button
          onClick={handleShare}
          disabled={isLoading}
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share Board
            </>
          )}
        </button>
      )}
    </div>
  );
}
