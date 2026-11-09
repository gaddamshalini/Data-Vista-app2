import React, { useState, useEffect, useMemo } from "react";
import {
  ExternalLink,
  Award,
  CheckCircle,
  Building,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  Globe,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  X,
  AlertCircle,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import {
  getFreeInternships,
  addFreeInternship,
  updateFreeInternship,
  deleteFreeInternship,
  toggleFreeInternshipActive
} from "../services/api";

// Domain colour mapping
const DOMAIN_COLORS = {
  "Software Engineering": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "AI/ML": { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
  "Data Analytics": { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  "Cloud Computing": { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "Cybersecurity": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "Web Development": { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  "Networking": { bg: "#fefce8", color: "#a16207", border: "#fef08a" },
  "Open Source": { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "Policy & Governance": { bg: "#fff1f2", color: "#be185d", border: "#fce7f3" },
  "Multiple Domains": { bg: "#f8fafc", color: "#475569", border: "#cbd5e1" },
};

function getDomainStyle(domain) {
  for (const key of Object.keys(DOMAIN_COLORS)) {
    if (domain?.toLowerCase().includes(key.toLowerCase().split(" ")[0])) {
      return DOMAIN_COLORS[key];
    }
  }
  return { bg: "#f8fafc", color: "#334155", border: "#cbd5e1" };
}

// Stipend badge
// Shows "Stipend Available" for paid/performance types, "Free Learning" for unpaid.
// Never shows a label that could be mistaken for a payment required.
function StipendBadge({ type }) {
  const raw = (type || "").toLowerCase();
  const hasStipend = raw.includes("paid") || raw.includes("performance");

  if (hasStipend) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px",
        borderRadius: "20px", backgroundColor: "#ecfdf5", color: "#15803d"
      }}>
        <DollarSign size={11} />
        Stipend Available
      </span>
    );
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px",
      borderRadius: "20px", backgroundColor: "#faf5ff", color: "#7c3aed"
    }}>
      <Sparkles size={11} />
      Free Learning
    </span>
  );
}

// Deadline badge
function DeadlineBadge({ deadline, isExpired }) {
  if (!deadline) return null;
  const isRolling = /rolling|open|ongoing|throughout/i.test(deadline);
  if (isExpired) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px",
        borderRadius: "4px", backgroundColor: "#fef2f2", color: "#dc2626"
      }}>
        <AlertTriangle size={10} /> Deadline Passed
      </span>
    );
  }
  if (isRolling) {
    return (
      <span style={{
        fontSize: "0.7rem", fontWeight: 600, padding: "2px 7px",
        borderRadius: "4px", backgroundColor: "#ecfdf5", color: "#15803d"
      }}>
        Always Open
      </span>
    );
  }
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 600, padding: "2px 7px",
      borderRadius: "4px", backgroundColor: "#fff7ed", color: "#c2410c"
    }}>
      Deadline: {deadline}
    </span>
  );
}

// Organisation logo placeholder
function OrgAvatar({ name }) {
  const colors = ["#2563eb","#7c3aed","#059669","#dc2626","#d97706","#0891b2","#be185d","#4f46e5"];
  const idx = [...(name || "A")].reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
  return (
    <div style={{
      width: "42px", height: "42px", borderRadius: "10px",
      backgroundColor: colors[idx] + "18",
      border: `1.5px solid ${colors[idx]}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: "1.05rem", color: colors[idx], flexShrink: 0
    }}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

// All unique domains for the filter chips
const ALL_DOMAINS_LABEL = "All Domains";

export default function FreeInternshipsPage() {
  const { isAdmin, userRole } = useStudent();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [includeAll, setIncludeAll] = useState(false);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState(ALL_DOMAINS_LABEL);
  const [stipendFilter, setStipendFilter] = useState("All");

  // Admin modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const BLANK_FORM = {
    title: "", organization: "", domain: "Software Engineering",
    description: "", duration: "3 – 6 Months", stipend_type: "Paid Stipend",
    stipend_amount: "₹25,000 / month",
    eligibility: "Currently enrolled B.Tech/BE/MCA/B.Sc students",
    application_deadline: "Rolling / Open Throughout Year",
    official_source: "", apply_url: "", source_url: "",
    free_to_apply: true, verification_status: "Verified Official"
  };
  const [formData, setFormData] = useState(BLANK_FORM);

  useEffect(() => { loadOpportunities(); }, [includeAll, isAdmin]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getFreeInternships(includeAll && isAdmin, userRole);
      if (res?.success) {
        setOpportunities(res.data || []);
      } else {
        setError(res?.error || "Failed to load internship opportunities.");
      }
    } catch (err) {
      setError(err.message || "Unable to reach internship server.");
    } finally {
      setLoading(false);
    }
  };

  // Build unique domain list from current data
  const domainOptions = useMemo(() => {
    const raw = opportunities.map((o) => {
      // Normalise domain to first part (before " & " or ",")
      const d = (o.domain || "").split(/[,&]/)[0].trim();
      if (/ai|ml|machine/i.test(d)) return "AI/ML";
      if (/cloud/i.test(d)) return "Cloud Computing";
      if (/cyber|security/i.test(d)) return "Cybersecurity";
      if (/web|front|full/i.test(d)) return "Web Development";
      if (/data/i.test(d)) return "Data Analytics";
      if (/network/i.test(d)) return "Networking";
      if (/open source/i.test(d)) return "Open Source";
      if (/software/i.test(d)) return "Software Engineering";
      if (/policy|governance|public/i.test(d)) return "Policy & Governance";
      return d || "Other";
    });
    return [ALL_DOMAINS_LABEL, ...Array.from(new Set(raw)).sort()];
  }, [opportunities]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return opportunities.filter((opp) => {
      // search
      if (q) {
        const hay = `${opp.title} ${opp.organization} ${opp.domain} ${opp.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // domain chip
      if (activeDomain !== ALL_DOMAINS_LABEL) {
        const normDom = (() => {
          const d = (opp.domain || "").split(/[,&]/)[0].trim();
          if (/ai|ml|machine/i.test(d)) return "AI/ML";
          if (/cloud/i.test(d)) return "Cloud Computing";
          if (/cyber|security/i.test(d)) return "Cybersecurity";
          if (/web|front|full/i.test(d)) return "Web Development";
          if (/data/i.test(d)) return "Data Analytics";
          if (/network/i.test(d)) return "Networking";
          if (/open source/i.test(d)) return "Open Source";
          if (/software/i.test(d)) return "Software Engineering";
          if (/policy|governance|public/i.test(d)) return "Policy & Governance";
          return d;
        })();
        if (normDom !== activeDomain) return false;
      }
      // stipend filter
      if (stipendFilter !== "All") {
        const isPaid = (opp.stipend_type || "").toLowerCase().includes("paid");
        const isFree = !isPaid;
        if (stipendFilter === "Paid" && !isPaid) return false;
        if (stipendFilter === "Free/Unpaid" && !isFree) return false;
      }
      return true;
    });
  }, [opportunities, searchQuery, activeDomain, stipendFilter]);

  const handleApplyNow = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Admin handlers
  const handleOpenAddModal = () => {
    setEditingItem(null); setFormError(""); setFormData(BLANK_FORM); setIsModalOpen(true);
  };
  const handleOpenEditModal = (opp) => {
    setEditingItem(opp); setFormError("");
    setFormData({
      title: opp.title || "", organization: opp.organization || "",
      domain: opp.domain || "", description: opp.description || "",
      duration: opp.duration || "", stipend_type: opp.stipend_type || "Paid Stipend",
      stipend_amount: opp.stipend_amount || "", eligibility: opp.eligibility || "",
      application_deadline: opp.application_deadline || "",
      official_source: opp.official_source || "",
      apply_url: opp.apply_url || "", source_url: opp.source_url || "",
      free_to_apply: opp.free_to_apply ?? true,
      verification_status: opp.verification_status || "Verified Official"
    });
    setIsModalOpen(true);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.organization.trim() || !formData.apply_url.trim()) {
      setFormError("Title, organisation, and official apply URL are required.");
      return;
    }
    try {
      setFormSubmitting(true); setFormError("");
      if (editingItem) await updateFreeInternship(editingItem.id, formData, "admin");
      else await addFreeInternship(formData, "admin");
      setIsModalOpen(false);
      loadOpportunities();
    } catch (err) {
      setFormError(err.message || "Failed to save opportunity.");
    } finally {
      setFormSubmitting(false);
    }
  };
  const handleToggleActive = async (id) => {
    try { await toggleFreeInternshipActive(id, "admin"); loadOpportunities(); }
    catch (err) { alert("Error: " + err.message); }
  };
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await deleteFreeInternship(id, "admin"); loadOpportunities(); }
    catch (err) { alert("Error: " + err.message); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "50px" }}>

      {/* ── Hero Banner ── */}
      <div style={{
        marginBottom: "22px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #312e81 100%)",
        color: "#fff", padding: "26px 28px", borderRadius: "16px",
        boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.4)",
        border: "1px solid rgba(255,255,255,0.07)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ maxWidth: "780px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
              {[
                { icon: <CheckCircle size={12} />, label: "100% Free Applications • Zero Fees", color: "#34d399" },
                { icon: <ShieldCheck size={12} />, label: "Official Sources Verified", color: "#60a5fa" },
                { icon: <Sparkles size={12} />, label: `${opportunities.length} Active Opportunities`, color: "#f9a8d4" },
              ].map((badge) => (
                <span key={badge.label} style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: "0.73rem", fontWeight: 700, padding: "3px 10px",
                  borderRadius: "20px", backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)", color: badge.color
                }}>
                  {badge.icon} {badge.label}
                </span>
              ))}
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 6px", letterSpacing: "0.2px" }}>
              Free Internship Opportunities
            </h1>
            <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
              Verified, authentic, 100% free internship programmes from Google, Microsoft, Amazon, Infosys, Cisco, IBM, AWS, Forage, Internshala, AICTE and more. Click <strong style={{ color: "#fff" }}>Apply Now</strong> to go directly to the official application page.
            </p>
          </div>
          {isAdmin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
              <button type="button" onClick={handleOpenAddModal}
                className="btn"
                style={{ backgroundColor: "#2563eb", color: "#fff", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, padding: "9px 16px", borderRadius: "8px" }}>
                <Plus size={15} /> Add Opportunity
              </button>
              <label style={{ fontSize: "0.74rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input type="checkbox" checked={includeAll} onChange={(e) => setIncludeAll(e.target.checked)} />
                Show Inactive / Expired
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="card" style={{ marginBottom: "18px", padding: "16px 20px" }}>
        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: "14px" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by internship name, company, or domain…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px 9px 36px", borderRadius: "8px",
              border: "1px solid #e2e8f0", fontSize: "0.88rem", boxSizing: "border-box",
              outline: "none", backgroundColor: "#f8fafc"
            }}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Domain chips + Stipend filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <Filter size={14} color="#64748b" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginRight: "2px" }}>Domain:</span>
          {domainOptions.map((d) => (
            <button key={d} type="button" onClick={() => setActiveDomain(d)}
              style={{
                padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600,
                border: activeDomain === d ? "1.5px solid var(--primary-lavender)" : "1px solid #e2e8f0",
                backgroundColor: activeDomain === d ? "var(--light-lavender)" : "#ffffff",
                color: activeDomain === d ? "var(--primary-lavender)" : "#475569",
                cursor: "pointer", transition: "all 0.12s ease"
              }}>
              {d}
            </button>
          ))}

          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginLeft: "8px" }}>Stipend:</span>
          {["All", "Paid", "Free/Unpaid"].map((s) => (
            <button key={s} type="button" onClick={() => setStipendFilter(s)}
              style={{
                padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600,
                border: stipendFilter === s ? "1.5px solid #059669" : "1px solid #e2e8f0",
                backgroundColor: stipendFilter === s ? "#ecfdf5" : "#ffffff",
                color: stipendFilter === s ? "#059669" : "#475569",
                cursor: "pointer", transition: "all 0.12s ease"
              }}>
              {s}
            </button>
          ))}

          {(searchQuery || activeDomain !== ALL_DOMAINS_LABEL || stipendFilter !== "All") && (
            <button type="button"
              onClick={() => { setSearchQuery(""); setActiveDomain(ALL_DOMAINS_LABEL); setStipendFilter("All"); }}
              style={{ marginLeft: "4px", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", cursor: "pointer" }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Info strip ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 16px", backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "20px",
        fontSize: "0.81rem", color: "#475569"
      }}>
        <Info size={15} color="#2563eb" style={{ flexShrink: 0 }} />
        <span>
          Showing <strong>{filtered.length}</strong> of {opportunities.length} verified opportunities.
          Applications are processed directly on official portals. DATA VISTA never charges fees.
        </span>
        <button type="button" onClick={loadOpportunities} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#2563eb", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 600 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── States ── */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "70px 20px" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>Loading verified opportunities…</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <AlertCircle size={36} color="#dc2626" style={{ margin: "0 auto 10px" }} />
          <h3 style={{ fontSize: "1rem", color: "#991b1b", marginBottom: "6px" }}>Failed to Load Opportunities</h3>
          <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "12px" }}>{error}</p>
          <button type="button" onClick={loadOpportunities} className="btn btn-secondary btn-sm">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Award size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "4px" }}>
            No opportunities match your filters
          </h3>
          <p style={{ fontSize: "0.84rem", color: "#64748b", margin: 0 }}>
            Try clearing filters or searching with a different keyword.
          </p>
        </div>
      ) : (
        /* ── Cards Grid ── */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {filtered.map((opp) => {
            const domStyle = getDomainStyle(opp.domain);
            const hasValidUrl = opp.apply_url && opp.apply_url.startsWith("http");
            return (
              <div key={opp.id} className="card" style={{
                display: "flex", flexDirection: "column", padding: "20px",
                borderRadius: "14px",
                border: opp.is_active ? "1px solid #e8edf4" : "1px dashed #cbd5e1",
                opacity: opp.is_active ? 1 : 0.65,
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.18s ease, transform 0.18s ease",
                position: "relative"
              }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <OrgAvatar name={opp.organization} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.73rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {opp.organization}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px", flexWrap: "wrap" }}>
                        <StipendBadge type={opp.stipend_type} />
                        <span style={{
                          fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px",
                          backgroundColor: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", gap: "3px"
                        }}>
                          <CheckCircle size={10} /> Free Apply
                        </span>
                      </div>
                    </div>
                  </div>

                  {opp.verification_status && (
                    <span style={{
                      fontSize: "0.67rem", fontWeight: 700, padding: "3px 8px", borderRadius: "4px",
                      backgroundColor: "#eff6ff", color: "#1d4ed8", whiteSpace: "nowrap", flexShrink: 0
                    }}>
                      {opp.verification_status}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary-navy)", margin: "0 0 8px", lineHeight: 1.35 }}>
                  {opp.title}
                </h3>

                {/* Domain tag */}
                <div style={{ marginBottom: "10px" }}>
                  <span style={{
                    fontSize: "0.74rem", fontWeight: 600, padding: "3px 9px", borderRadius: "5px",
                    backgroundColor: domStyle.bg, color: domStyle.color, border: `1px solid ${domStyle.border}`
                  }}>
                    {opp.domain}
                  </span>
                </div>

                {/* Description */}
                {opp.description && (
                  <p style={{ fontSize: "0.83rem", color: "#475569", lineHeight: 1.55, margin: "0 0 12px", flexGrow: 1 }}>
                    {opp.description}
                  </p>
                )}

                {/* Meta details */}
                <div style={{
                  backgroundColor: "#f8fafc", borderRadius: "9px", padding: "11px 13px",
                  marginBottom: "14px", display: "flex", flexDirection: "column", gap: "7px", fontSize: "0.81rem"
                }}>
                  {opp.stipend_amount && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "7px" }}>
                      <DollarSign size={14} color="#16a34a" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span><strong style={{ color: "#1e293b" }}>Stipend: </strong>
                        <span style={{ color: "#15803d", fontWeight: 600 }}>{opp.stipend_amount}</span>
                      </span>
                    </div>
                  )}
                  {opp.duration && (
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <Clock size={14} color="#475569" style={{ flexShrink: 0 }} />
                      <span><strong style={{ color: "#1e293b" }}>Duration: </strong>{opp.duration}</span>
                    </div>
                  )}
                  {opp.eligibility && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "7px" }}>
                      <GraduationCap size={14} color="#475569" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span style={{ lineHeight: 1.4 }}><strong style={{ color: "#1e293b" }}>Eligibility: </strong>{opp.eligibility}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                    <Calendar size={14} color="#d97706" style={{ flexShrink: 0 }} />
                    <span><strong style={{ color: "#1e293b" }}>Deadline: </strong></span>
                    <DeadlineBadge deadline={opp.application_deadline} isExpired={opp.is_expired} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <Globe size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                    <span style={{ color: "#2563eb", fontWeight: 500, fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {opp.official_source}
                    </span>
                  </div>
                </div>

                {/* Apply Now button */}
                <div style={{ marginTop: "auto" }}>
                  {hasValidUrl ? (
                    <button
                      type="button"
                      onClick={() => handleApplyNow(opp.apply_url)}
                      style={{
                        width: "100%", padding: "11px 16px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        fontWeight: 700, fontSize: "0.92rem", borderRadius: "9px", cursor: "pointer",
                        background: "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)",
                        color: "#fff", border: "none",
                        boxShadow: "0 3px 10px rgba(37, 99, 235, 0.3)",
                        transition: "opacity 0.15s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      title="Opens official application website in a new tab"
                    >
                      Apply Now
                      <ExternalLink size={15} />
                    </button>
                  ) : (
                    <div style={{
                      width: "100%", padding: "11px 16px", borderRadius: "9px",
                      backgroundColor: "#f1f5f9", color: "#94a3b8",
                      fontWeight: 600, fontSize: "0.88rem", textAlign: "center",
                      border: "1px dashed #cbd5e1", boxSizing: "border-box"
                    }}>
                      <AlertTriangle size={14} style={{ marginRight: "6px" }} />
                      Application Link Unavailable
                    </div>
                  )}

                  <div style={{ textAlign: "center", marginTop: "5px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      Opens official portal in a new tab
                    </span>
                  </div>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9"
                    }}>
                      <button type="button" onClick={() => handleToggleActive(opp.id)}
                        className="btn btn-secondary btn-sm" style={{ fontSize: "0.73rem" }}>
                        {opp.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button type="button" onClick={() => handleOpenEditModal(opp)}
                          className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                          <Edit2 size={12} />
                        </button>
                        <button type="button" onClick={() => handleDelete(opp.id, opp.title)}
                          className="btn btn-secondary btn-sm" style={{ padding: "4px 8px", color: "#dc2626" }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Admin Add / Edit Modal ── */}
      {isModalOpen && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1100, padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#fff", borderRadius: "14px", maxWidth: "640px",
            width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "26px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}>
                {editingItem ? "Edit Opportunity" : "Add Free Internship Opportunity"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fef2f2",
                color: "#b91c1c", fontSize: "0.82rem", marginBottom: "14px", border: "1px solid #fecaca"
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                {[
                  ["Internship Title *", "title", "e.g. Google Summer Internship"],
                  ["Organisation *", "organization", "e.g. Google / ISRO"],
                ].map(([label, key, ph]) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>{label}</label>
                    <input type="text" required placeholder={ph} value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Domain *</label>
                <input type="text" required placeholder="e.g. Data Analytics, AI/ML" value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Short Description</label>
                <textarea rows={2} placeholder="Brief description of the programme…" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box", resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Stipend Type</label>
                  <select value={formData.stipend_type} onChange={(e) => setFormData({ ...formData, stipend_type: e.target.value })}
                    style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}>
                    <option>Paid Stipend</option>
                    <option>Unpaid / Learning & Research</option>
                    <option>Performance Stipend</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Stipend Amount</label>
                  <input type="text" placeholder="e.g. ₹25,000 / month" value={formData.stipend_amount}
                    onChange={(e) => setFormData({ ...formData, stipend_amount: e.target.value })}
                    style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Duration</label>
                  <input type="text" placeholder="e.g. 3 Months" value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Application Deadline</label>
                  <input type="text" placeholder="YYYY-MM-DD or Rolling" value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Eligibility</label>
                <input type="text" placeholder="e.g. B.Tech/BE students with min 7.0 CGPA" value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Official Apply URL * (must start with https://)</label>
                <input type="url" required placeholder="https://careers.example.com/apply" value={formData.apply_url}
                  onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Official Source / Portal Name</label>
                <input type="text" placeholder="e.g. Google Careers Official Portal" value={formData.official_source}
                  onChange={(e) => setFormData({ ...formData, official_source: e.target.value })}
                  style={{ width: "100%", padding: "8px 11px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={formSubmitting} className="btn btn-primary">
                  {formSubmitting ? "Saving…" : editingItem ? "Update Opportunity" : "Add Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
