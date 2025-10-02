import axios, { AxiosInstance } from "axios";
import { AuthenticationManager, AuthSession } from "./auth.js";

export interface JellyfinClientOptions {
  baseUrl: string;
  userId?: string;
  token?: string;
}

export class JellyfinClient {
  private http: AxiosInstance;
  private authManager: AuthenticationManager;
  private currentSession: AuthSession | null = null;

  constructor(opts: JellyfinClientOptions) {
    this.authManager = new AuthenticationManager(opts.baseUrl);
    this.http = axios.create({
      baseURL: opts.baseUrl.replace(/\/+$/, ""),
      paramsSerializer: { indexes: null }
    });

    // If token and userId are provided, set up initial session
    if (opts.token && opts.userId) {
      this.currentSession = {
        accessToken: opts.token,
        userId: opts.userId,
        authenticatedAt: new Date(),
      };
    }
  }

  /**
   * Get current authentication session
   */
  private async getSession(): Promise<AuthSession> {
    if (this.currentSession) {
      return this.currentSession;
    }

    const session = await this.authManager.getAuthentication();
    this.currentSession = session;
    return session;
  }

  /**
   * Make authenticated request
   */
  private async authenticatedRequest<T = unknown>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    options: { params?: Record<string, unknown>; data?: unknown } = {}
  ): Promise<T> {
    const session = await this.getSession();

    const headers: Record<string, string> = {
      "X-MediaBrowser-Token": session.accessToken,
    };
    if (options.data) {
      headers["Content-Type"] = "application/json";
    }

    let response;
    if (method === 'get') {
      response = await this.http.get(url, { ...options, headers });
    } else if (method === 'post') {
      response = await this.http.post(url, options.data, { headers, params: options.params });
    } else if (method === 'put') {
      response = await this.http.put(url, options.data, { headers, params: options.params });
    } else {
      response = await this.http.delete(url, { headers, params: options.params });
    }

    return response.data;
  }

  async listItems(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    const session = await this.getSession();
    return this.authenticatedRequest('get', `/Users/${encodeURIComponent(session.userId)}/Items`, { params });
  }

  async searchHints(query: string, limit = 10): Promise<Record<string, unknown>> {
    const session = await this.getSession();
    const params = { SearchTerm: query, Limit: limit, UserId: session.userId };
    return this.authenticatedRequest('get', `/Search/Hints`, { params });
  }

  async nextUp(seriesId?: string, limit = 10): Promise<Record<string, unknown>> {
    const session = await this.getSession();
    const params: Record<string, unknown> = { UserId: session.userId, Limit: limit };
    if (seriesId) params.SeriesId = seriesId;
    return this.authenticatedRequest('get', `/Shows/NextUp`, { params });
  }

  async sessions(): Promise<Record<string, unknown>> {
    return this.authenticatedRequest('get', `/Sessions`);
  }

  async item(itemId: string): Promise<Record<string, unknown>> {
    const session = await this.getSession();
    return this.authenticatedRequest('get', `/Users/${encodeURIComponent(session.userId)}/Items/${encodeURIComponent(itemId)}`);
  }

  async streamInfo(itemId: string): Promise<Record<string, unknown>> {
    const session = await this.getSession();
    const params = { UserId: session.userId };
    return this.authenticatedRequest('get', `/Items/${encodeURIComponent(itemId)}/PlaybackInfo`, { params });
  }

  /**
   * Get authentication manager for direct access
   */
  getAuthManager(): AuthenticationManager {
    return this.authManager;
  }

  /**
   * Update current session (used after authentication)
   */
  setSession(session: AuthSession): void {
    this.currentSession = session;
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.currentSession = null;
    this.authManager.clearSession();
  }
}

