from pathlib import Path
import json
ROOT=Path(__file__).parent
raw=(ROOT/'report-template.html').read_text()
parts={'__DATA__':json.dumps(json.loads((ROOT/'data.json').read_text()),ensure_ascii=False,separators=(',',':')),'__WORKBOOK__':(ROOT/'workbook-preview.json').read_text().replace('</',r'<\/'),'__DECK__':(ROOT/'deck-preview.json').read_text().replace('</',r'<\/'),'__INSTRUCTION__':(ROOT/'instruction-preview.html').read_text(),'__VIEWER_CSS__':(ROOT/'viewer.css').read_text(),'__VIEWER_JS__':(ROOT/'viewer.js').read_text()}
for key,value in parts.items():raw=raw.replace(key,value)
assert all(key not in raw for key in parts)
(ROOT.parent/'index.html').write_text(raw)
print('Built ../index.html')
