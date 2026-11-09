import React, { useState, useEffect } from "react";
import {
  Award,
  DollarSign,
  Briefcase,
  MapPin,
  Building,
  CheckCircle2,
  PieChart as PieIcon,
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
import { getInternshipAnalytics } from "../services/api";

const COLORS = ["#1d4ed8", "#10b981", "#f59e0b", "#8b5cf6", "#0284c7", "#ec4899", "#64748b"];

export default function InternshipAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getInternshipAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error("Internship analytics load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading internship market intelligence...</p>
      </div>
    );
  }

  const summary = data.summary || {
    total_internships: 0,
    avg_stipend: 0,
    highest_stipend: 0,
    companies_offering: 0,
    remote_percentage: 0
  };

  return (
    <div>
      {/* Summary KPI Strip */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Active Internships</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#eff6ff", color: "var(--brand-blue)" }}>
              <Briefcase size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.total_internships}</div>
          <div className="kpi-subtext">Verified hiring cohorts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Average Monthly Stipend</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "var(--success)" }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{Number(summary.avg_stipend).toLocaleString()}</div>
          <div className="kpi-subtext">Monthly compensation</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Peak Stipend</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#faf5ff", color: "var(--purple)" }}>
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--purple)" }}>
            ₹{Number(summary.highest_stipend).toLocaleString()}
          </div>
          <div className="kpi-subtext">Top tier technology stipend</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Remote / Flexible</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: "#fffbeb", color: "var(--warning)" }}>
              <Building size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.remote_percentage}%</div>
          <div className="kpi-subtext">100% remote positions</div>
        </div>
      </div>

      {/* Charts Row 1: Common Roles & Demanded Skills */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Briefcase size={18} color="var(--brand-blue)" /> Most Common Internship Roles
              </div>
              <div className="card-subtitle">Volume of openings across internship specializations</div>
            </div>
          </div>
          <div style={{ height: "290px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_roles || []} layout="vertical" margin={{ top: 10, right: 20, left: 50, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="role" type="category" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Openings" fill="#1d4ed8" radius={[0, 4, 4, 0]}>
                  {(data.top_roles || []).map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
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
                <BarChart3 size={18} color="var(--brand-blue)" /> Demanded Internship Skills
              </div>
              <div className="card-subtitle">Technical skills most frequently required for student interns</div>
            </div>
          </div>
          <div style={{ height: "290px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.demanded_skills || []} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="skill" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Cohort Requirements" fill="#0284c7" radius={[4, 4, 0, 0]}>
                  {(data.demanded_skills || []).map((_, idx) => (
                    <Cell key={`cell-skill-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Location Distribution & Work Mode Breakdown */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <MapPin size={18} color="var(--brand-blue)" /> Location-Wise Internship Availability
              </div>
              <div className="card-subtitle">Major tech clusters offering internships</div>
            </div>
          </div>
          <div style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.location_wise || []} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="location" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <PieIcon size={18} color="var(--brand-blue)" /> Work Mode Flexibility (Remote vs On-Site vs Hybrid)
              </div>
              <div className="card-subtitle">Work arrangement breakdowns</div>
            </div>
          </div>
          <div style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.work_mode_breakdown || []}
                  dataKey="count"
                  nameKey="work_mode"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(data.work_mode_breakdown || []).map((_, idx) => (
                    <Cell key={`mode-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
