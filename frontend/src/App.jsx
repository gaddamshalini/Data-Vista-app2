import React, { useState } from "react";
import { StudentProvider, useStudent } from "./context/StudentContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StudentSwitcherModal from "./components/StudentSwitcherModal";
import RegisterStudentModal from "./components/RegisterStudentModal";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import PlacementAnalyticsPage from "./pages/PlacementAnalyticsPage";
import JobMarketPage from "./pages/JobMarketPage";
import SkillTrendsPage from "./pages/SkillTrendsPage";
import CareerRecommendationPage from "./pages/CareerRecommendationPage";
import SkillGapPage from "./pages/SkillGapPage";
import InternshipAnalyticsPage from "./pages/InternshipAnalyticsPage";
import InternshipMatchingPage from "./pages/InternshipMatchingPage";
import FreeInternshipsPage from "./pages/FreeInternshipsPage";
import StudentTaskPlannerPage from "./pages/StudentTaskPlannerPage";
import CodingPracticeTrackerPage from "./pages/CodingPracticeTrackerPage";
import MockInterviewPage from "./pages/MockInterviewPage";
import CareerRoadmapPage from "./pages/CareerRoadmapPage";
import SkillAssessmentPage from "./pages/SkillAssessmentPage";
import AptitudeAssessmentPage from "./pages/AptitudeAssessmentPage";
import LearningProgressPage from "./pages/LearningProgressPage";
import PerformanceInsightsPage from "./pages/PerformanceInsightsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PlacementReadinessPage from "./pages/PlacementReadinessPage";
import ResumeMatcherPage from "./pages/ResumeMatcherPage";

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
          {renderActivePage()}
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
