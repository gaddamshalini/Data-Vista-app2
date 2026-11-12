import React, { useState, Suspense, lazy } from "react";
import { StudentProvider, useStudent } from "./context/StudentContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StudentSwitcherModal from "./components/StudentSwitcherModal";
import RegisterStudentModal from "./components/RegisterStudentModal";
import LoginPage from "./pages/LoginPage";

// Lazy-load all pages — only downloaded when first visited
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ResumeBuilderPage = lazy(() => import("./pages/ResumeBuilderPage"));
const PlacementAnalyticsPage = lazy(() => import("./pages/PlacementAnalyticsPage"));
const JobMarketPage = lazy(() => import("./pages/JobMarketPage"));
const SkillTrendsPage = lazy(() => import("./pages/SkillTrendsPage"));
const CareerRecommendationPage = lazy(() => import("./pages/CareerRecommendationPage"));
const SkillGapPage = lazy(() => import("./pages/SkillGapPage"));
const InternshipAnalyticsPage = lazy(() => import("./pages/InternshipAnalyticsPage"));
const InternshipMatchingPage = lazy(() => import("./pages/InternshipMatchingPage"));
const FreeInternshipsPage = lazy(() => import("./pages/FreeInternshipsPage"));
const StudentTaskPlannerPage = lazy(() => import("./pages/StudentTaskPlannerPage"));
const CodingPracticeTrackerPage = lazy(() => import("./pages/CodingPracticeTrackerPage"));
const MockInterviewPage = lazy(() => import("./pages/MockInterviewPage"));
const CareerRoadmapPage = lazy(() => import("./pages/CareerRoadmapPage"));
const SkillAssessmentPage = lazy(() => import("./pages/SkillAssessmentPage"));
const AptitudeAssessmentPage = lazy(() => import("./pages/AptitudeAssessmentPage"));
const LearningProgressPage = lazy(() => import("./pages/LearningProgressPage"));
const PerformanceInsightsPage = lazy(() => import("./pages/PerformanceInsightsPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const PlacementReadinessPage = lazy(() => import("./pages/PlacementReadinessPage"));
const ResumeMatcherPage = lazy(() => import("./pages/ResumeMatcherPage"));

// Simple fallback shown while a page chunk is loading
const PageLoader = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "60vh", flexDirection: "column", gap: "12px", color: "#7563A8"
  }}>
    <div style={{
      width: "36px", height: "36px", border: "3px solid #E6E1EF",
      borderTop: "3px solid #7563A8", borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Loading...</span>
  </div>
);

function MainAppContent() {
  const { isAuthenticated } = useStudent();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not authenticated, prevent access to protected platform pages
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onOpenRegister={() => setIsRegisterOpen(true)} />
        <RegisterStudentModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      </>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage setActiveTab={setActiveTab} />;
      case "profile":
        return <ProfilePage />;
      case "resume_builder":
        return <ResumeBuilderPage />;
      case "placement_analytics":
        return <PlacementAnalyticsPage />;
      case "job_market":
        return <JobMarketPage />;
      case "skill_trends":
        return <SkillTrendsPage />;
      case "career_recommendation":
        return (
          <CareerRecommendationPage
            setActiveTab={setActiveTab}
            setSelectedCareerId={setSelectedCareerId}
          />
        );
      case "skill_gap":
        return (
          <SkillGapPage
            selectedCareerId={selectedCareerId}
            setSelectedCareerId={setSelectedCareerId}
            setActiveTab={setActiveTab}
          />
        );
      case "career_roadmap":
        return (
          <CareerRoadmapPage
            selectedCareerId={selectedCareerId}
            setSelectedCareerId={setSelectedCareerId}
          />
        );
      case "internship_analytics":
        return <InternshipAnalyticsPage />;
      case "internship_matching":
        return <InternshipMatchingPage />;
      case "free_internships":
        return <FreeInternshipsPage />;
      case "task_planner":
      case "tasks":
        return <StudentTaskPlannerPage setActiveTab={setActiveTab} />;
      case "coding_tracker":
        return <CodingPracticeTrackerPage setActiveTab={setActiveTab} />;
      case "mock_interview":
        return <MockInterviewPage setActiveTab={setActiveTab} />;
      case "skill_assessment":
        return <SkillAssessmentPage />;
      case "aptitude_assessment":
        return <AptitudeAssessmentPage />;
      case "learning_progress":
        return <LearningProgressPage />;
      case "performance_insights":
        return <PerformanceInsightsPage onNavigateTab={setActiveTab} />;
      case "admin_dashboard":
        return <AdminDashboardPage />;
      case "placement_readiness":
        return <PlacementReadinessPage />;
      case "resume_matcher":
        return <ResumeMatcherPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSwitcher={() => setIsSwitcherOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenSwitcher={() => setIsSwitcherOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="content-body">
          <Suspense fallback={<PageLoader />}>
            {renderActivePage()}
          </Suspense>
        </main>
      </div>

      {/* Global Modals */}
      <StudentSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      <RegisterStudentModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudentProvider>
      <MainAppContent />
    </StudentProvider>
  );
}
