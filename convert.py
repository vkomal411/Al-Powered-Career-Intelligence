import markdown2

input_file = r"C:\Users\venka\Downloads\CareerPilot_AI_Milestone1_Report.md"
output_file = r"C:\Users\venka\Downloads\CareerPilot_AI_Milestone1_Report.doc"

html = markdown2.markdown_path(input_file, extras=["tables", "fenced-code-blocks"])

with open(output_file, 'w', encoding='utf-8') as f:
    f.write('<html><head><meta charset="utf-8"></head><body>\n')
    f.write(html)
    f.write('</body></html>\n')
