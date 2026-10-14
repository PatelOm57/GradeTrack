// src/app/course/[id]/page.tsx
'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/config/supabase';
import { EditableTitle } from '@/components/editableTitle';
import { GradeGroup, GradeGroupType } from '@/components/gradeGroup';
import { GradeItem } from '@/components/gradeCard';
import { LoadingScreen } from '@/components/loadingScreen';
import { AddGroupDialog } from '@/components/dialog/addGroupDialog';
import { AddGradeItemDialog } from '@/components/dialog/addGradeItemDialog';
import { EditGradeItemDialog } from '@/components/dialog/editGradeItemDialog';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);

  const [courseTitle, setCourseTitle] = useState<string>('');
  const [gradeGroups, setGradeGroups] = useState<GradeGroupType[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dialog Visibility States
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: courseData, error: courseErr } = await supabase
          .from('courses')
          .select('field, level')
          .eq('id', courseId)
          .single();

        if (courseErr) console.error('Error fetching course:', courseErr.message);
        if (courseData) setCourseTitle(`${courseData.field} ${courseData.level}`);

        const { data: groupData, error: groupErr } = await supabase
          .from('grade_group')
          .select('*')
          .eq('course_id', courseId)
          .order('id', { ascending: true });

        if (groupErr) console.error('Error fetching grade_group:', groupErr.message);
        const fetchedGroups = groupData || [];
        setGradeGroups(fetchedGroups);

        if (fetchedGroups.length > 0) {
          const groupIds = fetchedGroups.map((g) => g.id);

          const { data: gradesData, error: gradesErr } = await supabase
            .from('grades')
            .select('*')
            .in('ggroup_id', groupIds)
            .order('id', { ascending: true });

          if (gradesErr) console.error('Error fetching grades:', gradesErr.message);
          setGrades(gradesData || []);
        } else {
          setGrades([]);
        }
      } catch (err) {
        console.error('Unexpected error loading course details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) fetchData();
  }, [courseId]);

  const handleRenameCourse = async (field: string, level: string) => {
    setCourseTitle(`${field} ${level}`);
    await supabase.from('courses').update({ field, level }).eq('id', courseId);
  };

  const handleUpdateScore = async (
    gradeId: number,
    newPoints: number | null,
    newPercent: number | null
  ) => {
    setGrades((prev) =>
      prev.map((g) =>
        g.id === gradeId ? { ...g, points: newPoints, percent: newPercent } : g
      )
    );

    await supabase
      .from('grades')
      .update({ points: newPoints, percent: newPercent })
      .eq('id', gradeId);
  };

  const handleDeleteGrade = async (gradeId: number) => {
    setGrades((prev) => prev.filter((g) => g.id !== gradeId));
    await supabase.from('grades').delete().eq('id', gradeId);
  };

  const handleDeleteGroup = async (groupId: number) => {
    setGradeGroups((prev) => prev.filter((g) => g.id !== groupId));
    setGrades((prev) => prev.filter((g) => g.ggroup_id !== groupId));

    await supabase.from('grades').delete().eq('ggroup_id', groupId);
    await supabase.from('grade_group').delete().eq('id', groupId);
  };

  const handleUpdateGroup = async (groupId: number, newName: string, newWeight: number) => {
    setGradeGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: newName, weight: newWeight } : g))
    );

    await supabase
      .from('grade_group')
      .update({ name: newName, weight: newWeight })
      .eq('id', groupId);
  };

  const handleCreateGroup = async (name: string, weight: number) => {
    const payload = {
      course_id: courseId,
      name,
      weight,
    };

    const { data, error } = await supabase
      .from('grade_group')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error creating grade group:', error.message);
    } else if (data) {
      setGradeGroups((prev) => [...prev, data]);
    }
  };

  const handleOpenAddItemForGroup = (groupId: number) => {
    setTargetGroupId(groupId);
    setShowAddItemDialog(true);
  };

  const handleOpenConfigureGrade = (grade: GradeItem) => {
    setEditingGradeId(grade.id);
    setShowEditItemDialog(true);
  };

  const handleCreateGradeItem = async (
    groupId: number,
    name: string,
    points: number | null,
    pointsOf: number,
    note: string | null
  ) => {
    const computedPercent =
      points !== null && pointsOf > 0 ? (points / pointsOf) * 100 : null;

    const newGradePayload = {
      ggroup_id: groupId,
      name,
      is_points: true,
      points,
      points_of: pointsOf,
      percent: computedPercent,
      note,
      auto_percent: false,
    };

    const { data, error } = await supabase
      .from('grades')
      .insert([newGradePayload])
      .select()
      .single();

    if (error) {
      console.error('Error adding grade item:', error.message);
    } else if (data) {
      setGrades((prev) => [...prev, data]);
    }
  };

  const handleSaveGradeItem = async (
    id: number,
    newName: string,
    newPoints: number | null,
    newPointsOf: number,
    newNote: string | null
  ) => {
    const computedPercent =
      newPoints !== null && newPointsOf > 0 ? (newPoints / newPointsOf) * 100 : null;

    setGrades((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              name: newName,
              points: newPoints,
              points_of: newPointsOf,
              percent: computedPercent,
              note: newNote,
            }
          : g
      )
    );

    await supabase
      .from('grades')
      .update({
        name: newName,
        points: newPoints,
        points_of: newPointsOf,
        percent: computedPercent,
        note: newNote,
      })
      .eq('id', id);
  };

  const calculateOverallGrade = () => {
    let totalWeightedScore = 0;
    let totalWeightCompleted = 0;

    gradeGroups.forEach((group) => {
      const groupGrades = grades.filter((g) => g.ggroup_id === group.id);

      let totalEarnedPoints = 0;
      let totalPossiblePoints = 0;
      let percentSum = 0;
      let percentCount = 0;

      groupGrades.forEach((g) => {
        if (g.is_points) {
          if (
            g.points !== null &&
            g.points !== undefined &&
            g.points_of &&
            g.points_of > 0
          ) {
            totalEarnedPoints += g.points;
            totalPossiblePoints += g.points_of;
          }
        } else {
          if (g.percent !== null && g.percent !== undefined) {
            percentSum += g.percent;
            percentCount += 1;
          }
        }
      });

      let groupPct: number | null = null;
      if (totalPossiblePoints > 0) {
        groupPct = totalEarnedPoints / totalPossiblePoints;
      } else if (percentCount > 0) {
        groupPct = percentSum / percentCount / 100;
      }

      if (groupPct !== null) {
        totalWeightedScore += groupPct * group.weight;
        totalWeightCompleted += group.weight;
      }
    });

    if (totalWeightCompleted === 0) return null;
    return Math.round((totalWeightedScore / totalWeightCompleted) * 100);
  };

  const overallGrade = calculateOverallGrade();
  const totalGroupWeight = gradeGroups.reduce((acc, g) => acc + (g.weight || 0), 0);
  const activeGroup = gradeGroups.find((g) => g.id === targetGroupId);
  const currentEditingGrade = grades.find((g) => g.id === editingGradeId) || null;

  const getWeightStatusClass = () => {
    if (totalGroupWeight < 100) return 'gt-weight-under';
    if (totalGroupWeight === 100) return 'gt-weight-exact';
    return 'gt-weight-over';
  };

  if (loading) return <LoadingScreen message="Loading course details..." variant="spinner" />;

  return (
    <main className="gt-course-detail-layout">
      {/* Standard Navigation */}
      <nav className="gt-course-nav">
        <Link href="/" className="gt-back-link gt-pop-target">
          ← Back to Dashboard
        </Link>
        <div className="gt-nav-status">Connected to Supabase</div>
      </nav>

      {/* Course Header Bar */}
      <header className="gt-course-header">
        <EditableTitle
          initialValue={courseTitle}
          mode="course"
          className="gt-course-main-title"
          onSave={handleRenameCourse}
          titleTip="Edit course title"
        />

        <div className="gt-overall-grade-container">
          <div className="gt-overall-grade-label">Overall Grade</div>
          <div className="gt-overall-grade-value">
            {overallGrade !== null ? `${overallGrade}%` : '---'}
          </div>
        </div>
      </header>

      {/* Sub-Header Actions Row */}
      <div className="gt-course-actions-bar">
        <button
          type="button"
          onClick={() => setShowAddGroupDialog(true)}
          className="gt-add-group-btn gt-pop-target"
        >
          + Add Grade Group
        </button>

        <div className="gt-weight-total-wrapper">
          <div className={`gt-weight-total-badge ${getWeightStatusClass()}`}>
            <span>Group Percentage Totals:</span>
            <span>{totalGroupWeight}%</span>
          </div>

          <div className="gt-tooltip">
            <div className="gt-tooltip-title">Weight Allocation Rules</div>
            <div className="gt-tooltip-list">
              <div className="gt-tooltip-item">
                <span className="gt-tooltip-dot gt-dot-yellow" />
                <span><strong>Yellow (&lt; 100%):</strong> Incomplete total weight.</span>
              </div>
              <div className="gt-tooltip-item">
                <span className="gt-tooltip-dot gt-dot-green" />
                <span><strong>Green (= 100%):</strong> Perfectly balanced course syllabus.</span>
              </div>
              <div className="gt-tooltip-item">
                <span className="gt-tooltip-dot gt-dot-red" />
                <span><strong>Red (&gt; 100%):</strong> Total exceeds 100% syllabus limit.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Groups Container */}
      <div className="gt-grade-groups-container">
        {gradeGroups.map((group) => (
          <GradeGroup
            key={group.id}
            group={group}
            grades={grades.filter((g) => g.ggroup_id === group.id)}
            onUpdateScore={handleUpdateScore}
            onDeleteGrade={handleDeleteGrade}
            onDeleteGroup={handleDeleteGroup}
            onUpdateGroup={handleUpdateGroup}
            onOpenAddItemForGroup={handleOpenAddItemForGroup}
            onConfigureGrade={handleOpenConfigureGrade}
          />
        ))}
      </div>

      {/* Componentized Dialogs */}
      <AddGroupDialog
        isOpen={showAddGroupDialog}
        onClose={() => setShowAddGroupDialog(false)}
        onCreateGroup={handleCreateGroup}
      />

      <AddGradeItemDialog
        isOpen={showAddItemDialog}
        onClose={() => setShowAddItemDialog(false)}
        targetGroupId={targetGroupId}
        targetGroupName={activeGroup?.name}
        onCreateItem={handleCreateGradeItem}
      />

      <EditGradeItemDialog
        isOpen={showEditItemDialog}
        onClose={() => setShowEditItemDialog(false)}
        grade={currentEditingGrade}
        onSave={handleSaveGradeItem}
      />
    </main>
  );
}