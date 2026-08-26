import { GradeItem } from '@/components/gradeCard';
import { GradeGroupType } from '@/components/gradeGroup';

export interface CourseGroup {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  cgroup_id: number;
  field: string;
  level: string;
  target: number;
  currentGrade?: number | null;
  completedWeight?: number | null;
}

{/* TEST DATA START */}

const STORAGE_KEYS = {
  COURSE_GROUPS: 'gradetrack_local_course_groups',
  COURSES: 'gradetrack_local_courses',
  GROUPS: 'gradetrack_local_groups',
  GRADES: 'gradetrack_local_grades',
};

const DEFAULT_COURSE_GROUPS: CourseGroup[] = [
  { id: 101, name: 'Spring 2026 (Local Offline)' },
];

const DEFAULT_COURSES: Course[] = [
  { id: 201, cgroup_id: 101, field: 'MATH', level: '201', target: 85.0 },
  { id: 202, cgroup_id: 101, field: 'PHYS', level: '150', target: 90.0 },
];

const DEFAULT_GROUPS: (GradeGroupType & { is_pure_points?: boolean })[] = [
  { id: 301, course_id: 201, name: 'Homework', weight: 40, is_pure_points: false },
  { id: 302, course_id: 201, name: 'Midterms', weight: 60, is_pure_points: false },
  { id: 303, course_id: 202, name: 'Lab Reports', weight: 50, is_pure_points: false },
];

const DEFAULT_GRADES: GradeItem[] = [
  {
    id: 401,
    ggroup_id: 301,
    name: 'HW (Local)',
    is_points: true,
    points: 10,
    points_of: 10,
    percent: null,
    auto_percent: false,
  },
  {
    id: 402,
    ggroup_id: 302,
    name: 'Midterm (Local)',
    is_points: true,
    points: 82,
    points_of: 100,
    percent: null,
    auto_percent: false,
  },
];

{/* TEST DATA END */}

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const localStorageEngine = {
  // Course Groups
  getCourseGroups: (): CourseGroup[] => {
    return getStoredItem<CourseGroup[]>(STORAGE_KEYS.COURSE_GROUPS, DEFAULT_COURSE_GROUPS);
  },
  updateCourseGroup: (groupId: number, name: string): void => {
    const groups = localStorageEngine.getCourseGroups();
    const updated = groups.map((g) => (g.id === groupId ? { ...g, name } : g));
    setStoredItem(STORAGE_KEYS.COURSE_GROUPS, updated);
  },

  // Courses
  getCourses: (): Course[] => {
    return getStoredItem<Course[]>(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
  },
  getCourseById: (courseId: number): Course | null => {
    const courses = localStorageEngine.getCourses();
    return courses.find((c) => c.id === courseId) || null;
  },
  updateCourse: (courseId: number, field: string, level: string): void => {
    const courses = localStorageEngine.getCourses();
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, field, level } : c
    );
    setStoredItem(STORAGE_KEYS.COURSES, updated);
  },

  // Grade Groups
  getGroupsByCourseId: (courseId: number): GradeGroupType[] => {
    const groups = getStoredItem<GradeGroupType[]>(STORAGE_KEYS.GROUPS, DEFAULT_GROUPS);
    return groups.filter((g) => g.course_id === courseId);
  },

  // Grades
  getGradesByGroupIds: (groupIds: number[]): GradeItem[] => {
    const grades = getStoredItem<GradeItem[]>(STORAGE_KEYS.GRADES, DEFAULT_GRADES);
    return grades.filter((g) => groupIds.includes(g.ggroup_id));
  },
  updateGradeScore: (
    gradeId: number,
    points: number | null,
    percent: number | null
  ): void => {
    const grades = getStoredItem<GradeItem[]>(STORAGE_KEYS.GRADES, DEFAULT_GRADES);
    const updated = grades.map((g) =>
      g.id === gradeId ? { ...g, points, percent } : g
    );
    setStoredItem(STORAGE_KEYS.GRADES, updated);
  },
  deleteGrade: (gradeId: number): void => {
    const grades = getStoredItem<GradeItem[]>(STORAGE_KEYS.GRADES, DEFAULT_GRADES);
    const updated = grades.filter((g) => g.id !== gradeId);
    setStoredItem(STORAGE_KEYS.GRADES, updated);
  },
  addGrade: (groupId: number): GradeItem => {
    const grades = getStoredItem<GradeItem[]>(STORAGE_KEYS.GRADES, DEFAULT_GRADES);
    const newGrade: GradeItem = {
      id: Date.now(),
      ggroup_id: groupId,
      name: 'New Item',
      is_points: true,
      points: null,
      points_of: 10,
      percent: null,
      auto_percent: false,
    };
    setStoredItem(STORAGE_KEYS.GRADES, [...grades, newGrade]);
    return newGrade;
  },
};