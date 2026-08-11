import React from "react";
import { GraduationCapIcon, FolderIcon, PlusIcon, TrashIcon } from "../icons";

export interface EducationItem {
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  url?: string;
}

interface EducationProjectsTabProps {
  educationList: EducationItem[];
  handleAddEducation: () => void;
  handleRemoveEducation: (index: number) => void;
  eduSchool: string;
  setEduSchool: (val: string) => void;
  eduDegree: string;
  setEduDegree: (val: string) => void;
  eduField: string;
  setEduField: (val: string) => void;
  eduStart: string;
  setEduStart: (val: string) => void;
  eduEnd: string;
  setEduEnd: (val: string) => void;

  projectsList: ProjectItem[];
  handleAddProject: () => void;
  handleRemoveProject: (index: number) => void;
  projName: string;
  setProjName: (val: string) => void;
  projDesc: string;
  setProjDesc: (val: string) => void;
  projUrl: string;
  setProjUrl: (val: string) => void;
}

export default function EducationProjectsTab({
  educationList,
  handleAddEducation,
  handleRemoveEducation,
  eduSchool,
  setEduSchool,
  eduDegree,
  setEduDegree,
  eduField,
  setEduField,
  eduStart,
  setEduStart,
  eduEnd,
  setEduEnd,
  projectsList,
  handleAddProject,
  handleRemoveProject,
  projName,
  setProjName,
  projDesc,
  setProjDesc,
  projUrl,
  setProjUrl,
}: EducationProjectsTabProps) {
  return (
    <div className="space-y-8">
      {/* Education Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <GraduationCapIcon className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-bold text-ink">Education History</h4>
        </div>

        <div className="space-y-3">
          {educationList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No education history added yet.</p>
          ) : (
            educationList.map((edu, index) => (
              <div key={index} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-ink">{edu.degree} in {edu.field_of_study}</p>
                  <p className="text-xs text-slate-500">{edu.school} — <span className="text-slate-400">{edu.start_date} to {edu.end_date}</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Remove education item"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-dashed border-slate-200 pt-4 mt-4 space-y-3.5">
          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Add New Education</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="School (e.g. Stanford University)"
              value={eduSchool}
              onChange={(e) => setEduSchool(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white"
            />
            <input
              type="text"
              placeholder="Degree (e.g. Bachelor of Science)"
              value={eduDegree}
              onChange={(e) => setEduDegree(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white"
            />
            <input
              type="text"
              placeholder="Field of Study (e.g. Computer Science)"
              value={eduField}
              onChange={(e) => setEduField(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <input
              type="text"
              placeholder="Start Date (e.g. Sept 2020)"
              value={eduStart}
              onChange={(e) => setEduStart(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white"
            />
            <input
              type="text"
              placeholder="End Date (e.g. June 2024 or Present)"
              value={eduEnd}
              onChange={(e) => setEduEnd(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddEducation}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary text-primary px-3 py-2 text-sm font-semibold hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4" /> Add Academic Step
            </button>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <FolderIcon className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-bold text-ink">Projects</h4>
        </div>

        <div className="space-y-3">
          {projectsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No projects added yet.</p>
          ) : (
            projectsList.map((proj, index) => (
              <div key={index} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <div className="max-w-[85%]">
                  <p className="text-sm font-semibold text-ink">
                    {proj.name}
                    {proj.url && (
                      <a
                        href={
                          proj.url.startsWith("http://") || proj.url.startsWith("https://")
                            ? proj.url
                            : `https://${proj.url.replace(/^javascript:/i, "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs font-semibold text-primary hover:underline"
                      >
                        View Project ↗
                      </a>
                    )}
                  </p>
                  <p className="text-xs text-slate-550 mt-0.5">{proj.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Remove project item"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-dashed border-slate-200 pt-4 mt-4 space-y-3.5">
          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Add New Project</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Project Name (e.g. Portfolio Website)"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white"
            />
            <input
              type="text"
              placeholder="Project Link (optional, e.g. https://github.com/)"
              value={projUrl}
              onChange={(e) => setProjUrl(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <textarea
              placeholder="Short description of the project, including technical stack..."
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white resize-none"
            />
            <button
              type="button"
              onClick={handleAddProject}
              className="w-full sm:w-[150px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary text-primary px-3 py-2.5 text-sm font-semibold hover:bg-primary hover:text-white transition-all active:scale-[0.98] h-10"
            >
              <PlusIcon className="h-4 w-4" /> Add Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
