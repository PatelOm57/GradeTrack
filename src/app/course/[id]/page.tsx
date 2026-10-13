'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/config/supabase';
import { EditableTitle } from '@/components/editableTitle';
import { GradeGroup, GradeGroupType } from '@/components/gradeGroup';
import { GradeItem } from '@/components/gradeCard';
import { LoadingScreen } from '@/components/loadingScreen';

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

  // New Group Modal State
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupWeight, setNewGroupWeight] = useState('10');

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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const weightNum = parseFloat(newGroupWeight) || 0;

    const payload = {
      course_id: courseId,
      name: newGroupName.trim(),
      weight: weightNum,
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
      setNewGroupName('');
      setNewGroupWeight('10');
      setShowAddGroupModal(false);
    }
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

  // Calculate Total Weight across all grade groups
  const totalGroupWeight = gradeGroups.reduce((acc, g) => acc + (g.weight || 0), 0);

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

      {/* Sub-Header Actions Row (Under Header Block) */}
      <div className="gt-course-actions-bar">
        {/* Left Side: Add Grade Group */}
        <button
          type="button"
          onClick={() => setShowAddGroupModal(true)}
          className="gt-add-group-btn gt-pop-target"
        >
          + Add Grade Group
        </button>

        {/* Right Side: Group Weight Percentage Total Indicator */}
        <div className="gt-weight-total-wrapper">
          <div className={`gt-weight-total-badge ${getWeightStatusClass()}`}>
            <span>Group Percentage Totals:</span>
            <span>{totalGroupWeight}%</span>
          </div>

          {/* Hover Tooltip */}
          <div className="gt-tooltip">
            <div className="gt-tooltip-title">Weight Allocation Rules</div>
            <div className="gt-tooltip-list">
              <div className="gt-tooltip-item">
                <span className="gt-tooltip-dot gt-dot-yellow" />
                <span><strong>Yellow (&lt; 100%):</strong> Incomplete total weight.</span>
              </div>
              <div className="gt-tooltip-item">
                <span className="gt-tooltip-dot gt-dot-green" />
                <span><strong>Green (= 100%):</strong> Correct weights across groups.</span>
              </div>
              <div className="gt-tooltip-item">
                <span className="gt-tooltip-dot gt-dot-red" />
                <span><strong>Red (&gt; 100%):</strong> Total exceeds 100%.</span>
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
          />
        ))}
      </div>

      {/* Add Grade Group Modal */}
      {showAddGroupModal && (
        <div className="gt-modal-overlay" onClick={() => setShowAddGroupModal(false)}>
          <div className="gt-modal-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="gt-modal-title">Create Grade Group</h4>
            
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase text-slate-500">Group Name</label>
              <input
                type="text"
                placeholder="e.g. Quizzes, Midterms, Assignments"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                autoFocus
                className="gt-editable-title-input"
              />

              <label className="text-xs font-bold uppercase text-slate-500">Weight (%)</label>
              <input
                type="number"
                placeholder="10"
                value={newGroupWeight}
                onChange={(e) => setNewGroupWeight(e.target.value)}
                className="gt-editable-title-input"
              />
            </div>

            <div className="gt-modal-actions">
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                className="gt-btn-cancel gt-pop-target"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateGroup}
                className="gt-btn-primary gt-pop-target"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}