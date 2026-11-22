import docx, json, re, sys, unicodedata
from docx.oxml.ns import qn

def strip_nikud(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if not unicodedata.combining(c))

d = docx.Document(sys.argv[1])
def is_bold(r):
    rpr = r._r.rPr
    if rpr is not None:
        for tag in ('w:b', 'w:bCs'):
            el = rpr.find(qn(tag))
            if el is not None:
                return el.get(qn('w:val')) not in ('0', 'false')
    st = r.style
    while st is not None:
        if st.font.bold or st.font.cs_bold: return True
        st = st.base_style
    return False
lines = []
for p in d.paragraphs:
    cur = []
    def flush():
        segs = []
        for t, b in cur:
            if segs and segs[-1][1] == b: segs[-1][0] += t
            else: segs.append([t, b])
        text = ''.join(t for t, _ in segs)
        if text.strip():
            # trim + collapse whitespace while keeping segments
            out = []
            for t, b in segs:
                t = re.sub(r'\s+', ' ', t)
                if t: out.append([t, b])
            out[0][0] = out[0][0].lstrip(); out[-1][0] = out[-1][0].rstrip()
            out = [s for s in out if s[0]]
            plain = ''.join(t for t, _ in out)
            nb = sum(len(t.strip()) for t, b in out if b); tot = sum(len(t.strip()) for t, _ in out) or 1
            lines.append({'segs': out, 't': plain, 'allbold': nb / tot > 0.95})
        cur.clear()
    for r in p.runs:
        b = is_bold(r)
        for ch in r._r.iterchildren():
            if ch.tag == qn('w:t'): cur.append((ch.text or '', b))
            elif ch.tag in (qn('w:br'), qn('w:cr')): flush()
            elif ch.tag == qn('w:tab'): cur.append((' ', b))
    flush()

def seg_out(l):
    # compact: plain string if no bold, else list of [text, 1/0]
    if not any(b for _, b in l['segs']): return l['t']
    return [[t, 1 if b else 0] for t, b in l['segs']]

T = [l['t'] for l in lines]
idx = lambda s, start=0: next(i for i in range(start, len(T)) if T[i].strip() == s)
i_body = idx('שירת הגוף'); i_nish = idx('נִשְׁמַת כָּל חַי'); i_briah = idx('שירת הבריאה'); i_tikun = idx('תיקון הנפש')

def is_closing(t):
    return strip_nikud(t).lstrip('ו').startswith('ברוך')

def build(lo, hi, header_re):
    blocks, cur = [], {'lines': []}
    for l in lines[lo:hi]:
        if l['allbold'] and header_re(l['t']):
            if cur['lines'] or cur.get('h'): blocks.append(cur)
            cur = {'h': l['t'], 'lines': []}
        else:
            cur['lines'].append(l)
    blocks.append(cur)
    # split trailing ברוך lines into a closing block
    last = blocks[-1]; k = len(last['lines'])
    while k > 0 and is_closing(last['lines'][k-1]['t']): k -= 1
    if k < len(last['lines']) and last.get('h'):
        blocks.append({'closing': True, 'lines': last['lines'][k:]}); last['lines'] = last['lines'][:k]
    for n, b in enumerate(blocks):
        b['lines'] = [seg_out(l) for l in b['lines']]
        if b.get('h'):
            name = re.sub(r'\s*(אומר|אומרת|אומרים|אומרות)\s*:?\s*$', '', b['h']).rstrip(':').strip()
            b['name'] = name
            b['id'] = f'{n}'
    return blocks

body = build(i_body + 1, i_nish, lambda t: re.search(r'(אומר|אומרת|אומרים|אומרות):\s*$', t))
nish = build(i_nish + 1, i_briah - 1, lambda t: False)
briah = build(i_briah + 1, i_tikun, lambda t: t.endswith(':'))
sub = lines[i_tikun + 1]['t']
tikun = build(i_tikun + 2, len(lines), lambda t: False)

data = {
  'parts': [
    {'id': 'guf', 'kicker': 'פרק שירה', 'title': 'שירת הגוף', 'blocks': body},
    {'id': 'nishmat', 'title': 'נִשְׁמַת כָּל חַי', 'blocks': nish},
    {'id': 'briah', 'kicker': 'פרק שירה', 'title': 'שירת הבריאה', 'blocks': briah},
    {'id': 'tikun', 'title': 'תיקון הנפש', 'subtitle': sub, 'blocks': tikun},
  ]
}
json.dump(data, open(sys.argv[2], 'w'), ensure_ascii=False, separators=(',', ':'))
for p in data['parts']:
    hs = [b.get('name') for b in p['blocks'] if b.get('name')]
    print(p['id'], 'blocks', len(p['blocks']), 'lines', sum(len(b['lines']) for b in p['blocks']), 'headers', len(hs), hs[:3], '...', hs[-2:], 'closing' if any(b.get('closing') for b in p['blocks']) else '')

# --- תיקוני תצוגה קלים ---
def fix_line(l):
    if isinstance(l, str):
        return re.sub(r'(?<=[֐-׿])\.(?=[א-ת])', '. ', l)
    out = [[t, b] for t, b in l]
    for i, (t, b) in enumerate(out):
        out[i][0] = re.sub(r'(?<=[֐-׿])\.(?=[א-ת])', '. ', t)
        if out[i][0].startswith('.') and len(out[i][0]) > 1 and 'א' <= out[i][0][1] <= 'ת':
            out[i][0] = '. ' + out[i][0][1:]
    return out
for p in data['parts']:
    for b in p['blocks']:
        new = []
        for l in b['lines']:
            if b.get('name') == 'הקדמה' and isinstance(l, str):
                new += [x.strip() for x in re.split(r'(?<=[:.])(?=[א-ת])', l) if x.strip()]
            else:
                new.append(fix_line(l))
        b['lines'] = new
json.dump(data, open(sys.argv[2], 'w'), ensure_ascii=False, separators=(',', ':'))
