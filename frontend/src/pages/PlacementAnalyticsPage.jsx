import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Filter,
  TrendingUp,
  Building,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getPlacementAnalytics } from "../services/api";

const COLORS = ["#1d4ed8", "#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

export default function PlacementAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [minCgpa, setMinCgpa] = useState("");
  const [maxCgpa, setMaxCgpa] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedBranch !== "All") params.branch = selectedBranch;
      if (selectedYear !== "All") params.year = selectedYear;
      if (selectedCompany !== "All") params.company = selectedCompany;
      if (minCgpa) params.min_cgpa = minCgpa;
      if (maxCgpa) params.max_cgpa = maxCgpa;

      const res = await getPlacementAnalytics(params);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load placement analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedBranch, selectedYear, selectedCompany]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    setSelectedBranch("All");
    setSelectedYear("All");
    setSelectedCompany("All");
    setMinCgpa("");
    setMaxCgpa("");
  };

  if (loading && !data) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading placement intelligence & analytics records...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    total_students: 0,
    placed_count: 0,
    placement_rate_pct: 0,
    avg_salary_lpa: 0,
    highest_salary_lpa: 0
  };

  const filters = data?.filters || { branches: [], years: [], companies: [] };

  return (
    <div>
      {/* Interactive Filter Bar */}
      <div className="card" style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.95rem", color: "var(--primary-navy)" }}>
            <Filter size={18} color="var(--brand-blue)" /> Interactive Placement Filters
          </div>
          <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
            Reset Filters
          </button>
        </div>

        <form onSubmit={handleApplyFilter} style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label className="form-label">Branch / Department</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="form-select"
            >
              <option value="All">All Departments</option>
              {filters.branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div style={{ width: "130px" }}>
            <label className="form-label">Graduation Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="form-select"
            >
              <option value="All">All Years</option>
              {filters.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "160px" }}>
            <label className="form-label">Recruiting Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="form-select"
            >
              <option value="All">All Companies</option>
              {filters.companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ width: "100px" }}>
            <label className="form-label">Min CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 7.0"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ width: "100px" }}>
            <label className="form-label">Max CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 9.5"
              value={maxCgpa}
              onChange={(e) => setMaxCgpa(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ height: "38px" }}>
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Filtered Students</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#eff6ff", color: "var(--brand-blue)" }}>
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.total_students}</div>
          <div className="kpi-subtext">Students in selected subset</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Placement Percentage</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "var(--success)" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>
            {summary.placement_rate_pct}%
          </div>
          <div className="kpi-subtext">{summary.placed_count} of {summary.total_students} Placed</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Average Salary</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#fffbeb", color: "var(--warning)" }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{summary.avg_salary_lpa} <span style={{ fontSize: "1rem" }}>LPA</span></div>
          <div className="kpi-subtext">Mean CTC offered</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Highest Package</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#faf5ff", color: "var(--purple)" }}>
              <Building size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--purple)" }}>
            ₹{summary.highest_salary_lpa} <span style={{ fontSize: "1rem" }}>LPA</span>
          </div>
          <div className="kpi-subtext">Peak tier campus offer</div>
        </div>
      </div>

      {/* Charts Row 1: Dept-wise Placement & Year-wise Trends */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <BarChart3 size={18} color="var(--brand-blue)" /> Department-Wise Placement Rate (%)
              </div>
              <div className="card-subtitle">Placement conversion by academic discipline</div>
            </div>
          </div>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.department_wise || []} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="branch" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, "Placement Rate"]} />
                <Bar dataKey="placement_pct" fill="#1d4ed8" radius={[4, 4, 0, 0]}>
                  {(data?.department_wise || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} color="var(--brand-blue)" /> Year-Wise Placement & Salary Trends
              </div>
              <div className="card-subtitle">Historical cohort performance trajectory</div>
            </div>
          </div>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.year_wise || []} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" unit="L" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="placement_pct" name="Placement Rate (%)" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="avg_salary" name="Avg CTC (LPA)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Company Hiring & Salary Distribution */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Building size={18} color="var(--brand-blue)" /> Top Recruiting Companies
              </div>
              <div className="card-subtitle">Volume of campus hires and avg CTC per firm</div>
            </div>
          </div>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.company_hiring || []} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="company" type="category" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => [value, name === "hired" ? "Offers" : "Avg LPA"]} />
                <Bar dataKey="hired" name="Offers Extended" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <PieIcon size={18} color="var(--brand-blue)" /> Salary Distribution (LPA Bins)
              </div>
              <div className="card-subtitle">Offer distribution across compensation tiers</div>
            </div>
          </div>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.salary_distribution || []} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Hired Students" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {(data?.salary_distribution || []).map((_, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3: Correlations (CGPA, Internship, Certification vs Placement) */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <BarChart3 size={18} color="var(--brand-blue)" /> Placement Predictor Correlations
            </div>
            <div className="card-subtitle">
              Evaluating the empirical impact of CGPA, Internships, and Certifications on placement conversion
            </div>
          </div>
        </div>

        <div className="grid-3">
          {/* CGPA vs Placement */}
          <div>
            <h4 style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px", textAlign: "center" }}>
              CGPA Range vs Placement %
            </h4>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.cgpa_vs_placement || []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="cgpa_bucket" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val) => [`${val}%`, "Placement Rate"]} />
                  <Bar dataKey="placement_pct" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Internship vs Placement */}
          <div>
            <h4 style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px", textAlign: "center" }}>
              Internship Months vs Placement %
            </h4>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.internship_vs_placement || []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="internship_bucket" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val) => [`${val}%`, "Placement Rate"]} />
                  <Bar dataKey="placement_pct" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Certifications vs Placement */}
          <div>
            <h4 style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "8px", textAlign: "center" }}>
              Certifications vs Placement %
            </h4>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.cert_vs_placement || []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="cert_bucket" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val) => [`${val}%`, "Placement Rate"]} />
                  <Bar dataKey="placement_pct" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
