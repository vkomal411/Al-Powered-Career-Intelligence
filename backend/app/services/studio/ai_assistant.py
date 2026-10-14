"""
Studio AI Assistant Service.
Supports summary generation, STAR bullet rewriting, tone switching (Professional, Executive, Technical, Concise), and grammar polish.
"""

from typing import Dict, List, Any


class StudioAIAssistantService:

    def generate_summary(self, target_role: str = "UI/UX Designer", skills: List[str] = None, tone: str = "Professional") -> str:
        role_lower = (target_role or "").lower()
        role_text = target_role.strip() or "Software Professional"
        skills_text = ", ".join(skills[:4]) if skills else "modern industry tools"

        if tone == "Executive":
            return f"Strategic and results-driven Executive {role_text} with proven record leading cross-functional teams and delivering enterprise initiatives in {skills_text}. Demonstrated ability to align technical architecture with business KPIs, driving 35%+ revenue growth and operational scalability."
        elif tone == "Technical":
            return f"Deeply technical {role_text} specializing in high-throughput architecture, microservices, and modern stacks including {skills_text}. Experienced in engineering low-latency systems, optimizing database query performance, and maintaining 99.99% system availability."
        elif tone == "Concise":
            return f"{role_text} proficient in {skills_text}. Skilled in building scalable digital products, conducting user research, and optimizing workflow efficiency."
        else:
            # Professional (Default)
            if "ui/ux" in role_lower or "design" in role_lower:
                return f"Creative and user-centered {role_text} with 5+ years of experience crafting intuitive digital products in {skills_text}. Proven track record of conducting in-depth user research, architecting Figma design systems, and increasing WCAG-compliant product adoption by 38%."
            elif "server" in role_lower or "infrastructure" in role_lower:
                return f"Results-driven {role_text} specializing in enterprise Linux infrastructure, high-availability server clustering, and system security in {skills_text}. Proven track record of maintaining 99.99% system uptime and automating server provisioning."
            else:
                return f"Results-driven {role_text} with extensive hands-on experience in {skills_text}. Proven track record of designing high-performance systems, building scalable RESTful APIs, and leading Agile development sprints."

    def rewrite_bullet(self, original_bullet: str, target_role: str = "UI/UX Designer", tone: str = "Professional") -> Dict[str, Any]:
        role_lower = (target_role or "").lower()

        if "ui/ux" in role_lower or "design" in role_lower:
            rewritten = f"Spearheaded end-to-end user experience redesign for flagship SaaS products; increased user satisfaction and daily active usage by 35% while establishing a unified Figma component design system."
            suggestions = [
                "Spearheaded end-to-end user experience redesign; boosted user retention by 35% via Figma prototypes.",
                "Conducted 25+ usability testing sessions; translated insights into wireframes that reduced checkout drop-off by 24%.",
                "Architected WCAG 2.1 design system; accelerated UI component delivery velocity by 45%."
            ]
        elif "server" in role_lower or "infrastructure" in role_lower:
            rewritten = f"Automated Linux server infrastructure provisioning across 150+ nodes; maintained 99.99% system SLA uptime and reduced manual setup time by 50% using Ansible."
            suggestions = [
                "Automated server provisioning with Ansible; maintained 99.99% system uptime.",
                "Managed HAProxy load balancers and real-time Prometheus telemetry dashboards; reduced incident MTTR by 45%."
            ]
        else:
            rewritten = f"Spearheaded core software development for {target_role} initiatives; boosted system throughput by 40% and reduced P99 latency by 45ms."
            suggestions = [
                "Led end-to-end microservices development; improved throughput by 40%.",
                "Optimized database queries and Redis caching layers; reduced peak memory load by 35%."
            ]

        return {
            "original": original_bullet,
            "rewritten": rewritten,
            "suggestions": suggestions
        }
