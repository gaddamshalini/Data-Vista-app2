import React, { useState } from "react";
import { Search, X, Check, User, ArrowRight } from "lucide-react";
import { useStudent } from "../context/StudentContext";

export default function StudentSwitcherModal({ isOpen, onClose }) {
  const { allStudents, activeStudent, selectStudent } = useStudent();
  const [filterQuery, setFilterQuery] = useState("");

  if (!isOpen) return null;

  const filtered = allStudents.filter((s) => {
    const q = filterQuery.toLowerCase();
    return (
      s.student_id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q)
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary-navy)" }}>
              Switch Active Student Profile
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Select a student to synchronize all analytics, career matchings, and predictions.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search by ID, Name or Department..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "34px" }}
            autoFocus
          />
          <Search size={16} style={{ position: "absolute", left: "11px", top: "12px", color: "var(--text-dim)" }} />
        </div>

        {/* Students List */}
        <div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--text-dim)", fontSize: "0.85rem" }}>
              No students found matching "{filterQuery}"
            </div>
          ) : (
            filtered.map((s) => {
              const isSelected = activeStudent?.student_id === s.student_id;
              return (
                <div
                  key={s.student_id}
                  onClick={() => {
                    selectStudent(s);
                    onClose();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: isSelected ? "2px solid var(--brand-blue)" : "1px solid var(--border-subtle)",
                    backgroundColor: isSelected ? "var(--brand-blue-light)" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: isSelected ? "var(--brand-blue)" : "var(--bg-subtle)",
                        color: isSelected ? "#ffffff" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        overflow: "hidden",
                        flexShrink: 0
                      }}
                    >
                      {s.profile_photo ? (
                        <img
                          src={s.profile_photo}
                          alt={s.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        s.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary-navy)" }}>
                        {s.name} <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--brand-blue)" }}>({s.student_id})</span>
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                        {s.branch} • CGPA: {s.cgpa} • {s.skills?.length || 0} Skills
                      </div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="badge badge-blue">
                        <Check size={12} /> Active
                      </span>
                    ) : (
                      <button className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                        Select <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
