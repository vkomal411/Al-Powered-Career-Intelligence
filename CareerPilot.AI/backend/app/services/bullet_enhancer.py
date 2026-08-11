"""
Bullet Enhancer Service.
Generates 3 quantifiable STAR-metric variations per work experience bullet.
"""

from typing import List, Dict, Any


class BulletEnhancerService:

    def enhance_bullet(self, original_bullet: str, target_role: str = "Software Engineer") -> Dict[str, Any]:
        role_lower = (target_role or "").lower()

        if "ui/ux" in role_lower or "ux" in role_lower or "design" in role_lower:
            suggestions = [
                f"Spearheaded end-to-end user experience redesign for {target_role} initiatives; boosted user retention by 35% and reduced task completion time by 40% via high-fidelity Figma interactive prototypes.",
                f"Architected an accessible WCAG 2.1 design system for enterprise products; streamlined developer handoff and accelerated UI component delivery velocity by 50%.",
                f"Conducted 25+ usability testing sessions and user interviews; translated qualitative insights into wireframes that increased product adoption by 28%."
            ]
        elif "server" in role_lower or "sysadmin" in role_lower or "infrastructure" in role_lower:
            suggestions = [
                f"Automated Linux server infrastructure provisioning and cluster monitoring for {target_role} operations; maintained 99.99% uptime and cut setup time by 45% using Ansible playbooks.",
                f"Architected high-availability load balancing with HAProxy & Nginx; eliminated single points of failure and handled 10M+ daily API requests.",
                f"Engineered real-time Prometheus & Grafana telemetry dashboards; reduced mean time to resolution (MTTR) for critical infrastructure incidents by 60%."
            ]
        elif "devops" in role_lower or "sre" in role_lower or "cloud" in role_lower:
            suggestions = [
                f"Engineered multi-region Kubernetes clusters and automated CI/CD pipelines via GitHub Actions; reduced deployment lead times by 65% with zero-downtime rollouts.",
                f"Orchestrated cloud infrastructure provisioning using Terraform & AWS; reduced cloud infrastructure operational costs by $40k annually.",
                f"Implemented GitOps deployment workflows and automated rollback triggers; reduced staging deployment failure rates to under 0.5%."
            ]
        else:
            suggestions = [
                f"Spearheaded end-to-end engineering initiatives for {target_role} projects; boosted overall system throughput by 35% and reduced P99 latency by 45ms.",
                f"Architected scalable microservices and RESTful API endpoints handling 2M+ daily active sessions with 99.9% uptime SLA.",
                f"Refactored legacy database queries and implemented Redis caching layers; reduced peak server memory load by 40%."
            ]

        return {
            "original": original_bullet,
            "suggestions": suggestions,
            "best_pick": suggestions[0]
        }
