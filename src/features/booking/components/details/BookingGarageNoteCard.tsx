"use client";

import React from "react";
import { StickyNote, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BookingGarageNoteCardProps {
  note: string;
  onChangeNote: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges?: boolean;
}

export function BookingGarageNoteCard({
  note,
  onChangeNote,
  onSave,
  isSaving,
  hasUnsavedChanges = true,
}: BookingGarageNoteCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex-1 flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-[#19CA32]" />
          <h2 className="text-sm font-bold text-gray-900">Garage Note</h2>
        </div>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium">
          Private
        </span>
      </div>
      <textarea
        rows={4}
        value={note}
        onChange={(e) => onChangeNote(e.target.value)}
        placeholder="Add a private note about this booking (visible to garage only)…"
        className="w-full flex-1 text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#19CA32] focus:border-[#19CA32] transition-colors"
      />
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Visible only to your garage team.
        </p>
        <Button
          type="button"
          size="sm"
          disabled={isSaving || !hasUnsavedChanges}
          onClick={onSave}
          className="h-8 text-xs bg-[#19CA32] hover:bg-[#158a26] text-white cursor-pointer px-4 gap-1.5 disabled:opacity-40"
        >
          {isSaving ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save Note
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
