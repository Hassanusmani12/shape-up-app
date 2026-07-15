import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Container, Row, Col, Modal, Form, ProgressBar, InputGroup, Badge
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { useGetWorkoutsQuery } from "../slices/workoutsApiSlice";
import { useGetDailyLogsQuery, useUpdateDailyLogMutation } from "../slices/dailyLogSlice";
import { useGetDailyStatsQuery } from "../slices/nutritionApiSlice";
import { getCalorieGoal, getMacroTargets } from "../utils/nutritionUtils";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaFilePdf, FaEdit, FaFire, FaTint, FaDumbbell,
  FaWeight, FaUserCircle, FaTrophy, FaWalking, FaChartLine, FaRobot, FaLeaf
} from "react-icons/fa";
import TiltCard from "../components/cinematic/TiltCard";
import StepTracker from "../components/StepTracker";

const useReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, isVisible];
};

const useCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (end === 0) return;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

const Reveal = ({ children, className = "", delay = 0, animation = "fade-up" }) => {
  const [ref, isVisible] = useReveal();
  return (
    <div ref={ref} className={`${className} ${isVisible ? `anim-${animation}` : 'anim-hidden'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const AnimatedValue = ({ value, suffix = "" }) => {
  const count = useCounter(value || 0);
  return <span>{count}{suffix}</span>;
};

const AchievementBadge = ({ icon, title, desc, unlocked, index }) => (
  <Reveal animation="pop-in" delay={index * 100}>
    <div className={`achievement-card cinematic-card ${unlocked ? 'unlocked' : 'locked'}`} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 14, marginBottom: 8 }}>
      <div className={`badge-icon ${unlocked ? 'text-success' : 'text-muted'}`} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: '1.2rem', marginRight: 12, background: 'rgba(255,255,255,0.03)' }}>{icon}</div>
      <div className="badge-info flex-grow-1">
        <h6 className={`fw-bold mb-0 ${unlocked ? 'text-success' : ''}`}>{title}</h6>
        <small className="text-muted">{desc}</small>
      </div>
      {unlocked ? (
        <div className="status-dot bg-success shadow-sm pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%' }}></div>
      ) : (
        <div className="status-dot bg-secondary opacity-25" style={{ width: 8, height: 8, borderRadius: '50%' }}></div>
      )}
    </div>
  </Reveal>
);

const Dashboard = () => {
  const { data: workouts, isLoading: loadingWorkouts } = useGetWorkoutsQuery();
  const { data: dailyLogs, isLoading: loadingLogs } = useGetDailyLogsQuery();
  const [updateDailyLog, { isLoading: updatingLog }] = useUpdateDailyLogMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const userId = userInfo?._id;
  const { data: nutritionData } = useGetDailyStatsQuery(undefined, { skip: !userId, pollingInterval: 10000 });
  const aiNutrients = nutritionData?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 };

  const GOALS = useMemo(() => {
    let goals = { calories: 2000, water: 2500, volume: 5000, steps: 8000 };
    if (userInfo) {
      goals.calories = getCalorieGoal(userInfo);
      goals.water = Math.round((userInfo.weight || 70) * 35);
      goals.volume = Math.round((userInfo.weight || 70) * 60);
      if (userInfo.goal === 'Cut') goals.steps = 10000;
      else if (userInfo.goal === 'Bulk') goals.steps = 6000;
    }
    return goals;
  }, [userInfo]);

  const macroTargets = useMemo(() => getMacroTargets(userInfo?.weight), [userInfo]);

  const [showModal, setShowModal] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [calories, setCalories] = useState("");
  const [water, setWater] = useState("");
  const [weight, setWeight] = useState("");
  const [activeTab, setActiveTab] = useState('overview');

  const todayDate = new Date().toISOString().split("T")[0];

  const todayStats = useMemo(() => {
    const log = dailyLogs?.find(l => l.date === todayDate) || {};
    const todayWorkout = workouts?.find(w => w.createdAt && w.createdAt.split("T")[0] === todayDate);

    const volume = todayWorkout
      ? todayWorkout.exercises?.reduce((acc, ex) => acc + (Number(ex.weight) || 0) * (Number(ex.sets) || 0) * (Number(ex.reps) || 0), 0)
      : 0;

    return {
      calories: Number(log.calories) || 0,
      water: Number(log.water) || 0,
      weight: Number(log.weight) || userInfo?.weight || 0,
      steps: Number(log.steps) || 0,
      volume: volume
    };
  }, [dailyLogs, workouts, todayDate, userInfo]);

  const achievements = useMemo(() => {
    return [
      { icon: <FaFire />, title: "Calorie Crusher", desc: `Hit ${GOALS.calories} kcal`, unlocked: aiNutrients.calories >= GOALS.calories },
      { icon: <FaTint />, title: "Hydration Hero", desc: `Drank ${GOALS.water}ml`, unlocked: todayStats.water >= GOALS.water },
      { icon: <FaDumbbell />, title: "Heavy Lifter", desc: `Vol > ${GOALS.volume}kg`, unlocked: todayStats.volume >= GOALS.volume },
      { icon: <FaWalking />, title: "Step Master", desc: `Hit ${GOALS.steps} steps`, unlocked: todayStats.steps >= GOALS.steps },
    ];
  }, [todayStats, GOALS]);

  const chartData = useMemo(() => {
    if (!dailyLogs) return [];
    const sortedLogs = [...dailyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sortedLogs.slice(-7).map(log => {
      const logDateStr = log.date.split('T')[0];
      let dailyVolume = 0;
      if (workouts) {
        const daysWorkouts = workouts.filter(w => w.createdAt && w.createdAt.startsWith(logDateStr));
        dailyVolume = daysWorkouts.reduce((total, w) => {
          const wVol = w.exercises?.reduce((acc, ex) =>
            acc + ((Number(ex.weight) || 0) * (Number(ex.sets) || 0) * (Number(ex.reps) || 0)), 0) || 0;
          return total + wVol;
        }, 0);
      }
      return {
        date: new Date(log.date).toLocaleDateString("en-US", { weekday: 'short' }),
        calories: log.calories || 0,
        water: log.water || 0,
        weight: log.weight || null,
        steps: log.steps || 0,
        volume: dailyVolume
      };
    });
  }, [dailyLogs, workouts]);

  const handleShow = () => {
    setCalories(todayStats.calories || "");
    setWater(todayStats.water || "");
    setWeight(todayStats.weight || "");
    setLogDate(todayDate);
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);

  const handleSaveLog = async (e) => {
    e.preventDefault();
    try {
      await updateDailyLog({ date: logDate, calories: Number(calories), water: Number(water), weight: Number(weight) }).unwrap();
      toast.success("Stats Updated Successfully!");
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const saveSteps = async (newSteps) => {
    try {
      await updateDailyLog({ date: todayDate, steps: newSteps, calories: todayStats.calories, water: todayStats.water, weight: todayStats.weight }).unwrap();
      toast.success("Steps Synced!");
    } catch (err) { console.error("Step Sync Failed", err); }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Shape Up Report - ${userInfo?.name}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Calories', 'Water (ml)', 'Weight (kg)', 'Volume (kg)']],
      body: dailyLogs ? dailyLogs.map(l => [l.date, l.calories, l.water, l.weight]) : [],
      theme: 'grid',
    });
    doc.save("ShapeUp_Progress.pdf");
  };

  const getProgress = (val, goal) => Math.min((val / goal) * 100, 100);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="cinematic-card" style={{ padding: '10px 14px' }}>
          <p style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)', fontSize: 13 }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: 0, fontSize: 12 }}>
              {entry.name === 'volume' ? 'Volume' : entry.name}: {entry.value} {entry.name === 'weight' ? 'kg' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-wrapper cinematic-section position-relative overflow-hidden" data-scene>
      <Container className="py-5 position-relative" style={{ zIndex: 1, maxWidth: 1300 }}>
        <Reveal animation="fade-up">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end mb-5">
            <div>
              <div className="d-flex align-items-center mb-2">
                <FaUserCircle className="me-2" style={{ color: 'var(--neon-green)' }} size={20} />
                <span className="text-adaptive-muted fw-bold small" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1.5 }}>Welcome back, {userInfo?.name || 'Athlete'}</span>
              </div>
              <h1 className="gradient-text athletic-heading fw-bold display-4 mb-0 text-adaptive section-title" style={{ fontSize: '2.5rem' }}>Overview</h1>
              <p className="text-adaptive-muted mt-2 mb-0" style={{ maxWidth: 500, fontSize: '0.9rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="d-flex gap-3 mt-4 mt-lg-0">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={generatePDF}
                className="btn-cinematic btn-cinematic-outline d-flex align-items-center">
                <FaFilePdf className="me-2" style={{ color: '#e63946' }} /> Export Report
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleShow}
                className="btn-cinematic btn-cinematic-green d-flex align-items-center">
                <FaEdit className="me-2" /> Log Daily Stats
              </motion.button>
            </div>
          </div>
        </Reveal>

        {loadingWorkouts || loadingLogs ? <Loader /> : (
          <>
            <Row className="mb-5 g-3" data-card-stagger>
              {[
                { icon: <FaFire />, value: aiNutrients.calories, label: "Calories Burned", goal: GOALS.calories, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", suffix: "" },
                { icon: <FaTint />, value: todayStats.water, label: "Hydration", goal: GOALS.water, color: "#00d4ff", bg: "rgba(0, 212, 255, 0.1)", suffix: "ml" },
                { icon: <FaDumbbell />, value: todayStats.volume, label: "Volume Lifted", goal: GOALS.volume, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", suffix: "kg" },
                { icon: <FaWeight />, value: todayStats.weight, label: "Current Weight", goal: null, color: "#00ff88", bg: "rgba(0, 255, 136, 0.1)", suffix: "kg" },
              ].map((stat, idx) => (
                <Col md={6} lg={3} key={idx}>
                  <Reveal animation="fade-up" delay={(idx + 1) * 100}>
                    <TiltCard tiltDegree={5}>
                      <div className="cinematic-card" style={{ padding: 24, cursor: 'default' }}>
                        <div className="d-flex justify-content-between mb-3">
                          <div className="floating-element icon-circle" style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', background: stat.bg, color: stat.color }}>
                            {stat.icon}
                          </div>
                        {stat.goal && (
                          <Badge style={{ background: `${stat.color}20`, color: stat.color, fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}>
                            Goal: {stat.goal}{stat.suffix}
                          </Badge>
                        )}
                      </div>
                      <h2 className="stat-value mb-1" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {stat.label === "Volume Lifted" ? ((stat.value || 0) / 1000).toFixed(1) : <AnimatedValue value={stat.value || 0} />}
                        {stat.suffix && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>{stat.suffix}</span>}
                      </h2>
                      <p className="text-adaptive-muted mb-3 fw-bold small" style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>{stat.label}</p>
                      {stat.goal && (
                        <ProgressBar
                          now={getProgress(stat.value, stat.goal)}
                          style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}
                          variant=""
                        >
                          <div style={{ width: `${getProgress(stat.value, stat.goal)}%`, background: stat.color, borderRadius: 4, transition: 'width 1s ease' }} />
                        </ProgressBar>
                      )}
                      </div>
                      </TiltCard>
                    </Reveal>
                </Col>
              ))}
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12}>
                <Reveal animation="fade-up" delay={300}>
                  <div className="cinematic-card" style={{ padding: 24 }}>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <FaRobot style={{ color: "var(--neon-green)", fontSize: "1.1rem" }} />
                      <h5 className="gradient-text athletic-heading fw-bold m-0 text-adaptive" style={{ fontSize: "0.95rem" }}>AI Nutrition & Macros</h5>
                      <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#64748b" }}>
                        Today's AI-Logged Intake
                      </span>
                    </div>
                    <Row className="align-items-center g-4">
                      <Col xs={12} md={3} className="text-center">
                        <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto" }}>
                          <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                            <circle
                              cx="65" cy="65" r="54"
                              fill="none"
                              stroke="#00ff88"
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 54}`}
                              strokeDashoffset={2 * Math.PI * 54 * (1 - Math.min(aiNutrients.calories / GOALS.calories, 1))}
                              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                            />
                          </svg>
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              textAlign: "center",
                            }}
                          >
                            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#e2e8f0", lineHeight: 1 }}>
                              {aiNutrients.calories}
                            </div>
                            <small style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
                              of {GOALS.calories}
                            </small>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 4 }}>
                          <FaFire style={{ color: "#f59e0b", marginRight: 4 }} />
                          {Math.max(0, GOALS.calories - aiNutrients.calories)} remaining
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>
                          <FaRobot style={{ color: "var(--neon-green)", marginRight: 4 }} />
                          {aiNutrients.meals} meal{aiNutrients.meals !== 1 ? "s" : ""} logged
                        </div>
                      </Col>
                      <Col xs={12} md={9}>
                        <Row className="g-3">
                          {[
                            {
                              label: "Protein",
                              value: aiNutrients.protein,
                              target: macroTargets.protein,
                              color: "#00BFFF",
                              bg: "rgba(0, 191, 255, 0.1)",
                              icon: <FaDumbbell style={{ color: "#00BFFF" }} />,
                            },
                            {
                              label: "Carbs",
                              value: aiNutrients.carbs,
                              target: macroTargets.carbs,
                              color: "#00FA9A",
                              bg: "rgba(0, 250, 154, 0.1)",
                              icon: <FaLeaf style={{ color: "#00FA9A" }} />,
                            },
                            {
                              label: "Fats",
                              value: aiNutrients.fats,
                              target: macroTargets.fats,
                              color: "#FF8C00",
                              bg: "rgba(255, 140, 0, 0.1)",
                              icon: <FaFire style={{ color: "#FF8C00" }} />,
                            },
                          ].map((macro, idx) => {
                            const pct = Math.min((macro.value / macro.target) * 100, 100);
                            return (
                              <Col xs={12} sm={4} key={idx}>
                                <div
                                  style={{
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: 14,
                                    padding: "14px 16px",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                  }}
                                >
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    {macro.icon}
                                    <span style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                      {macro.label}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between mb-2">
                                    <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "1.1rem" }}>
                                      {macro.value}g
                                    </span>
                                    <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                                      / {macro.target}g
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      width: "100%",
                                      height: 6,
                                      borderRadius: 3,
                                      background: "rgba(255,255,255,0.06)",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${pct}%`,
                                        height: "100%",
                                        borderRadius: 3,
                                        background: macro.color,
                                        transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: `0 0 8px ${macro.color}66`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </Col>
                            );
                          })}
                        </Row>
                      </Col>
                    </Row>
                  </div>
                </Reveal>
              </Col>
            </Row>

            <Row className="g-3 mb-5" data-card-stagger>
              <Col lg={8}>
                <Reveal animation="fade-up" delay={500}>
                  <div className="cinematic-card" style={{ padding: 24 }} data-scene>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="d-flex align-items-center gap-2">
                        <FaChartLine style={{ color: 'var(--neon-green)' }} size={18} />
                        <h5 className="gradient-text athletic-heading fw-bold m-0 text-adaptive" style={{ fontSize: '1rem' }}>Analytics</h5>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 3, borderRadius: 10, display: 'flex', gap: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                        {['overview', 'weight', 'volume'].map(tab => (
                          <button key={tab}
                            style={{
                              padding: '6px 14px', border: 'none', fontSize: '0.8rem', fontWeight: 600,
                              borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                              background: activeTab === tab ? 'var(--neon-green)' : 'transparent',
                              color: activeTab === tab ? 'var(--bg-primary)' : 'var(--text-muted)',
                            }}
                            onClick={() => setActiveTab(tab)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ width: "100%", height: 320 }} data-fade>
                      <ResponsiveContainer>
                        <defs>
                          <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00e676" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>

                        {activeTab === 'overview' && (
                          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="calories" stroke="#00e676" strokeWidth={2} fillOpacity={1} fill="url(#colorCalories)" animationDuration={1500} />
                          </AreaChart>
                        )}

                        {activeTab === 'weight' && (
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="weight" radius={[4, 4, 4, 4]} barSize={12} animationDuration={1500}>
                              {chartData.map((entry, index) => {
                                const prevWeight = index > 0 ? chartData[index - 1].weight : entry.weight;
                                return <Cell key={`cell-${index}`} fill={entry.weight <= prevWeight ? '#10b981' : '#e63946'} />;
                              })}
                            </Bar>
                          </BarChart>
                        )}

                        {activeTab === 'volume' && (
                          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" animationDuration={1500} />
                          </AreaChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Reveal>
              </Col>

              <Col lg={4}>
                <div className="d-flex flex-column gap-3 h-100">
                  <Reveal animation="fade-up" delay={600}>
                    <div className="cinematic-card" style={{ padding: 16 }} data-fade>
                      <StepTracker currentSteps={todayStats.steps} goal={GOALS.steps} onSave={saveSteps} />
                    </div>
                  </Reveal>
                  <Reveal animation="fade-up" delay={700}>
                    <div className="cinematic-card" style={{ padding: 24 }} data-scene>
                      <h5 className="gradient-text athletic-heading fw-bold mb-3 text-adaptive" style={{ fontSize: '0.95rem' }}><FaTrophy className="me-2" style={{ color: 'var(--neon-green)' }} />Today's Wins</h5>
                      <div>
                        {achievements.map((ach, idx) => (
                          <AchievementBadge key={idx} {...ach} index={idx} />
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </div>
              </Col>
            </Row>
          </>
        )}

        {/* MODAL */}
        <Modal show={showModal} onHide={handleClose} centered animation={true}>
          <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <Modal.Title className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>Update Daily Log</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: 24 }}>
            <Form onSubmit={handleSaveLog}>
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Select Date</Form.Label>
                <Form.Control type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required className="neon-input" style={{ colorScheme: 'dark' }} />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Calories</Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--border-medium)', color: '#f59e0b' }}><FaFire /></InputGroup.Text>
                      <Form.Control type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className="neon-input" />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Water (ml)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--border-medium)', color: '#00d4ff' }}><FaTint /></InputGroup.Text>
                      <Form.Control type="number" value={water} onChange={(e) => setWater(e.target.value)} placeholder="0" className="neon-input" />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Current Weight (kg)</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--border-medium)', color: '#00ff88' }}><FaWeight /></InputGroup.Text>
                  <Form.Control type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.0" className="neon-input" />
                </InputGroup>
              </Form.Group>
              <div className="d-flex gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="button" onClick={handleClose}
                  className="btn-cinematic btn-cinematic-outline" style={{ flex: 1 }}>
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={updatingLog}
                  className="btn-cinematic btn-cinematic-green"
                  style={{ flex: 1, cursor: updatingLog ? 'not-allowed' : 'pointer', opacity: updatingLog ? 0.7 : 1 }}>
                  {updatingLog ? "Saving..." : "Save Updates"}
                </motion.button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;
