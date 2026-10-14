// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);

  // Confirmation Modal Delete States
  const [deletingGroup, setDeletingGroup] = useState<CourseGroup | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
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
      prev.map((g) => (g.id === id ? { ...g, name: newName } : g))
    );
    await supabase.from('course_group').update({ name: newName }).eq('id', id);
  };

  const handleRenameCourse = async (id: number, field: string, level: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, field, level } : c))
    );
    await supabase.from('courses').update({ field, level }).eq('id', id);
  };

  const handleCreateCourseGroup = async (name: string) => {
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
    setTargetGroupId(groupId);
    setShowAddCourseDialog(true);
  };

  const handleCreateCourse = async (
    cgroupId: number,
    field: string,
    level: string,
    target: number
  ) => {
    const payload = {
      cgroup_id: cgroupId,
      field,
      level,
      target,
    };

    const { data, error } = await supabase
      .from('courses')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error adding course:', error.message);
    } else if (data) {
      setCourses((prev) => [...prev, data]);
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!deletingGroup) return;
    const groupId = deletingGroup.id;
    setCourseGroups((prev) => prev.filter((g) => g.id !== groupId));
    setCourses((prev) => prev.filter((c) => c.cgroup_id !== groupId));
    setDeletingGroup(null);

    await supabase.from('courses').delete().eq('cgroup_id', groupId);
    await supabase.from('course_group').delete().eq('id', groupId);
  };

  const handleConfirmDeleteCourse = async () => {
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
      <h1 className="gt-dashboard-title">GradeTrack Dashboard</h1>

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
              onDelete={() => setDeletingGroup(group)}
              titleTip="Edit semester name"
            />

            <div className="gt-course-grid">
              {groupCourses.map((course) => (
                <Link 
                  key={course.id}
                  href={`/course/${course.id}`} 
                  className="gt-course-card-link"
                >
                  <div className="gt-course-card gt-pop-target">
                    <div>
                      <EditableTitle
                        initialValue={`${course.field} ${course.level}`}
                        mode="course"
                        className="gt-course-card-title"
                        onSave={(field, level) => handleRenameCourse(course.id, field, level)}
                        onDelete={() => setDeletingCourse(course)}
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

              {/* Minimalist Small Square "+" Button */}
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

      {/* Add Course Group Button (Centered at bottom) */}
      <div className="gt-add-course-group-wrapper">
        <button
          type="button"
          onClick={() => setShowAddGroupDialog(true)}
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