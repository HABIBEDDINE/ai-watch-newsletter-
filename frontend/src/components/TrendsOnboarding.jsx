import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const ROLES = [
  {
    id: "cto",
    icon: "🏢",
    title: "CTO / Tech Leader",
    description: "Tech strategy, architecture & infrastructure",
  },
  {
    id: "innovation_manager",
    icon: "💡",
    title: "Innovation Manager",
    description: "Use case discovery & emerging tech scouting",
  },
  {
    id: "strategy_director",
    icon: "📊",
    title: "Strategy Director",
    description: "Market positioning & transformation roadmaps",
  },
  {
    id: "other",
    icon: "👤",
    title: "Other / General",
    description: "General AI news & customise freely",
  },
];

const TOPICS = [
  { id: "llm_models", label: "LLM Models", icon: "🧠" },
  { id: "dev_tools", label: "Dev & Coding AI", icon: "💻" },
  { id: "ai_agents", label: "AI Agents", icon: "🤖" },
  { id: "open_source", label: "Open Source AI", icon: "🔓" },
  { id: "ai_infrastructure", label: "AI Infrastructure", icon: "⚙️" },
  { id: "enterprise_apps", label: "Enterprise AI Apps", icon: "🏢" },
];

const ROLE_DEFAULT_TOPICS = {
  cto: ["llm_models", "ai_infrastructure", "enterprise_apps"],
  innovation_manager: ["ai_agents", "llm_models", "dev_tools"],
  strategy_director: ["enterprise_apps", "llm_models", "ai_agents"],
  other: ["llm_models", "ai_agents"],
};

export default function TrendsOnboarding({ onComplete, onSkip }) {
  const { user, updateUser } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setSelectedTopics(ROLE_DEFAULT_TOPICS[roleId] || []);
  };

  const handleTopicToggle = (topicId) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((t) => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleGetStarted = async () => {
    setLoading(true);

    // Try to save to backend, but don't block on failure
    try {
      const { completeOnboarding } = await import("../services/api");
      await completeOnboarding(selectedRole, selectedTopics);
    } catch (e) {
      console.warn("Could not save to server, using localStorage:", e);
    }

    // Always save to localStorage as reliable fallback
    const userId = user?.user_id || "guest";
    localStorage.setItem(`trends_onboarding_${userId}`, "completed");
    localStorage.setItem(`user_role_${userId}`, selectedRole);
    localStorage.setItem(`user_topics_${userId}`, JSON.stringify(selectedTopics));

    // Update context
    if (updateUser) {
      updateUser({
        role: selectedRole,
        trend_topics: selectedTopics,
        onboarding_completed: true,
      });
    }

    setLoading(false);
    onComplete({ role: selectedRole, topics: selectedTopics });
  };

  const handleSkip = () => {
    const userId = user?.user_id || "guest";
    localStorage.setItem(`trends_onboarding_${userId}`, "skipped");
    onSkip();
  };

  return (
    <div style={styles.overlay}>
      <div style={{
        ...styles.modal,
        padding: isMobile ? "24px 20px" : "32px 40px",
        maxWidth: isMobile ? "95%" : 580,
      }}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={{ ...styles.title, fontSize: isMobile ? 20 : 24 }}>Personalise Your AI Trends</h2>
          <p style={{ ...styles.subtitle, fontSize: isMobile ? 13 : 14 }}>
            {step === 1
              ? "Tell us your role so we can surface the trends that matter most."
              : "Select the topics you want in your daily trend feed."}
          </p>
        </div>

        {/* Step indicator */}
        <div style={styles.stepIndicator}>
          <div style={{ ...styles.stepDot, ...(step >= 1 ? styles.stepDotActive : {}), width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, fontSize: isMobile ? 12 : 14 }}>1</div>
          <div style={{ ...styles.stepLine, background: step > 1 ? "var(--accent)" : "var(--border)", width: isMobile ? 40 : 60 }} />
          <div style={{ ...styles.stepDot, ...(step >= 2 ? styles.stepDotActive : {}), width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, fontSize: isMobile ? 12 : 14 }}>2</div>
        </div>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)" }}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{
                    ...styles.card,
                    border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: isSelected ? "var(--accent-dim)" : "var(--card-bg)",
                  }}
                >
                  <span style={styles.cardIcon}>{role.icon}</span>
                  <div style={{
                    ...styles.cardTitle,
                    color: isSelected ? "var(--accent)" : "var(--text-primary)",
                  }}>
                    {role.title}
                  </div>
                  <div style={styles.cardDesc}>{role.description}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Topic selection */}
        {step === 2 && (
          <div style={{ ...styles.topicsGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)" }}>
            {TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicToggle(topic.id)}
                  style={{
                    ...styles.topicCard,
                    border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: isSelected ? "var(--accent-dim)" : "var(--card-bg)",
                    padding: isMobile ? "10px 14px" : "12px 16px",
                  }}
                >
                  <span style={styles.topicIcon}>{topic.icon}</span>
                  <span style={{
                    ...styles.topicLabel,
                    color: isSelected ? "var(--accent)" : "var(--text-primary)",
                    fontWeight: isSelected ? 600 : 400,
                  }}>
                    {topic.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{
          ...styles.actions,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 10 : 12,
        }}>
          {isMobile ? (
            <>
              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedRole}
                  style={{
                    ...styles.nextBtn,
                    width: "100%",
                    background: selectedRole ? "var(--accent)" : "var(--border)",
                    color: selectedRole ? "#fff" : "var(--text-muted)",
                    cursor: selectedRole ? "pointer" : "not-allowed",
                  }}
                >
                  Continue →
                </button>
              ) : (
                <>
                  <button
                    onClick={handleGetStarted}
                    disabled={selectedTopics.length === 0 || loading}
                    style={{
                      ...styles.nextBtn,
                      width: "100%",
                      background: selectedTopics.length > 0 ? "#E35B1A" : "var(--border)",
                      color: selectedTopics.length > 0 ? "#fff" : "var(--text-muted)",
                      cursor: selectedTopics.length > 0 && !loading ? "pointer" : "not-allowed",
                    }}
                  >
                    {loading ? "Setting up..." : "Get Started →"}
                  </button>
                  <button style={{ ...styles.backBtn, width: "100%" }} onClick={() => setStep(1)}>
                    ← Back
                  </button>
                </>
              )}
              <button style={{ ...styles.skipBtn, marginRight: 0, textAlign: "center" }} onClick={handleSkip}>
                Skip for now
              </button>
            </>
          ) : (
            <>
              <button style={styles.skipBtn} onClick={handleSkip}>
                Skip for now
              </button>

              {step === 2 && (
                <button style={styles.backBtn} onClick={() => setStep(1)}>
                  ← Back
                </button>
              )}

              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedRole}
                  style={{
                    ...styles.nextBtn,
                    background: selectedRole ? "var(--accent)" : "var(--border)",
                    color: selectedRole ? "#fff" : "var(--text-muted)",
                    cursor: selectedRole ? "pointer" : "not-allowed",
                  }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleGetStarted}
                  disabled={selectedTopics.length === 0 || loading}
                  style={{
                    ...styles.nextBtn,
                    background: selectedTopics.length > 0 ? "#E35B1A" : "var(--border)",
                    color: selectedTopics.length > 0 ? "#fff" : "var(--text-muted)",
                    cursor: selectedTopics.length > 0 && !loading ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? "Setting up..." : "Get Started →"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "var(--card-bg)",
    borderRadius: 16,
    padding: "32px 40px",
    maxWidth: 580,
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    border: "1px solid var(--border)",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: "var(--text-secondary)",
    marginTop: 8,
  },
  stepIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "var(--border)",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
  },
  stepDotActive: {
    background: "var(--accent)",
    color: "#fff",
  },
  stepLine: {
    width: 60,
    height: 2,
    background: "var(--border)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    padding: 18,
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
  },
  cardIcon: {
    fontSize: 28,
    display: "block",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },
  topicsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    marginBottom: 24,
  },
  topicCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  topicIcon: {
    fontSize: 18,
  },
  topicLabel: {
    fontSize: 13,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  skipBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    color: "var(--text-muted)",
    cursor: "pointer",
    marginRight: "auto",
    padding: "10px 0",
  },
  backBtn: {
    padding: "10px 20px",
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: 6,
    fontSize: 14,
    color: "var(--text-primary)",
    cursor: "pointer",
  },
  nextBtn: {
    padding: "10px 28px",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
  },
};
