import axios, { AxiosInstance } from "axios";

export interface AuthSession {
  accessToken: string;
  userId: string;
  userName?: string;
  serverInfo?: {
    name: string;
    version: string;
  } | undefined;
  authenticatedAt: Date;
}

export interface PendingRequest {
  toolName: string;
  arguments: Record<string, unknown>;
  timestamp: Date;
}

export class AuthenticationRequiredError extends Error {
  constructor(message = "Authentication required. Please use the authenticate_user tool.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export class AuthenticationManager {
  private session: AuthSession | null = null;
  private pendingRequest: PendingRequest | null = null;
  private baseUrl: string;
  private http: AxiosInstance;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "X-Emby-Authorization": 'MediaBrowser Client="Jellyfin MCP", Device="MCP Server", DeviceId="jellyfin-mcp-001", Version="1.0.0"',
      },
    });
  }

  /**
   * Get current authentication session using hybrid approach:
   * 1. Check in-memory session
   * 2. Try environment variables (API key approach)
   * 3. Try environment variables (username/password approach)
   * 4. Trigger interactive authentication
   */
  async getAuthentication(): Promise<AuthSession> {
    // 1. Check in-memory session
    if (this.session && this.isSessionValid(this.session)) {
      return this.session;
    }

    // 2. Try environment variables (API key approach)
    if (process.env.JELLYFIN_TOKEN && process.env.JELLYFIN_USER_ID) {
      const envSession: AuthSession = {
        accessToken: process.env.JELLYFIN_TOKEN,
        userId: process.env.JELLYFIN_USER_ID,
        authenticatedAt: new Date(),
      };

      // Validate the environment token
      if (await this.validateToken(envSession.accessToken, envSession.userId)) {
        this.session = envSession;
        return envSession;
      } else {
        console.error("⚠️  Environment token is invalid or expired");
      }
    }

    // 3. Try environment variables (username/password approach)
    if (process.env.JELLYFIN_USERNAME && process.env.JELLYFIN_PASSWORD) {
      try {
        const session = await this.authenticateUser(
          process.env.JELLYFIN_USERNAME,
          process.env.JELLYFIN_PASSWORD
        );
        console.error("✅ Successfully authenticated using environment username/password");
        return session;
      } catch (error: unknown) {
        console.error("⚠️  Environment username/password authentication failed:", error instanceof Error ? error.message : String(error));
      }
    }

    // 4. Trigger interactive authentication
    throw new AuthenticationRequiredError();
  }

  /**
   * Authenticate user with username/password
   */
  async authenticateUser(username: string, password: string): Promise<AuthSession> {
    try {
      const response = await this.http.post("/Users/authenticateByName", {
        Username: username,
        Pw: password,
      });

      const { AccessToken, User } = response.data;

      if (!AccessToken || !User?.Id) {
        throw new Error("Invalid response from Jellyfin server");
      }

      // Get server info
      let serverInfo;
      try {
        const serverResponse = await this.http.get("/System/Info/Public");
        serverInfo = {
          name: serverResponse.data.ServerName || "Jellyfin",
          version: serverResponse.data.Version || "Unknown",
        };
      } catch {
        // Server info is optional
        serverInfo = undefined;
      }

      const session: AuthSession = {
        accessToken: AccessToken,
        userId: User.Id,
        userName: User.Name,
        authenticatedAt: new Date(),
      };

      if (serverInfo) {
        session.serverInfo = serverInfo;
      }

      this.session = session;
      return session;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number }; code?: string; message?: string };
      if (axiosError.response?.status === 401) {
        throw new Error("Invalid username or password");
      } else if (axiosError.response?.status === 403) {
        throw new Error("User account is disabled or not allowed to sign in");
      } else if (axiosError.code === "ECONNREFUSED" || axiosError.code === "ENOTFOUND") {
        throw new Error(`Cannot connect to Jellyfin server at ${this.baseUrl}`);
      } else {
        throw new Error(`Authentication failed: ${axiosError.message || String(error)}`);
      }
    }
  }

  /**
   * Set authentication token directly
   */
  async setToken(accessToken: string, userId?: string): Promise<AuthSession> {
    // If userId is not provided, try to get it from the token
    let finalUserId = userId;
    if (!finalUserId) {
      try {
        // Try to get current user info using the token
        const response = await axios.get(`${this.baseUrl}/Users/Me`, {
          headers: { "X-MediaBrowser-Token": accessToken },
        });
        finalUserId = response.data.Id;
      } catch {
        throw new Error("Invalid token or unable to determine user ID");
      }
    }

    if (!finalUserId) {
      throw new Error("Unable to determine user ID");
    }

    // Validate the token
    if (!(await this.validateToken(accessToken, finalUserId))) {
      throw new Error("Invalid or expired token");
    }

    const session: AuthSession = {
      accessToken,
      userId: finalUserId,
      authenticatedAt: new Date(),
    };

    this.session = session;
    return session;
  }

  /**
   * Store a pending request that triggered authentication
   */
  storePendingRequest(toolName: string, args: Record<string, unknown>): void {
    this.pendingRequest = {
      toolName,
      arguments: args,
      timestamp: new Date(),
    };
  }

  /**
   * Get and clear the pending request
   */
  getPendingRequest(): PendingRequest | null {
    const request = this.pendingRequest;
    this.pendingRequest = null;
    return request;
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.session = null;
    this.pendingRequest = null;
  }

  /**
   * Check if session is valid (not expired, etc.)
   */
  private isSessionValid(session: AuthSession): boolean {
    // For now, just check if it exists and is not too old
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const age = Date.now() - session.authenticatedAt.getTime();
    return age < maxAge;
  }

  /**
   * Validate a token by making a test API call
   */
  private async validateToken(token: string, userId: string): Promise<boolean> {
    try {
      await this.http.get(`/Users/${encodeURIComponent(userId)}/Items`, {
        headers: { "X-MediaBrowser-Token": token },
        params: { Limit: 1 },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current session info (for debugging/status)
   */
  getSessionInfo(): { authenticated: boolean; userId?: string; userName?: string } {
    if (!this.session) {
      return { authenticated: false };
    }

    const result: { authenticated: boolean; userId?: string; userName?: string } = {
      authenticated: true,
      userId: this.session.userId,
    };

    if (this.session.userName) {
      result.userName = this.session.userName;
    }

    return result;
  }
}