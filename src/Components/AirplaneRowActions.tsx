import React from "react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import type { Data } from "../types/Data";

type Props = {
  row: Data;
  editingId: string | null;
  draft: Partial<Data> | null;
  setEditingId: (id: string | null) => void;
  setDraft: (d: Partial<Data> | null) => void;
  updateRow: (input: { id: string; type: string; capacity: number; size: number }) => void;
  deleteRow: (id: string) => void;
};

export default function AirplaneRowActions({
  row,
  editingId,
  draft,
  setEditingId,
  setDraft,
  updateRow,
  deleteRow,
}: Props) {
  const isEditing = editingId === row.id;

  return (
    <>
      {isEditing ? (
        <>
          <IconButton
            size="small"
            aria-label={`save-${row.id}`}
            onClick={() => {
              if (!draft) return;
              const id = (draft.id ?? row.id) as string;
              const type = (draft.type ?? row.type) as string;
              const capacity = Number(draft.capacity ?? row.capacity);
              const size = Number(draft.size ?? row.size);
              if (Number.isNaN(capacity) || Number.isNaN(size)) {
                window.alert("Capacity and Size must be numbers.");
                return;
              }
              updateRow({ id, type, capacity, size });
              setEditingId(null);
              setDraft(null);
            }}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={`cancel-${row.id}`}
            onClick={() => {
              setEditingId(null);
              setDraft(null);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton
            size="small"
            aria-label={`edit-${row.id}`}
            onClick={() => {
              setEditingId(row.id);
              setDraft({ id: row.id, type: row.type, capacity: row.capacity, size: row.size });
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={`delete-${row.id}`}
            onClick={() => {
              if (!window.confirm("Delete this airplane?")) return;
              deleteRow(row.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </>
  );
}
