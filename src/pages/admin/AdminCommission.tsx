// pages/admin/AdminCommission.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Paid,
  Pending,
  CheckCircle,
  Cancel,
  Visibility,
  Download,
  Refresh,
  FilterList,
  Clear,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import commissionService from "../../services/commissionService";
import {
  type Commission,
  type CommissionSummary,
} from "../../types/commission.types";
import { formatCurrency } from "../../utils/formatters";

// Define proper types
interface StatusUpdateData {
  status: string;
  notes: string;
}

interface Filters {
  status: string;
  affiliateId: string;
  adminId: string;
  productId: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  search: string;
}

const AdminCommission: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 20,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    status: "",
    affiliateId: "",
    adminId: "",
    productId: "",
    startDate: null,
    endDate: null,
    search: "",
  });
  const [selectedCommission, setSelectedCommission] =
    useState<Commission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<StatusUpdateData>({
    status: "",
    notes: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  useEffect(() => {
    fetchCommissions();
  }, [pagination.page, filters]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await commissionService.getAllCommissions({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        affiliateId: filters.affiliateId
          ? parseInt(filters.affiliateId)
          : undefined,
        adminId: filters.adminId ? parseInt(filters.adminId) : undefined,
        productId: filters.productId ? parseInt(filters.productId) : undefined,
        startDate: filters.startDate
          ? filters.startDate.format("YYYY-MM-DD")
          : undefined,
        endDate: filters.endDate
          ? filters.endDate.format("YYYY-MM-DD")
          : undefined,
        search: filters.search || undefined,
      });

      setCommissions(response.data.commissions);
      setSummary(response.data.summary);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      console.error("Error fetching commissions:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch commissions",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedCommission) return;
    try {
      await commissionService.updateCommissionStatus(selectedCommission.id, {
        status: statusUpdate.status as any,
        notes: statusUpdate.notes,
      });
      setSnackbar({
        open: true,
        message: `Commission status updated to ${statusUpdate.status}`,
        severity: "success",
      });
      setOpenDialog(false);
      fetchCommissions();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update commission status",
        severity: "error",
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await commissionService.exportCommissionReport(
        filters.startDate ? filters.startDate.format("YYYY-MM-DD") : undefined,
        filters.endDate ? filters.endDate.format("YYYY-MM-DD") : undefined,
      );
      // Download as JSON
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `commission-report-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to export report",
        severity: "error",
      });
    }
  };

  const getStatusChip = (status: string) => {
    const configs: Record<
      string,
      {
        color: "warning" | "info" | "success" | "error";
        icon: React.ReactElement;
      }
    > = {
      pending: { color: "warning", icon: <Pending /> },
      approved: { color: "info", icon: <CheckCircle /> },
      paid: { color: "success", icon: <Paid /> },
      rejected: { color: "error", icon: <Cancel /> },
    };
    const config = configs[status] || configs.pending;
    return (
      <Chip
        icon={config.icon}
        label={status.toUpperCase()}
        color={config.color}
        size="small"
      />
    );
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography color="textSecondary" variant="caption">
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {typeof value === "number" ? formatCurrency(value) : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: "textSecondary" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: "50%",
              p: 1,
              display: "flex",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Commission Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCommissions}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Revenue"
              value={summary.totalCommissions}
              icon={<AccountBalanceWallet sx={{ color: "#1976d2" }} />}
              color="#1976d2"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Affiliate Commission"
              value={summary.totalAffiliateCommission}
              icon={<TrendingUp sx={{ color: "#2e7d32" }} />}
              color="#2e7d32"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Admin Commission"
              value={summary.totalAdminCommission}
              icon={<TrendingDown sx={{ color: "#ed6c02" }} />}
              color="#ed6c02"
              subtitle={`Avg Rate: ${summary.averageAffiliateRate}%`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Orders"
              value={summary.totalCount}
              icon={<Paid sx={{ color: "#9c27b0" }} />}
              color="#9c27b0"
              subtitle={`${summary.pendingCount} Pending · ${summary.paidCount} Paid`}
            />
          </Grid>
        </Grid>
      )}

      {/* Filters - FIXED: Using sx for spacing and alignItems */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Order ID, Buyer Name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              slotProps={{
                input: {
                  endAdornment: filters.search && (
                    <IconButton
                      size="small"
                      onClick={() => setFilters({ ...filters, search: "" })}
                    >
                      <Clear />
                    </IconButton>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(newValue) =>
                  setFilters({ ...filters, startDate: newValue })
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(newValue) =>
                  setFilters({ ...filters, endDate: newValue })
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={fetchCommissions}
              fullWidth
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Commissions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Affiliate</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Affiliate Commission</TableCell>
              <TableCell align="right">Admin Commission</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : commissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography sx={{ color: "textSecondary" }}>
                    No commissions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              commissions.map((commission) => (
                <TableRow key={commission.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {commission.orderId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {commission.Product?.mainImage && (
                        <img
                          src={commission.Product.mainImage}
                          alt={commission.Product.name}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 4,
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                        {commission.Product?.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {commission.affiliate?.name || "N/A"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "textSecondary" }}
                    >
                      {commission.affiliate?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {commission.admin?.name || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {formatCurrency(commission.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: "success.main" }}>
                      {formatCurrency(commission.affiliateCommissionAmount)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "textSecondary" }}
                    >
                      ({commission.affiliateCommissionRate}%)
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: "primary.main" }}>
                      {formatCurrency(commission.adminCommissionAmount)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "textSecondary" }}
                    >
                      ({commission.adminCommissionRate}%)
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(commission.status)}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedCommission(commission);
                          setOpenDialog(true);
                          setStatusUpdate({
                            status: commission.status,
                            notes: commission.notes || "",
                          });
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(_, page) => setPagination({ ...pagination, page })}
            color="primary"
          />
        </Box>
      </TableContainer>

      {/* Update Status Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Commission Status
          {selectedCommission && (
            <Typography
              variant="caption"
              sx={{ display: "block", color: "textSecondary" }}
            >
              Order: {selectedCommission.orderId}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusUpdate.status}
                label="Status"
                onChange={(e) =>
                  setStatusUpdate({ ...statusUpdate, status: e.target.value })
                }
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={statusUpdate.notes}
              onChange={(e) =>
                setStatusUpdate({ ...statusUpdate, notes: e.target.value })
              }
            />
            {selectedCommission && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "textSecondary" }}
                >
                  Affiliate: {selectedCommission.affiliate?.name || "N/A"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "textSecondary" }}
                >
                  Amount:{" "}
                  {formatCurrency(selectedCommission.affiliateCommissionAmount)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "textSecondary" }}
                >
                  Rate: {selectedCommission.affiliateCommissionRate}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCommission;
