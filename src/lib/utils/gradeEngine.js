export function getAssignmentPercentage(grade) {
  if (!grade) return null;

  if (grade.is_points) {
    if (grade.auto_percent !== false) {
      if (grade.points !== null && grade.points !== undefined && grade.points_of) {
        return (Number(grade.points) / Number(grade.points_of)) * 100;
      }
      return null;
    }
    return grade.percent !== null && grade.percent !== undefined ? Number(grade.percent) : null;
  }

  return grade.percent !== null && grade.percent !== undefined ? Number(grade.percent) : null;
}

export function calculateGroupScore(group, grades) {
  if (!grades || grades.length === 0) return null;

  if (group.is_pure_points) {
    const validPointGrades = grades.filter(
      g => g.points !== null && g.points !== undefined && g.points_of
    );
    if (validPointGrades.length === 0) return null;

    const totalEarned = validPointGrades.reduce((sum, g) => sum + Number(g.points), 0);
    const totalPossible = validPointGrades.reduce((sum, g) => sum + Number(g.points_of), 0);

    return totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
  }

  const validPercentages = grades
    .map(g => getAssignmentPercentage(g))
    .filter(val => val !== null);

  if (validPercentages.length === 0) return null;

  const sum = validPercentages.reduce((acc, val) => acc + val, 0);
  return sum / validPercentages.length;
}

export function calculateCourseGrade(gradeGroups = [], gradesByGroupId = {}) {
  let weightedPointsEarned = 0;
  let totalCompletedWeight = 0;

  const groupSummaries = gradeGroups.map(group => {
    const groupWeight = Number(group.weight) || 0;
    const groupGrades = gradesByGroupId[group.id] || [];
    const subgrade = calculateGroupScore(group, groupGrades);

    if (subgrade !== null) {
      const weightedContribution = (subgrade * groupWeight) / 100;
      weightedPointsEarned += weightedContribution;
      totalCompletedWeight += groupWeight;

      return { id: group.id, name: group.name, weight: groupWeight, subgrade, isCompleted: true };
    }

    return { id: group.id, name: group.name, weight: groupWeight, subgrade: null, isCompleted: false };
  });

  const currentGrade = totalCompletedWeight > 0 
    ? (weightedPointsEarned / totalCompletedWeight) * 100 
    : null;

  return {
    currentGrade,
    completedWeight: totalCompletedWeight,
    remainingWeight: Math.max(0, 100 - totalCompletedWeight),
    groupSummaries
  };
}