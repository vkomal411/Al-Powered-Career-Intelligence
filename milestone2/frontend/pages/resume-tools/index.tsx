import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ResumeToolsIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/resume-tools/ats-score-analysis");
  }, [router]);

  return null;
}
