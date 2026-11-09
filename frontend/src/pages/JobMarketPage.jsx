import React, { useState, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  MapPin,
  Building,
  DollarSign,
  Award,
  Layers,
  BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { getJobMarketAnalytics } from "../services/api";

const PALETTE = ["#1d4ed8", "#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b", "#06b6d4"];

export default function JobMarketPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getJobMarketAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error("Job market load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading real-time job market intelligence...</p>
      </div>
    );
  }

  const summary = data.summary || {
    total_active_jobs: 0,
    avg_market_salary: 0,
    unique_companies: 0,
    unique_roles: 0
  };

  return (
    <div>
      {/* KPI Cards Header */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Active Job Postings</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#eff6ff", color: "var(--brand-blue)" }}>
              <Briefcase size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.total_active_jobs}</div>
          <div className="kpi-subtext">Verified employer listings</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Average Market CTC</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "var(--success)" }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{summary.avg_market_salary} <span style={{ fontSize: "1rem" }}>LPA</span></div>
          <div className="kpi-subtext">Across all monitored roles</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Hiring Companies</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#faf5ff", color: "var(--purple)" }}>
              <Building size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.unique_companies}</div>
          <div className="kpi-subtext">MNCs and tech enterprises</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Distinct Tech Roles</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#fffbeb", color: "var(--warning)" }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.unique_roles}</div>
          <div className="kpi-subtext">Specialized career paths</div>
        </div>
      </div>

      {/* Row 1: Most Demanded Roles & Most Demanded Skills */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Briefcase size={18} color="var(--brand-blue)" /> Most Demanded Job Roles
              </div>
              <div className="card-subtitle">Volume of active open positions by job designation</div>
            </div>
          </div>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_roles || []} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="role" type="category" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val) => [val, "Active Openings"]} />
                <Bar dataKey="count" fill="#1d4ed8" radius={[0, 4, 4, 0]}>
                  {(data.top_roles || []).map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
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
                <TrendingUp size={18} color="var(--brand-blue)" /> Top Demanded Technical Skills
              </div>
              <div className="card-subtitle">Frequency of skill mentions in employer job descriptions</div>
            </div>
          </div>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_skills || []} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="skill" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [val, "Job Postings Requiring Skill"]} />
                <Bar dataKey="postings" fill="#0284c7" radius={[4, 4, 0, 0]}>
                  {(data.top_skills || []).map((_, idx) => (
                    <Cell key={`skill-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Salary by Role & Salary by Skill */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <DollarSign size={18} color="var(--brand-blue)" /> Average Compensation by Role (LPA)
              </div>
              <div className="card-subtitle">Benchmark remuneration packages offered across roles</div>
            </div>
          </div>
          <div style={{ height: "290px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salary_by_role || []} layout="vertical" margin={{ top: 10, right: 20, left: 50, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit=" L" tick={{ fontSize: 11 }} />
                <YAxis dataKey="role" type="category" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val) => [`₹${val} LPA`, "Avg Package"]} />
                <Bar dataKey="avg_salary_lpa" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Award size={18} color="var(--brand-blue)" /> Premium Salaries by Skill (LPA)
              </div>
              <div className="card-subtitle">Skills associated with highest average compensation</div>
            </div>
          </div>
          <div style={{ height: "290px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salary_by_skill || []} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit=" L" tick={{ fontSize: 11 }} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val) => [`₹${val} LPA`, "Avg Skill Package"]} />
                <Bar dataKey="avg_salary_lpa" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Location Demand & Experience Level */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <MapPin size={18} color="var(--brand-blue)" /> Location-Wise Hiring Concentration
              </div>
              <div className="card-subtitle">Geographic distribution of openings</div>
            </div>
          </div>
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.location_demand || []} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="location" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="jobs_count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Layers size={18} color="var(--brand-blue)" /> Experience Level Requirements
              </div>
              <div className="card-subtitle">Entry level vs junior vs mid career job splits</div>
            </div>
          </div>
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.experience_distribution || []} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="experience_level" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
