// types/commission.types.ts

export interface Commission {
  id: number;
  affiliateId: number;
  adminId: number;
  productId: number;
  purchaseId: number;
  orderId: string;
  affiliateCommissionAmount: number;
  affiliateCommissionRate: number;
  adminCommissionAmount: number;
  adminCommissionRate: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  affiliate?: {
    id: number;
    name: string;
    email: string;
    affiliateId: string;
    phone?: string;
  };
  admin?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  Product?: {
    id: number;
    name: string;
    mainImage: string;
    company: string;
    price: number;
  };
  Purchase?: {
    id: number;
    orderId: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    createdAt: string;
  };
}

export interface CommissionSummary {
  totalCommissions: number;
  totalAffiliateCommission: number;
  totalAdminCommission: number;
  averageAffiliateRate: string;
  pendingCount: number;
  approvedCount: number;
  paidCount: number;
  rejectedCount: number;
  totalCount: number;
}

export interface CommissionResponse {
  success: boolean;
  data: {
    commissions: Commission[];
    summary: CommissionSummary;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AdminCommissionSummaryResponse {
  success: boolean;
  data: {
    summary: {
      totalCommissions: number;
      totalAffiliateCommission: number;
      totalAdminCommission: number;
      statusBreakdown: {
        pending: number;
        approved: number;
        paid: number;
        rejected: number;
      };
      averageCommissionRate: string;
    };
    topAffiliates: Array<{
      affiliateId: number;
      totalCommission: number;
      orderCount: number;
      affiliate: {
        id: number;
        name: string;
        email: string;
      };
    }>;
    topAdmins: Array<{
      adminId: number;
      totalCommission: number;
      orderCount: number;
      admin: {
        id: number;
        name: string;
        email: string;
      };
    }>;
    monthlyTrends: Array<{
      month: string;
      totalRevenue: number;
      affiliateCommission: number;
      adminCommission: number;
    }>;
    period: string;
  };
}

export interface AffiliateCommissionSummaryResponse {
  success: boolean;
  data: {
    commissions: Commission[];
    summary: {
      totalEarnings: number;
      totalOrders: number;
      pending: number;
      approved: number;
      paid: number;
      rejected: number;
      pendingCount: number;
      approvedCount: number;
      paidCount: number;
      rejectedCount: number;
      averageCommissionRate: string;
    };
    topProducts: Array<{
      productId: number;
      totalAmount: number;
      count: number;
      Product: {
        id: number;
        name: string;
        mainImage: string;
        company: string;
      };
    }>;
    monthlyTrend: Array<{
      month: string;
      total: number;
    }>;
    totalRecords: number;
    period: string;
  };
}

export interface CommissionStatistics {
  success: boolean;
  data: {
    statusDistribution: Array<{
      status: string;
      count: number;
      totalAmount: number;
    }>;
    rateDistribution: Array<{
      rateRange: number;
      count: number;
    }>;
    dailyEarnings: Array<{
      date: string;
      affiliateCommission: number;
      adminCommission: number;
    }>;
  };
}

export interface UpdateCommissionStatusData {
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  notes?: string;
}

export interface CommissionFilters {
  page?: number;
  limit?: number;
  status?: string;
  affiliateId?: number;
  adminId?: number;
  productId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}