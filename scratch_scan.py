import os
import re
import sys

# Set standard output encoding to utf-8 if possible
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

root_dir = r"d:\自用\AI对话用\酒馆用\00 tavern_helper_template（自动打包）\角色卡\00 世界书\扭曲仙境\twst"

yaml_files = []
for dirpath, dirnames, filenames in os.walk(root_dir):
    for f in filenames:
        if f.endswith('.yaml') or f.endswith('.yml'):
            yaml_files.append(os.path.join(dirpath, f))

# Sort the files by path
yaml_files.sort()

output_lines = []
output_lines.append("# 世界书文件扫描报告 (twst)")
output_lines.append("")
output_lines.append("| 文件夹 | 文件名 | 结构类型 | 详细信息 / 包含标签 | 处理建议 |")
output_lines.append("| --- | --- | --- | --- | --- |")

for filepath in yaml_files:
    rel_path = os.path.relpath(filepath, root_dir)
    dir_name = os.path.dirname(rel_path) or "根目录"
    file_name = os.path.basename(rel_path)
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    tags_open = re.findall(r'<([a-zA-Z0-9_\-&]+)>', content)
    tags_close = re.findall(r'</([a-zA-Z0-9_\-&]+)>', content)
    xml_blocks = [t for t in tags_open if t in tags_close]
    
    separators = content.split('---')
    separator_count = len(separators)
    
    # Check for list items
    list_items = re.findall(r'^\s*-\s+name:', content, re.MULTILINE)
    
    structure_type = "单条目"
    details = ""
    recommendation = "无需调整"
    
    if len(xml_blocks) > 1 or separator_count > 1:
        structure_type = "多条目（XML标签）"
        details = f"包含 {len(xml_blocks)} 个标签: " + ", ".join([f"`<{t}>`" for t in xml_blocks])
        recommendation = "⚠️ 建议拆分为单条目文件"
    elif "family" in rel_path.lower():
        structure_type = "家属/家族条目"
        if len(xml_blocks) == 1:
            details = f"仅有 1 个标签: `<{xml_blocks[0]}>`"
            # It's in the family folder. If it's single character, it's fine, but still is family
            recommendation = "可保持现状（单人卡）"
        elif len(xml_blocks) == 0:
            details = "无标签"
            recommendation = "建议检查是否需要添加XML标签包裹"
    elif len(list_items) > 1:
        structure_type = "列表型条目 (List)"
        details = f"包含 {len(list_items)} 个 `- name:` 子条目"
        recommendation = "⚠️ 建议拆分为单条目文件，方便精准检索"
    else:
        if len(xml_blocks) == 1:
            details = f"包含标签: `<{xml_blocks[0]}>`"
        else:
            details = "无标签标准YAML"
            
    # Format the file path for markdown link
    md_link = f"[{file_name}](file:///{filepath.replace('\\', '/')})"
    output_lines.append(f"| {dir_name} | {md_link} | {structure_type} | {details} | {recommendation} |")

# Write to report.md
report_path = r"d:\自用\AI对话用\酒馆用\00 tavern_helper_template（自动打包）\report.md"
with open(report_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(output_lines))

print("Report generated successfully at:", report_path)
