const getBMR = (gender, weight, height, age) => {
  if (!weight || !height || !age) return 0;
  if (gender === 'Male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
};

export const getCalorieGoal = (userInfo) => {
  if (!userInfo) return 2000;
  const weight = userInfo.weight || 70;
  const height = userInfo.height || 170;
  const age = userInfo.age || 25;
  const gender = userInfo.gender || 'Male';
  const userGoal = userInfo.goal || 'Maintain';

  const bmr = getBMR(gender, weight, height, age);
  const tdee = bmr * 1.55;

  if (userGoal === 'Cut') {
    return Math.round(tdee - 500);
  } else if (userGoal === 'Bulk') {
    return Math.round(tdee + 500);
  }
  return Math.round(tdee);
};

export const getMacroTargets = (weight) => {
  const w = weight || 70;
  return {
    protein: Math.round(w * 2.2),
    carbs: Math.round(w * 3),
    fats: Math.round(w * 0.8),
  };
};
