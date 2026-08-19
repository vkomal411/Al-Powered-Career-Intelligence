import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Topbar from "../components/Topbar";
import { apiFetch, UserResponse, logoutUser, syncProfileFromResume } from "../lib/api";
import {
  UserIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  AwardIcon,
  KeyIcon,
  SaveIcon,
} from "../components/icons";

import PersonalTab from "../components/profile/PersonalTab";
import CareerGoalsTab from "../components/profile/CareerGoalsTab";
import EducationProjectsTab, { EducationItem, ProjectItem } from "../components/profile/EducationProjectsTab";
import SkillsCertsTab, { CertificationItem } from "../components/profile/SkillsCertsTab";
import SecurityTab from "../components/profile/SecurityTab";

type TabType = "personal" | "preferences" | "education_projects" | "skills_certs" | "security";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  // Status Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form States
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [industry, setIndustry] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Education States
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduStart, setEduStart] = useState("");
  const [eduEnd, setEduEnd] = useState("");

  // Projects States
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projUrl, setProjUrl] = useState("");

  // Skills States
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Certifications States
  const [certificationsList, setCertificationsList] = useState<CertificationItem[]>([]);
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);

  useEffect(() => {
    apiFetch<UserResponse>("/auth/me")
      .then((data) => {
        setUser(data);
        setFullName(data.full_name);
        setTargetRole(data.target_role || "");
        setExperienceLevel(data.experience_level || "");
        setIndustry(data.industry || "");
        setEducationList(data.education || []);
        setSkillsList(data.skills || []);
        setCertificationsList(data.certifications || []);
        setProjectsList(data.projects || []);
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    router.push("/login");
  }

  const [pendingSync, setPendingSync] = useState<{
    user: UserResponse;
    addedSkills: string[];
  } | null>(null);

  // 1-Click Sync Handler with Diff Confirmation Modal
  async function handleSyncProfile() {
    setError(null);
    setSuccess(null);
    setSyncingProfile(true);
    try {
      const updatedUser = await syncProfileFromResume();
      const newSkills = updatedUser.skills || [];
      const addedSkills = newSkills.filter(
        (s) => !skillsList.some((existing) => existing.toLowerCase() === s.toLowerCase())
      );

      if (addedSkills.length === 0) {
        setSuccess("Your profile skills taxonomy is already up to date with your latest resume!");
      } else {
        setPendingSync({
          user: updatedUser,
          addedSkills: addedSkills,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync profile from resume. Please upload a resume first.");
    } finally {
      setSyncingProfile(false);
    }
  }

  function confirmSync() {
    if (!pendingSync) return;
    setUser(pendingSync.user);
    setSkillsList(pendingSync.user.skills || []);
    setSuccess(`Successfully synchronized ${pendingSync.addedSkills.length} new skill(s) into your profile!`);
    setPendingSync(null);
  }

  function cancelSync() {
    setPendingSync(null);
  }


  // List Management handlers
  function handleAddEducation() {
    if (!eduSchool.trim() || !eduDegree.trim() || !eduField.trim()) {
      setError("School name, degree, and field of study are required.");
      return;
    }
    const newItem: EducationItem = {
      school: eduSchool.trim(),
      degree: eduDegree.trim(),
      field_of_study: eduField.trim(),
      start_date: eduStart.trim() || "N/A",
      end_date: eduEnd.trim() || "Present",
    };
    setEducationList([...educationList, newItem]);
    setEduSchool("");
    setEduDegree("");
    setEduField("");
    setEduStart("");
    setEduEnd("");
    setError(null);
  }

  function handleRemoveEducation(index: number) {
    setEducationList(educationList.filter((_, i) => i !== index));
  }

  function handleAddProject() {
    if (!projName.trim() || !projDesc.trim()) {
      setError("Project name and description are required.");
      return;
    }
    const newItem: ProjectItem = {
      name: projName.trim(),
      description: projDesc.trim(),
      url: projUrl.trim() || undefined,
    };
    setProjectsList([...projectsList, newItem]);
    setProjName("");
    setProjDesc("");
    setProjUrl("");
    setError(null);
  }

  function handleRemoveProject(index: number) {
    setProjectsList(projectsList.filter((_, i) => i !== index));
  }

  function handleAddSkill(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const rawInput = newSkill.trim();
    if (!rawInput) return;

    // Support bulk comma-separated input
    const parsedSkills = rawInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const existingLower = new Set(skillsList.map((s) => s.toLowerCase()));
    const toAdd: string[] = [];

    for (const skill of parsedSkills) {
      if (!existingLower.has(skill.toLowerCase())) {
        toAdd.push(skill);
        existingLower.add(skill.toLowerCase());
      }
    }

    if (toAdd.length === 0) {
      setError("All entered skills already exist in your profile.");
      return;
    }

    setSkillsList([...skillsList, ...toAdd]);
    setNewSkill("");
    setError(null);
  }

  function handleRemoveSkill(skillToRemove: string) {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  }

  async function handleAddCertification() {
    if (!certName.trim() || !certIssuer.trim()) {
      setError("Certification name and issuer are required.");
      return;
    }

    setError(null);
    setUploadingCert(true);

    let uploadedUrl: string | undefined = undefined;
    let uploadedName: string | undefined = undefined;

    if (certFile) {
      const formData = new FormData();
      formData.append("file", certFile);

      try {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const uploadHeaders: Record<string, string> = {};
        if (authToken) uploadHeaders["Authorization"] = `Bearer ${authToken}`;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/upload-certificate`,
          {
            method: "POST",
            credentials: "include",
            headers: uploadHeaders,
            body: formData,
          }
        );

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.detail || "Failed to upload certificate file.");
        }

        const data = await response.json();
        uploadedUrl = data.file_url;
        uploadedName = data.filename;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload certificate.");
        setUploadingCert(false);
        return;
      }
    }

    const newItem: CertificationItem = {
      name: certName.trim(),
      issuer: certIssuer.trim(),
      issue_date: certDate.trim() || "N/A",
      file_url: uploadedUrl,
      file_name: uploadedName,
    };

    setCertificationsList([...certificationsList, newItem]);
    setCertName("");
    setCertIssuer("");
    setCertDate("");
    setCertFile(null);
    const fileInput = document.getElementById("cert-file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    setUploadingCert(false);
    setError(null);
  }

  function handleRemoveCertification(index: number) {
    setCertificationsList(certificationsList.filter((_, i) => i !== index));
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setSaving(true);

    const payload: Record<string, unknown> = {};

    if (activeTab === "personal") {
      if (!fullName.trim()) {
        setError("Full name cannot be blank");
        setSaving(false);
        return;
      }
      payload.full_name = fullName;
    } else if (activeTab === "preferences") {
      payload.target_role = targetRole;
      payload.experience_level = experienceLevel;
      payload.industry = industry;
    } else if (activeTab === "education_projects") {
      payload.education = educationList;
      payload.projects = projectsList;
    } else if (activeTab === "skills_certs") {
      payload.skills = skillsList;
      payload.certifications = certificationsList;
    } else if (activeTab === "security") {
      if (!oldPassword || !newPassword) {
        setError("Both current and new passwords are required");
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        setSaving(false);
        return;
      }
      payload.old_password = oldPassword;
      payload.new_password = newPassword;
    }

    try {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const profileHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) profileHeaders["Authorization"] = `Bearer ${authToken}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/profile`,
        {
          method: "PUT",
          headers: profileHeaders,
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.detail || "Failed to update profile settings.");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setSuccess("Profile settings updated successfully!");

      if (activeTab === "security") {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-[#0B1120]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>My Profile — CareerPilot.AI</title>
      </Head>
      <div className="min-h-screen bg-paper dark:bg-[#0B1120]">
        <Topbar fullName={user.full_name} user={user} onLogout={handleLogout} />

        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-white">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your personal data, qualifications, skills, and career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 items-start">
            {/* Sidebar Tabs */}
            <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => { setActiveTab("personal"); setError(null); setSuccess(null); }}
                className={`group flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out active:scale-[0.99] ${
                  activeTab === "personal"
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                    : "text-slate-500 hover:bg-slate-50 hover:text-ink hover:translate-x-1 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <UserIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                Personal Details
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("preferences"); setError(null); setSuccess(null); }}
                className={`group flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out active:scale-[0.99] ${
                  activeTab === "preferences"
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                    : "text-slate-500 hover:bg-slate-50 hover:text-ink hover:translate-x-1 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <BriefcaseIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                Career Goals
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("education_projects"); setError(null); setSuccess(null); }}
                className={`group flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out active:scale-[0.99] ${
                  activeTab === "education_projects"
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                    : "text-slate-500 hover:bg-slate-50 hover:text-ink hover:translate-x-1 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <GraduationCapIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                Education &amp; Projects
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("skills_certs"); setError(null); setSuccess(null); }}
                className={`group flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out active:scale-[0.99] ${
                  activeTab === "skills_certs"
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                    : "text-slate-500 hover:bg-slate-50 hover:text-ink hover:translate-x-1 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <AwardIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                Skills &amp; Certs
              </button>

              <button
                type="button"
                disabled={!user.has_password}
                onClick={() => { setActiveTab("security"); setError(null); setSuccess(null); }}
                className={`group flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out active:scale-[0.99] ${
                  !user.has_password
                    ? "opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600"
                    : activeTab === "security"
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                    : "text-slate-500 hover:bg-slate-50 hover:text-ink hover:translate-x-1 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <KeyIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                Password &amp; Security
              </button>
            </div>

            {/* Form Panels */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                <h3 className="font-display font-bold text-base text-ink capitalize dark:text-white">
                  {activeTab === "personal" && "Personal Details"}
                  {activeTab === "preferences" && "Career Goals & Matching"}
                  {activeTab === "education_projects" && "Education & Projects"}
                  {activeTab === "skills_certs" && "Skills & Certifications"}
                  {activeTab === "security" && "Change Security Credentials"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
                  {activeTab === "personal" && "Update name or view connected OAuth vectors."}
                  {activeTab === "preferences" && "Add targeting preferences to adjust parsed score compatibility."}
                  {activeTab === "education_projects" && "Add academic achievements and work/personal projects."}
                  {activeTab === "skills_certs" && "Manually update or auto-sync your list of skills and certs."}
                  {activeTab === "security" && "Keep your account details hardened with a secure password."}
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                {/* Alerts */}
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50/40 p-4 text-sm font-medium text-danger dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-sm font-medium text-verified dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {success}
                  </div>
                )}

                {/* Sub-components */}
                {activeTab === "personal" && (
                  <PersonalTab fullName={fullName} setFullName={setFullName} user={user} />
                )}

                {activeTab === "preferences" && (
                  <CareerGoalsTab
                    targetRole={targetRole}
                    setTargetRole={setTargetRole}
                    experienceLevel={experienceLevel}
                    setExperienceLevel={setExperienceLevel}
                    industry={industry}
                    setIndustry={setIndustry}
                  />
                )}

                {activeTab === "education_projects" && (
                  <EducationProjectsTab
                    educationList={educationList}
                    handleAddEducation={handleAddEducation}
                    handleRemoveEducation={handleRemoveEducation}
                    eduSchool={eduSchool}
                    setEduSchool={setEduSchool}
                    eduDegree={eduDegree}
                    setEduDegree={setEduDegree}
                    eduField={eduField}
                    setEduField={setEduField}
                    eduStart={eduStart}
                    setEduStart={setEduStart}
                    eduEnd={eduEnd}
                    setEduEnd={setEduEnd}
                    projectsList={projectsList}
                    handleAddProject={handleAddProject}
                    handleRemoveProject={handleRemoveProject}
                    projName={projName}
                    setProjName={setProjName}
                    projDesc={projDesc}
                    setProjDesc={setProjDesc}
                    projUrl={projUrl}
                    setProjUrl={setProjUrl}
                  />
                )}

                {activeTab === "skills_certs" && (
                  <SkillsCertsTab
                    skillsList={skillsList}
                    newSkill={newSkill}
                    setNewSkill={setNewSkill}
                    handleAddSkill={handleAddSkill}
                    handleRemoveSkill={handleRemoveSkill}
                    handleSyncProfile={handleSyncProfile}
                    syncingProfile={syncingProfile}
                    certificationsList={certificationsList}
                    handleAddCertification={handleAddCertification}
                    handleRemoveCertification={handleRemoveCertification}
                    certName={certName}
                    setCertName={setCertName}
                    certIssuer={certIssuer}
                    setCertIssuer={setCertIssuer}
                    certDate={certDate}
                    setCertDate={setCertDate}
                    setCertFile={setCertFile}
                    uploadingCert={uploadingCert}
                  />
                )}

                {activeTab === "security" && user.has_password && (
                  <SecurityTab
                    oldPassword={oldPassword}
                    setOldPassword={setOldPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                  />
                )}

                {/* Diff / Confirmation Modal for Resume Sync */}
                {pendingSync && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                          ✨
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-ink dark:text-white">Confirm Profile Sync</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Review new skills detected from your resume</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          The following <span className="font-bold text-primary">{pendingSync.addedSkills.length} new skill(s)</span> were extracted from your latest resume upload:
                        </p>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-slate-150 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
                          {pendingSync.addedSkills.map((sk, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              + {sk}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400 italic dark:text-slate-500">
                          Clicking &quot;Confirm &amp; Apply&quot; will merge these skills into your profile taxonomy.
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={cancelSync}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={confirmSync}
                          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
                        >
                          Confirm &amp; Apply Sync
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center justify-end border-t border-slate-100 pt-5 mt-5 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-50"
                  >
                    <SaveIcon className="h-4 w-4" />
                    {saving ? "Saving Changes..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
