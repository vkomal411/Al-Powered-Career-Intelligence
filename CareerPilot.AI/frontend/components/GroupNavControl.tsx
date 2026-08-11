import React from "react";
import { useRouter } from "next/router";
import SlidingSegmentedControl from "./SlidingSegmentedControl";

export interface NavItem {
  id: string;
  label: string;
  route: string;
}

export const RESUME_TOOLS_NAV: NavItem[] = [
  { id: "ats-score-analysis", label: "ATS Score Analysis", route: "/resume-tools/ats-score-analysis" },
  { id: "gap-analysis", label: "Skill Gap Analysis", route: "/resume-tools/gap-analysis" },
  { id: "resume-boost", label: "Resume Boost", route: "/resume-tools/resume-boost" },
  { id: "resume-builder", label: "Resume Builder", route: "/resume-tools/resume-builder" },
];

export const CAREER_TOOLS_NAV: NavItem[] = [
  { id: "learning-level-up", label: "Learning & Level Up", route: "/career-tools/learning-level-up" },
  { id: "job-recommendation", label: "Job Recommendation", route: "/career-tools/job-recommendation" },
  { id: "course-recommendations", label: "Course Recommendations", route: "/career-tools/course-recommendations" },
  { id: "career-roadmap", label: "Career Roadmap", route: "/career-tools/career-roadmap" },
  { id: "interview-question-generator", label: "Interview Question Generator", route: "/career-tools/interview-question-generator" },
];

interface GroupNavControlProps {
  group: "resume-tools" | "career-tools";
  activeId: string;
}

export const GroupNavControl: React.FC<GroupNavControlProps> = ({ group, activeId }) => {
  const router = useRouter();
  const items = group === "resume-tools" ? RESUME_TOOLS_NAV : CAREER_TOOLS_NAV;

  const handleTabChange = (selectedId: string) => {
    const targetItem = items.find((item) => item.id === selectedId);
    if (targetItem) {
      router.push(targetItem.route);
    }
  };

  return (
    <div className="flex flex-col gap-2 pb-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {group === "resume-tools" ? "Resume Tools Group" : "Career Tools Group"}
        </h2>
      </div>
      <SlidingSegmentedControl
        tabs={items.map((i) => ({ id: i.id, label: i.label }))}
        activeId={activeId}
        onChange={handleTabChange}
      />
    </div>
  );
};

export default GroupNavControl;
