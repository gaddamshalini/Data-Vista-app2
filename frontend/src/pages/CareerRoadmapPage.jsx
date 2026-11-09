import React, { useState, useEffect } from "react";
import {
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Sparkles,
  Layers,
  Award,
  BookOpen
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { getCareerRoadmap, getCareers } from "../services/api";

export default function CareerRoadmapPage({ selectedCareerId, setSelectedCareerId }) {
  const { activeStudent } = useStudent();
  const [careersList, setCareersList] = useState([]);
  const [activeCareerId, setActiveCareerId] = useState(selectedCareerId || null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load careers
  useEffect(() => {
    async function loadCareers() {
      try {
        const res = await getCareers();
        if (res.success) {
          setCareersList(res.data);
          if (!activeCareerId && res.data.length > 0) {
            const matched = res.data.find(
              (c) => c.title.toLowerCase() === (activeStudent?.preferred_career || "").toLowerCase()
            );
            setActiveCareerId(matched ? matched.id : res.data[0].id);
          }
        }
      } catch (err) {
        console.error("Roadmap careers list error:", err);
      }
    }
    loadCareers();
  }, [activeStudent]);

  // Load roadmap data
  useEffect(() => {
    async function fetchRoadmap() {
      if (!activeStudent?.student_id || !activeCareerId) return;
      try {
        setLoading(true);
        const res = await getCareerRoadmap(activeStudent.student_id, activeCareerId);
        if (res.success) {
          setRoadmapData(res);
        }
      } catch (err) {
        console.error("Roadmap fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmap();
  }, [activeStudent, activeCareerId]);

  if (loading && !roadmapData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Synthesizing personalized phased career roadmap for {activeStudent?.name}...</p>
      </div>
    );
  }

  const steps = roadmapData?.roadmap_steps || [];

  return (
    <div>
      {/* Target Selector Header */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={22} color="var(--brand-blue)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                Personalized Career Roadmap
              </h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Actionable phased learning milestones customized for <strong>{activeStudent.name}</strong> based on current skill gaps
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
              Target Milestone:
            </label>
            <select
              value={activeCareerId || ""}
              onChange={(e) => {
                const id = parseInt(e.target.value, 10);
                setActiveCareerId(id);
                if (setSelectedCareerId) setSelectedCareerId(id);
              }}
              className="form-select"
              style={{ width: "230px", fontWeight: 600 }}
            >
              {careersList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Target Role Milestone Banner */}
      <div
        className="card"
        style={{
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--brand-blue)" }}>
            GOAL TRACKING
          </div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-navy)" }}>
            TARGET ROLE: {roadmapData?.target_career}
          </h3>
          <p style={{ fontSize: "0.84rem", color: "#1e40af", marginTop: "2px" }}>
            Domain: {roadmapData?.domain} • {roadmapData?.total_steps} Strategic Milestones
          </p>
        </div>

        <span className="badge badge-blue" style={{ fontSize: "0.82rem", padding: "6px 14px" }}>
          <Sparkles size={14} /> Tailored to Your Profile
        </span>
      </div>

      {/* Visual Step-by-Step Timeline Roadmap */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", paddingLeft: "10px" }}>
        {steps.map((st, idx) => {
          const isFirst = idx === 0;
          return (
            <div
              key={st.step}
              className="card"
              style={{
                margin: 0,
                padding: "22px 24px",
                borderLeft: isFirst ? "4px solid var(--brand-blue)" : "4px solid var(--border-subtle)",
                backgroundColor: isFirst ? "#ffffff" : "#ffffff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: isFirst ? "var(--brand-blue)" : "var(--bg-subtle)",
                      color: isFirst ? "#ffffff" : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.88rem"
                    }}
                  >
                    {st.step}
                  </div>
                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: isFirst ? "var(--brand-blue)" : "var(--text-muted)" }}>
                      Phase {st.step}: {st.phase}
                    </span>
                    <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                      {st.title}
                    </h4>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={13} /> {st.duration}
                  </span>
                  <span className={isFirst ? "badge badge-blue" : "badge badge-gray"}>
                    {st.status}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "0.86rem", color: "var(--text-main)", marginLeft: "44px" }}>
                {st.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
