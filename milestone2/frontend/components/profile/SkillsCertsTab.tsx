import React from "react";
import { BriefcaseIcon, AwardIcon, PlusIcon, TrashIcon, SyncIcon } from "../icons";

export interface CertificationItem {
  name: string;
  issuer: string;
  issue_date: string;
  file_url?: string;
  file_name?: string;
}

interface SkillsCertsTabProps {
  skillsList: string[];
  newSkill: string;
  setNewSkill: (val: string) => void;
  handleAddSkill: (e?: React.FormEvent) => void;
  handleRemoveSkill: (skill: string) => void;
  handleSyncProfile: () => void;
  syncingProfile: boolean;

  certificationsList: CertificationItem[];
  handleAddCertification: () => void;
  handleRemoveCertification: (index: number) => void;
  certName: string;
  setCertName: (val: string) => void;
  certIssuer: string;
  setCertIssuer: (val: string) => void;
  certDate: string;
  setCertDate: (val: string) => void;
  setCertFile: (file: File | null) => void;
  uploadingCert: boolean;
}

export default function SkillsCertsTab({
  skillsList,
  newSkill,
  setNewSkill,
  handleAddSkill,
  handleRemoveSkill,
  handleSyncProfile,
  syncingProfile,
  certificationsList,
  handleAddCertification,
  handleRemoveCertification,
  certName,
  setCertName,
  certIssuer,
  setCertIssuer,
  certDate,
  setCertDate,
  setCertFile,
  uploadingCert,
}: SkillsCertsTabProps) {
  return (
    <div className="space-y-8">
      {/* Skills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-bold text-ink">Skills Taxonomy</h4>
          </div>
          
          <button
            type="button"
            onClick={handleSyncProfile}
            disabled={syncingProfile}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <SyncIcon className={`h-3.5 w-3.5 ${syncingProfile ? "animate-spin" : ""}`} />
            {syncingProfile ? "Syncing..." : "Sync from Latest Resume"}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a skill and press Enter or click Add (e.g. React, Docker)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white"
          />
          <button
            type="button"
            onClick={() => handleAddSkill()}
            className="inline-flex items-center justify-center rounded-lg border border-primary text-primary px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {skillsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No skills added yet. Click &quot;Sync from Latest Resume&quot; or type above.</p>
          ) : (
            skillsList.map((skill, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-red-500 font-bold ml-0.5 text-sm transition-colors focus:outline-none"
                  aria-label={`Remove skill ${skill}`}
                >
                  &times;
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <AwardIcon className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-bold text-ink">Certifications</h4>
        </div>

        <div className="space-y-3">
          {certificationsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No certifications added yet.</p>
          ) : (
            certificationsList.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {cert.name}
                    {cert.file_url && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${cert.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2.5 inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
                      >
                        View Document ↗
                      </a>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{cert.issuer} — <span className="text-slate-400">{cert.issue_date}</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Remove certification item"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
          <div>
            <h5 className="text-sm font-semibold text-ink">Add New Certification</h5>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter the details of your professional certifications below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Certification Name</label>
              <input
                type="text"
                placeholder="e.g. AWS Certified Solutions Architect"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Issuing Organization (Issuer)</label>
              <input
                type="text"
                placeholder="e.g. Amazon Web Services (AWS)"
                value={certIssuer}
                onChange={(e) => setCertIssuer(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Issue Date (or Validity)</label>
              <input
                type="text"
                placeholder="e.g. Nov 2023, or Valid until Dec 2026"
                value={certDate}
                onChange={(e) => setCertDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Upload Document (PDF, PNG, JPG)</label>
              <input
                id="cert-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleAddCertification}
              disabled={uploadingCert}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 h-[40px]"
            >
              <PlusIcon className="h-4 w-4" /> 
              {uploadingCert ? "Uploading & Adding..." : "Add Certification"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
