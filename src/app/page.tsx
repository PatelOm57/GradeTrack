'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/config/supabase';
import { getStorageMode } from '@/lib/local/session';
import { localStorageEngine } from '@/lib/local/storage';
import { EditableTitle } from '@/components/editableTitle';
import { ModeIndicator } from '@/components/modeIndicator';

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

export default function Home() {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const mode = getStorageMode();

        if (mode === 'local') {
          // Local Storage
          const groupsData = localStorageEngine.getCourseGroups();
          const coursesData = localStorageEngine.getCourses();
          setCourseGroups(groupsData);
          setCourses(coursesData);
        } else {
          // Supabase Cloud Storage
          let { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
            const testPassword = process.env.NEXT_PUBLIC_TEST_PASS;

            if (testEmail && testPassword) {
              const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword,
              });
              if (authErr) throw authErr;
              session = authData.session;
            }
          }

          const { data: groupsData, error: groupsErr } = await supabase
            .from('course_group')
            .select('*')
            .order('id', { ascending: true });
          if (groupsErr) throw groupsErr;

          const { data: coursesData, error: coursesErr } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true });
          if (coursesErr) throw coursesErr;

          setCourseGroups(groupsData || []);
          setCourses(coursesData || []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleRenameGroup = async (id: number, newName: string) => {
    setCourseGroups((prev) =>
      prev.map((g) => (Number(g.id) === Number(id) ? { ...g, name: newName } : g))
    );
    const mode = getStorageMode();

    if (mode === 'local') {
      localStorageEngine.updateCourseGroup(id, newName);
    } else {
      await supabase.from('course_group').update({ name: newName }).eq('id', id);
    }
  };

  // Rename course
  const handleRenameCourse = async (id: number, field: string, level: string) => {
    setCourses((prev) =>
      prev.map((c) => (Number(c.id) === Number(id) ? { ...c, field, level } : c))
    );
    const mode = getStorageMode();

    if (mode === 'local') {
      localStorageEngine.updateCourse(id, field, level);
    } else {
      await supabase.from('courses').update({ field, level }).eq('id', id);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Mode Switch */}
      <ModeIndicator />

      <h1 className="text-3xl font-bold">GradeTrack Dashboard</h1>

      {courseGroups.map((group) => {
        // Coerce types to explicit numbers to avoid string/number mismatch
        const groupCourses = courses.filter((c) => Number(c.cgroup_id) === Number(group.id));

        return (
          <section key={group.id} className="border p-6 rounded-xl space-y-4 bg-slate-50/50">
            <EditableTitle
              initialValue={group.name}
              mode="group"
              onSave={() => {}}
              onSaveGroup={(newName) => handleRenameGroup(group.id, newName)}
              titleTip="Click to rename semester"
            />

            <div className="flex flex-wrap gap-4">
              {groupCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="w-56 h-36 border p-4 rounded-lg bg-white hover:shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <EditableTitle
                      initialValue={`${course.field} ${course.level}`}
                      mode="course"
                      className="text-lg font-bold"
                      onSave={(field, level) => handleRenameCourse(course.id, field, level)}
                      titleTip="Click to rename course"
                    />

                    <div>
                      <Link href={`/course/${course.id}`} className="text-xs text-slate-500 hover:underline">
                        Target: {course.target}%
                      </Link>
                    </div>
                  </div>

                  <Link href={`/course/${course.id}`}>
                    <div className="text-xl font-semibold text-blue-600">
                      {course.currentGrade ? `${course.currentGrade}%` : '---'}
                    </div>
                  </Link>
                </div>
              ))}

              {groupCourses.length === 0 && (
                <div className="text-sm text-slate-400 italic">No courses in this group.</div>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}