// pages/affiliate/AffiliateCommission.tsx
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
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  TrendingUp,
  AccountBalanceWallet,
  Paid,
  Pending,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
} from "@mui/icons-material";
import commissionService from "../../services/commissionService";
import { type Commission } from "../../types/commission.types";
import { formatCurrency } from "../../utils/formatters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Type for the commission summary
interface CommissionSummary {
  totalEarnings: number;
  totalOrders: number;
  averageCommissionRate: string;
  approved: number;
  approvedCount: number;
  pending: number;
  pendingCount: number;
  paid: number;
  paidCount: number;
  rejected: number;
  rejectedCount: number;
}

// Type for top products
interface TopProduct {
  productId: number;
  totalAmount: number;
  count: number;
  Product: {
    id: number;
    name: string;
    mainImage: string;
    company: string;
  };
}

// Type for monthly trend
interface MonthlyTrend {
  month: string;
  total: number;
}

const AffiliateCommission: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 20,
    totalPages: 0,
  });
  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  useEffect(() => {
    fetchCommissionData();
  }, [period, statusFilter]);

  const fetchCommissionData = async () => {
    setLoading(true);
    try {
      const response =
        await commissionService.getAffiliateCommissionSummary(period);
      setSummary(response.data.summary);
      setTopProducts(response.data.topProducts || []);
      setMonthlyTrend(response.data.monthlyTrend || []);
      setCommissions(response.data.commissions || []);
      setPagination({
        ...pagination,
        total: response.data.totalRecords || 0,
        totalPages: Math.ceil(
          (response.data.totalRecords || 0) / pagination.limit,
        ),
      });
    } catch (error) {
      console.error("Error fetching commission data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch commission data",
        severity: "error",
      });
    } finally {
      setLoading(false);
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
              <Typography variant="caption" color="textSecondary">
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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "1400px", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            My Commission Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track your earnings and commission performance
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCommissionData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards - Using Grid2 with item prop removed */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Earnings"
              value={summary.totalEarnings}
              icon={<AccountBalanceWallet sx={{ color: "#1976d2" }} />}
              color="#1976d2"
              subtitle={`${summary.totalOrders} Orders`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Average Commission Rate"
              value={`${summary.averageCommissionRate}%`}
              icon={<TrendingUp sx={{ color: "#2e7d32" }} />}
              color="#2e7d32"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Available Balance"
              value={summary.approved}
              icon={<Paid sx={{ color: "#ed6c02" }} />}
              color="#ed6c02"
              subtitle={`${summary.approvedCount} Approved`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Pending Commission"
              value={summary.pending}
              icon={<Pending sx={{ color: "#9c27b0" }} />}
              color="#9c27b0"
              subtitle={`${summary.pendingCount} Pending`}
            />
          </Grid>
        </Grid>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Monthly Trend Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Earnings Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Earnings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Commission Status
            </Typography>
            <Box
              sx={{ height: 300, display: "flex", justifyContent: "center" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Pending", value: summary?.pending || 0 },
                      { name: "Approved", value: summary?.approved || 0 },
                      { name: "Paid", value: summary?.paid || 0 },
                      { name: "Rejected", value: summary?.rejected || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent = 0 }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {monthlyTrend.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top Performing Products
          </Typography>
          <Grid container spacing={2}>
            {topProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.productId}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {product.Product?.mainImage && (
                        <img
                          src={product.Product.mainImage}
                          alt={product.Product.name}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {product.Product?.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {product.Product?.company}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Typography variant="caption" color="textSecondary">
                        {product.count} Sales
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        {formatCurrency(product.totalAmount)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Recent Commissions Table */}
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Recent Commission Transactions</Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Commission</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 120 }}
                        >
                          {commission.Product?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {commission.Purchase?.buyerName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {commission.Purchase?.buyerEmail}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(commission.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "success.main" }}
                      >
                        {formatCurrency(commission.affiliateCommissionAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${commission.affiliateCommissionRate}%`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(commission.status)}</TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(_, page) => setPagination({ ...pagination, page })}
            color="primary"
          />
        </Box>
      </Paper>

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

export default AffiliateCommission;
