import React, { useState } from "react";
import { X, Sparkles, Globe, Hash, FileText, Check } from "lucide-react";
import LoadingSpinner from "./loading-spinner";

type ClusterSuggestion = {
  type: "domain" | "content" | "keywords";
  name: string;
  description: string;
  bookmarkIds: string[];
  confidence: number;
  suggestedPosition: { x: number; y: number };
  color: string;
};

type ClusteringSuggestionsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  suggestions: ClusterSuggestion[];
  isLoading: boolean;
  onAcceptSuggestion: (suggestion: ClusterSuggestion) => void;
  onRefreshSuggestions: () => void;
};

export default function ClusteringSuggestionsDialog({
  isOpen,
  onClose,
  suggestions,
  isLoading,
  onAcceptSuggestion,
  onRefreshSuggestions,
}: ClusteringSuggestionsDialogProps) {
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "domain":
        return <Globe size={16} />;
      case "content":
        return <FileText size={16} />;
      case "keywords":
        return <Hash size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "domain":
        return "Domain-based";
      case "content":
        return "Content similarity";
      case "keywords":
        return "Keyword-based";
      default:
        return "Smart clustering";
    }
  };

  const handleAcceptSuggestion = async (suggestion: ClusterSuggestion) => {
    const suggestionKey = `${suggestion.type}-${suggestion.name}`;
    setAcceptingIds((prev) => new Set([...prev, suggestionKey]));

    try {
      await onAcceptSuggestion(suggestion);
    } finally {
      setAcceptingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(suggestionKey);
        return newSet;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-3xl shadow-modern-lg w-full max-w-3xl max-h-[85vh] overflow-hidden animate-slide-up border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-modern">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Smart Clustering Suggestions
              </h2>
              <p className="text-slate-600 font-medium">
                AI-powered bookmark organization based on content patterns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 hover:scale-105"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-zinc-500 mt-4">
                Analyzing your bookmarks...
              </p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-zinc-100 rounded-full mb-4">
                <Sparkles size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 mb-2">
                No clustering suggestions found
              </h3>
              <p className="text-sm text-zinc-500 text-center max-w-md">
                You need at least 2 bookmarks with similar patterns to generate
                suggestions. Add more bookmarks or try refreshing.
              </p>
              <button
                onClick={onRefreshSuggestions}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Refresh Suggestions
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-zinc-600">
                  Found {suggestions.length} clustering suggestion
                  {suggestions.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={onRefreshSuggestions}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Refresh
                </button>
              </div>

              {suggestions.map((suggestion) => {
                const suggestionKey = `${suggestion.type}-${suggestion.name}`;
                const isAccepting = acceptingIds.has(suggestionKey);

                return (
                  <div
                    key={suggestionKey}
                    className="border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: `${suggestion.color}20` }}
                          >
                            <div style={{ color: suggestion.color }}>
                              {getTypeIcon(suggestion.type)}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-zinc-900">
                              {suggestion.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-zinc-100 rounded-full text-zinc-600">
                                {getTypeLabel(suggestion.type)}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {Math.round(suggestion.confidence * 100)}%
                                confidence
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-zinc-600 mb-3">
                          {suggestion.description}
                        </p>

                        {/* Confidence bar */}
                        <div className="w-full bg-zinc-200 rounded-full h-1.5 mb-3">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${suggestion.confidence * 100}%`,
                              backgroundColor: suggestion.color,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        disabled={isAccepting}
                        className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isAccepting ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Accept
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && suggestions.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50">
            <p className="text-xs text-zinc-500">
              Collections will be created automatically and bookmarks will be
              grouped accordingly. You can always modify or delete collections
              later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
