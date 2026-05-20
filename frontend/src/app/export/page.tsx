"use client";
import React, { useState } from "react";
import { getExportUrl } from "../../lib/api";
import { Download } from "lucide-react";

export default function ExportPage() {
  const [jur, setJur] = useState("");
  const [pillar, setPillar] = useState("");
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    const url = getExportUrl(jur || undefined, pillar || undefined, format);
    const a = document.createElement("a");
    a.href = url;
    a.download = `regscope_export.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div>
      <div className="page-header">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-syne)" }}>Export Center</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Download compliance data as structured JSON or flat CSV
          </p>
        </div>
      </div>

      <div className="page-content max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Filters */}
          <div className="lg:col-span-3 rs-card-static space-y-6" style={{ padding: "2rem", borderRadius: "1rem" }}>
            <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Export Filters</h2>
            <div>
              <label className="section-label block mb-2">Jurisdiction</label>
              <select value={jur} onChange={e => setJur(e.target.value)} className="select-field">
                <option value="">All Jurisdictions</option>
                <option value="IN">India (DPDP 2023)</option>
                <option value="SG">Singapore (PDPA)</option>
                <option value="EU">European Union (GDPR)</option>
              </select>
            </div>
            <div>
              <label className="section-label block mb-2">Compliance Pillar</label>
              <select value={pillar} onChange={e => setPillar(e.target.value)} className="select-field">
                <option value="">All Pillars</option>
                <option value="pillar_6">Pillar 6 — Cross-Border Transfer</option>
                <option value="pillar_7">Pillar 7 — Security Safeguards</option>
              </select>
            </div>
          </div>

          {/* Right: Format + Download */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rs-card-static space-y-3" style={{ padding: "1.5rem", borderRadius: "1rem" }}>
              <h2 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Export Format</h2>

              {(["json", "csv"] as const).map(f => (
                <label
                  key={f}
                  className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: `1px solid ${format === f ? "var(--accent-cyan)" : "var(--border-subtle)"}`,
                    background: format === f ? "rgba(0,217,255,0.04)" : "transparent",
                  }}
                >
                  <input
                    type="radio" name="format" value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="mt-0.5"
                    style={{ accentColor: "var(--accent-cyan)" }}
                  />
                  <div>
                    <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                      {f === "json" ? "📄 JSON" : "📊 CSV"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {f === "json" ? "Hierarchical structure" : "Flat spreadsheet"}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button onClick={handleDownload} disabled={loading} className="btn-primary btn-full btn-lg">
              <Download size={16} />
              {loading ? "Preparing…" : "Download Export"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
