"""בונה את inspiration.json (ספריית "השראה אישית") מתוך data/inspiration-source.json ו-booklet.json.
הפסוקים נלקחים מהספרון עצמו לפי verse_index, כך שהנוסח תמיד מדויק.
הרצה: python3 tools/build_inspiration.py"""
import json, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = json.load(open(os.path.join(ROOT, 'data/inspiration-source.json')))
booklet = json.load(open(os.path.join(ROOT, 'booklet.json')))

# מילות מפתח שג'מיני שייך לכמה אברים – לכל אחת נקבע אבר אחד
OWNER = {'קשב': 3, 'שיווי משקל': 6, 'שאיפה': 32, 'נשימה': 32, 'דיבור': 9, 'קול': 17, 'אכילה': 9, 'בליעה': 18,
    'ביטוי עצמי': 17, 'צעקה': 17, 'שפה': 11, 'בליעת רוק': 18, 'גרון': 17, 'חנק': 18, 'הזנה': 29, 'עמידה': 45,
    'סרעפת': 26, 'עמוד שדרה': 27, 'כובד': 28, 'כאב בחזה': 30, 'דופק': 30, 'פעימות': 30, 'לחץ בחזה': 30,
    'דפיקות לב': 30, 'חמצן': 32, 'חיוניות': 32, 'קיבה': 38, 'עיכול': 38, 'בטן תחתונה': 33, 'בטן עליונה': 38,
    'מתח בבטן': 33, 'מרה': 35, 'עייפות': 55, 'התחדשות': 55, 'לחץ': 60, 'הורמונים': 63, 'עייפות אחרי אוכל': 37,
    'כאב בבטן תחתונה': 40, 'ריקון': 40, 'חרדה': 60, 'לחץ דם': 55, 'נוזלים': 64, 'עייפות עמוקה': 60,
    'כבדות ברגליים': 45, 'הליכה': 45, 'ירך ימין': 48, 'ירך שמאל': 48, 'ברך ימין': 49, 'ברך שמאל': 49,
    'שוק ימין': 50, 'שוק שמאל': 50, 'עקב ימין': 51, 'עקב שמאל': 51, 'מפרקים': 58, 'גיד אכילס': 51, 'זרימה': 55}

TEAMIM = re.compile('[֑-ֽ֯׀׃]')  # טעמי המקרא (הניקוד נשאר)

def plain(line):
    return line if isinstance(line, str) else ''.join(t for t, _ in line)

blocks = {f"guf-{b['id']}": b for b in booklet['parts'][0]['blocks'] if b.get('name')}
out = []
for o in src:
    b = blocks[o['id']]
    verses = []
    for l in b['lines']:
        t = re.sub(r'^ואומר[:.]\s*', '', plain(l).strip())
        m = re.search(r'\(([^()]+)\)\s*$', t)
        body = (t[:m.start()] if m else t).strip().strip('"״\' ').rstrip(':').strip('"״ ')
        verses.append({'text': TEAMIM.sub('', body), 'source': m.group(1).strip() if m else ''})
    num = int(o['id'].split('-')[1])
    kws = [k.strip() for k in o['keywords'] if k.strip() and OWNER.get(k.strip(), num) == num]
    kws = list(dict.fromkeys([b['name']] + kws))
    out.append({'id': o['id'], 'name': b['name'], 'title': b['h'].rstrip(':').strip(), 'keywords': kws,
                'variants': [{'verse': verses[v['verse_index']]['text'], 'source': verses[v['verse_index']]['source'],
                              'inspiration': v['inspiration'], 'meditation': v['meditation']} for v in o['variants']]})
json.dump(out, open(os.path.join(ROOT, 'inspiration.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'organs,', sum(len(o['variants']) for o in out), 'variants,', round(os.path.getsize(os.path.join(ROOT, 'inspiration.json')) / 1024), 'KB')
