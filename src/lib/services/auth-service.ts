export type Role = "ADMIN" | "CUSTOMER";

export interface UserSession {
  loginId: string; // can be email or phone
  role: Role;
  token: string;
  fullName?: string;
}

const AUTH_KEY = "himanshu_store_auth_session";
const OFFICIAL_ADMIN_EMAIL = "himanshukushwahaf352@gmail.com";

/**
 * Custom Authentication Service simulating a Spring Boot backend.
 * Uses LocalStorage exclusively.
 */
export const AuthService = {
  
  /**
   * Retrieves the current session from LocalStorage
   */
  getSession(): UserSession | null {
    if (typeof localStorage === 'undefined') return null;
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data) as any;
      if (parsed.email && !parsed.loginId) {
        parsed.loginId = parsed.email;
        delete parsed.email;
        localStorage.setItem(AUTH_KEY, JSON.stringify(parsed));
      }
      return parsed as UserSession;
    } catch (e) {
      return null;
    }
  },

  /**
   * Saves the session to LocalStorage
   */
  setSession(session: UserSession) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      // Dispatch a custom event so hooks can re-render across tabs/components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event("auth-changed"));
      }
    }
  },

  /**
   * Clears the session
   */
  clearSession() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event("auth-changed"));
      }
    }
  },

  /**
   * Simulates an API call to sign in or sign up
   */
  async authenticate(loginId: string, password?: string, fullName?: string): Promise<UserSession> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 600));

    // Determine Role
    const role: Role = loginId.toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "CUSTOMER";

    // Simulate generating a JWT token like Spring Boot would
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload_${Date.now()}.mock_signature`;

    const session: UserSession = {
      loginId: loginId.toLowerCase(),
      role,
      token: mockJwt,
      fullName: fullName || "User",
    };

    this.setSession(session);
    return session;
  },

  /**
   * Sign Out
   */
  async signOut() {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.clearSession();
  }
};
