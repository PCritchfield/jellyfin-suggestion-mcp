import axios, { AxiosInstance } from "axios";

export interface JellyfinClientOptions {
  baseUrl: string;
  userId: string;
  token: string;
}

export class JellyfinClient {
  private http: AxiosInstance;
  private userId: string;

  constructor(opts: JellyfinClientOptions) {
    this.userId = opts.userId;
    this.http = axios.create({
      baseURL: opts.baseUrl.replace(/\/+$/, ""),
      headers: { "X-MediaBrowser-Token": opts.token },
      paramsSerializer: { indexes: null }
    });
  }

  async listItems(params: Record<string, any>) {
    const { data } = await this.http.get(`/Users/${encodeURIComponent(this.userId)}/Items`, { params });
    return data;
  }

  async searchHints(query: string, limit = 10) {
    const { data } = await this.http.get(`/Search/Hints`, { params: { SearchTerm: query, Limit: limit, UserId: this.userId } });
    return data;
  }

  async nextUp(seriesId?: string, limit = 10) {
    const params: Record<string, any> = { UserId: this.userId, Limit: limit };
    if (seriesId) params.SeriesId = seriesId;
    const { data } = await this.http.get(`/Shows/NextUp`, { params });
    return data;
  }

  async sessions() {
    const { data } = await this.http.get(`/Sessions`);
    return data;
  }

  async item(itemId: string) {
    const { data } = await this.http.get(`/Users/${encodeURIComponent(this.userId)}/Items/${encodeURIComponent(itemId)}`);
    return data;
  }

  async streamInfo(itemId: string) {
    const { data } = await this.http.get(`/Items/${encodeURIComponent(itemId)}/PlaybackInfo`, { params: { UserId: this.userId } });
    return data;
  }
}

