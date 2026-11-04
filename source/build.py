from pathlib import Path
import json
ROOT=Path(__file__).parent
raw=(ROOT/'report-template.html').read_text()
arrow='<svg class="drawn-arrow arrow-right" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>'
parts={
 '__HERO__':(ROOT/'hero.html').read_text(),
 '__FINDINGS__':(ROOT/'findings.html').read_text(),
 '__FACTORS__':(ROOT/'factors.html').read_text(),
 '__PROJECT_CSS__':(ROOT/'project-layout.css').read_text(),
 '__REPORT_JS__':(ROOT/'report.js').read_text(),
 '__FACTOR_RENDER__':(ROOT/'factor-render.js').read_text(),
 '__TEAM_INFO__':json.dumps(json.loads((ROOT/'team-info.json').read_text()),ensure_ascii=False,separators=(',',':')),
 '__DATA__':json.dumps(json.loads((ROOT/'data.json').read_text()),ensure_ascii=False,separators=(',',':')),
 '__WORKBOOK__':(ROOT/'workbook-preview.json').read_text().replace('</',r'<\/'),
 '__DECK__':(ROOT/'deck-preview.json').read_text().replace('</',r'<\/'),
 '__INSTRUCTION__':(ROOT/'instruction-preview.html').read_text(),
 '__VIEWER_CSS__':(ROOT/'viewer.css').read_text(),
 '__VIEWER_JS__':(ROOT/'viewer.js').read_text(),
 '__ARROW__':arrow,
}
for key,value in parts.items():raw=raw.replace(key,value)
assert all(key not in raw for key in parts)
(ROOT.parent/'index.html').write_text(raw)
print('Built ../index.html')

