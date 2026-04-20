export interface DashboardResponse {
  totalContracts: number;
  activeContracts: number;
  draftContracts: number;
  expiredContracts: number;
  pendingApprovalContracts: number;
  terminatedContracts: number;

  totalClients: number;
  activeClients: number;

  totalUsers: number;
  activeUsers: number;

  pendingApprovals: number;

  totalContractValue: number;
  activeContractValue: number;

  expiringSoon7Days: number;
  expiringSoon30Days: number;
  expiringSoon60Days: number;

  userRolesDistribution: UserRoleDistribution[];

  clientGrowthPercentage: number;
  newClientsThisMonth: number;

  teamMemberCount: number;

  myContracts: number;
  myDraftContracts: number;
  myMonthSales: number;

  monthlyRevenue: MonthlyRevenue[];
  contractTypeDistribution: ContractTypeDistribution[];
  contractStatusDistribution: ContractStatusDistribution[];
  topClients: TopClient[];
}

export interface MonthlyRevenue {
  month: string;
  value: number;
  count: number;
}

export interface ContractTypeDistribution {
  type: string;
  count: number;
  value: number;
}

export interface ContractStatusDistribution {
  status: string;
  count: number;
}

export interface TopClient {
  clientId: number;
  companyName: string;
  contractCount: number;
  totalValue: number;
}

export interface UserRoleDistribution {
  role: string;
  count: number;
}
