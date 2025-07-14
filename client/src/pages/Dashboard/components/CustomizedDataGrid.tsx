import { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
  type GridRowSelectionModel,
  type GridCellParams,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import {
  PlayArrowRounded as PlayIcon,
  RestartAltRounded as RestartIcon,
  StopRounded as StopIcon,
  DeleteRounded as DeleteIcon,
  VisibilityRounded as VisibilityIcon,
} from "@mui/icons-material";

import { fetchURLs, startProcessing, stopProcessing } from "../../../api/urls";
import type { URLRow } from "../../../api/urls";

import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { blue, orange, grey } from "@mui/material/colors";
import type { SxProps, Theme } from "@mui/material";
import Fuse from "fuse.js";

export default function CustomizedDataGrid({
  refreshTrigger,
  onRequestDelete,
  onViewAnalytics,
  userRole,
}: {
  refreshTrigger: number;
  onRequestDelete: (id: number) => void;
  onViewAnalytics: (id: number, url: string) => void;
  userRole?: string | null;
}) {
  const [rows, setRows] = useState<URLRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<URLRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 20,
    page: 0,
  });

  // Util: Apply fuzzy search using Fuse.js
  const applySearchFilter = (rows: URLRow[], search: string): URLRow[] => {
    if (!search.trim()) return rows;
    const fuse = new Fuse(rows, {
      keys: ["url", "status", "lastUpdated"],
      threshold: 0.3,
    });
    return fuse.search(search).map((res) => res.item);
  };

  // Fetch and refresh data
  const fetchData = useCallback(() => {
    setLoading(true);
    fetchURLs()
      .then((data) => {
        const sorted = data.sort((a, b) => b.id - a.id); // sort newest first
        setRows(sorted);
        setFilteredRows(applySearchFilter(sorted, searchText));
      })
      .finally(() => setLoading(false));
  }, [searchText]);

  // Initial & interval refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Refresh when parent triggers
  useEffect(() => {
    fetchData();
  }, [refreshTrigger, fetchData]);

  // Re-apply search when text or rows change
  useEffect(() => {
    setFilteredRows(applySearchFilter(rows, searchText));
  }, [searchText, rows]);

  // Shared icon style
  const iconButtonStyle = (enabled: boolean): SxProps<Theme> => ({
    cursor: enabled ? "pointer" : "default",
    color: enabled ? "inherit" : grey[400],
    transition: "color 0.2s, transform 0.15s",
    "&:hover": enabled ? { color: blue[700], transform: "scale(1.15)" } : {},
    userSelect: "none",
  });

  const deleteIconSx: SxProps<Theme> = {
    cursor: "pointer",
    color: "error.main",
    transition: "color 0.2s, transform 0.15s",
    "&:hover": { color: "error.dark", transform: "scale(1.15)" },
    userSelect: "none",
  };

  // Column definitions
  const columns: GridColDef[] = [
    {
      field: "url",
      headerName: "URL",
      flex: 2,
      minWidth: 250,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: ({ value }) => {
        const chipProps: any = {
          label: value,
          size: "small",
          variant: "outlined",
        };

        switch (value) {
          case "Done":
            chipProps.color = "success";
            break;
          case "Error":
          case "Stopped":
            chipProps.color = "error";
            break;
          case "Processing":
            chipProps.sx = {
              borderColor: blue[300],
              backgroundColor: `${blue[50]} !important`,
              "& .MuiChip-label": { color: blue[800] },
            };
            break;
          case "Queued":
            chipProps.sx = {
              borderColor: orange[300],
              backgroundColor: `${orange[50]} !important`,
              "& .MuiChip-label": { color: orange[900] },
            };
            break;
        }

        return <Chip {...chipProps} />;
      },
    },
    {
      field: "lastUpdated",
      headerName: "Last Updated",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 180,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const { status, id } = row;
        const isProcessing = status === "Processing";
        const isQueued = status === "Queued";
        const isDoneOrError = ["Done", "Error"].includes(status);
        // Disable icons if user is not admin
        const isAdmin = userRole === "admin";
        const handleStartRestart = async () => {
          if (!isAdmin) return;
          await startProcessing([id]);
          fetchData();
        };

        const handleStop = async () => {
          if (!isAdmin) return;
          await stopProcessing([id]);
          fetchData();
        };

        return (
          <Box
            display="flex"
            gap={1}
            alignItems="center"
            height="100%"
            py={0.5}
          >
            {userRole === "admin" && (
              <>
                <Tooltip title={isQueued ? "Start" : "Restart"}>
                  {isQueued ? (
                    <PlayIcon
                      onClick={handleStartRestart}
                      sx={iconButtonStyle(true)}
                    />
                  ) : (
                    <RestartIcon
                      onClick={() => isDoneOrError && handleStartRestart()}
                      sx={iconButtonStyle(isDoneOrError)}
                    />
                  )}
                </Tooltip>

                <Tooltip title="Stop">
                  <StopIcon
                    onClick={handleStop}
                    sx={iconButtonStyle(isProcessing)}
                  />
                </Tooltip>

                <Tooltip title="Delete">
                  <DeleteIcon
                    onClick={() => onRequestDelete(id)}
                    sx={deleteIconSx}
                  />
                </Tooltip>
              </>
            )}

            <Tooltip title="View Analytics">
              <VisibilityIcon
                onClick={() => onViewAnalytics(id, row.url)}
                sx={iconButtonStyle(true)}
              />
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <>
      {/* Search Input */}
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </Box>

      {/* DataGrid */}
      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={setSelectionModel}
        onCellClick={(params: GridCellParams, event) => {
          if (params.field !== "url") event.stopPropagation();
        }}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
        sx={{
          height: 600,
          "& .MuiDataGrid-cell:focus": { outline: "none" },
          "& .MuiDataGrid-cell:focus-within": { outline: "none" },
        }}
      />
    </>
  );
}
