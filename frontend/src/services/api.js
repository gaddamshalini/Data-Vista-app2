// In production (deployed build), set VITE_API_BASE_URL to the deployed Flask
// backend URL *before* running `npm run build`:
//   Example .env.production:  VITE_API_BASE_URL=https://your-data-vista-api.onrender.com
//
// In development, leave VITE_API_BASE_URL unset. The Vite dev-server proxy
// (configured in vite.config.js) forwards /api/* to http://127.0.0.1:5000,
// so we use a relative path ("") and avoid CORS issues entirely.
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
  : "";
const API_BASE_URL = `${BACKEND_URL}/api`;

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// Student APIs
export const getStudents = () => request("/students");
export const getStudentById = (id) => request(`/students/${encodeURIComponent(id)}`);
export const searchStudents = (q) => request(`/students/search?q=${encodeURIComponent(q)}`);
export const createStudent = (payload) =>
  request("/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const updateStudent = (id, payload) =>
  request(`/students/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const getCatalogOptions = () => request("/students/catalog/options");

// Analytics APIs
export const getPlacementAnalytics = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/analytics/placement${qs ? `?${qs}` : ""}`);
};
export const getJobMarketAnalytics = () => request("/analytics/jobs");
export const getSkillTrends = (skill = "Python") =>
  request(`/analytics/skill-trends?skill=${encodeURIComponent(skill)}`);
export const addCustomSkill = (payload) =>
  request("/analytics/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

// Career & Roadmap APIs
export const getCareers = () => request("/careers");
export const getCareerRecommendations = (studentId) =>
  request(`/careers/recommendations?student_id=${encodeURIComponent(studentId)}`);
export const getSkillGap = (studentId, careerId, role) => {
  let url = `/careers/skill-gap?student_id=${encodeURIComponent(studentId)}`;
  if (careerId) url += `&career_id=${careerId}`;
  if (role) url += `&role=${encodeURIComponent(role)}`;
  return request(url);
};
export const getCareerRoadmap = (studentId, careerId) => {
  let url = `/careers/roadmap?student_id=${encodeURIComponent(studentId)}`;
  if (careerId) url += `&career_id=${careerId}`;
  return request(url);
};

// GitHub Repositories API
export const getGithubRepos = (studentId, username) => {
  let url = studentId ? `/students/${encodeURIComponent(studentId)}/github-repos` : `/students/github-repos`;
  if (username) url += `?username=${encodeURIComponent(username)}`;
  return request(url);
};

// Internship APIs
export const getInternshipAnalytics = () => request("/internships/analytics");
export const getInternshipMatches = (studentId, filters = {}) => {
  const params = new URLSearchParams({ student_id: studentId, ...filters });
  return request(`/internships/match?${params.toString()}`);
};

// Machine Learning Placement Readiness APIs
export const getPlacementReadiness = (studentId) =>
  request(`/ml/predict?student_id=${encodeURIComponent(studentId)}`);
export const predictCustomReadiness = (features) =>
  request("/ml/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features)
  });
export const getModelEvaluationMetrics = () => request("/ml/evaluation-metrics");

// NLP Resume Matcher APIs
export const getSampleJDs = () => request("/nlp/sample-jds");
export const matchResume = (formDataOrJson, isMultipart = false) => {
  const options = {
    method: "POST"
  };
  if (isMultipart) {
    options.body = formDataOrJson;
  } else {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(formDataOrJson);
  }
  return request("/nlp/match", options);
};

// Health Check API
export const checkHealth = () => request("/health");

// Auth APIs
export const loginUser = (payload) =>
  request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

// Resume Builder Persistence APIs
export const getSavedResumes = (studentId) =>
  request(`/resumes/${encodeURIComponent(studentId)}`);
export const saveResume = (studentId, payload) =>
  request(`/resumes/${encodeURIComponent(studentId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const deleteSavedResume = (resumeId) =>
  request(`/resumes/item/${resumeId}`, { method: "DELETE" });

// Technical Skill Assessment APIs
export const getSkillAssessmentList = () => request("/assessments/skills/list");
export const startSkillAssessment = (skill, studentId) =>
  request(`/assessments/skills/start?skill=${encodeURIComponent(skill)}&student_id=${encodeURIComponent(studentId)}`);
export const submitSkillAssessment = (payload) =>
  request("/assessments/skills/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const getSkillAssessmentHistory = (studentId) =>
  request(`/assessments/skills/history/${encodeURIComponent(studentId)}`);

// Aptitude Assessment APIs
export const getAptitudeCategories = () => request("/assessments/aptitude/categories");
export const startAptitudeAssessment = (studentId, category = "all") =>
  request(`/assessments/aptitude/start?student_id=${encodeURIComponent(studentId)}&category=${encodeURIComponent(category)}`);
export const submitAptitudeAssessment = (payload) =>
  request("/assessments/aptitude/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const getAptitudeAssessmentHistory = (studentId) =>
  request(`/assessments/aptitude/history/${encodeURIComponent(studentId)}`);

// Learning Progress Tracker APIs
export const getLearningGoals = (studentId) =>
  request(`/learning/${encodeURIComponent(studentId)}`);
export const addLearningGoal = (studentId, payload) =>
  request(`/learning/${encodeURIComponent(studentId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const updateLearningGoal = (goalId, payload) =>
  request(`/learning/goal/${goalId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const deleteLearningGoal = (goalId) =>
  request(`/learning/goal/${goalId}`, { method: "DELETE" });
export const syncSkillGapGoals = (studentId) =>
  request(`/learning/${encodeURIComponent(studentId)}/sync-skill-gap`, { method: "POST" });

// Student Performance Insights API
export const getStudentInsights = (studentId) =>
  request(`/insights/${encodeURIComponent(studentId)}`);

// Admin APIs (Authenticated via header/param)
export const getAdminMetrics = (role = "admin") =>
  request("/admin/metrics", {
    headers: { "X-User-Role": role }
  });
export const getAdminStudents = (query = "", role = "admin") =>
  request(`/admin/students${query ? `?q=${encodeURIComponent(query)}` : ""}`, {
    headers: { "X-User-Role": role }
  });
export const getAdminStudentDeepDive = (studentId, role = "admin") =>
  request(`/admin/students/${encodeURIComponent(studentId)}`, {
    headers: { "X-User-Role": role }
  });

// Notifications APIs
export const getNotifications = (studentId) =>
  request(`/notifications/${encodeURIComponent(studentId)}`);
export const markNotificationRead = (notifId) =>
  request(`/notifications/item/${notifId}/read`, { method: "PUT" });
export const markAllNotificationsRead = (studentId) =>
  request(`/notifications/${encodeURIComponent(studentId)}/mark-all-read`, { method: "PUT" });
export const deleteNotification = (notifId) =>
  request(`/notifications/item/${notifId}`, { method: "DELETE" });
export const clearAllNotifications = (studentId) =>
  request(`/notifications/${encodeURIComponent(studentId)}/clear`, { method: "DELETE" });

// Free Internship Opportunities APIs
export const getFreeInternships = (includeAll = false, role = "student") => {
  const params = new URLSearchParams();
  if (includeAll) params.append("include_all", "true");
  const qs = params.toString();
  return request(`/free-internships${qs ? `?${qs}` : ""}`, {
    headers: { "X-User-Role": role }
  });
};

export const addFreeInternship = (payload, role = "admin") =>
  request("/free-internships", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Role": role
    },
    body: JSON.stringify(payload)
  });

export const updateFreeInternship = (id, payload, role = "admin") =>
  request(`/free-internships/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Role": role
    },
    body: JSON.stringify(payload)
  });

export const deleteFreeInternship = (id, role = "admin") =>
  request(`/free-internships/${id}`, {
    method: "DELETE",
    headers: { "X-User-Role": role }
  });

export const toggleFreeInternshipActive = (id, role = "admin") =>
  request(`/free-internships/${id}/toggle-active`, {
    method: "PATCH",
    headers: { "X-User-Role": role }
  });

// Student Task Planner APIs
export const getStudentTasks = (studentId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/tasks/${encodeURIComponent(studentId)}${qs ? `?${qs}` : ""}`);
};
export const createStudentTask = (studentId, payload) =>
  request(`/tasks/${encodeURIComponent(studentId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const updateStudentTask = (studentId, taskId, payload) =>
  request(`/tasks/${encodeURIComponent(studentId)}/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const toggleStudentTaskStatus = (studentId, taskId, status) =>
  request(`/tasks/${encodeURIComponent(studentId)}/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
export const deleteStudentTask = (studentId, taskId) =>
  request(`/tasks/${encodeURIComponent(studentId)}/${taskId}`, {
    method: "DELETE"
  });

// Coding Practice Tracker APIs
export const getCodingRecords = (studentId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/coding/${encodeURIComponent(studentId)}${qs ? `?${qs}` : ""}`);
};
export const addCodingRecord = (studentId, payload) =>
  request(`/coding/${encodeURIComponent(studentId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const updateCodingRecord = (studentId, recordId, payload) =>
  request(`/coding/${encodeURIComponent(studentId)}/${recordId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const deleteCodingRecord = (studentId, recordId) =>
  request(`/coding/${encodeURIComponent(studentId)}/${recordId}`, {
    method: "DELETE"
  });

// Mock Interview Practice APIs
export const getInterviewDomains = () => request("/interviews/domains");
export const getInterviewQuestions = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/interviews/questions${qs ? `?${qs}` : ""}`);
};
export const saveInterviewPractice = (studentId, payload) =>
  request(`/interviews/practice/${encodeURIComponent(studentId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
export const getInterviewHistory = (studentId) =>
  request(`/interviews/history/${encodeURIComponent(studentId)}`);

