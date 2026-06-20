const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface Finding {
  category: string;
  severity: string;
  matched_text: string;
  layer: string;
  explanation: string;
  weight: number;
}

export interface ScanResult {
  id?: number;
  risk_score: number;
  classification: string;
  findings: Finding[];
  sanitized_content: string;
  removed_segments: string[];
  blocked: boolean;
  layers_used: string[];
  source_type: string;
  original_preview: string;
}

export interface Stats {
  total_scans: number;
  total_threats: number;
  avg_risk_score: number;
  blocked_count: number;
  categories: Record<string, number>;
  sources: Record<string, number>;
  recent_threats: number;
}

export interface ScanListItem {
  id: number;
  source_type: string;
  risk_score: number;
  classification: string;
  blocked: boolean;
  original_preview: string;
  created_at: string;
  findings_count: number;
}

export interface Scenario {
  id: string;
  name: string;
  source_type: string;
  steps: string[];
}

export interface SimulateResult {
  scenario_id: string;
  scenario_name: string;
  steps: string[];
  scan: ScanResult;
  timeline: { step: number; label: string; status: string }[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || res.statusText);
    }
    return res.json();
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error("Backend unavailable. Run: npm run dev:backend");
    }
    throw e;
  }
}

export const api = {
  health: () => request<{ status: string; llm_available: boolean }>("/api/v1/health"),
  stats: () => request<Stats>("/api/v1/stats"),
  scans: (limit = 20) => request<ScanListItem[]>(`/api/v1/scans?limit=${limit}`),
  scanText: (content: string, source_type = "text") =>
    request<ScanResult>("/api/v1/scan", {
      method: "POST",
      body: JSON.stringify({ content, source_type }),
    }),
  scanUrl: (url: string) =>
    request<ScanResult>(`/api/v1/scan/url?url=${encodeURIComponent(url)}`, { method: "POST" }),
  scanFile: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API_URL}/api/v1/scan/file`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<ScanResult>;
    } catch (e) {
      if (e instanceof TypeError) throw new Error("Backend unavailable. Run: npm run dev:backend");
      throw e;
    }
  },
  scenarios: () => request<Scenario[]>("/api/v1/scenarios"),
  simulate: (scenario_id: string) =>
    request<SimulateResult>("/api/v1/simulate", {
      method: "POST",
      body: JSON.stringify({ scenario_id }),
    }),
};
