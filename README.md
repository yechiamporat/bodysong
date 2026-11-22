# שירת הגוף

קוד האתר https://shirathaguf.netlify.app

- `index.html` – האתר כולו (React בתוך הדף).
- `images/` – הלוגו ו-29 עמודי הספרון.
- `netlify/functions/inspire.mjs` – "השראה אישית מפרק שירה": פונה ל-Gemini מצד השרת.
- `booklet.pdf` – הספרון בפורמט PDF.

## הגדרה בנטליפיי

1. האתר מחובר למאגר הזה (Site configuration → Build & deploy → Link repository).
2. משתנה סביבה `GEMINI_API_KEY` מוגדר ב-Site configuration → Environment variables.
   המפתח לא נשמר בקוד ולא מגיע לדפדפן.
3. (רשות) `GEMINI_MODELS` – רשימת מודלים מופרדת בפסיקים, ברירת מחדל: `gemini-2.5-flash,gemini-flash-latest`.

כל דחיפה ל-`main` מעלה גרסה חדשה. לחזרה לגרסה קודמת: Deploys → בוחרים גרסה → Publish deploy.
