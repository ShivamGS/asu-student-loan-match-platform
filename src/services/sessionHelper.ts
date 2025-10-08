import { CurrentUserSession, UserProfile } from '../types';

// Get the complete current session
export const getCurrentSession = (): CurrentUserSession | null => {
  try {
    const sessionData = localStorage.getItem('currentSession');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      console.log('✅ [SESSION] Retrieved session:', session);
      return session;
    }
    console.log('⚠️ [SESSION] No session found in storage');
    return null;
  } catch (error) {
    console.error('❌ [SESSION] Error retrieving session:', error);
    return null;
  }
};

// Get current user's ASU ID
export const getCurrentUserAsuId = (): string | null => {
  try {
    const session = getCurrentSession();
    const asuId = session?.asuId || null;

    if (asuId) {
      console.log('✅ [SESSION] Retrieved ASU ID:', asuId);
    } else {
      console.log('⚠️ [SESSION] No ASU ID found in session');
    }

    return asuId;
  } catch (error) {
    console.error('❌ [SESSION] Error retrieving ASU ID:', error);
    return null;
  }
};

// Get full user profile
export const getUserProfile = (): UserProfile | null => {
  try {
    const session = getCurrentSession();
    const profile = session?.userProfile || null;

    if (profile) {
      console.log('✅ [SESSION] Retrieved user profile');
    } else {
      console.log('⚠️ [SESSION] No user profile found in session');
    }

    return profile;
  } catch (error) {
    console.error('❌ [SESSION] Error retrieving user profile:', error);
    return null;
  }
};

// Get approval status
export const getApprovalStatus = (): 'approved' | 'pending' | 'rejected' | 'action_required' | null => {
  try {
    const session = getCurrentSession();
    const status = session?.approvalStatus || null;

    if (status) {
      console.log('✅ [SESSION] Retrieved approval status:', status);
    } else {
      console.log('⚠️ [SESSION] No approval status found in session');
    }

    return status;
  } catch (error) {
    console.error('❌ [SESSION] Error retrieving approval status:', error);
    return null;
  }
};

// Set/Store a new session
export const setCurrentSession = (session: CurrentUserSession): void => {
  try {
    localStorage.setItem('currentSession', JSON.stringify(session));
    console.log('✅ [SESSION] Stored new session for ASU ID:', session.asuId);
  } catch (error) {
    console.error('❌ [SESSION] Error storing session:', error);
  }
};

// Clear session (for logout)
export const clearSession = (): void => {
  try {
    localStorage.removeItem('currentSession');
    sessionStorage.clear(); // Also clear any session storage
    console.log('✅ [SESSION] Cleared all session data');
  } catch (error) {
    console.error('❌ [SESSION] Error clearing session:', error);
  }
};

// Update session with new data
export const updateSession = (updates: Partial<CurrentUserSession>): void => {
  try {
    const currentSession = getCurrentSession();
    if (currentSession) {
      const updatedSession = { ...currentSession, ...updates };
      localStorage.setItem('currentSession', JSON.stringify(updatedSession));
      console.log('✅ [SESSION] Updated session with new data');
    } else {
      console.log('⚠️ [SESSION] No existing session to update');
    }
  } catch (error) {
    console.error('❌ [SESSION] Error updating session:', error);
  }
};

// Update only approval status
export const updateApprovalStatus = (status: 'approved' | 'pending' | 'rejected' | 'action_required'): void => {
  try {
    updateSession({ approvalStatus: status });
    console.log('✅ [SESSION] Updated approval status to:', status);
  } catch (error) {
    console.error('❌ [SESSION] Error updating approval status:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const session = getCurrentSession();
  const authenticated = session !== null && !!session.asuId;

  if (authenticated) {
    console.log('✅ [SESSION] User is authenticated');
  } else {
    console.log('❌ [SESSION] User is not authenticated');
  }

  return authenticated;
};

// Get user's display name
export const getUserDisplayName = (): string => {
  try {
    const profile = getUserProfile();

    if (!profile) {
      return 'User';
    }

    // Try to get name from loan application first
    if (profile.loanApplication?.applicantName) {
      const firstName = profile.loanApplication.applicantName.split(' ')[0];
      return firstName;
    }

    // Try to get name from salary verification
    if (profile.salaryVerification?.employeeName) {
      const firstName = profile.salaryVerification.employeeName.split(' ')[0];
      return firstName;
    }

    return 'User';
  } catch (error) {
    console.error('❌ [SESSION] Error getting display name:', error);
    return 'User';
  }
};

// Get user's full name
export const getUserFullName = (): string => {
  try {
    const profile = getUserProfile();

    if (!profile) {
      return 'User';
    }

    // Try to get name from loan application first
    if (profile.loanApplication?.applicantName) {
      return profile.loanApplication.applicantName;
    }

    // Try to get name from salary verification
    if (profile.salaryVerification?.employeeName) {
      return profile.salaryVerification.employeeName;
    }

    return 'User';
  } catch (error) {
    console.error('❌ [SESSION] Error getting full name:', error);
    return 'User';
  }
};

// Get user's email (if available)
export const getUserEmail = (): string | null => {
  try {
    const session = getCurrentSession();
    return session?.userProfile?.asuEmail || null;
  } catch (error) {
    console.error('❌ [SESSION] Error getting email:', error);
    return null;
  }
};

// LEGACY SUPPORT - For backward compatibility with old code
// Get current user data (legacy format)
export const getCurrentUser = () => {
  try {
    const session = getCurrentSession();
    // Return in legacy format if needed
    return session ? {
      asuId: session.asuId,
      email: getUserEmail() || session.userProfile?.loanApplication?.applicantName || session.userProfile?.salaryVerification?.employeeName || null
    } : null;
  } catch (error) {
    console.error('❌ [SESSION] Error retrieving current user:', error);
    return null;
  }
};

// Refresh session from API (useful after document approval changes status)
export const refreshSessionFromAPI = async (asuId: string): Promise<boolean> => {
  try {
    console.log('🔄 [SESSION] Refreshing session from API for ASU ID:', asuId);

    const response = await fetch(
      `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${asuId}`
    );

    if (!response.ok) {
      console.error('❌ [SESSION] Failed to refresh session from API');
      return false;
    }

    const data = await response.json();
    const user = data.user;

    // Update session with fresh data
    updateSession({
      approvalStatus: user.approvalStatus,
      userProfile: user
    });

    console.log('✅ [SESSION] Successfully refreshed session from API');
    return true;
  } catch (error) {
    console.error('❌ [SESSION] Error refreshing session from API:', error);
    return false;
  }
};
