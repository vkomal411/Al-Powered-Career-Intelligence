import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CareerToolsIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/career-tools/learning-level-up");
  }, [router]);

  return null;
}
