import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getStudents,
  getStudentById,
  updateStudent as apiUpdateStudent,
  createStudent as apiCreateStudent,
  getCatalogOptions,
  addCustomSkill as apiAddCustomSkill,
  searchStudents as apiSearchStudents,
  checkHealth,
  loginUser,
  restoreSession
} from "../services/api";

export const DEFAULT_BRANCHES = [
  "Computer Science and Engineering (CSE)",
  "CSE (Artificial Intelligence)",
  "CSE (Data Science)",
  "CSE (Cyber Security)",
  "CSE (Technology)",
  "Electrical and Electronics Engineering (EEE)",
  "Mechanical Engineering (Mech)",
  "Electronics and Communication Engineering (ECE)",
  "Civil Engineering (Civil)",
  "CSE (AI & ML)",
  "Other"
];

export const DEFAULT_CAREERS = [
  "Data Analyst",
  "Business Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "Full Stack Developer",
  "Cloud & DevOps Engineer",
  "Software Development Engineer (SDE)"
];

export const DEFAULT_SKILLS = [
  "C", "Java", "Python", "SQL", "Full Stack Development (FSD)", "GitHub",
  "Power BI", "Tableau", "Excel", "Advanced Excel", "Pandas", "NumPy",
  "Scikit-learn", "Statistics", "Machine Learning", "Deep Learning",
  "C++", "JavaScript", "TypeScript", "React", "Node.js", "HTML/CSS",
  "FastAPI", "AWS", "Docker", "Git", "Problem Solving", "Communication"
];

export const DEFAULT_CERTS = [
  "Google Data Analytics Professional Certificate",
  "Microsoft Certified: Power BI Data Analyst Associate",
  "AWS Certified Cloud Practitioner",
  "Meta Front-End Developer Professional Certificate",
  "IBM Data Science Professional Certificate",
  "DeepLearning.AI Machine Learning Specialization"
];

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [activeStudent, setActiveStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  // Always start unauthenticated — session is restored via /api/auth/me on mount
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("student");
  const [currentUser, setCurrentUser] = useState(null);
  const [catalog, setCatalog] = useState({
    skills: DEFAULT_SKILLS.map((s, idx) => ({ id: idx + 1, name: s, category: "Technical", demand_index: 80 })),
    certifications: DEFAULT_CERTS.map((c, idx) => ({ id: idx + 1, name: c, issuing_org: "Certified" })),
    branches: DEFAULT_BRANCHES,
    careers: DEFAULT_CAREERS
  });
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load catalog options (runs always, independent of auth)
  const loadCatalog = async () => {
    try {
      const health = await checkHealth();
      if (health.status === "healthy") setIsBackendConnected(true);
    } catch {
      setIsBackendConnected(false);
    }
    try {
      const catalogRes = await getCatalogOptions();
      if (catalogRes?.success) {
        setCatalog({
          skills: catalogRes.skills?.length > 0
            ? catalogRes.skills
            : DEFAULT_SKILLS.map((s, idx) => ({ id: idx + 1, name: s, category: "Technical", demand_index: 80 })),
          certifications: catalogRes.certifications?.length > 0
            ? catalogRes.certifications
            : DEFAULT_CERTS.map((c, idx) => ({ id: idx + 1, name: c, issuing_org: "Certified" })),
          branches: catalogRes.branches?.length > 0 ? catalogRes.branches : DEFAULT_BRANCHES,
          careers: catalogRes.careers?.length > 0 ? catalogRes.careers : DEFAULT_CAREERS
        });
        setIsBackendConnected(true);
      }
    } catch {
      // keep defaults
    }
  };

  // Initial load: restore session if stored credentials exist, then load catalog
  const init = async () => {
    try {
      setLoading(true);
      setError(null);

      await loadCatalog();

      // Attempt to restore a previous session
      const savedStudentId = localStorage.getItem("datavista_active_student_id");
      const savedRole = localStorage.getItem("datavista_user_role") || "student";

      if (savedStudentId) {
        try {
          const res = await restoreSession({ student_id: savedStudentId, role: savedRole });
          if (res.success) {
            setCurrentUser(res.user);
            setUserRole(res.user.role);
            if (res.student) {
              setActiveStudent(res.student);
            }
            setIsAuthenticated(true);
            setIsBackendConnected(true);
            // Also load all students for admin or switcher features
            if (res.user.role === "admin") {
              const studentsRes = await getStudents().catch(() => ({ success: false, data: [] }));
              if (studentsRes?.success) setAllStudents(studentsRes.data);
            }
            return; // session restored, done
          }
        } catch {
          // Session restore failed — clear stale data and show login
          localStorage.removeItem("datavista_active_student_id");
          localStorage.removeItem("datavista_user_role");
          localStorage.removeItem("datavista_auth_token");
        }
      }

      // No valid session — stay unauthenticated
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Init error:", err);
      setIsBackendConnected(false);
      setError("Backend connection offline. Please launch the backend with 'python app.py' on port 5000.");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  // Select student and save to localStorage
  const selectStudent = (student) => {
    setActiveStudent(student);
    if (student?.student_id) {
      localStorage.setItem("datavista_active_student_id", student.student_id);
    }
  };

  // Switch student by ID (auto-retrieve from DB)
  const switchStudentById = async (studentId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentById(studentId);
      if (res.success && res.data) {
        selectStudent(res.data);
        setIsBackendConnected(true);
        return res.data;
      }
    } catch (err) {
      setError(err.message || `Student ${studentId} not found`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Switch student by ID or Name
  const switchStudentByIdOrName = async (query) => {
    const q = (query || "").trim();
    if (!q) return null;

    // 1. Check local loaded students — by ID, name, or email
    const localMatch = allStudents.find(
      (s) =>
        s.student_id.toLowerCase() === q.toLowerCase() ||
        s.name.toLowerCase() === q.toLowerCase() ||
        (s.email && s.email.toLowerCase() === q.toLowerCase()) ||
        (s.personal_email && s.personal_email.toLowerCase() === q.toLowerCase()) ||
        (s.college_email && s.college_email.toLowerCase() === q.toLowerCase())
    ) || allStudents.find(
      (s) =>
        s.student_id.toLowerCase().includes(q.toLowerCase()) ||
        s.name.toLowerCase().includes(q.toLowerCase())
    );

    if (localMatch) {
      selectStudent(localMatch);
      return localMatch;
    }

    // 2. Query backend search endpoint
    try {
      setLoading(true);
      const searchRes = await apiSearchStudents(q);
      if (searchRes?.success && searchRes.data?.length > 0) {
        const found = searchRes.data[0];
        selectStudent(found);
        setIsBackendConnected(true);
        return found;
      }

      // 3. Fallback to direct ID get
      const idRes = await getStudentById(q.toUpperCase());
      if (idRes?.success && idRes.data) {
        selectStudent(idRes.data);
        setIsBackendConnected(true);
        return idRes.data;
      }
    } catch (err) {
      console.warn("Search lookup failed:", err);
    } finally {
      setLoading(false);
    }

    throw new Error(`No student found matching "${q}"`);
  };

  // Refresh active student from backend
  const refreshActiveStudent = async () => {
    if (!activeStudent?.student_id) return;
    try {
      const res = await getStudentById(activeStudent.student_id);
      if (res.success && res.data) {
        setActiveStudent(res.data);
        setAllStudents((prev) =>
          prev.map((s) => (s.student_id === res.data.student_id ? res.data : s))
        );
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  // Update existing student profile
  const saveStudentProfile = async (updatedData) => {
    if (!activeStudent?.student_id) return;
    try {
      setLoading(true);
      const res = await apiUpdateStudent(activeStudent.student_id, updatedData);
      if (res.success && res.data) {
        setActiveStudent(res.data);
        setAllStudents((prev) =>
          prev.map((s) => (s.student_id === res.data.student_id ? res.data : s))
        );
        setIsBackendConnected(true);
        return res.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register new student profile
  const registerStudent = async (newStudentData) => {
    try {
      setLoading(true);
      const res = await apiCreateStudent(newStudentData);
      if (res.success && res.data) {
        selectStudent(res.data);
        setAllStudents((prev) => [res.data, ...prev]);
        setIsBackendConnected(true);
        return res.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add custom skill to catalog and state
  const addNewSkill = async (skillData) => {
    try {
      const res = await apiAddCustomSkill(skillData);
      if (res.success && res.data) {
        setCatalog((prev) => {
          const exists = prev.skills.some(
            (s) => s.name.toLowerCase() === res.data.name.toLowerCase()
          );
          if (exists) return prev;
          return {
            ...prev,
            skills: [...prev.skills, res.data]
          };
        });
        return res.data;
      }
    } catch (err) {
      throw err;
    }
  };

  // Authentication Login — strictly validates against backend
  const login = async (identifier, password, role = "student") => {
    const q = (identifier || "").trim();
    if (!q) {
      throw new Error(
        role === "admin"
          ? "Please enter your Admin username."
          : "Please enter your Student ID or registered email."
      );
    }
    if (!password || !password.trim()) {
      throw new Error("Password is required.");
    }

    try {
      setLoading(true);

      // Validate credentials on backend — this is the single source of truth
      const authRes = await loginUser({ username: q, password: password.trim(), role });

      if (!authRes.success) {
        throw new Error(authRes.error || "Authentication failed.");
      }

      // Backend returned a valid user + student profile
      const user = authRes.user;
      const studentData = authRes.student;

      setCurrentUser(user);
      setUserRole(user.role);

      if (user.role === "student" && studentData) {
        setActiveStudent(studentData);
        localStorage.setItem("datavista_active_student_id", studentData.student_id);
      } else if (user.role === "admin") {
        // Load all students for admin view
        const studentsRes = await getStudents().catch(() => ({ success: false, data: [] }));
        if (studentsRes?.success) setAllStudents(studentsRes.data);
        localStorage.setItem("datavista_active_student_id", user.username);
      }

      localStorage.setItem("datavista_user_role", user.role);
      localStorage.setItem("datavista_auth_token", `dv_${user.role}_${user.username}_${Date.now()}`);

      setIsAuthenticated(true);
      setIsBackendConnected(true);

      return user.role === "student" ? studentData : user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Authentication Logout — clears session but preserves account/profile data in DB
  const logout = () => {
    // Fire-and-forget logout activity log
    if (activeStudent?.student_id) {
      const apiBase = import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
        : "";
      fetch(`${apiBase}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: activeStudent.student_id })
      }).catch(() => {});
    }
    // Clear all session identifiers
    localStorage.removeItem("datavista_active_student_id");
    localStorage.removeItem("datavista_auth_token");
    localStorage.removeItem("datavista_user_role");
    // Clear in-memory state
    setUserRole("student");
    setCurrentUser(null);
    setActiveStudent(null);
    setAllStudents([]);
    setIsAuthenticated(false);
  };

  return (
    <StudentContext.Provider
      value={{
        activeStudent,
        allStudents,
        catalog,
        isBackendConnected,
        loading,
        error,
        setError,
        selectStudent,
        switchStudentById,
        switchStudentByIdOrName,
        searchStudents: apiSearchStudents,
        refreshActiveStudent,
        saveStudentProfile,
        registerStudent,
        addNewSkill,
        retryConnection: init,
        isAuthenticated,
        userRole,
        isAdmin: userRole === "admin",
        currentUser,
        login,
        logout
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}
