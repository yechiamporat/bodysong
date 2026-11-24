# שירת הגוף

קוד האתר https://shirathaguf.netlify.app

- `src/app.jsx` – קוד האתר (React). **כאן עורכים.**
- `src/template.html` – תבנית העמוד (head, עיצוב, סקריפטים).
- `tools/build_site.mjs` – בונה מהמקור את `app.js` ואת כל העמודים עם הטקסט כבר בתוכם:
  `index.html`, `shirat-haguf/`, `hashraa/`, `nishmat-kol-chai/`, `shirat-habriah/`, `tikun-hanefesh/`, `tirgul/`, `odot/`,
  וגם `sitemap.xml` ו-`robots.txt`. הקבצים האלה נוצרים אוטומטית – לא לערוך אותם ידנית.
  הרצה: `cd tools && npm install && npm run build`, ואז commit לכל הקבצים שהשתנו.
- `images/` – הלוגו, תמונת השיתוף ו-29 עמודי הספרון.
- `inspiration.json` – ספריית "השראה אישית" (3 גרסאות לכל אבר + מילות מפתח). נבנית מ-`data/inspiration-source.json`:
  `python3 tools/build_inspiration.py`.
- `netlify/functions/inspire.mjs` – גיבוי לכלי ההשראה: הקלדה שלא מתאימה לאף אבר נשלחת ל-Gemini מצד השרת.
- `images/sketches/` – שרטוטי העיפרון של 64 האברים (`guf-<id>.webp`).
- `booklet.pdf` – הספרון בפורמט PDF.
- `booklet.json` – טקסט הספרון לתצוגת הקריאה. נוצר מקובץ הוורד:
  `python3 tools/build_booklet_json.py "שירת הגוף.docx" booklet.json` (דורש `pip install python-docx`).

## הגדרה בנטליפיי

1. האתר מחובר למאגר הזה (Site configuration → Build & deploy → Link repository).
2. משתנה סביבה `GEMINI_API_KEY` מוגדר ב-Site configuration → Environment variables.
   המפתח לא נשמר בקוד ולא מגיע לדפדפן.
3. (רשות) `GEMINI_MODELS` – רשימת מודלים מופרדת בפסיקים, ברירת מחדל: `gemini-2.5-flash,gemini-flash-latest`.

כל דחיפה ל-`main` מעלה גרסה חדשה. לחזרה לגרסה קודמת: Deploys → בוחרים גרסה → Publish deploy.
