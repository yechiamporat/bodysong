# שירת הגוף

קוד האתר https://shirathaguf.netlify.app

- `src/app.jsx` – קוד האתר (React). **כאן עורכים.**
- `src/template.html` – תבנית העמוד (head, עיצוב, סקריפטים).
- `tools/build_site.mjs` – בונה מהמקור את `app.js` ואת כל העמודים עם הטקסט כבר בתוכם:
  `index.html`, `shirat-haguf/`, `nishmat-kol-chai/`, `shirat-habriah/`, `tikun-hanefesh/`, `tirgul/`, `odot/`,
  וגם `sitemap.xml` ו-`robots.txt`. הקבצים האלה נוצרים אוטומטית – לא לערוך אותם ידנית.
  הרצה: `cd tools && npm install && npm run build`, ואז commit לכל הקבצים שהשתנו.
- `images/` – הלוגו, תמונת השיתוף ו-29 עמודי הספרון.
- `netlify/functions/inspire.mjs` – "השראה אישית מפרק שירה": פונה ל-Gemini מצד השרת.
- `booklet.pdf` – הספרון בפורמט PDF.
- `booklet.json` – טקסט הספרון לתצוגת הקריאה. נוצר מקובץ הוורד:
  `python3 tools/build_booklet_json.py "שירת הגוף.docx" booklet.json` (דורש `pip install python-docx`).

## הגדרה בנטליפיי

1. האתר מחובר למאגר הזה (Site configuration → Build & deploy → Link repository).
2. משתנה סביבה `GEMINI_API_KEY` מוגדר ב-Site configuration → Environment variables.
   המפתח לא נשמר בקוד ולא מגיע לדפדפן.
3. (רשות) `GEMINI_MODELS` – רשימת מודלים מופרדת בפסיקים, ברירת מחדל: `gemini-2.5-flash,gemini-flash-latest`.

כל דחיפה ל-`main` מעלה גרסה חדשה. לחזרה לגרסה קודמת: Deploys → בוחרים גרסה → Publish deploy.
