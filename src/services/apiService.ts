import { UserProfile } from '../types';

const API_BASE_URL = 'https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod';

// Helper function to parse DynamoDB format to regular JSON
const parseDynamoDBItem = (item: any): any => {
  console.log('🔧 [API] Parsing DynamoDB item...');

  if (!item) {
    console.log('🔴 [API] Item is null/undefined');
    return null;
  }

  const parseValue = (value: any): any => {
    if (!value) return null;

    // Handle different DynamoDB types
    if (value.S !== undefined) return value.S;
    if (value.N !== undefined) return parseFloat(value.N);
    if (value.BOOL !== undefined) return value.BOOL;
    if (value.M !== undefined) return parseDynamoDBItem(value.M);
    if (value.L !== undefined) return value.L.map((v: any) => parseValue(v));
    if (value.NULL !== undefined) return null;

    return value;
  };

  const result: any = {};
  for (const key in item) {
    result[key] = parseValue(item[key]);
  }

  console.log('✅ [API] DynamoDB parsing complete');
  return result;
};

export const apiService = {
  // Fetch user profile by ASU ID
  async getUserProfile(asuId: string): Promise<UserProfile | null> {
    console.log('🌐 [API] getUserProfile called');
    console.log('🌐 [API] ASU ID:', asuId);
    console.log('🌐 [API] API Base URL:', API_BASE_URL);

    try {
      const url = `${API_BASE_URL}/admin/users/${asuId}`;
      console.log('🌐 [API] Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 [API] Response received');
      console.log('📡 [API] Status:', response.status);
      console.log('📡 [API] Status Text:', response.statusText);
      console.log('📡 [API] OK:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('🔴 [API] User not found (404)');
          return null;
        }
        console.error('🔴 [API] Request failed:', response.statusText);
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      console.log('🔵 [API] Parsing response JSON...');
      const data = await response.json();
      console.log('📦 [API] Raw API response:', data);
      console.log('📦 [API] Response type:', typeof data);
      console.log('📦 [API] Response keys:', Object.keys(data));

      // Parse DynamoDB format
      console.log('🔵 [API] Starting DynamoDB parsing...');
      const parsedData = parseDynamoDBItem(data);
      console.log('✅ [API] Parsed data:', parsedData);
      console.log('✅ [API] Parsed data keys:', parsedData ? Object.keys(parsedData) : 'null');

      // Extract user object from response
      let userData = parsedData;
      if (parsedData && parsedData.user) {
        console.log('🔧 [API] Extracting user object from response');
        userData = parsedData.user;
      }

      if (userData) {
        console.log('📋 [API] ASU ID from parsed data:', userData.asuId);
        console.log('📋 [API] Approval Status from parsed data:', userData.approvalStatus);
        console.log('📋 [API] Has latestRecommendation:', !!userData.latestRecommendation);
      }

      return userData;
    } catch (error) {
      console.error('❌ [API] Error in getUserProfile:', error);
      console.error('❌ [API] Error type:', typeof error);
      console.error('❌ [API] Error details:', error);
      throw error;
    }
  },

  // Helper to get dashboard data from user profile
  getDashboardData(userProfile: UserProfile) {
    console.log('📊 [API] getDashboardData called');
    console.log('📊 [API] User profile provided:', !!userProfile);

    if (!userProfile.latestRecommendation) {
      console.log('🔴 [API] No latestRecommendation found');
      return null;
    }

    console.log('✅ [API] latestRecommendation exists');
    const recommendation = userProfile.latestRecommendation;
    const dashboardData = recommendation.dashboardData || {};
    const financialProjections = recommendation.financialProjections || {};

    console.log('📊 [API] Dashboard data keys:', Object.keys(dashboardData));
    console.log('📊 [API] Financial projections keys:', Object.keys(financialProjections));

    const result = {
      programApproval: dashboardData.programApproval || {},
      currentPeriodProgress: dashboardData.currentPeriodProgress || {},
      progressMetrics: dashboardData.progressMetrics || {},
      financialHealth: dashboardData.financialHealth || {},
      retirementProjection: dashboardData.retirementProjection || {},
      salaryCapInfo: dashboardData.salaryCapInfo || {},
      monthlyBreakdown: financialProjections.monthlyBreakdown || {},
      annualSummary: financialProjections.annualSummary || {},
      loanPayoffProjection: financialProjections.loanPayoffProjection || {},
      taxSavings: financialProjections.taxSavings || {},
      debtToIncomeImpact: financialProjections.debtToIncomeImpact || {},
    };

    console.log('✅ [API] Dashboard data extracted successfully');
    return result;
  },
};