import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";

import CustomizedDataGrid from "./CustomizedDataGrid";
import UrlAnalytics from "./UrlAnalytics";
import { addURL, deleteURL } from "../../../api/urls";
import { useAuth } from "../../../context/Auth/AuthContext";

export default function MainGrid() {
  // Form and dialog states
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [urlErrorMessage, setUrlErrorMessage] = useState("");

  // Notifications
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // User context
  const { user } = useAuth();

  // Data refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Delete confirmation dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Analytics view
  const [selectedURLId, setSelectedURLId] = useState<number | null>(null);
  const [selectedURL, setSelectedURL] = useState<string | null>(null);

  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

  // Add a new URL
  const handleAddURL = async () => {
    if (!urlRegex.test(urlInput)) {
      setUrlError(true);
      setUrlErrorMessage("Please enter a valid URL.");
      return;
    }

    try {
      await addURL({ url: urlInput });
      setSuccess(true);
      setRefreshTrigger((prev) => prev + 1);
      setUrlInput("");
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  // Delete a URL
  const handleDeleteURL = async () => {
    if (deleteId === null) return;

    try {
      await deleteURL(deleteId);
      setDeleteSuccess(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  // View analytics for a selected URL
  const handleViewAnalytics = (id: number, url: string) => {
    setSelectedURLId(id);
    setSelectedURL(url);
  };

  // Return back from analytics view
  const handleBack = () => {
    setSelectedURLId(null);
    setSelectedURL(null);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" }, p: 2 }}>
      {/* Header and Add URL button */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography component="h2" variant="h5">
          Tracked URLs
        </Typography>

        {selectedURLId === null && user?.role === "admin" && (
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add URL
          </Button>
        )}
      </Stack>

      {/* Conditional: Show either analytics or table */}
      {selectedURLId !== null && selectedURL !== null ? (
        <UrlAnalytics
          urlId={selectedURLId}
          url={selectedURL}
          onBack={handleBack}
        />
      ) : (
        <CustomizedDataGrid
          refreshTrigger={refreshTrigger}
          onRequestDelete={(id: number) => {
            setDeleteId(id);
            setDeleteOpen(true);
          }}
          onViewAnalytics={handleViewAnalytics}
          userRole={user?.role}
        />
      )}

      {/* Add URL Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New URL</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter URL"
            variant="outlined"
            fullWidth
            margin="normal"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            autoFocus
            error={urlError}
            helperText={urlErrorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddURL}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this URL? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteURL}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
      >
        <MuiAlert severity="error" elevation={6} variant="filled">
          {error}
        </MuiAlert>
      </Snackbar>

      {/* Success Snackbar for adding */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <MuiAlert severity="success" elevation={6} variant="filled">
          URL added successfully
        </MuiAlert>
      </Snackbar>

      {/* Success Snackbar for deleting */}
      <Snackbar
        open={deleteSuccess}
        autoHideDuration={3000}
        onClose={() => setDeleteSuccess(false)}
      >
        <MuiAlert severity="success" elevation={6} variant="filled">
          URL deleted successfully
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
