import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import type { AirplaneInput } from "../generated/graphql";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: AirplaneInput) => void;
};

export default function AddAirplaneDialog({ open, onClose, onCreate }: Props) {
  const [id, setId] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [size, setSize] = useState(0);

  const handleCreate = () => {
    if (!id || !type) {
      window.alert("Please provide id and type.");
      return;
    }
    if (Number.isNaN(Number(capacity)) || Number.isNaN(Number(size))) {
      window.alert("Capacity and Size must be numbers.");
      return;
    }

    onCreate({ id, type, capacity: Number(capacity), size: Number(size) });
    setId("");
    setType("");
    setCapacity(0);
    setSize(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Airplane</DialogTitle>
      <DialogContent>
        <TextField margin="dense" label="ID" fullWidth value={id} onChange={(e) => setId(e.target.value)} />
        <TextField margin="dense" label="Type" fullWidth value={type} onChange={(e) => setType(e.target.value)} />
        <TextField
          margin="dense"
          label="Capacity"
          type="number"
          fullWidth
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
        <TextField
          margin="dense"
          label="Size"
          type="number"
          fullWidth
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
