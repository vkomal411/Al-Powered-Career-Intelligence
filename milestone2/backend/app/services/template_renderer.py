"""
Template Renderer Service for HTML/CSS Resume rendering.
Supports 'modern', 'classic', and 'ats' templates.
"""

from typing import Dict, Any


class TemplateRenderer:

    TEMPLATES = {
        "modern": """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 35px; color: #0f172a; background: #ffffff; line-height: 1.5; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px; }
    .name { font-size: 24px; font-weight: bold; color: #1e1b4b; margin: 0; }
    .role { font-size: 13px; font-weight: bold; color: #4f46e5; margin-top: 4px; }
    .contact { font-size: 11px; color: #64748b; margin-top: 4px; }
    .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-top: 16px; margin-bottom: 8px; }
    .content { font-size: 11px; color: #334155; }
    .exp-item { margin-bottom: 10px; }
    .exp-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; color: #0f172a; }
    .bullet { margin-left: 12px; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">{{ name or 'Your Full Name' }}</div>
    <div class="role">{{ target_role or 'Software Professional' }}</div>
    <div class="contact">Email: {{ email or 'email@example.com' }} | Phone: {{ phone or '+1 555-0000' }} | Location: {{ location or 'Remote' }}</div>
  </div>

  {% if summary %}
  <div class="section-title">PROFESSIONAL SUMMARY</div>
  <div class="content">{{ summary }}</div>
  {% endif %}

  {% if experience %}
  <div class="section-title">WORK EXPERIENCE</div>
  {% for job in experience %}
    <div class="exp-item">
      <div class="exp-header">
        <span>{{ job.job_title }} — {{ job.company }}</span>
        <span>{{ job.start_date }} - {{ job.end_date or 'Present' }}</span>
      </div>
      <div class="content">{{ job.description }}</div>
      {% for bullet in job.bullets %}
        <div class="content bullet">• {{ bullet }}</div>
      {% endfor %}
    </div>
  {% endfor %}
  {% endif %}

  {% if skills %}
  <div class="section-title">TECHNICAL SKILLS</div>
  <div class="content">{{ skills | join(' • ') }}</div>
  {% endif %}
</body>
</html>
""",
        "ats": """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 25px; line-height: 1.4; color: #111; }
    h1 { font-size: 20px; margin: 0; }
    h2 { font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #333; margin-top: 14px; margin-bottom: 6px; }
    p { font-size: 11px; margin: 2px 0; }
  </style>
</head>
<body>
  <h1>{{ name }}</h1>
  <p>{{ target_role }} | {{ email }} | {{ phone }}</p>

  <h2>SUMMARY</h2>
  <p>{{ summary }}</p>

  <h2>EXPERIENCE</h2>
  {% for job in experience %}
    <p><strong>{{ job.job_title }}</strong> - {{ job.company }} ({{ job.start_date }} - {{ job.end_date or 'Present' }})</p>
    <p>{{ job.description }}</p>
  {% endfor %}

  <h2>SKILLS</h2>
  <p>{{ skills | join(' | ') }}</p>
</body>
</html>
"""
    }

    @staticmethod
    def render_html(template_name: str, data: Dict[str, Any]) -> str:
        try:
            from jinja2 import Template
            template_str = TemplateRenderer.TEMPLATES.get(template_name, TemplateRenderer.TEMPLATES["modern"])
            template = Template(template_str)
            return template.render(**data)
        except Exception:
            # Fallback simple string replacement
            return f"<html><body><h1>{data.get('name', 'Resume')}</h1><p>{data.get('summary', '')}</p></body></html>"
