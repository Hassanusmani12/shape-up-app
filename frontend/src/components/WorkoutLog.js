import React, { useState, useCallback, useEffect } from "react";
import { Card, Form, Button, Table, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useCreateWorkoutMutation, useGetWorkoutByDateQuery, useDeleteExerciseMutation } from "../slices/workoutsApiSlice";
import { FaCalendarAlt, FaDumbbell, FaClipboardList, FaTrash } from "react-icons/fa";

const ConfirmDialog = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onCancel}
    >
      <div style={{ background: '#1a1a2e', padding: '32px', borderRadius: 16, maxWidth: 400, width: '90%', textAlign: 'center', border: '1px solid rgba(255,23,68,0.3)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Delete Exercise?</div>
        <div style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: 24 }}>This cannot be undone.</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button type="button" onClick={onCancel}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#ccc', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#e63946', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkoutLog = ({ selectedExercise }) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [createWorkout, { isLoading }] = useCreateWorkoutMutation();
  const [deleteExercise] = useDeleteExerciseMutation();
  const { data: workoutData } = useGetWorkoutByDateQuery(date);

  const exercises = workoutData?.exercises || [];

  // Auto-fill exercise name when user picks from Exercise Database
  useEffect(() => {
    if (selectedExercise?.name) {
      setExerciseName(selectedExercise.name);
    }
  }, [selectedExercise]);

  const resetForm = useCallback(() => {
    setExerciseName("");
    setSets("");
    setReps("");
    setWeight("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseName || !sets || !reps) {
      toast.error("Please fill in all fields");
      return;
    }

    resetForm();

    try {
      await createWorkout({
        date,
        exercises: [{
          name: exerciseName,
          sets: Number(sets),
          reps: Number(reps),
          weight: Number(weight) || 0,
        }]
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add workout");
    }
  };

  const handleDelete = (index) => setConfirmDelete(index);

  const handleConfirmDelete = async () => {
    if (confirmDelete === null) return;
    const idx = confirmDelete;
    setConfirmDelete(null);
    const newEx = exercises.filter((_, i) => i !== idx);
    try {
      if (newEx.length === 0) {
        await deleteExercise({ date }).unwrap();
      } else {
        await createWorkout({ date, exercises: newEx }).unwrap();
      }
    } catch {
      toast.error("Failed to delete exercise");
    }
  };

  return (
    <>
      <Card className="shadow-sm border-0 workout-log-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <Card.Header className="py-3 d-flex align-items-center" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          <FaClipboardList className="me-2 neon-text"/>
          <h5 className="mb-0 fw-bold text-adaptive-head">Daily Workout Log</h5>
        </Card.Header>
        <Card.Body style={{ background: 'transparent' }}>
          {/* Date Picker */}
          <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-uppercase text-muted">Select Date</Form.Label>
              <div className="input-group">
                  <span className="input-group-text" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}><FaCalendarAlt className="text-muted"/></span>
                  <Form.Control 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="border-start-0 ps-0"
                  />
              </div>
          </Form.Group>

          {/* Add Form */}
          <Form onSubmit={handleSubmit} className="p-3 rounded border mb-4 workout-form-container" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <h6 className="mb-3 fw-bold neon-text"><FaDumbbell className="me-2"/>Log Set</h6>
              
              <Form.Group className="mb-3">
                  <Form.Control 
                      type="text" 
                      placeholder="Exercise Name" 
                      value={exerciseName} 
                      onChange={(e) => setExerciseName(e.target.value)}
                      required
                  />
              </Form.Group>

              <Row className="g-2">
                  <Col xs={4}>
                      <Form.Control type="number" placeholder="Sets" value={sets} onChange={(e) => setSets(e.target.value)} required />
                  </Col>
                  <Col xs={4}>
                      <Form.Control type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} required />
                  </Col>
                  <Col xs={4}>
                      <Form.Control type="number" placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </Col>
              </Row>

              <Button type="submit" variant="success" className="w-100 mt-3 shadow-sm" disabled={isLoading} style={{ background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 700 }}>
                  {isLoading ? "Saving..." : "Add Entry"}
              </Button>
          </Form>

          {/* Today's List */}
          <h6 className="mt-4 fw-bold mb-3 pb-2 text-adaptive-head" style={{ borderBottom: '1px solid var(--border-subtle)' }}>Log for {new Date(date).toLocaleDateString()}</h6>
          <div className="table-responsive custom-scrollbar" style={{maxHeight: "350px", overflowY: "auto"}}>
              <Table size="sm" striped hover className="mb-0 align-middle">
                  {/* Removed 'table-light' and used 'custom-thead' */}
                  <thead className="custom-thead" style={{ background: 'var(--bg-elevated)' }}>
                      <tr>
                          <th style={{width: '38%'}}>Exercise</th>
                          <th className="text-center">Sets</th>
                          <th className="text-center">Reps</th>
                          <th className="text-center" style={{width: '26%'}}>Kg / Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      {exercises.length > 0 ? (
                        exercises.map((ex, idx) => (
                            <tr key={`${ex.name}_${idx}`}>
                                <td className="fw-semibold">{ex.name}</td>
                                <td className="text-center">{ex.sets}</td>
                                <td className="text-center">{ex.reps}</td>
                                <td className="text-center">
                                  <span style={{marginRight: 8}}>{ex.weight}</span>
                                  <button type="button" onClick={() => handleDelete(idx)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff1744', fontSize: '0.8rem', padding: '2px 6px' }}>
                                    <FaTrash />
                                  </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center text-muted py-4">
                                No exercises logged for this date.
                            </td>
                        </tr>
                    )}
                  </tbody>
              </Table>
          </div>
        </Card.Body>
      </Card>

      <ConfirmDialog
        show={confirmDelete !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
};

export default React.memo(WorkoutLog);
