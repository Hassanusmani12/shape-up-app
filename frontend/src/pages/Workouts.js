import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { 
  FaDumbbell, FaClipboardList, FaLayerGroup, 
  FaSearch
} from "react-icons/fa";

import ExerciseDB from "../components/ExerciseDB";
import WorkoutLog from "../components/WorkoutLog"; 

const Workouts = () => {
  const [pickedExercise, setPickedExercise] = useState(null);
  return (
    <div className="page-wrapper position-relative cinematic-section" style={{overflow: 'visible'}}>
      
      <Container fluid="xxl" className="py-4 px-md-5">
        
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-5">
          <div>
             <div className="d-flex align-items-center mb-2">
                <FaLayerGroup className="me-2 neon-text" />
                <span className="text-muted fw-bold small text-uppercase ls-2">Workout Planner</span>
             </div>
             <h1 className="display-4 fw-bold mb-0 gradient-text athletic-heading">
                Find Your Flow
             </h1>
          </div>
          
          <div className="mt-4 mt-lg-0">
             <div className="d-inline-flex align-items-center px-4 py-2 rounded-pill" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
                <div className="spinner-grow spinner-grow-sm text-success me-3" role="status"></div>
                <small className="text-light mb-0">Database Live. Real-time Updates.</small>
             </div>
          </div>
        </div>

        <Row className="g-4 align-items-start">
            
            <Col lg={5} xl={4}>
                <div style={{position: 'sticky', top: 20, zIndex: 10, maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column'}}>
                    <div className="cinematic-card d-flex flex-column card-4d" style={{flex: 1, minHeight: 0, overflow: 'hidden'}}>
                        <div className="d-flex align-items-center justify-content-between p-3" style={{borderBottom: '1px solid var(--border-subtle)'}}>
                            <div className="d-flex align-items-center">
                                <div className="me-3" style={{width: 45, height: 45, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 15px var(--neon-cyan)', opacity: 0.9, color: 'var(--neon-cyan)', background: 'rgba(0, 212, 255, 0.1)'}}>
                                   <FaClipboardList />
                                </div>
                                <div>
                                   <h5 className="fw-bold mb-0 text-adaptive-head">Today's Log</h5>
                                   <small className="text-muted fw-bold" style={{fontSize: '0.7rem'}}>ACTIVE SESSION</small>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3" style={{flex: 1, minHeight: 0, overflowY: 'auto'}}>
                            <WorkoutLog selectedExercise={pickedExercise} />
                        </div>
                    </div>
                </div>
            </Col>

            <Col lg={7} xl={8}>
                <div className="cinematic-card h-100 d-flex flex-column card-4d">
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3" style={{borderBottom: '1px solid var(--border-subtle)'}}>
                        <div className="d-flex align-items-center mb-3 mb-md-0">
                            <div className="me-3" style={{width: 45, height: 45, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 15px var(--neon-green)', opacity: 0.9, color: 'var(--neon-green)', background: 'rgba(0, 255, 136, 0.1)'}}>
                               <FaDumbbell />
                            </div>
                            <div>
                               <h5 className="fw-bold mb-0 text-adaptive-head">Exercise Database</h5>
                               <small className="text-muted fw-bold" style={{fontSize: '0.7rem'}}>LIBRARY V2.0</small>
                            </div>
                        </div>
                        
                        <div className="d-none d-md-flex align-items-center text-muted small px-3 py-1 rounded-pill" style={{border: '1px solid var(--border-subtle)', background: 'var(--bg-card)'}}>
                           <FaSearch className="me-2" /> 
                           <span>Search available in list below</span>
                        </div>
                    </div>

                    <div className="p-4">
                        <ExerciseDB onSelectExercise={setPickedExercise} />
                    </div>
                </div>
            </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Workouts;
