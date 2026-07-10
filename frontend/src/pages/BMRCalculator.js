import React, { useState, useEffect } from "react";
import { 
  Container, Row, Col, Form, Button, 
  Badge, InputGroup
} from "react-bootstrap";
import { useSelector } from "react-redux"; 
import { 
  FaCalculator, FaUndo, FaAppleAlt, FaMale, FaFemale
} from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const ACTIVITY_LEVELS = [
  { value: 1.2, label: "Sedentary", desc: "Desk job, little to no exercise" },
  { value: 1.375, label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
  { value: 1.55, label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
  { value: 1.725, label: "Very Active", desc: "Hard exercise 6-7 days/week" },
  { value: 1.9, label: "Super Active", desc: "Physical job or training 2x/day" },
];

const GOAL_MODIFIERS = {
  cut: -500,
  maintain: 0,
  bulk: 500
};

const ResultRow = ({ label, value, unit, highlight = false, delay }) => (
    <div 
        className={`d-flex justify-content-between align-items-center p-3 mb-2 rounded-3 hover-scale fade-in-up ${highlight ? 'border border-primary' : 'border'}`}
        style={{animationDelay: delay, background: highlight ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 255, 255, 0.04)', borderColor: highlight ? 'var(--neon-green)' : 'var(--border-subtle)'}}
    >
        <span className={highlight ? "fw-bold" : "text-muted fw-bold"} style={highlight ? {color: 'var(--neon-green)'} : {}}>{label}</span>
        <span className={`fw-bold ${highlight ? 'h4 mb-0' : 'h6 mb-0'}`} style={highlight ? {color: 'var(--neon-green)'} : {color: 'var(--text-primary)'}}>
            {value} <small className="fs-6 text-muted">{unit}</small>
        </span>
    </div>
);

const MacroCard = ({ label, grams, cals, color, percent, delay }) => (
    <div 
        className="text-center p-3 rounded-4 h-100 shadow-sm fade-in-up hover-lift card-4d"
        style={{animationDelay: delay, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(12px)'}}
    >
        <h6 className="fw-bold text-uppercase ls-1" style={{color}}>{label}</h6>
        <h2 className="fw-bold mb-0 text-adaptive-head gradient-text athletic-heading">{grams}g</h2>
        <small className="text-muted fw-bold">{cals} kcal ({percent}%)</small>
        <div className="mt-2" style={{height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden'}}>
            <div style={{width: `${percent}%`, background: color, height: '100%', transition: 'width 1s ease-in-out'}}></div>
        </div>
    </div>
);

const BMRCalculator = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);
  const [activityIndex, setActivityIndex] = useState(2);
  const [bodyFat] = useState(15);
  const [formula] = useState("mifflin");
  const [goal, setGoal] = useState("maintain");
  
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);
  const [targetCalories, setTargetCalories] = useState(0);
  const [macros, setMacros] = useState([]);

  useEffect(() => {
      if (userInfo) {
          if(userInfo.gender) setGender(userInfo.gender.toLowerCase());
          if(userInfo.weight) setWeight(userInfo.weight);
          if(userInfo.height) setHeight(userInfo.height);
          if(userInfo.age) setAge(userInfo.age);
          if(userInfo.goal) setGoal(userInfo.goal.toLowerCase());
      }
  }, [userInfo]);

  useEffect(() => {
    let calculatedBMR = 0;
    const activity = ACTIVITY_LEVELS[activityIndex].value;

    if (formula === "mifflin") {
        if (gender === "male") {
            calculatedBMR = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            calculatedBMR = 10 * weight + 6.25 * height - 5 * age - 161;
        }
    } else {
        const leanMass = weight * (1 - bodyFat / 100);
        calculatedBMR = 370 + (21.6 * leanMass);
    }

    const calculatedTDEE = calculatedBMR * activity;
    const calculatedTarget = calculatedTDEE + GOAL_MODIFIERS[goal];

    const proteinGrams = Math.round(weight * 2.2); 
    const fatGrams = Math.round(weight * 0.9);
    const proteinCals = proteinGrams * 4;
    const fatCals = fatGrams * 9;
    const remainingCals = calculatedTarget - (proteinCals + fatCals);
    const carbGrams = Math.max(0, Math.round(remainingCals / 4));

    setBmr(Math.round(calculatedBMR));
    setTdee(Math.round(calculatedTDEE));
    setTargetCalories(Math.round(calculatedTarget));

    setMacros([
        { name: "Protein", value: proteinGrams, cals: proteinCals, color: "#0d6efd" },
        { name: "Carbs", value: carbGrams, cals: remainingCals, color: "#198754" },
        { name: "Fats", value: fatGrams, cals: fatCals, color: "#ffc107" },
    ]);

  }, [gender, weight, height, age, activityIndex, bodyFat, formula, goal]);

  const handleReset = () => {
      setWeight(70); setHeight(175); setAge(25); setActivityIndex(2); setGoal("maintain");
  };

  return (
    <div className="page-wrapper position-relative overflow-hidden cinematic-section" data-scene>
      
      <Container className="py-5 position-relative" style={{zIndex: 2}}>
        
        <div className="text-center mb-5 fade-in">
           <div className="d-inline-flex align-items-center justify-content-center mb-2 hover-scale">
              <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2 me-2 shadow-sm">AI POWERED</Badge>
           </div>
           <h1 className="display-4 fw-bold mb-3 text-adaptive-head gradient-text athletic-heading" data-reveal>
               Metabolic Profile
           </h1>
           <p className="text-muted mx-auto" style={{maxWidth: "600px", fontSize: "1.1rem"}}>
              Your personal blueprint for fat loss and muscle gain. Pre-filled with your dashboard data.
           </p>
        </div>

        <Row className="g-5">
            
            <Col lg={6} className="fade-in-up" style={{ animationDelay: "0.1s" }}>
               <div className="cinematic-card p-4 p-md-5 h-100 hover-lift card-4d">
                  
                  <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0 text-adaptive-head"><FaCalculator className="me-2 text-primary"/>Parameters</h4>
                       <Button variant="outline-secondary" size="sm" onClick={handleReset} className="rounded-pill px-3 hover-scale btn-cinematic btn-cinematic-outline"><FaUndo className="me-1"/>Reset</Button>
                  </div>

                  <Form>
                      <div className="mb-4">
                          <label className="fw-bold text-muted small mb-2 d-block">GENDER</label>
                          <div className="d-flex gap-3">
                              <Button 
                                variant="light"
                                className="flex-grow-1 py-2 rounded-pill d-flex align-items-center justify-content-center hover-scale border-0 fw-bold"
                                style={gender === 'male' ? {background: 'var(--neon-green)', color: '#000'} : {background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)'}}
                                onClick={() => setGender('male')}
                              >
                                  <FaMale size={20} className="me-2"/> Male
                              </Button>
                              <Button 
                                variant="light"
                                className="flex-grow-1 py-2 rounded-pill d-flex align-items-center justify-content-center hover-scale border-0 fw-bold"
                                style={gender === 'female' ? {background: 'var(--neon-green)', color: '#000'} : {background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)'}}
                                onClick={() => setGender('female')}
                              >
                                  <FaFemale size={20} className="me-2"/> Female
                              </Button>
                          </div>
                      </div>

                      <Row className="mb-4 g-3">
                          <Col md={4}>
                              <Form.Label className="fw-bold text-muted small">WEIGHT</Form.Label>
                              <InputGroup className="hover-scale">
                                  <Form.Control type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="neon-input" />
                                  <InputGroup.Text style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)'}}>kg</InputGroup.Text>
                              </InputGroup>
                          </Col>
                          <Col md={4}>
                              <Form.Label className="fw-bold text-muted small">HEIGHT</Form.Label>
                              <InputGroup className="hover-scale">
                                  <Form.Control type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="neon-input" />
                                  <InputGroup.Text style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)'}}>cm</InputGroup.Text>
                              </InputGroup>
                          </Col>
                          <Col md={4}>
                              <Form.Label className="fw-bold text-muted small">AGE</Form.Label>
                              <InputGroup className="hover-scale">
                                  <Form.Control type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="neon-input" />
                                  <InputGroup.Text style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)'}}>yrs</InputGroup.Text>
                              </InputGroup>
                          </Col>
                      </Row>

                      <div className="mb-5 p-3 rounded-4 hover-scale" style={{background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)'}}>
                          <Form.Label className="fw-bold text-muted small d-flex justify-content-between">
                              <span>ACTIVITY LEVEL</span>
                              <span style={{color: 'var(--neon-green)'}} className="fw-bold">{ACTIVITY_LEVELS[activityIndex].label}</span>
                          </Form.Label>
                          
                          <input 
                            type="range" 
                            className="form-range mb-2" 
                            min="0" max="4" step="1" 
                            value={activityIndex} 
                            onChange={(e) => setActivityIndex(Number(e.target.value))} 
                            style={{accentColor: 'var(--neon-green)'}}
                          />
                          
                          <small className="text-muted d-block text-center">
                             {ACTIVITY_LEVELS[activityIndex].desc}
                          </small>
                      </div>

                      <div className="mb-3">
                          <label className="fw-bold text-muted small mb-2 d-block">PRIMARY GOAL</label>
                          <div className="d-flex p-1 rounded-pill" style={{background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)'}}>
                              {['cut', 'maintain', 'bulk'].map(g => (
                                  <Button 
                                    key={g}
                                    variant="light"
                                    className="flex-grow-1 rounded-pill text-uppercase fw-bold py-2 border-0"
                                    style={goal === g ? {background: 'var(--neon-green)', color: '#000', boxShadow: '0 4px 15px rgba(0, 255, 136, 0.4)', transform: 'scale(1.05)'} : {background: 'transparent', color: 'var(--text-secondary)'}}
                                    onClick={() => setGoal(g)}
                                  >
                                      {g}
                                  </Button>
                              ))}
                          </div>
                      </div>

                  </Form>
               </div>
            </Col>

            <Col lg={6} className="fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div className="cinematic-card h-100 p-4 p-md-5 d-flex flex-column hover-lift card-4d">
                    
                    <div className="text-center mb-4">
                        <div className="d-inline-flex p-3 rounded-circle mb-3 shadow-sm hover-scale" style={{background: 'rgba(0, 255, 136, 0.1)', color: 'var(--neon-green)'}}>
                            <FaAppleAlt size={24} />
                        </div>
                        <h3 className="fw-bold text-adaptive-head mb-1 gradient-text athletic-heading">Your Metabolic Profile</h3>
                        <p className="text-muted small">Based on your inputs</p>
                    </div>

                    <div className="mb-4">
                        <ResultRow label="BMR (Resting)" value={bmr} unit="kcal/day" delay="0.4s" />
                        <ResultRow label="TDEE (Maintenance)" value={tdee} unit="kcal/day" delay="0.5s" />
                        <div className="my-3"></div>
                        <div className="p-3 rounded-3 d-flex justify-content-between align-items-center hover-scale" style={{background: 'var(--neon-green)', color: '#000'}}>
                            <span className="fw-bold text-uppercase ls-1 small">Target Calories</span>
                            <span className="display-6 fw-bold">{targetCalories} <span className="fs-6 opacity-75">kcal</span></span>
                        </div>
                    </div>

                    <div className="mb-4 text-center fade-in-up" style={{animationDelay: '0.6s'}}>
                        <h6 className="fw-bold text-muted mb-3">Recommended Macros</h6>
                        <div style={{ height: '220px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={macros}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1500}
                                    >
                                        {macros.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', textAlign: 'center'}}>
                                <span className="h4 fw-bold d-block mb-0 text-adaptive-head">{targetCalories}</span>
                                <small className="text-muted small">Daily</small>
                            </div>
                        </div>
                    </div>

                    <Row className="g-2" data-card-stagger>
                        {macros.map((macro, idx) => (
                            <Col key={idx}>
                                <MacroCard 
                                    label={macro.name} 
                                    grams={macro.value} 
                                    cals={macro.cals} 
                                    color={macro.color} 
                                    percent={Math.round((macro.cals / targetCalories) * 100)}
                                    delay={`${0.7 + (idx * 0.1)}s`}
                                />
                            </Col>
                        ))}
                    </Row>

                </div>
            </Col>

        </Row>
      </Container>
    </div>
  );
};

export default BMRCalculator;
