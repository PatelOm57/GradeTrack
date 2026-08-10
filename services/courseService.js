import { supabase } from '@lib/config/supabase.js';

// Course Groups

export async function createCourseGroup(name, userId) {
  const { data, error } = await supabase
    .from('course_group')
    .insert([{ name, user_id: userId }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserCourseGroups(userId) {
  const { data, error } = await supabase
    .from('course_group')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data;
}

// Courses

export async function createCourse({ field, level, target, cgroupId, userId }) {
  const { data, error } = await supabase
    .from('courses')
    .insert([{
      field,
      level,
      target,
      cgroup_id: cgroupId,
      user_id: userId
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserCourses(userId) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data;
}

// Grade Groups

export async function createGradeGroup({ name, weight, isPurePoints = false, courseId, userId }) {
  const { data, error } = await supabase
    .from('grade_group')
    .insert([{
      name,
      weight,
      is_pure_points: isPurePoints,
      course_id: courseId,
      user_id: userId
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateGradeGroupMode(groupId, isPurePoints) {
  const { data, error } = await supabase
    .from('grade_group')
    .update({ is_pure_points: isPurePoints })
    .eq('id', groupId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Grades

export async function createGrade({ 
  name, 
  ggroupId, 
  userId, 
  isPoints = false, 
  autoPercent = true, 
  percent = null, 
  points = null, 
  pointsOf = null 
}) {
  const { data, error } = await supabase
    .from('grades')
    .insert([{
      name,
      ggroup_id: ggroupId,
      user_id: userId,
      is_points: isPoints,
      auto_percent: autoPercent,
      percent,
      points,
      points_of: pointsOf
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Bulk Toggle: Sets auto_percent for all grades in a specific Grade Group
 */
export async function setGroupAutoPercent(ggroupId, autoPercent) {
  const { data, error } = await supabase
    .from('grades')
    .update({ auto_percent: autoPercent })
    .eq('ggroup_id', ggroupId)
    .select();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Bulk Toggle: Sets auto_percent for all grades across an entire Course
 */
export async function setCourseAutoPercent(courseId, autoPercent) {
  // 1. Fetch all ggroup_ids belonging to this course
  const { data: groups, error: groupErr } = await supabase
    .from('grade_group')
    .select('id')
    .eq('course_id', courseId);

  if (groupErr) throw new Error(groupErr.message);

  const ggroupIds = groups.map(g => g.id);
  if (ggroupIds.length === 0) return [];

  // 2. Update auto_percent across all matching grades
  const { data, error } = await supabase
    .from('grades')
    .update({ auto_percent: autoPercent })
    .in('ggroup_id', ggroupIds)
    .select();

  if (error) throw new Error(error.message);
  return data;
}