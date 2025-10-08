import { QuickSignUpData, UserSession } from '../types';

// ============================================
// AUTHENTICATION API SERVICES
// ============================================

/**
 * Quick sign-up for new users (email + name only)
 * TODO: Replace with actual AWS API endpoint
 */
export const quickSignUp = async (data: QuickSignUpData): Promise<UserSession> => {
  try {
    // ✅ VALIDATE: Ensure employeeId is exactly 10 digits
    if (!data.employeeId || !/^\d{10}$/.test(data.employeeId)) {
      throw new Error('Valid 10-digit ASU ID is required');
    }

    // TODO: POST to AWS API endpoint
    // const response = await fetch('https://your-api.com/auth/signup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // const result = await response.json();
    // return result;

    // MOCK IMPLEMENTATION - Remove when API is ready
    await simulateAPIDelay(1500);
    
    // ✅ FIXED: Use only the 10-digit ASU ID as userId
    const mockSession: UserSession = {
      userId: data.employeeId, // Now guaranteed to be a 10-digit string
      token: `mock_token_${Math.random().toString(36).substr(2, 9)}`,
      profile: {
        fullName: data.fullName,
        email: data.email,
        employeeId: data.employeeId,
      },
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for demo
    localStorage.setItem('userSession', JSON.stringify(mockSession));
    
    return mockSession;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error instanceof Error ? error : new Error('Failed to create account. Please try again.');
  }
};

/**
 * Sign in existing user
 * TODO: Replace with actual AWS API endpoint
 */
export const signIn = async (email: string): Promise<UserSession> => {
  try {
    // TODO: POST to AWS API endpoint
    // const response = await fetch('https://your-api.com/auth/signin', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email })
    // });
    // const result = await response.json();
    // return result;

    // MOCK IMPLEMENTATION
    await simulateAPIDelay(1000);
    
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      return JSON.parse(storedSession);
    }
    
    throw new Error('User not found');
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error('Failed to sign in. Please try again.');
  }
};

/**
 * Get current user session from storage
 */
export const getCurrentSession = (): UserSession | null => {
  try {
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      return JSON.parse(storedSession);
    }
    return null;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * Sign out user
 */
export const signOut = (): void => {
  try {
    // TODO: Call AWS API to invalidate token
    // await fetch('https://your-api.com/auth/signout', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });

    localStorage.removeItem('userSession');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const session = getCurrentSession();
  return session !== null;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Simulate API delay for demo purposes
 */
const simulateAPIDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
