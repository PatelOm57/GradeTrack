// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/config/supabase';
import { EditableTitle } from '@/components/editableTitle';
import { LoadingScreen } from '@/components/loadingScreen';
import { AddCourseGroupDialog } from '@/components/dialog/addCourseGroupDialog';
import { AddCourseDialog } from '@/components/dialog/addCourseDialog';

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Dialog States
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);

  // Confirmation Modal Delete States
  const [deletingGroup, setDeletingGroup] = useState<CourseGroup | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const notifyDemoBlocked = () => {
    setNotice('Demo Mode: Cannot Edit');
    setTimeout(() => setNotice(null), 3500);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const demoParam = searchParams.get('demo') === 'true';

        if (!demoParam) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            router.push('/login');
            return;
          }
        }

        setIsDemo(demoParam);

        let groupsQuery = supabase.from('course_group').select('*').order('id', { ascending: true });
        let coursesQuery = supabase.from('courses').select('*').order('id', { ascending: true });

        if (demoParam) {
          groupsQuery = groupsQuery.eq('user_id', '00000000-0000-0000-0000-000000000000');
          coursesQuery = coursesQuery.eq('user_id', '00000000-0000-0000-0000-000000000000');
        }

        const { data: groupsData, error: groupsErr } = await groupsQuery;
        if (groupsErr) throw groupsErr;

        const { data: coursesData, error: coursesErr } = await coursesQuery;
        if (coursesErr) throw coursesErr;

        setCourseGroups(groupsData || []);
        setCourses(coursesData || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router, searchParams]);

  const handleAuthAction = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleRenameGroup = async (id: number, newName: string) => {
    if (isDemo) return notifyDemoBlocked();
    setCourseGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: newName } : g))
    );
    await supabase.from('course_group').update({ name: newName }).eq('id', id);
  };

  const handleRenameCourse = async (id: number, field: string, level: string) => {
    if (isDemo) return notifyDemoBlocked();
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, field, level } : c))
    );
    await supabase.from('courses').update({ field, level }).eq('id', id);
  };

  const handleCreateCourseGroup = async (name: string) => {
    if (isDemo) return notifyDemoBlocked();
    const { data, error } = await supabase
      .from('course_group')
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      console.error('Error creating course group:', error.message);
    } else if (data) {
      setCourseGroups((prev) => [...prev, data]);
    }
  };

  const handleOpenAddCourse = (groupId: number) => {
    if (isDemo) return notifyDemoBlocked();
    setTargetGroupId(groupId);
    setShowAddCourseDialog(true);
  };

  const handleCreateCourse = async (
    cgroupId: number,
    field: string,
    level: string,
    target: number
  ) => {
    if (isDemo) return notifyDemoBlocked();
    const payload = { cgroup_id: cgroupId, field, level, target };
    const { data, error } = await supabase.from('courses').insert([payload]).select().single();

    if (error) {
      console.error('Error adding course:', error.message);
    } else if (data) {
      setCourses((prev) => [...prev, data]);
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (isDemo) return notifyDemoBlocked();
    if (!deletingGroup) return;
    const groupId = deletingGroup.id;
    setCourseGroups((prev) => prev.filter((g) => g.id !== groupId));
    setCourses((prev) => prev.filter((c) => c.cgroup_id !== groupId));
    setDeletingGroup(null);

    await supabase.from('courses').delete().eq('cgroup_id', groupId);
    await supabase.from('course_group').delete().eq('id', groupId);
  };

  const handleConfirmDeleteCourse = async () => {
    if (isDemo) return notifyDemoBlocked();
    if (!deletingCourse) return;
    const courseId = deletingCourse.id;
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setDeletingCourse(null);

    await supabase.from('courses').delete().eq('id', courseId);
  };

  const activeGroup = courseGroups.find((g) => g.id === targetGroupId);

  if (loading) return <LoadingScreen message="Loading your dashboard..." variant="skeleton" />;
  if (error) return <div className="gt-error-state">Error: {error}</div>;

  return (
    <main className="gt-dashboard-layout">
      {/* Blocked Notification Toast */}
      {notice && (
        <div className="fixed top-4 right-4 z-50 p-3 bg-red-600 text-white border-2 border-black rounded-md text-xs font-extrabold shadow-lg animate-bounce">
          {notice}
        </div>
      )}

      {/* Main Header Row with Centered Title and Top-Right Action Button */}
      <div className="relative flex items-center justify-between mb-6 mt-1">
        <div className="flex-1" />
        <h1 className="gt-dashboard-title !m-0 !text-center">GradeTrack Dashboard</h1>
        <div className="flex-1 flex justify-end">
          <button
            type="button"
            onClick={handleAuthAction}
            className="gt-btn-cancel gt-pop-target text-xs px-3 py-1.5 font-bold text-slate-800 hover:text-red-600 hover:border-red-500"
            title={isDemo ? 'Exit Demo Mode' : 'Sign out of GradeTrack'}
          >
            {isDemo ? 'Exit Demo' : 'Sign Out'}
          </button>
        </div>
      </div>

      {courseGroups.map((group) => {
        const groupCourses = courses.filter((c) => c.cgroup_id === group.id);

        return (
          <section key={group.id} className="gt-semester-group">
            <EditableTitle
              initialValue={group.name}
              mode="group"
              className="gt-group-title-text"
              onSave={() => {}}
              onSaveGroup={(newName) => handleRenameGroup(group.id, newName)}
              onDelete={() => (isDemo ? notifyDemoBlocked() : setDeletingGroup(group))}
              titleTip="Edit semester name"
            />

            <div className="gt-course-grid">
              {groupCourses.map((course) => (
                <Link 
                  key={course.id}
                  href={`/course/${course.id}${isDemo ? '?demo=true' : ''}`} 
                  className="gt-course-card-link"
                >
                  <div className="gt-course-card gt-pop-target">
                    <div>
                      <EditableTitle
                        initialValue={`${course.field} ${course.level}`}
                        mode="course"
                        className="gt-course-card-title"
                        onSave={(field, level) => handleRenameCourse(course.id, field, level)}
                        onDelete={() => (isDemo ? notifyDemoBlocked() : setDeletingCourse(course))}
                        titleTip="Edit course title"
                      />

                      <div className="gt-course-target-link">
                        Target: {course.target}%
                      </div>
                    </div>

                    <div className="gt-course-grade-value">
                      {course.currentGrade ? `${course.currentGrade}%` : '---'}
                    </div>
                  </div>
                </Link>
              ))}

              <button
                type="button"
                onClick={() => handleOpenAddCourse(group.id)}
                className="gt-add-course-square-btn gt-pop-target"
                title={`Add course to ${group.name}`}
              >
                +
              </button>
            </div>
          </section>
        );
      })}

      <div className="gt-add-course-group-wrapper">
        <button
          type="button"
          onClick={() => (isDemo ? notifyDemoBlocked() : setShowAddGroupDialog(true))}
          className="gt-add-course-group-btn gt-pop-target"
        >
          + Add Course Group
        </button>
      </div>

      {/* Modals */}
      <AddCourseGroupDialog
        isOpen={showAddGroupDialog}
        onClose={() => setShowAddGroupDialog(false)}
        onCreateGroup={handleCreateCourseGroup}
      />

      <AddCourseDialog
        isOpen={showAddCourseDialog}
        onClose={() => setShowAddCourseDialog(false)}
        targetGroupId={targetGroupId}
        targetGroupName={activeGroup?.name}
        onCreateCourse={handleCreateCourse}
      />

      {/* Delete Group Modal */}
      {deletingGroup && (
        <div className="gt-modal-overlay" onClick={() => setDeletingGroup(null)}>
          <div className="gt-modal-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="gt-modal-title">Delete Course Group?</h4>
            <p className="gt-modal-text">
              Are you sure you want to delete <strong>{deletingGroup.name}</strong>? This action will permanently remove all courses inside this group.
            </p>

            <div className="gt-modal-actions">
              <button 
                type="button"
                onClick={() => setDeletingGroup(null)}
                className="gt-btn-cancel gt-pop-target"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmDeleteGroup}
                className="gt-btn-delete gt-pop-target"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {deletingCourse && (
        <div className="gt-modal-overlay" onClick={() => setDeletingCourse(null)}>
          <div className="gt-modal-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="gt-modal-title">Delete Course?</h4>
            <p className="gt-modal-text">
              Are you sure you want to delete <strong>{deletingCourse.field} {deletingCourse.level}</strong>? All grade groups and grades within this course will be permanently removed.
            </p>

            <div className="gt-modal-actions">
              <button 
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="gt-btn-cancel gt-pop-target"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmDeleteCourse}
                className="gt-btn-delete gt-pop-target"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}