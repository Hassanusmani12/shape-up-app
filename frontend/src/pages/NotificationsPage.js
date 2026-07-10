import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Badge, Modal, Tab, Nav } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useGetRemindersQuery, useCreateReminderMutation, useDeleteReminderMutation } from "../slices/reminderSlice";
import Loader from "../components/Loader";
import {
  FaBell, FaTrashAlt, FaRunning, FaUtensils, FaTint,
  FaPlusCircle, FaVolumeUp, FaCalendarAlt,
  FaCheckCircle, FaPlay, FaStop, FaMusic
} from "react-icons/fa";

const SOUND_LIBRARY = [
  { id: 'classic', name: 'Classic Alarm', url: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
  { id: 'digital', name: 'Digital Beep', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'nature', name: 'Morning Birds', url: 'https://assets.mixkit.co/active_storage/sfx/139/139-preview.mp3' },
  { id: 'scifi', name: 'Sci-Fi Alert', url: 'https://assets.mixkit.co/active_storage/sfx/1002/1002-preview.mp3' },
  { id: 'gentle', name: 'Gentle Chime', url: 'https://assets.mixkit.co/active_storage/sfx/1020/1020-preview.mp3' }
];

const CATEGORIES = [
  { id: 'General', label: 'General', icon: <FaBell />, color: '#3b82f6' },
  { id: 'Workout', label: 'Workout', icon: <FaRunning />, color: '#8b5cf6' },
  { id: 'Meal', label: 'Meal Prep', icon: <FaUtensils />, color: '#00e676' },
  { id: 'Water', label: 'Hydration', icon: <FaTint />, color: '#06b6d4' }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }
  })
};

const slideIn = {
  hidden: { opacity: 0, x: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }
  })
};

const StatCard = ({ icon, value, label, color, delay }) => (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      custom={delay}
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}20` }}
      className="cinematic-card"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        background: `${color}15`,
        color: color,
      }}
    >
      {icon}
    </div>
    <div>
      <h4 style={{ fontWeight: 800, marginBottom: 0, color: 'var(--text-primary)', fontSize: '1.4rem' }}>{value}</h4>
      <small style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</small>
    </div>
  </motion.div>
);

const SoundCard = ({ sound, isPlaying, onPlay, onStop }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => isPlaying ? onStop() : onPlay(sound)}
    style={{
      cursor: 'pointer',
      padding: '14px 16px',
      borderRadius: 12,
      border: isPlaying ? '1px solid rgba(230, 57, 70, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
      background: isPlaying ? 'rgba(230, 57, 70, 0.08)' : 'rgba(255, 255, 255, 0.02)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'all 0.2s',
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isPlaying ? 'rgba(230, 57, 70, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        color: isPlaying ? '#e63946' : 'var(--text-muted)',
        fontSize: '0.9rem',
      }}
    >
      {isPlaying ? <FaStop /> : <FaPlay />}
    </div>
    <div style={{ flex: 1 }}>
      <h6 style={{ marginBottom: 0, fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{sound.name}</h6>
      <small style={{ color: isPlaying ? '#e63946' : 'var(--text-muted)', fontSize: '0.75rem' }}>
        {isPlaying ? "Playing..." : "Tap to preview"}
      </small>
    </div>
    {isPlaying && (
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {[10, 20, 15, 25, 12].map((h, i) => (
          <span
            key={i}
            style={{
              width: 3,
              background: '#e63946',
              borderRadius: 2,
              animation: `eqBar 0.8s infinite ease-in-out ${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    )}
    <style>{`
      @keyframes eqBar {
        0%, 100% { height: 6px; }
        50% { height: 20px; }
      }
    `}</style>
  </motion.div>
);

const EmptyState = ({ text = "You're all caught up for today!" }) => (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="cinematic-card"
      style={{
        padding: '48px 32px',
        textAlign: 'center',
      }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}
    >
      <FaCheckCircle size={28} style={{ color: '#10b981', opacity: 0.7 }} />
    </div>
    <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>All Clear</h6>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>{text}</p>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8, opacity: 0.6 }}>Use the form to add a new task.</p>
  </motion.div>
);

const ReminderItem = ({ rem, onDelete, showDate = false }) => {
  if (!rem) return null;
  const cat = CATEGORIES.find(c => c.id === rem.type) || CATEGORIES[0];

  return (
    <motion.div
      layout
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="cinematic-card"
      whileHover={{ x: 4, borderColor: `${cat.color}40` }}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${cat.color}12`,
          color: cat.color,
          fontSize: '1.1rem',
          marginRight: 14,
          flexShrink: 0,
        }}
      >
        {cat.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h6 style={{ fontWeight: 700, marginBottom: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            {rem.time}
          </h6>
          {showDate && rem.date && (
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FaCalendarAlt style={{ fontSize: 10 }} />
              {new Date(rem.date).toLocaleDateString()}
            </small>
          )}
          {rem.priority === 'High' && (
            <Badge
              style={{
                background: 'rgba(230, 57, 70, 0.15)',
                color: '#e63946',
                fontSize: '0.6rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: 0.5,
              }}
            >
              HIGH
            </Badge>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: cat.color,
              background: `${cat.color}10`,
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {rem.type}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
            {rem.title}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(rem._id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          opacity: 0.5,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.color = '#e63946';
          e.currentTarget.style.background = 'rgba(230, 57, 70, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.5';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'none';
        }}
      >
        <FaTrashAlt />
      </button>
    </motion.div>
  );
};

const NotificationsPage = () => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("General");
  const [priority, setPriority] = useState("Normal");

  const [audioInstance, setAudioInstance] = useState(null);
  const [playingSoundId, setPlayingSoundId] = useState(null);
  const [showSoundModal, setShowSoundModal] = useState(false);

  const { data: reminders, isLoading } = useGetRemindersQuery();
  const [createReminder, { isLoading: isCreating }] = useCreateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();

  const stats = useMemo(() => {
    if (!reminders || !Array.isArray(reminders)) return { total: 0, high: 0, today: 0, workout: 0 };
    const todayStr = new Date().toISOString().split("T")[0];
    const safeReminders = reminders.filter(r => r && r._id);
    return {
      total: safeReminders.length,
      high: safeReminders.filter(r => r.priority === 'High').length,
      workout: safeReminders.filter(r => r.type === 'Workout').length,
      today: safeReminders.filter(r => r.date === todayStr || !r.date).length
    };
  }, [reminders]);

  const groupedReminders = useMemo(() => {
    if (!reminders || !Array.isArray(reminders)) return { today: [], upcoming: [] };
    const todayStr = new Date().toISOString().split("T")[0];
    const safeReminders = reminders.filter(r => r && r._id);
    return {
      today: safeReminders.filter(r => r.date === todayStr || !r.date).sort((a, b) => (a.time || "").localeCompare(b.time || "")),
      upcoming: safeReminders.filter(r => r.date && r.date > todayStr).sort((a, b) => new Date(a.date) - new Date(b.date)),
    };
  }, [reminders]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!title || !time) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      await createReminder({ title, time, date, type, priority }).unwrap();
      toast.success("Reminder Scheduled!");
      setTitle("");
      setTime("");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Dismiss this alert?")) {
      try {
        await deleteReminder(id).unwrap();
        toast.success("Dismissed");
      } catch (err) { toast.error("Failed to delete"); }
    }
  };

  const playSound = (sound) => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }

    const newAudio = new Audio(sound.url);
    newAudio.volume = 1.0;

    newAudio.play().then(() => {
      setPlayingSoundId(sound.id);
    }).catch(e => {
      console.error("Audio Play Error:", e);
      toast.error("Could not play sound. Check internet connection.");
    });

    newAudio.onended = () => {
      setPlayingSoundId(null);
      setAudioInstance(null);
    };

    setAudioInstance(newAudio);
  };

  const stopSound = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }
    setPlayingSoundId(null);
    setAudioInstance(null);
  };

  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [audioInstance]);

  const testSystemAlarm = () => {
    stopSound();
    const sound = SOUND_LIBRARY[0];
    const audio = new Audio(sound.url);

    let count = 0;
    const playLoop = () => {
      if (count < 3) {
        count++;
        audio.currentTime = 0;
        audio.play().catch(e => console.error(e));
      }
    };
    audio.addEventListener('ended', playLoop);

    audio.play().catch(e => {
      console.error(e);
      toast.error("Failed to play test sound");
    });

    setAudioInstance(audio);
    toast.info("Testing System Alarm (3x Loop)...");
  };

  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'var(--text-muted)',
    marginBottom: 6,
    display: 'block',
  };

  const categoryBtnStyle = (isActive, color) => ({
    flex: 1,
    padding: '10px 8px',
    borderRadius: 10,
    border: isActive ? `1px solid ${color}40` : '1px solid rgba(255, 255, 255, 0.06)',
    background: isActive ? `${color}15` : 'rgba(255, 255, 255, 0.02)',
    color: isActive ? color : 'var(--text-muted)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.78rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.2s',
  });

  return (
    <div className="cinematic-section position-relative overflow-hidden" style={{ minHeight: '100vh', position: 'relative' }} data-scene>
      <Container className="py-5" style={{ position: 'relative', zIndex: 2, maxWidth: 1200 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 40,
            gap: 16,
          }}
        >
          <div>
            <h1 className="gradient-text athletic-heading" style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 4, color: 'var(--text-primary)' }} data-reveal>
              Command Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 0 }}>
              Manage Your Schedule & Alerts
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSoundModal(true)}
              className="btn-cinematic btn-cinematic-outline"
              style={{
                padding: '10px 20px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FaMusic /> Library
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(230, 57, 70, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={testSystemAlarm}
              className="btn-cinematic"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #e63946, #c1121f)',
                color: '#fff',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FaVolumeUp /> Test System
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <Row className="g-3 mb-5">
          <Col md={4}>
            <StatCard icon={<FaBell />} value={stats.total} label="Active Alerts" color="#3b82f6" delay={0.1} />
          </Col>
          <Col md={4}>
            <StatCard icon={<FaCalendarAlt />} value={stats.today} label="Today's Tasks" color="#10b981" delay={0.2} />
          </Col>
          <Col md={4}>
            <StatCard icon={<FaRunning />} value={stats.workout} label="Workouts Pending" color="#8b5cf6" delay={0.3} />
          </Col>
        </Row>

        <Row className="g-4">

          {/* Left: Create Form */}
          <Col lg={5}>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="cinematic-card"
              style={{
                padding: 28,
                height: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}
                >
                  <FaPlusCircle />
                </div>
                <div>
                  <h5 style={{ fontWeight: 700, marginBottom: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Create Alert</h5>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Set a new reminder</small>
                </div>
              </div>

              <form onSubmit={submitHandler}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>TITLE</label>
                  <input
                    type="text"
                    placeholder="e.g. Gym Session, Meal Prep"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="neon-input"
                  />
                </div>

                <Row className="g-3" style={{ marginBottom: 16 }}>
                  <Col md={6}>
                    <label style={labelStyle}>DATE</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="neon-input"
                    />
                  </Col>
                  <Col md={6}>
                    <label style={labelStyle}>TIME</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="neon-input"
                    />
                  </Col>
                </Row>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>CATEGORY</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        style={categoryBtnStyle(type === cat.id, cat.color)}
                        onClick={() => setType(cat.id)}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>PRIORITY</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="neon-input"
                    style={{
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                    }}
                  >
                    <option value="Normal" style={{ background: 'var(--bg-secondary)' }}>Normal</option>
                    <option value="High" style={{ background: 'var(--bg-secondary)' }}>High Priority (Persistent Alert)</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  disabled={isCreating}
                  className="btn-cinematic btn-cinematic-green"
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0, 230, 118, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    cursor: isCreating ? 'not-allowed' : 'pointer',
                    opacity: isCreating ? 0.7 : 1,
                  }}
                >
                  {isCreating ? "Scheduling..." : "Set Reminder"}
                </motion.button>
              </form>
            </motion.div>
          </Col>

          {/* Right: Timeline */}
          <Col lg={7}>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
              data-card-stagger
            >
              <Tab.Container defaultActiveKey="today">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h5 style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 0 }}>
                    Timeline
                  </h5>
                  <Nav variant="pills" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 10,
                    padding: 3,
                    gap: 4,
                  }}>
                    <Nav.Item>
                      <Nav.Link eventKey="today" style={{
                        padding: '6px 16px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}>Today</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="upcoming" style={{
                        padding: '6px 16px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}>Upcoming</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>

                <Tab.Content>
                  <Tab.Pane eventKey="today">
                    {isLoading ? (
                      <Loader />
                    ) : groupedReminders.today?.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <div style={{ maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
                        <AnimatePresence>
                          {groupedReminders.today.map((rem, idx) => (
                            <ReminderItem key={rem._id} rem={rem} onDelete={handleDelete} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="upcoming">
                    {groupedReminders.upcoming?.length === 0 ? (
                      <EmptyState text="No upcoming reminders scheduled." />
                    ) : (
                      <div style={{ maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
                        <AnimatePresence>
                          {groupedReminders.upcoming.map((rem, idx) => (
                            <ReminderItem key={rem._id} rem={rem} onDelete={handleDelete} showDate={true} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </motion.div>
          </Col>
        </Row>

        {/* Sound Library Modal */}
        <Modal
          show={showSoundModal}
          onHide={() => { stopSound(); setShowSoundModal(false); }}
          centered
          backdrop="static"
        >
          <Modal.Header
            closeButton
            style={{
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Modal.Title style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Alert Sounds</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: 'var(--bg-secondary)', padding: 20 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>Click to preview sounds. These sounds are used for system alerts.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SOUND_LIBRARY.map(sound => (
                <SoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={playingSoundId === sound.id}
                  onPlay={playSound}
                  onStop={stopSound}
                />
              ))}
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default NotificationsPage;
