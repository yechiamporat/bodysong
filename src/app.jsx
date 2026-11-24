        const { useState, useEffect, useRef } = React;

        const Icon = ({ name, size = 20, className = "" }) => {
            useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [name]);
            const lucideName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            return <i data-lucide={lucideName} className={className} style={{ width: size, height: size }}></i>;
        };

        const LOGO_URL = "/images/favicon.png";
        const getPagePath = (num) => `/images/page_${num}.png`;

        // כתובות העמודים באתר
        const PART_PATHS = { guf: '/shirat-haguf/', nishmat: '/nishmat-kol-chai/', briah: '/shirat-habriah/', tikun: '/tikun-hanefesh/' };
        const NAV_ITEMS = [
            { id: 'home', label: 'בית', href: '/' },
            { id: 'song', label: 'שירת הגוף', href: '/shirat-haguf/' },
            { id: 'inspire', label: 'השראה', href: '/hashraa/' },
            { id: 'practice', label: 'תרגול', href: '/tirgul/' },
            { id: 'about', label: 'אודות', href: '/odot/' }
        ];


        const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw error;
            }
        };

        const Logo = ({ className = "w-10 h-10" }) => (
            <div className={`${className} bg-white rounded-full flex items-center justify-center p-0.5 shadow-[0_0_12px_rgba(255,255,255,0.25)] overflow-hidden transition-transform duration-500`}>
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain rounded-full" 
                     onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
        );

        const ImageFlipBook = ({ onClose }) => {
            const [currentPage, setCurrentPage] = useState(1);
            const totalPages = 29;
            const next = () => setCurrentPage(p => Math.min(totalPages, p + 1));
            const prev = () => setCurrentPage(p => Math.max(1, p - 1));
            const touchStartX = useRef(null);
            useEffect(() => { if (currentPage < totalPages) { const im = new Image(); im.src = getPagePath(currentPage + 1); } }, [currentPage]);

            useEffect(() => {
                const handleKeyDown = (e) => {
                    if (e.key === 'ArrowLeft') next();
                    if (e.key === 'ArrowRight') prev();
                    if (e.key === 'Escape') onClose();
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, [currentPage]);

            // תמיכה בהחלקת אצבע לטלפונים ניידים
            const handleTouchStart = (e) => {
                touchStartX.current = e.touches[0].clientX;
            };

            const handleTouchEnd = (e) => {
                if (touchStartX.current === null) return;
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX.current - touchEndX;

                if (diff > 50) next();
                else if (diff < -50) prev();

                touchStartX.current = null;
            };

            return (
                <div className="fixed inset-x-0 bottom-0 top-14 z-[100] bg-black flex flex-col items-center justify-between p-2 md:p-3 overflow-hidden text-right">
                    {/* ההדר העליון - הלוגו והכותרת הוסרו למניעת כפילות */}
                    <div className="w-full max-w-7xl flex justify-between items-center px-4 py-2 border-b border-white/5">
                        <button onClick={onClose} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 text-stone-200 hover:bg-white/10 text-sm">
                            <Icon name="AlignRight" size={16} /> לקריאה כטקסט
                        </button>
                        <a href="/booklet.pdf" download="שירת-הגוף.pdf" className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 text-stone-200 hover:bg-white/10 text-sm">
                            <Icon name="Download" size={16} /> PDF
                        </a>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all">
                            <Icon name="X" size={28} />
                        </button>
                    </div>

                    <div className="relative w-full flex-grow flex items-center justify-center py-1"
                         onTouchStart={handleTouchStart}
                         onTouchEnd={handleTouchEnd}>
                        
                        {/* חץ ימינה (קודם) - מוגדל וברור גם בטלפון הנייד */}
                        <button onClick={prev} disabled={currentPage === 1} 
                                className="absolute right-2 md:right-8 z-20 flex items-center justify-center p-2 md:p-3 bg-black/60 hover:bg-black/90 rounded-full text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-sm disabled:opacity-0 transition-all group">
                            <Icon name="ChevronRight" size={36} className="md:w-[48px] md:h-[48px] group-hover:scale-110 transition-transform" />
                        </button>
                        
                        <div className="bg-white shadow-[0_5px_40px_rgba(0,0,0,1)] rounded-sm overflow-hidden animate-fade-in book-container">
                            <img src={getPagePath(currentPage)} alt={`Page ${currentPage}`} className="w-auto object-contain" style={{ maxHeight: 'calc(100vh - 9rem)' }} onError={(e) => { e.target.src = `https://via.placeholder.com/800x1100?text=Page+${currentPage}`; }} />
                        </div>

                        {/* חץ שמאלה (הבא) - מוגדל וברור גם בטלפון הנייד */}
                        <button onClick={next} disabled={currentPage === totalPages} 
                                className="absolute left-2 md:left-8 z-20 flex items-center justify-center p-2 md:p-3 bg-black/60 hover:bg-black/90 rounded-full text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-sm disabled:opacity-0 transition-all group">
                            <Icon name="ChevronLeft" size={36} className="md:w-[48px] md:h-[48px] group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="py-1 flex flex-col items-center gap-1 opacity-70">
                        <span className="text-white/80 font-serif text-xs">עמוד {currentPage} מתוך {totalPages}</span>
                        <div className="flex gap-1 max-w-xs flex-wrap justify-center">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all ${currentPage === i + 1 ? 'w-3 bg-white shadow-[0_0_5px_white]' : 'w-1 bg-white/20'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            );
        };

        const practiceData = [
            {
                title: "1. פתיחה – מה היחס שלי אל הגוף שלי? מי הוא? מי אני?",
                content: [
                    `רובנו, רוב בני האדם, ברוב הזמן, חושבים על עצמנו (או יותר נכון לא חושבים על עצמנו), על מה שאנחנו קוראים לו "אני", כדבר מובן מאיליו – "אני" מתנהל ופועל בצורה כזאת או אחרת במרחב ובזמן.`,
                    `אבל ברגע שנשאלת השאלה "מי אני?" מתחילים להבין שהתשובה מאד לא ברורה.`,
                    `לרוב, הנטייה הראשונה היא לספר מה קרה לי בחיים כלומר – "אני" הוא העבר שלי. אבל כשחושבים על זה מעט זה לא מאד הגיוני, כי אני פועל גם עכשיו, ויש לי עתיד (כנראה). ובכלל – מה שקרה לי הוא אולי חלק ממני, אבל הוא לא בדיוק "אני".`,
                    `לאחר מכן יש נטייה לזהות את עצמי עם המחשבות שלי. יש בזה מעט הגיון, הרי רובנו חושבים המון מחשבות רוב הזמן. אז מעבר לעובדה שהאני שלי מכיל יותר מאשר מחשבות, גם עצם השימוש במילים הללו, העובדה שאפשר להגיד "המחשבות שלי" מבדיל את המחשבות שלי ממני. כלומר גם המחשבות הן לא "אני".`,
                    `את אותו תהליך מחשבתי אפשר להכיל גם על "הרגשות שלי", "התחושות שלי", ומה שחשוב מבחינתנו "הגוף שלי".`,
                    `עוד לא ענינו על השאלה "מי אני?", ננסה להציע תשובות בפרקים הבאים.`,
                    `אבל נשים לרגע את "הגוף שלי" במרכז הבמה. גם עליו נכון המשפט שבו פתחנו – רובנו מתייחסים אליו כמובן מאיליו, כדבר שמתנהל ופועל במרחב ובזמן. אבל האם אני בכלל שם לב שהגוף שלי קיים? האם אני שומע מה שיש לו לומר? האם אני מקשיב לו?`,
                    `"שירת הגוף" באה לנסות ולתת לגוף נוכחות, ולהעניק לו מילים מתוך המקורות, כדי לגשש דרך בדיוק אל הדבר הזה – אל ההקשבה לגוף ותשומת הלב אליו, בתקווה שהדבר יפתח גם פתח להכרת מה שאנחנו קוראים "אני" ומתוך כך גם פתח לדבקות באלהים. ננסה לפתוח את הפתחים הללו דרך כמה תרגילים ומחשבות.`
                ]
            },
            {
                title: "2. תרגול מקדים - השקטה של הברברת והקשבה לגוף ולאיברים",
                content: [
                    `מה מפריע לנו להקשיב לגוף שלנו?`,
                    `במילה אחת – מחשבות.`,
                    `המחשבות עסוקות בעבר ובעתיד, בהרצה של מילים ותמונות.`,
                    `והגוף נמצא בהווה – כאן ועכשיו.`,
                    `לכן כשאנחנו רוצים להקשיב לגוף אנחנו צריכים להשקיט מעט את הווליום של המחשבות ואת העיסוק בעבר ובעתיד – ולשים את עצמנו במה שקורה כאן ועכשיו, בעולם ובגוף.`,
                    `אחת הדרכים המרכזיות להשקטה של המחשבות היא להתרכז בפעולות פשוטות שהגוף שלנו עושה בדרך כלל בלי שנרגיש, הטכניקה הידועה היא ריכוז בנשימות.`,
                    `את הדבר הזה ממש כדאי לתרגל (כאן ועכשיו!)`,
                    `1. קחו לכם דקה. שבו, עמדו או שכבו בנחת, ושימו לב לאוויר שנכנס פנימה ויוצא החוצה, נכנס ויוצא, נכנס ויוצא וכו'. נסו להיות שם, בפשטות: אויר נכנס פנימה ויוצא החוצה מהאף. נכנס ויוצא מבית החזה, מהריאות. פשוט נשימה ונשיפה, תנו לזה את הזמן...`,
                    `2. את אותו תרגיל אפשר לנסות לעשות עם המחשבות והמוח – לשים לב אל המחשבות, לנסות לראות אותן מבחוץ, בלי שיפוטיות. איך הן נכנסות ויוצאות ומשוטטות במוח... גם לזה חשוב לתת את הזמן, להתרגל לתרגיל.`,
                    `3. עוד דבר שאפשר לשים לב אליו הוא איך הגוף מונח, איך הוא מרגיש? – הרגליים על הרצפה, הישבן על הכסא וכו'. נעים לו? נוח? משהו כואב? (לא צריך לשנות כלום, רק להקשיב)...`,
                    `אנחנו כאן ועכשיו. אז מה הגוף אומר?`,
                    `זה הזמן להתחיל לומר "שירת הגוף".`,
                    `אפשר תוך כדי "שירת הגוף" לנסות לתרגל שוב ושוב את הדברים הללו – לשים לב למחשבות ולראות את היופי שבמוח ולשים לב לפעולתו ("מוח אומר"), לשים לב לפעולות התמידיות של הגוף (הנשימה – "ריאות אומרות", דפיקות הלב – "לב אומר"), ולאורך כל "שירת הגוף" להקשיב לכל איבר שבגוף ולשמוע אותו – מה הוא אומר לי? מה הוא מספר? מה הוא עושה? איך הוא מרגיש?`,
                    `ככה אנחנו אפילו יותר נוכחים. יותר כאן ועכשיו. אפשר להתקדם הלאה.`
                ]
            },
            {
                title: "3. אני, צלם אלוהים",
                content: [
                    `אז מצאנו את הגוף, וניסינו לשמוע אותו ולהקשיב לו.`,
                    `אבל מי אני?`,
                    `התשובה של התורה היא: אני צלם אלהים.`,
                    `כך תכנן אלהים: "וַיֹּאמֶר אֱלֹהִים נַעֲשֶׂה אָדָם בְּצַלְמֵנוּ כִּדְמוּתֵנוּ" (בראשית א, כו).`,
                    `וכך ברא אותי: "וַיִּבְרָא אֱלֹהִים אֶת הָאָדָם בְּצַלְמוֹ בְּצֶלֶם אֱלֹהִים בָּרָא אֹתוֹ" (שם, כז).`,
                    `אבל מה זה אומר?`,
                    `"צלם אלהים" הוא בעצם הנכחה של אלהים, המשכה שלו, כמו הבן והאב בתורה: "וַיְחִי אָדָם שְׁלֹשִׁים וּמְאַת שָׁנָה וַיּוֹלֶד בִּדְמוּתוֹ כְּצַלְמוֹ וַיִּקְרָא אֶת שְׁמוֹ שֵׁת" (בראשית ה, ג)`,
                    `אבל מיהו אלהים שנבראתי בצלמו?`,
                    `שאלה טובה. כמו השאלה "מי אני?" התשובה לא ברורה. אולי כבר זה חלק מצלם אלהים.`,
                    `ובכל זאת, על פי הקבלה יש שני פנים מרכזיים בהתגלותו של הקב"ה בעולם, שתי "תכונות" הופכיות:`,
                    `1. "סובב כל עלמין" (מקיף את כל העולמות) ש"לית מחשבה תפיסה ביה כלל" (אין מחשבה תופסת בו כלל).`,
                    `2. "ממלא כל עלמין" (ממלא את כל העולמות) ש"לית אתר פנוי מינה" (אין מקום פנוי ממנו).`,
                    `והאדם, "אני", הוא "צלם אלהים", ויש בי את שני הפנים הללו, ודרכם יש לי אפשרות להידבק בבוראי.`,
                    `ננסה להציע שני תרגולים להנכחה של שני הפנים הללו של האני ודבקותו באלהים תוך כדי "שירת הגוף".`
                ]
            },
            {
                title: "4. פנים ראשונות: 'אני' נכלל באין סוף",
                content: [
                    `לפי הרמב״ם כדי ״להתקרב״ יותר להשגת הקב״ה צריך להבין בעיקר כמה אנחנו רחוקים מהשגתו, כמה השתיקה יפה לו יותר מכל תואר, וכמה כל תואר שבו היינו חושבים לתאר אותו רחוק ממנו מאד. ואפילו יותר מכך – להגדיר את הקב"ה ולתת לו תארים חיוביים גובל בעבודה זרה, כי התואר הוא וודאי לא האל, האל רחוק מכל הגדרה, רחוק מכל קטגוריה ותואר.`,
                    `סופר על רב סעדיה גאון (רס"ג):`,
                    `פעם התארח רס"ג אצל אדם מכניס אורחים, אשר אירח אותו יפה – כדרכו עם כל אורח. אמנם, בעל הבית לא ידע מי הוא אורחו. כאשר כבר עזב רס"ג את מארחו, גילה מישהו את אוזן בעל הבית מי היה אורחו. בעל הבית נחרד, רדף אחרי רס"ג עד שהשיגו ונפל לרגליו בבקשת מחילה על שלא אירחו כראוי. לאחר שרס"ג ענה לו כי אירח אותו בצורה נפלאה, הוא המשיך להתחנן באמרו שאילו היה מכיר במעלת אורחו כפי שהוא יודע אותה כעת הוא היה דואג לו הרבה יותר ומארח אותו יותר בכבוד, וביחס לכבוד הראוי הזה אופן האירוח שלו נחשב למשפיל, ועליו לבקש מחילה.`,
                    `רס"ג התפעל ביותר מן המעשה, ואמר שזו הוראת הדרך העיקרית ביותר שקבל בחייו בעבודת ה' – בכל יום על האדם להתעלות ולהוסיף בהכרת ה' שלו, ומתוך כך לשוב ולהתחרט על עבודת ה' שלו ביום הקודם, מתוך הבנה שביחס להכרת ה' כיום עבודתו אתמול נחשבת כהשפלה.`,
                    `כך הדבר ביחס לקב"ה – בגילויו כאין סוף.`,
                    `ואיך הדבר מתבטא בזהות האדם, שהוא צלם אלהים?`,
                    `בעומק – האדם הוא גם כזה – גילוי של אין סוף.`,
                    `ר' נחמן מברסלב מציע לנו דרך לגלות את האין סוף שבתוכנו:`,
                    `"המהלך בדרך יחידי, הנעור בלילה וכו'. דע, שעיקר הביטול, שאדם מבטל ישותו ונעשה אין, ונכלל באחדות השם יתברך, אין זה אלא על ידי התבודדות. וההתבודדות צריך מקום וזמן מיוחד, שלא יבלבלו אותו המונעים. והזמן הוא בלילה. היינו: הנעור בלילה, שאז הכל ישנים. והמקום הוא בדרך יחידי, ולא בדרך הרבים, שלא יפסיקנו עוברי הדרכים, אלא דייקא שאין רבים הולכים שם, שם ילך ויתבודד, והיינו: והמהלך בדרך יחידי, ואז יכול לפנות ליבו מכל וכל, ויכול לבוא לביטול כל הישות, והיינו: והמפנה ליבו לבטלה. ואז, כשנתבטל לגמרי, אזי הוא נכלל באחדות השם יתברך, ואז הוא בא לבחינת מחוייב, כי הקב"ה מחוייב המציאות, וכל הדברים הם אפשר המציאות, וכשנתבטל ונכלל באחדותו, אזי הוא יוצא מבחינת אפשר, ונכלל במחוייב, וזה בחינת: הרי זה מתחייב בנפשו."`,
                    `התורה הזו בנויה על המשנה במסכת אבות:`,
                    `"רבי חנינא בן חכינאי אומר: הנעור בלילה והמהלך בדרך יחידי והמפנה לבו לבטלה, הרי זה מתחייב בנפשו."`,
                    `ר׳ נחמן הופך את המשמעות הפשוטה של המשנה. פשט המשנה כנראה רוצה לומר לאדם: אל תסכן את עצמך (אל תלך בלילה לבד ותתבטל) – כי אם תעשה את זה יכול לקרות לך משהו רע, עד כדי מוות (׳תתחייב בנפשך׳).`,
                    `אבל ר' נחמן מלמד אותנו דבר אחר.`,
                    `המטרה שר׳ נחמן מייעד לאדם בתורה זו היא ״ביטול״ – לבטל את ישותו, להיעשות אין ולהיכלל באחדות ה׳ יתברך (שהוא "אין" או "אין סוף").`,
                    `כלומר – כמו שהבנו, לקב״ה אין ישות (הוא לא ״יש״ נבדל) אלא הוא רחוק מכל הגדרה, ובשפה החסידית-קבלית הוא ״אין״ (או "אין סוף") – מעבר להגדרות – זוהי אחדות ה׳ יתברך, ושאיפתו של האדם היא להיכלל באחדות הזאת. הדרך לעשות זאת היא כשאדם ״מבטל את ישותו ונעשה אין״. והפרקטיקה שר׳ נחמן מציע כדי להגיע ל״ביטול״ היא ״התבודדות״:`,
                    `שאדם ילך לבד, בלילה (זמן מיוחד ומבודד), בדרך שאנשים לא הולכים בה (מקום מיוחד ומבודד) – ויעשה התבודדות של ביטול – ״לפנות לבו מכל וכל, ויכול לבוא לביטול הישות. ואז, כשנתבטל לגמרי, אזי הוא נכלל באחדות ה׳ יתברך״.`,
                    `וכך מפורט יותר באותה התורה:`,
                    `"ושם ילך ויתבודד, ויפנה לבו ודעתו מכל עסקי עולם הזה, ויבטל הכל, עד שיזכה לבחינת ביטול באמת. היינו, שבתחילה ירבה בתפילות ושיחות בהתבודדות בלילה בדרך יחידי כנ"ל, עד שיזכה לבטל זה הדבר, דהיינו לבטל מידה ותאווה זאת, ואח"כ ירבה עוד בהתבודדות הנ"ל, עד שיבטל מידה ותאווה אחרת. וכן ינהג זמן רב בהתבודדות, בזמן הנ"ל, ובמקום הנ"ל, עד שיבטל הכל. ואח"כ עדיין נשאר ממנו איזה דבר וכו', ואח"כ מבטלין גם זה, עד שלא נשאר ממנו כלום".`,
                    `כלומר – הפרקטיקה היא לזהות איזה דבר שאיתו אני מזדהה (״מידה״ או ״תאווה״ או ״איזה דבר״) ולבטל אותו, ואחר כך לבטל את הדבר הבא – עד שלא נשאר ממני כלום. ״אני״ הופך ל״אין״ – ואז מגיעים להיות כלולים בקב״ה שהוא ה״אין״.`,
                    `וכך מגלים את העצמי האמיתי שהוא האין, האין סוף, צלם אלהים.`,
                    `ועדיין לא לגמרי ברור מה הכוונה ״לבטל״ מידה או הגדרה. תשובה סבירה לכך נמצאת בסוטרה בודהיסטית הנקראת ״לא עצמי״ שמציעה פרקטיקה דומה מאד של זיהוי דברים שאליהם האדם קשור (גוף, הרגשה, זיהוי, תופעה מנטאלית, הכרה) וניתוק ההגדרה שלו עצמו (שברמה מסוימת לא באמת קיים) מהם. המחשבה שאדם חושב כאשר הוא מבין את זה היא – ״הדבר הזה - זה לא אני״. ובטקסט שם:`,
                    `"זה לא שלי, זה לא עצמי, זה לא אני".`,
                    `ר׳ נחמן כנראה מכוון פחות או יותר לאותה פרקטיקה ולאותה כוונה, להתרכז בכל דבר שאתו אני מזדהה (״מידה״ או ״תאווה״ או ״איזה דבר״) ולחשוב: ״זה לא אני״ – כי האישיות שלי היא לא הגוף, היא לא מה שאני חושב, מה שאני מרגיש או מה שאני מתאווה. היא לא מוגדרת בשום תואר ומידה, היא ״אין״, אין סוף - היא צלם אלהים.`
                ]
            },
            {
                title: "5. תרגול פנים ראשונות",
                content: [
                    `הגוף שלי מדבר, אני בשקט.`,
                    `אני איני הגוף שלי, אני אינני, אני כלול באלהים.`,
                    `נחזור על התרגיל המקדים.`,
                    `נשים לב אל הנשימות,`,
                    `אל המחשבות,`,
                    `אל הגוף.`,
                    `נהיה נוכחים כאן ועכשיו.`,
                    `ואז נשאל שאלה פשוטה בחלל האוויר:`,
                    `איפה אני?`,
                    `נקרא בשירת הגוף, ובכל איבר נעצור ונשאל:`,
                    `אני בראש?`,
                    `אני במח?`,
                    `אני בלב?`,
                    `בידיים?`,
                    `ברגליים?`,
                    `וכו'`,
                    `וכו'`,
                    `נתבונן על זה היטב ונראה שאף אחת מהאפשרויות לא מדויקת.`,
                    `אף אחת מהאפשרויות לא מגדירה אותי.`,
                    `נמשיך להקשיב, נמשיך להתבונן.`,
                    `ונבין לאט לאט, עם כל אפשרות שאנחנו שוללים`,
                    `שהדבר הזה שאנחנו קוראים לו "אני"`,
                    `הוא בלתי ניסן לתפיסה.`,
                    `הוא מעבר להגדרות.`,
                    `הוא נוגע באין סוף.`,
                    `הוא בטל,`,
                    `נכלל`,
                    `ודבק`,
                    `באלהים.`
                ]
            },
            {
                title: "6. פנים שניות: מלא כל הארץ והגוף",
                content: [
                    `אל מול האין סוף שאין תפיסה בו כלל, עומדות הפנים של אלהים שנמצא בכל מקום "מלא כל הארץ כבודו".`,
                    `ה' יתברך מתגלה בייחודו דווקא על ידי זה שהוא נמצא בכל מקום ומאחד את כל הדברים.`,
                    `על פי הקבלה לאל יש פנים רבות ובכולן הוא מתגלה. והוא כולל בתוכו את כל הכוחות כולם. וכנגדו – נמצא כל דבר באדם, בתורה ובעולם.`,
                    `לריבוי הפנים הזה יש שני מצבים:`,
                    `הראשון הוא המצב המתוקן - אחדות בין הפנים הרבות, והשני הוא המצב השבור - מצב של פירוד.`,
                    `והאל והאדם נעים ונדים בין המצבים השונים – פירוד, חטא, חורבן וגלות, ולעומת זאת – תיקון וגאולה.`,
                    `כצלם אלהים, עבודתו של האדם בעולם היא לחבר ולאחד את עצמו ואת פניו השונות, ומתוך כך - את העולמות כולם, ואת פניו השונים של הקב״ה.`,
                    `כך נכתב בזהר הקדוש (ברעיא מהימנא) לפרשת ואתחנן:`,
                    `״שמע ישראל ה’ אלוהינו ה’ אחד״.`,
                    `מצווה זו, לייחד שמו של הקב״ה בכל יום, שהרי כמו שמייחדים שמו של הקב״ה למטה, כך מתייחד שמו למעלה. נמצא שהקדוש ברוך הוא יחיד מעלה ומטה.`,
                    `מי שמייחד שמו של הקב״ה ישים לבו ורצונו באותו ייחוד שאמרנו, ויחבר כל איבריו באותו ייחוד באותו רצון, להיות כולם אחד. כמו ששם כל איבריו בסוד האחד, כך למעלה מחבר כל האיברים העליונים באותו ייחוד, להיות כולם אחד.`,
                    `בשעה שבא אדם ליחד את שמו של הקב״ה, כל חיילות השמים עומדים שורות שורות כדי להיתקן ולהיכלל כולם באותו יחוד, לעמוד בסוד אחד ביחוד אחד. כולם מיתקנים בתיקוניהם כראוי.`,
                    `באותה שעה עומד ממונה אחד, שמש, העומד תחת רמ״ח עולמות וכולם נקראים איברי הגוף ... וזה הוא מלקט שושנים, כמו שאתה אומר ״וללקוט שושנים״, שהם איברי הגוף.`,
                    `על פי הטקסט הזה, קיום מצוות ייחוד ה׳ בשמע ישראל, הוא עבודה תודעתית של האדם לאחד את איבריו באחדות אחת, כדי ליצור אחדות ב"איבריו" של הקב״ה ובכל העולמות (שנקראים אברי הגוף).`,
                    `איך עושים את זה? ״ישים לבו ורצונו באותו ייחוד שאמרנו, ויחבר כל אבריו באותו ייחוד ובאותו רצון, להיות כולם אחד״.`,
                    `כלומר - יש משהו, חוויה או הבנה שנקראים ״ייחוד״, שבה ״הקב״ה אחד למטה ולמעלה״ – ואל זה צריך לכוון את הלב, התודעה והרצון, ולחבר את האיברים לשם.`,
                    `יכול להיות שהכוונה היא לעבודה תודעתית כזאת: לחשוב ולהתרכז בהכרה בייחוד ה׳ בתשומת לב - שהקב״ה הוא אחד למעלה ולמטה, וכל הדברים הם גילוי אלוהות, וכולם נכללים באחד.`,
                    `ואז לעבור בתשומת לב על כל האיברים, איבר איבר, ולחבר אותם בעזרת התודעה - המחשבה והדמיון, אחד אחד, לאותו הייחוד.`,
                    `עד שיהיה האדם כולו אחדות אחת. שמאוחדת עם האחדות האלהית.`,
                    `ולפי הזהר, כאשר אדם עושה את העבודה הזאת, גם כל חיילות השמיים וכל רמ״ח העולמות, שהם הם "איבריו" של הקב״ה על פי הטקסט – גם הם מתאחדים באותו הייחוד שכולל הכל.`,
                    `כלומר – בפנים השניות, אני הוא צלם אלהים שמלא כל, שמתגלה בכל מקום ובכל הגוף, שמחבר וכולל הכל באלהים - את האיברים ומתוך כך את האישיות ואת העולמות כולם. זה לעומת ה"ביטול" שבפנים הראשונות שבהן האני הוא צלם אלהים במקום הלא נתפס של "האין".`,
                    `בפנים הראשונות אני דבק באין. בפנים השניות אני דבק בהכל.`
                ]
            },
            {
                title: "7. תרגול פנים שניות",
                content: [
                    `האחד נוכח. אני נוכח, וכל חלק בגוף שלי כאשר הוא שר - הוא דבק באחדות של האני.`,
                    `וכך עד שכל כולי אחד. הגוף וכל חלקיו וכל חלקי נפשי כלולים באחד. אני כלול באלהים.`,
                    `נחזור על התרגיל המקדים.`,
                    `נשים לב אל הנשימות,`,
                    `אל המחשבות,`,
                    `אל הגוף.`,
                    `נהיה נוכחים כאן ועכשיו.`,
                    `נשים את המחשבות שאותם למדנו על ליבנו –`,
                    `נתבונן בכך שכל הדברים בעולם הם גילוי של האחד,`,
                    `כי "מלא כל הארץ כבודו".`,
                    `נשים לב שאם מתבוננים לעומק,`,
                    `עד רמת החלקיקים הקטנים,`,
                    `אין שום דבר ברור`,
                    `שמפריד בין הגוף שלי`,
                    `לבין האדמה שהרגליים שלי עליה`,
                    `ובין האויר שסביבי.`,
                    `והכל הוא בסוד אחד.`,
                    `ואז 'נשים את ליבנו ורצוננו באותו ייחוד שאמרנו',`,
                    `ונתחיל לקרוא בשירת הגוף, ובכל איבר נעצור ונחבר,`,
                    `'נחבר כל איבר באותו ייחוד באותו רצון, להיות כולם אחד'.`,
                    `הראש – נכלל באחד.`,
                    `המח – נכלל באחד.`,
                    `הלב – נכלל באחד.`,
                    `הידיים – נכלל באחד.`,
                    `הרגליים – נכלל באחד.`,
                    `וכו'`,
                    `וכו'`,
                    `הגוף כולו,`,
                    `ואני כולי,`,
                    `נכלל`,
                    `באחד`,
                    `ודבק`,
                    `באלהים.`
                ]
            },
            {
                title: "8. בין שירת הגוף לשירת הבריאה",
                content: [
                    `אני צלם אלהים.`,
                    `והגוף שלי?`,
                    `חז"ל אמרו:`,
                    `"הני חמשה ברכי נפשי כנגד מי אמרן דוד?`,
                    `לא אמרן אלא כנגד הקב"ה וכנגד נשמה.`,
                    `מה הקב"ה מלא כל העולם אף נשמה מלאה את כל הגוף`,
                    `מה הקדוש ברוך הוא רואה ואינו נראה אף נשמה רואה ואינה נראית`,
                    `מה הקב"ה זן את כל העולם כלו אף נשמה זנה את כל הגוף`,
                    `מה הקב"ה טהור אף נשמה טהורה`,
                    `מה הקב"ה יושב בחדרי חדרים אף נשמה יושבת בחדרי חדרים.`,
                    `יבא מי שיש בו חמשה דברים הללו וישבח למי שיש בו חמשה דברים הללו:"`,
                    `(ברכות י.)`,
                    `הנשמה דומה לקב"ה – ממלאה, רואה ואינה נראית, זנה, טהורה ויושבת בחדרי חדרים.`,
                    `והגוף?`,
                    `הגוף הוא השתקפות של "גופו" של הקב"ה: העולם (והעולמות כולם).`,
                    `כבר קראנו בזהר "רמ״ח עולמות... כולם נקראים איברי הגוף".`,
                    `וגם במדרש הזה הנשמה מקבילה לקב"ה, והעולם מקביל לגוף – הכלי, הניזון, המסתיר.`,
                    `גם זה חלק מלהיות צלם אלהים:`,
                    `לממש בתוכי את הייחוד בין הנשמה והגוף, ומתוך כך להביט ולראות את ייחוד הקב"ה ושכינתו בעולמו.`,
                    `כמו שראינו על פי הזהר, שלאדם יש כוח גדול מאד - כאשר אדם עושה את העבודה של אחדות האיברים, גם כל חיילות השמיים וכל רמ״ח העולמות, שהם הם "איבריו" של הקב״ה – גם הם מתאחדים באותו הייחוד שכולל הכל.`,
                    `ומתוך "שירת הגוף" אפשר לגשת ל"שירת הבריאה".`,
                    `לשים לב איך מתוך מצוות ייחוד ה', מתוך אחדות האברים, כל הדברים שבשמיים ובארץ "...עומדים שורות שורות כדי להיתקן ולהיכלל כולם באותו יחוד, לעמוד בסוד אחד ביחוד אחד. כולם מיתקנים בתיקוניהם כראוי".`
                ]
            },
            {
                title: "9. תרגול שירת הגוף והבריאה",
                content: [
                    `נתחיל מאיפה שהפסקנו בתרגול השני`,
                    `הגוף כולו,`,
                    `ואני כולי,`,
                    `נכלל`,
                    `באחד`,
                    `ודבק`,
                    `באלהים.`,
                    `נתחיל לקרוא בשירת הבריאה,`,
                    `שמיים אומרים "שמים מספרים כבוד אל"...`,
                    `ארץ אומרת "לה' הארץ ומלואה"...`,
                    `וכו'....`,
                    `נתבונן ונחוש איך "גופו" של הקב"ה שר`,
                    `וננסה להדביק שוב כל "איבר"`,
                    `בסוד של אחד.`,
                    `הגוף שלי`,
                    `עם`,
                    `שמיים`,
                    `ארץ`,
                    `כוכבים`,
                    `אש ומים`,
                    `עצים`,
                    `וצמחים`,
                    `ציפורים`,
                    `חיות`,
                    `ואדם`,
                    `כולם`,
                    `נכללים`,
                    `באחד`,
                    `ודבקים`,
                    `באלהים.`
                ]
            }
        ];

        // ===== ספריית ההשראה המוכנה מראש (inspiration.json) =====
        // מבקר שמקליד אבר או תחושה מוכרים מקבל תשובה מהספרייה מיד, בלי AI ובלי מכסה.
        // רק הקלדה שלא מתאימה לאף אבר נשלחת ל-Gemini דרך /api/inspire.
        let inspirationLib = null;
        const loadInspiration = () => {
            if (!inspirationLib) {
                inspirationLib = typeof fetch === 'function'
                    ? fetch('/inspiration.json').then(r => r.json()).catch(() => { inspirationLib = null; return []; })
                    : Promise.resolve([]);
            }
            return inspirationLib;
        };
        const normHe = (t) => (t || '').normalize('NFKD').replace(/[\u0591-\u05C7]/g, '')
            .replace(/[^\u05D0-\u05EAa-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim();
        const PREFIX = /^[הובלמשכ]/;
        const matchOrgan = (lib, input) => {
            const q = normHe(input);
            if (!q) return null;
            const tokens = q.split(' ');
            const forms = [...new Set([q, tokens.map(t => (t.length > 2 ? t.replace(PREFIX, '') : t)).join(' ')])];
            let best = null, bestScore = 0;
            lib.forEach((o, oi) => {
                for (const kw of o.keywords) {
                    const k = normHe(kw);
                    if (!k) continue;
                    for (const f of forms) {
                        let sc = 0;
                        if (f === k) sc = 1000 + k.length;
                        else if ((' ' + f + ' ').includes(' ' + k + ' ')) sc = 500 + k.length;
                        else if (f.length >= 3 && k.includes(f)) sc = 200 + f.length;
                        if (sc > bestScore) { bestScore = sc; best = oi; }
                    }
                }
            });
            return best === null ? null : lib[best];
        };
        const lastVariant = {};

        const INSPIRE_EXAMPLES = ['לב', 'עיניים', 'ידיים', 'נשימה', 'ראש', 'בטן', 'גב', 'רגליים'];

        const BodyInspiration = ({ standalone = false, pick = null }) => {
            const [input, setInput] = useState('');
            const [result, setResult] = useState(null);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState("");

            const [names, setNames] = useState([]);
            const [shareCard, setShareCard] = useState(null);
            useEffect(() => { loadInspiration().then(lib => setNames(lib.map(o => o.name))); }, []);
            const resultRef = useRef(null);
            useEffect(() => {
                if (!pick) return;
                setInput(pick.name);
                generate(pick.name).then(() => setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80));
            }, [pick]);

            const generate = async (text) => {
                const q = (typeof text === 'string' ? text : input).trim();
                if (!q) return;
                setError("");
                const lib = await loadInspiration();
                const organ = lib.length ? matchOrgan(lib, q) : null;
                if (organ) {
                    // גרסה אחרת מזו שהוצגה בפעם הקודמת לאותו אבר
                    const n = organ.variants.length;
                    let i = Math.floor(Math.random() * n);
                    if (n > 1 && i === lastVariant[organ.id]) i = (i + 1) % n;
                    lastVariant[organ.id] = i;
                    setResult({ ...organ.variants[i], organId: organ.id, organTitle: organ.title || organ.name });
                    return;
                }
                setLoading(true);
                setResult(null);
                try {
                    // הקריאה ל-Gemini מתבצעת בשרת (netlify/functions/inspire.mjs) – המפתח לא נמצא בדף
                    const response = await fetch('/api/inspire', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ input: q })
                    });
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) throw new Error(data.error || "לא הצלחנו לקבל השראה כרגע. נסו שוב בעוד רגע.");
                    setResult(data);
                } catch (e) {
                    setError(e.message);
                } finally { setLoading(false); }
            };

            return (
                <div className={`bg-stone-900/40 border border-white/5 rounded-2xl p-6 md:p-8 ${standalone ? '' : 'mt-12'} text-right shadow-xl relative overflow-hidden`}>
                    {!standalone && (
                        <h3 className="text-xl md:text-2xl font-serif font-bold mb-4 flex items-center gap-3 justify-end text-white">
                            <Icon name="Sparkles" size={20} className="text-stone-400" /> השראה אישית מפרק שירה
                        </h3>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 relative z-10 text-right">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} list="organ-names"
                               onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
                               placeholder="איזה איבר או תחושה מבקשים שירה?" 
                               className="flex-grow bg-black/60 border border-white/10 rounded-full px-6 py-3 text-white text-base focus:outline-none focus:ring-1 focus:ring-stone-600 transition-all text-right shadow-inner" />
                        <button onClick={() => generate()} disabled={loading || !input.trim()} 
                                className="bg-stone-200 text-black font-bold px-8 py-2.5 rounded-full text-base hover:bg-white transition-all disabled:opacity-50 min-w-[120px]">
                            {loading ? "מתבונן..." : "גלה את השירה"}
                        </button>
                    </div>
                    {standalone && (
                        <div className="flex flex-wrap gap-2 mt-4 text-sm">
                            <span className="text-stone-500 py-1.5">לדוגמה:</span>
                            {INSPIRE_EXAMPLES.map(n => (
                                <button key={n} onClick={() => { setInput(n); generate(n); }} className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-stone-300 hover:text-white hover:border-white/30">{n}</button>
                            ))}
                        </div>
                    )}
                    {shareCard && <ShareCardDialog card={shareCard} onClose={() => setShareCard(null)} />}
                    <datalist id="organ-names">{names.map(n => <option key={n} value={n} />)}</datalist>
                    {error && <p className="mt-4 text-red-400 text-right text-sm font-bold">{error}</p>}
                    {result && (
                        <div ref={resultRef} className="mt-8 space-y-4 animate-fade-in text-right relative z-10 song-anchor">
                            {result.verse && (
                                <div className="bg-white/5 p-5 rounded-xl border-r-4 border-stone-600 text-right shadow-lg">
                                    <p className="text-xl md:text-2xl font-serif italic text-white leading-relaxed text-right">"{result.verse}"</p>
                                    {result.source && <p className="mt-2 text-sm text-stone-500 text-right">({result.source})</p>}
                                </div>
                            )}
                            <div className="p-6 bg-white/[0.01] rounded-xl border border-white/5 text-right shadow-md">
                                <p className="text-lg text-stone-300 leading-relaxed mb-4 font-light text-right">{result.inspiration}</p>
                                <div className="pt-4 border-t border-white/5 text-lg text-white italic font-serif text-right">
                                    {result.meditation}
                                </div>
                            </div>
                            {result.organId && (
                                <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
                                    <a href={`/shirat-haguf/#${result.organId}`} className="text-stone-300 underline underline-offset-4 hover:text-white">ל"{result.organTitle}" בשירת הגוף</a>
                                    <span className="flex gap-2">
                                        <button onClick={() => setShareCard({ id: result.organId, title: result.organTitle, verse: cleanVerse(result.verse), source: result.source })} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/15 text-stone-300 hover:bg-white/5"><Icon name="Share2" size={14} /> שיתוף</button>
                                        <button onClick={() => generate()} className="px-4 py-1.5 rounded-full border border-white/15 text-stone-300 hover:bg-white/5">השראה נוספת</button>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        // ===== שירת הגוף כטקסט (מתוך booklet.json) =====
        const SOURCE_PARTS = ['guf', 'briah'];

        const renderInline = (text, partId, keyBase) => {
            if (!SOURCE_PARTS.includes(partId)) return text;
            // מקורות בסוגריים – באות קטנה ועמומה
            const out = [];
            let last = 0, m, i = 0;
            const re = /\(([^()]{2,40})\)/g;
            while ((m = re.exec(text)) !== null) {
                if (m.index > last) out.push(text.slice(last, m.index));
                out.push(<span key={`${keyBase}-s${i++}`} className="song-source">({m[1]})</span>);
                last = m.index + m[0].length;
            }
            if (last < text.length) out.push(text.slice(last));
            return out;
        };

        const SongLine = ({ line, partId, k }) => {
            const segs = typeof line === 'string' ? [[line, 0]] : line;
            const isAlso = typeof line === 'string' && /^ואומר[:.]/.test(line);
            return (
                <p className={`song-line ${isAlso ? 'song-also' : ''}`}>
                    {segs.map(([t, b], i) => b
                        ? <strong key={i} className="text-white font-bold">{t}</strong>
                        : <React.Fragment key={i}>{renderInline(t, partId, `${k}-${i}`)}</React.Fragment>)}
                </p>
            );
        };

        // ===== מפת הגוף =====
        const BODY_REGIONS = [
            { key: 'head', label: 'ראש ופנים', dot: [100, 34], organs: [[1, "ראש"], [2, "קרקפתא דתפילין"], [3, "מח"], [4, "שיער"], [5, "רקה"], [6, "אזן"], [7, "עין"], [8, "אף"], [9, "פה"], [10, "לשון"], [11, "שפתיים"], [12, "חיך"], [13, "שיניים"], [14, "לחיים"]] },
            { key: 'neck', label: 'צוואר וגרון', dot: [100, 70], organs: [[15, "צוואר"], [16, "עורף"], [17, "מיתרי הקול"], [18, "ושט"]] },
            { key: 'shoulders', label: 'כתפיים וגב', dot: [140, 90], organs: [[19, "חגורת הכתפיים"], [20, "כתף"], [27, "גב"], [28, "שכמה"]] },
            { key: 'hands', label: 'ידיים', dot: [171, 256], organs: [[21, "ידיים"], [22, "יד ימין"], [23, "יד שמאל"], [24, "אצבעות"], [25, "ציפורניים"]] },
            { key: 'chest', label: 'חזה ולב', dot: [111, 122], organs: [[26, "גופא (מרכז הגוף)"], [29, "שדיים"], [30, "לב"], [31, "מעטפת הלב"], [32, "ריאות ומערכת הנשימה"]] },
            { key: 'belly', label: 'בטן', dot: [100, 172], organs: [[33, "בטן"], [34, "כבד"], [35, "כיס המרה"], [36, "טחול, מערכת החיסון והלימפה"], [37, "לבלב"], [38, "קיבה"], [39, "מעי דק"], [40, "מעי גס"], [41, "כליות"]] },
            { key: 'pelvis', label: 'אגן', dot: [100, 224], organs: [[42, "שלפוחית השתן"], [43, "אברי הרבייה הפנימיים"], [44, "אברי הרביה החיצוניים (אות ברית קודש)"]] },
            { key: 'legs', label: 'רגליים', dot: [119, 334], organs: [[45, "רגליים"], [46, "רגל ימין"], [47, "רגל שמאל"], [48, "ירך"], [49, "ברך"], [50, "שוק"], [51, "עקב"], [52, "כף הרגל"]] },
            { key: 'whole', label: 'בכל הגוף', dot: null, organs: [[53, "עור"], [54, "שרירים ובשר"], [55, "דם"], [56, "עורקים"], [57, "ורידים"], [58, "עצמות"], [59, "גידים"], [60, "מערכת העצבים"], [61, "מערכת העצבים הפאראסימפטטית"], [62, "מערכת העצבים הסימפטטית"], [63, "המערכת ההורמונאלית"], [64, "חללי הגוף, הרקמה המחברת והנוזל הבין תאי"]] }
        ];
        const BODY_PATH = 'M108,55 C111.0,58.2 108.3,69.8 110,74 C111.7,78.2 113.7,78.3 118,80 C122.3,81.7 131.0,82.3 136,84 C141.0,85.7 145.0,87.0 148,90 C151.0,93.0 152.5,96.7 154,102 C155.5,107.3 156.0,114.3 157,122 C158.0,129.7 158.8,139.7 160,148 C161.2,156.3 162.7,163.7 164,172 C165.3,180.3 166.7,189.7 168,198 C169.3,206.3 170.8,215.3 172,222 C173.2,228.7 173.7,233.7 175,238 C176.3,242.3 178.8,244.7 180,248 C181.2,251.3 182.3,255.0 182,258 C181.7,261.0 180.0,264.3 178,266 C176.0,267.7 172.3,269.0 170,268 C167.7,267.0 165.3,263.3 164,260 C162.7,256.7 162.7,252.0 162,248 C161.3,244.0 161.3,242.3 160,236 C158.7,229.7 155.8,218.7 154,210 C152.2,201.3 150.5,192.3 149,184 C147.5,175.7 146.3,167.7 145,160 C143.7,152.3 142.3,144.0 141,138 C139.7,132.0 138.0,123.7 137,124 C136.0,124.3 135.8,133.0 135,140 C134.2,147.0 132.8,158.3 132,166 C131.2,173.7 129.8,179.7 130,186 C130.2,192.3 131.8,198.0 133,204 C134.2,210.0 136.2,215.0 137,222 C137.8,229.0 138.2,237.0 138,246 C137.8,255.0 136.8,266.0 136,276 C135.2,286.0 133.8,297.3 133,306 C132.2,314.7 131.2,320.7 131,328 C130.8,335.3 132.2,341.7 132,350 C131.8,358.3 131.0,369.0 130,378 C129.0,387.0 126.5,397.3 126,404 C125.5,410.7 125.7,414.0 127,418 C128.3,422.0 132.5,425.3 134,428 C135.5,430.7 137.7,432.7 136,434 C134.3,435.3 127.8,436.0 124,436 C120.2,436.0 115.2,436.7 113,434 C110.8,431.3 111.2,425.0 111,420 C110.8,415.0 112.2,411.0 112,404 C111.8,397.0 110.7,387.0 110,378 C109.3,369.0 108.3,358.3 108,350 C107.7,341.7 108.3,336.3 108,328 C107.7,319.7 106.7,310.0 106,300 C105.3,290.0 104.8,277.3 104,268 C103.2,258.7 101.7,248.3 101,244 C100.3,239.7 100.3,242.0 100,242 C99.7,242.0 99.7,239.7 99,244 C98.3,248.3 96.8,258.7 96,268 C95.2,277.3 94.7,290.0 94,300 C93.3,310.0 92.3,319.7 92,328 C91.7,336.3 92.3,341.7 92,350 C91.7,358.3 90.7,369.0 90,378 C89.3,387.0 88.2,397.0 88,404 C87.8,411.0 89.2,415.0 89,420 C88.8,425.0 89.2,431.3 87,434 C84.8,436.7 79.8,436.0 76,436 C72.2,436.0 65.7,435.3 64,434 C62.3,432.7 64.5,430.7 66,428 C67.5,425.3 71.7,422.0 73,418 C74.3,414.0 74.5,410.7 74,404 C73.5,397.3 71.0,387.0 70,378 C69.0,369.0 68.2,358.3 68,350 C67.8,341.7 69.2,335.3 69,328 C68.8,320.7 67.8,314.7 67,306 C66.2,297.3 64.8,286.0 64,276 C63.2,266.0 62.2,255.0 62,246 C61.8,237.0 62.2,229.0 63,222 C63.8,215.0 65.8,210.0 67,204 C68.2,198.0 69.8,192.3 70,186 C70.2,179.7 68.8,173.7 68,166 C67.2,158.3 65.8,147.0 65,140 C64.2,133.0 64.0,124.3 63,124 C62.0,123.7 60.3,132.0 59,138 C57.7,144.0 56.3,152.3 55,160 C53.7,167.7 52.5,175.7 51,184 C49.5,192.3 47.8,201.3 46,210 C44.2,218.7 41.3,229.7 40,236 C38.7,242.3 38.7,244.0 38,248 C37.3,252.0 37.3,256.7 36,260 C34.7,263.3 32.3,267.0 30,268 C27.7,269.0 24.0,267.7 22,266 C20.0,264.3 18.3,261.0 18,258 C17.7,255.0 18.8,251.3 20,248 C21.2,244.7 23.7,242.3 25,238 C26.3,233.7 26.8,228.7 28,222 C29.2,215.3 30.7,206.3 32,198 C33.3,189.7 34.7,180.3 36,172 C37.3,163.7 38.8,156.3 40,148 C41.2,139.7 42.0,129.7 43,122 C44.0,114.3 44.5,107.3 46,102 C47.5,96.7 49.0,93.0 52,90 C55.0,87.0 59.0,85.7 64,84 C69.0,82.3 77.7,81.7 82,80 C86.3,78.3 88.3,78.2 90,74 C91.7,69.8 89.0,58.2 92,55 C95.0,51.8 105.0,51.8 108,55 Z';
        const BodyMap = ({ onPick, compact = false }) => {
            const [region, setRegionState] = useState(null);
            const listRef = useRef(null);
            const setRegion = (k) => {
                setRegionState(k);
                setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
            };
            const current = BODY_REGIONS.find(r => r.key === region);
            return (
                <div className={`flex ${compact ? 'flex-col' : 'flex-col md:flex-row'} gap-6 items-center md:items-start`}>
                    <svg viewBox="0 0 200 440" className="body-map w-36 md:w-52 shrink-0" role="img" aria-label="מפת הגוף: בחרו אזור">
                        <g fill="none" stroke="#e7e5e4" strokeWidth="1.1" strokeLinejoin="round" opacity="0.75">
                            <ellipse cx="100" cy="36" rx="21" ry="26" />
                            <path d={BODY_PATH} />
                        </g>
                        {BODY_REGIONS.filter(r => r.dot).map((r, i) => (
                            <g key={r.key} className="map-dot" style={{ animationDelay: `${i * 0.4}s` }} onClick={() => setRegion(r.key)} role="button" tabIndex="0"
                               aria-label={r.label} onKeyDown={(e) => { if (e.key === 'Enter') setRegion(r.key); }}>
                                <circle cx={r.dot[0]} cy={r.dot[1]} r="14" fill="transparent" />
                                <circle cx={r.dot[0]} cy={r.dot[1]} r={region === r.key ? 6 : 4.5} className={region === r.key ? 'map-dot-on' : 'map-dot-off'} />
                            </g>
                        ))}
                    </svg>
                    <div className="flex-grow w-full text-right">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {BODY_REGIONS.map(r => (
                                <button key={r.key} onClick={() => setRegion(r.key)}
                                        className={`px-3 py-1.5 rounded-full text-sm border ${region === r.key ? 'bg-white text-black border-white font-bold' : 'border-white/15 text-stone-300 hover:text-white'}`}>{r.label}</button>
                            ))}
                        </div>
                        {!current && <p className="text-stone-500 font-serif text-lg">בחרו אזור בגוף, ואז את האבר.</p>}
                        {current && (
                            <div ref={listRef} className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fade-in scroll-mb-6">
                                {current.organs.map(([id, name]) => (
                                    <button key={id} onClick={() => onPick(id, name)}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-stone-900/70 border border-white/10 hover:border-white/30 text-stone-200 hover:text-white text-sm text-right">
                                        <img src={`/images/sketches/guf-${id}.webp`} alt="" width="32" height="32" loading="lazy" className="w-8 h-8 shrink-0" />
                                        <span>{name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        // ===== כרטיס שיתוף =====
        const SITE_HOST = 'shirathaguf.netlify.app';
        const stripTeamim = (t) => (t || '').replace(/[֑-ֽ֯׀׃]/g, '');
        const cleanVerse = (t) => stripTeamim(t).replace(/\(([^()]*)\)\s*$/, '').trim().replace(/^["״'׳]+|["״'׳:]+$/g, '').replace(/:$/, '').trim();
        const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });

        const wrapLines = (ctx, text, maxW) => {
            const words = text.split(/\s+/); const lines = []; let line = '';
            for (const w of words) {
                const t = line ? `${line} ${w}` : w;
                if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
            }
            if (line) lines.push(line);
            return lines;
        };

        const makeShareCard = async ({ id, title, verse, source }) => {
            const W = 1080, H = 1350;
            const c = document.createElement('canvas'); c.width = W; c.height = H;
            const ctx = c.getContext('2d');
            try {
                await Promise.all([
                    document.fonts.load('700 64px "David Libre"', 'אבג'),
                    document.fonts.load('400 46px "Noto Serif Hebrew"', 'אָבָג'),
                    document.fonts.load('400 30px "Assistant"', 'אבג'),
                ]);
            } catch (e) {}
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
            ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
            const [sketch, logo] = await Promise.all([loadImg(`/images/sketches/${id}.webp`).catch(() => null), loadImg('/images/favicon.png').catch(() => null)]);
            // הפסוק – מקטינים את הגופן עד שהוא נכנס (מקסימום 430 פיקסלים)
            let size = 58, lines = [];
            for (; size >= 28; size -= 2) {
                ctx.font = `400 ${size}px "Noto Serif Hebrew", serif`;
                lines = wrapLines(ctx, `"${verse}"`, 900);
                if (lines.length * size * 1.75 + (source ? 50 : 0) <= 430) break;
            }
            const lh = size * 1.75;
            const verseH = (lines.length - 1) * lh + size + (source ? 56 : 0);
            // ממרכזים את כל ההרכב (שרטוט, כותרת, פסוק) בשטח שמעל התחתית
            const sk = 360, gap1 = 50, titleH = 66, gap2 = 70;
            const contentH = (sketch ? sk + gap1 : 0) + titleH + gap2 + verseH;
            let y0 = Math.max(40, (1050 - contentH) / 2);
            if (sketch) { ctx.drawImage(sketch, (W - sk) / 2, y0, sk, sk); y0 += sk + gap1; }
            ctx.fillStyle = '#fff'; ctx.font = '700 66px "David Libre", serif';
            ctx.fillText(`${title}:`, W / 2, y0 + 52); y0 += titleH + gap2;
            let y = y0 + size;
            ctx.fillStyle = '#e7e5e4'; ctx.font = `400 ${size}px "Noto Serif Hebrew", serif`;
            for (const l of lines) { ctx.fillText(l, W / 2, y); y += lh; }
            if (source) { ctx.fillStyle = '#a8a29e'; ctx.font = '400 30px "Assistant", sans-serif'; ctx.fillText(`(${source})`, W / 2, y - lh + 56); }
            // תחתית: קו, לוגו, שם וסלוגן
            ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(W / 2 - 160, 1075); ctx.lineTo(W / 2 + 160, 1075); ctx.stroke();
            if (logo) {
                ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 1140, 45, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip();
                ctx.drawImage(logo, W / 2 - 44, 1096, 88, 88); ctx.restore();
            }
            ctx.fillStyle = '#fff'; ctx.font = '700 44px "David Libre", serif'; ctx.fillText('שירת הגוף', W / 2, 1232);
            ctx.fillStyle = '#d6d3d1'; ctx.font = '400 34px "David Libre", serif'; ctx.fillText('להקשיב, לנכוח, להתפלל', W / 2, 1280);
            ctx.fillStyle = '#78716c'; ctx.font = '400 24px "Assistant", sans-serif'; ctx.fillText(SITE_HOST, W / 2, 1320);
            return new Promise(res => c.toBlob(res, 'image/png'));
        };

        const ShareCardDialog = ({ card, onClose }) => {
            const [url, setUrl] = useState(null);
            const [file, setFile] = useState(null);
            useEffect(() => {
                let u;
                makeShareCard(card).then(blob => {
                    if (!blob) return;
                    u = URL.createObjectURL(blob); setUrl(u);
                    setFile(new File([blob], `shirat-haguf-${card.id}.png`, { type: 'image/png' }));
                });
                const onKey = (e) => { if (e.key === 'Escape') onClose(); };
                window.addEventListener('keydown', onKey);
                return () => { window.removeEventListener('keydown', onKey); if (u) URL.revokeObjectURL(u); };
            }, []);
            const link = `https://${SITE_HOST}/shirat-haguf/#${card.id}`;
            const canShare = file && navigator.canShare && navigator.canShare({ files: [file] });
            const share = async () => {
                try { await navigator.share({ files: [file], text: `${card.title} – שירת הגוף\n${link}` }); } catch (e) {}
            };
            return (
                <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
                    <div className="bg-stone-950 border border-white/10 rounded-2xl p-4 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
                        {url ? <img src={url} alt={`כרטיס שיתוף: ${card.title}`} className="w-full rounded-lg mb-4" /> : <p className="py-24 text-stone-500 font-serif">מכין את הכרטיס…</p>}
                        <div className="flex gap-2 justify-center flex-wrap">
                            {canShare && <button onClick={share} className="px-5 py-2 rounded-full bg-white text-black font-bold">שיתוף</button>}
                            {url && <a href={url} download={`shirat-haguf-${card.id}.png`} className="px-5 py-2 rounded-full border border-white/20 text-stone-200">הורדת התמונה</a>}
                            <button onClick={onClose} className="px-5 py-2 rounded-full text-stone-400 hover:text-white">סגירה</button>
                        </div>
                    </div>
                </div>
            );
        };

        // ===== תצוגה: ניגודיות גבוהה =====
        const useHighContrast = () => {
            const [on, setOn] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('hc'));
            const toggle = () => {
                const v = !on; setOn(v);
                document.documentElement.classList.toggle('hc', v);
                try { localStorage.setItem('hc', v ? '1' : '0'); } catch (e) {}
            };
            return [on, toggle];
        };

        const SKETCH_ANIM = { 30: 'anim-pulse', 31: 'anim-pulse', 32: 'anim-breathe' };

        const plainLine = (l) => (typeof l === 'string' ? l : l.map(x => x[0]).join(''));

        const SongText = ({ data, partId, onOpenBook }) => {
            const [tocOpen, setTocOpen] = useState(false);
            const [mapOpen, setMapOpen] = useState(false);
            const [menuOpen, setMenuOpen] = useState(false);
            const [shareCard, setShareCard] = useState(null);
            const [hc, toggleHc] = useHighContrast();
            const [size, setSize] = useState(() => {
                try { return Number(localStorage.getItem('songTextSize')) || 1; } catch (e) { return 1; }
            });
            const [showTop, setShowTop] = useState(false);

            useEffect(() => {
                const onScroll = () => setShowTop(window.scrollY > 900);
                window.addEventListener('scroll', onScroll, { passive: true });
                // קישור ישיר לאבר: /shirat-haguf/#guf-30
                const id = decodeURIComponent(window.location.hash.slice(1));
                if (id) {
                    // גוללים שוב אחרי טעינת הגופנים והתמונות, כי הם משנים את גובה הדף
                    const jump = () => document.getElementById(id)?.scrollIntoView({ block: 'start' });
                    setTimeout(jump, 60);
                    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(jump, 30));
                    if (document.readyState !== 'complete') window.addEventListener('load', () => setTimeout(jump, 30), { once: true });
                }
                return () => window.removeEventListener('scroll', onScroll);
            }, []);

            useEffect(() => {
                try { localStorage.setItem('songTextSize', String(size)); } catch (e) {}
            }, [size]);

            const goTo = (id) => {
                setTocOpen(false); setMapOpen(false);
                try { history.replaceState(null, '', `#${id}`); } catch (e) {}
                setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
            };

            if (!data) return null;
            const parts = data.parts;
            const idx = Math.max(0, parts.findIndex(p => p.id === partId));
            const part = parts[idx];
            const prevPart = parts[idx - 1];
            const nextPart = parts[idx + 1];
            const blockId = (p, b) => `${p.id}-${b.id}`;
            const pickOrgan = (num) => {
                if (part.id === 'guf') goTo(`guf-${num}`);
                else window.location.href = `/shirat-haguf/#guf-${num}`;
            };
            const shareBlock = (b) => {
                const first = plainLine((b.lines || [])[0] || '');
                const m = first.match(/\(([^()]+)\)\s*$/);
                setShareCard({ id: blockId(part, b), title: b.h.replace(/:\s*$/, ''), verse: cleanVerse(first), source: m ? m[1].trim() : '' });
            };

            return (
                <div className="text-right">
                    {/* סרגל כלים דביק */}
                    <div className="sticky top-14 z-40 bg-black/95 backdrop-blur-md border-b border-white/5 no-print">
                        <div className="max-w-3xl mx-auto px-2 h-12 flex items-center justify-between gap-1.5 text-sm">
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => { setTocOpen(o => !o); setMapOpen(false); setMenuOpen(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-stone-200 hover:bg-white/5">
                                    <Icon name={tocOpen ? 'X' : 'List'} size={16} /> תוכן
                                </button>
                                <button onClick={() => { setMapOpen(o => !o); setTocOpen(false); setMenuOpen(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-stone-200 hover:bg-white/5">
                                    <Icon name={mapOpen ? 'X' : 'PersonStanding'} size={16} /> מפה
                                </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="relative">
                                    <button onClick={() => setMenuOpen(o => !o)} aria-label="תצוגה והדפסה" aria-expanded={menuOpen} className="w-9 h-9 rounded-full border border-white/15 text-stone-200 hover:bg-white/5 font-serif font-bold">א</button>
                                    {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>}
                                    {menuOpen && (
                                        <div className="absolute left-0 top-11 w-56 bg-stone-950 border border-white/15 rounded-xl p-2 shadow-2xl animate-fade-in z-50">
                                            <div className="flex items-center justify-between px-2 py-1.5">
                                                <span className="text-stone-400">גודל טקסט</span>
                                                <span className="flex gap-1">
                                                    <button onClick={() => setSize(s => Math.max(0.85, +(s - 0.1).toFixed(2)))} aria-label="הקטנת גופן" className="w-8 h-8 rounded-full bg-white/5 text-stone-300 hover:text-white">א-</button>
                                                    <button onClick={() => setSize(s => Math.min(1.6, +(s + 0.1).toFixed(2)))} aria-label="הגדלת גופן" className="w-8 h-8 rounded-full bg-white/5 text-white text-base">א+</button>
                                                </span>
                                            </div>
                                            <button onClick={toggleHc} role="switch" aria-checked={hc} className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 text-stone-200">
                                                <span>ניגודיות גבוהה</span><span className={`w-9 h-5 rounded-full p-0.5 flex ${hc ? 'bg-white justify-end' : 'bg-white/20 justify-start'}`}><span className="w-4 h-4 rounded-full bg-black"></span></span>
                                            </button>
                                            <button onClick={() => { setMenuOpen(false); setTimeout(() => window.print(), 50); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 text-stone-200"><Icon name="Printer" size={16} /> הדפסת הטקסט</button>
                                            <a href="/booklet.pdf" download="שירת-הגוף.pdf" className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 text-stone-200"><Icon name="Download" size={16} /> הספרון המעוצב (PDF)</a>
                                        </div>
                                    )}
                                </div>
                                <button onClick={onOpenBook} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-stone-200 hover:bg-white/5">
                                    <Icon name="BookOpen" size={16} /> ספרון
                                </button>
                            </div>
                        </div>
                    </div>

                    {mapOpen && (
                        <div className="fixed inset-x-0 top-[6.5rem] bottom-0 z-40 bg-black overflow-y-auto custom-scrollbar animate-fade-in no-print">
                            <div className="max-w-3xl mx-auto px-4 py-6">
                                <h2 className="font-serif text-2xl font-bold text-white mb-4">מפת הגוף</h2>
                                <BodyMap onPick={pickOrgan} />
                            </div>
                        </div>
                    )}

                    {shareCard && <ShareCardDialog card={shareCard} onClose={() => setShareCard(null)} />}

                    {/* תוכן עניינים – כל החלקים; חלק אחר נפתח בעמוד שלו */}
                    {tocOpen && (
                        <div className="fixed inset-x-0 top-[6.5rem] bottom-0 z-40 bg-black overflow-y-auto custom-scrollbar animate-fade-in no-print">
                            <div className="max-w-3xl mx-auto px-4 py-6">
                                {parts.map(p => {
                                    const named = p.blocks.filter(b => b.name);
                                    const here = p.id === part.id;
                                    return (
                                        <div key={p.id} className="mb-8">
                                            {here
                                                ? <button onClick={() => goTo(p.id)} className="font-serif text-2xl font-bold text-white mb-3 hover:underline">{p.title}</button>
                                                : <a href={PART_PATHS[p.id]} className="block font-serif text-2xl font-bold text-stone-300 mb-3 hover:underline">{p.title}</a>}
                                            {named.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {named.map(b => here
                                                        ? <button key={b.id} onClick={() => goTo(blockId(p, b))} className="px-3 py-1.5 rounded-full bg-stone-900 border border-white/10 text-stone-300 hover:text-white hover:border-white/30 text-sm">{b.name}</button>
                                                        : <a key={b.id} href={`${PART_PATHS[p.id]}#${blockId(p, b)}`} className="px-3 py-1.5 rounded-full bg-stone-900 border border-white/10 text-stone-400 hover:text-white hover:border-white/30 text-sm">{b.name}</a>)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <article className="max-w-3xl mx-auto px-5 md:px-8 py-10 song-text" style={{ fontSize: `${size * 1.2}rem` }}>
                        <section id={part.id} className="song-anchor mb-16">
                            <header className="text-center mb-8 pt-4">
                                {part.kicker && <div className="font-serif text-stone-500 text-lg mb-1">{part.kicker}</div>}
                                <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">{part.title}</h1>
                                {part.subtitle && <div className="font-serif text-stone-400 text-lg mt-2">{part.subtitle}</div>}
                                <div className="mx-auto mt-6 w-16 h-px bg-white/20"></div>
                            </header>
                            {part.blocks.map((b, bi) => (
                                <div key={bi} id={b.id ? blockId(part, b) : undefined} className={`song-anchor ${b.closing ? 'song-closing' : ''} ${b.h ? 'song-block' : 'mb-6'}`}>
                                    {b.sketch && <img src={b.sketch} alt={`שרטוט: ${b.name}`} width="256" height="256" loading="lazy" decoding="async" className={`song-sketch ${SKETCH_ANIM[b.id] || ''}`} />}
                                    {b.h && <h2 className="song-h">{b.h}</h2>}
                                    {(b.lines || []).map((l, li) => <SongLine key={li} line={l} partId={part.id} k={`${part.id}-${bi}-${li}`} />)}
                                    {part.id === 'guf' && b.h && (
                                        <button onClick={() => shareBlock(b)} className="song-share no-print" aria-label={`שיתוף: ${b.h.replace(/:\s*$/, '')}`}>
                                            <Icon name="Share2" size={14} /> שיתוף
                                        </button>
                                    )}
                                </div>
                            ))}
                        </section>

                        <nav className="flex justify-between items-center gap-3 border-t border-white/5 pt-8 mb-10 text-base no-print" aria-label="חלקי הספרון">
                            {prevPart ? <a href={PART_PATHS[prevPart.id]} className="px-4 py-2 rounded-full border border-white/15 text-stone-200 hover:bg-white/5">→ {prevPart.title}</a> : <span></span>}
                            {nextPart ? <a href={PART_PATHS[nextPart.id]} className="px-4 py-2 rounded-full border border-white/15 text-stone-200 hover:bg-white/5">{nextPart.title} ←</a> : <span></span>}
                        </nav>
                        <div className="text-center no-print flex flex-wrap gap-3 justify-center">
                            <button onClick={onOpenBook} className="px-6 py-2.5 rounded-full border border-white/20 text-stone-200 hover:bg-white/5 text-base">לעיון בעמודי הספרון המעוצבים</button>
                            <a href="/booklet.pdf" download="שירת-הגוף.pdf" className="px-6 py-2.5 rounded-full border border-white/20 text-stone-200 hover:bg-white/5 text-base">הורדת הספרון (PDF)</a>
                        </div>
                    </article>

                    {showTop && (
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="לראש העמוד" className="fixed bottom-5 left-5 z-40 w-11 h-11 rounded-full bg-white text-black shadow-lg flex items-center justify-center">
                            <Icon name="ArrowUp" size={20} />
                        </button>
                    )}
                </div>
            );
        };

        const InspirePage = () => {
            const [pick, setPick] = useState(null);
            return (
                <>
                    <BodyInspiration standalone pick={pick} />
                    <div className="mt-10 bg-stone-900/30 border border-white/5 rounded-2xl p-6 md:p-8">
                        <h2 className="text-xl md:text-2xl font-serif font-bold mb-5 text-white">או בחרו מתוך מפת הגוף</h2>
                        <BodyMap onPick={(id, name) => setPick({ name, n: Date.now() })} />
                    </div>
                </>
            );
        };

        const App = ({ route = { view: 'home' }, pageData = null }) => {
            const view = route.view;
            const [showBook, setShowBook] = useState(false);
            const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

            return (
                <div className="min-h-screen bg-black text-stone-300 selection:bg-white selection:text-black">
                    <nav className="fixed top-0 w-full z-[60] bg-black/95 backdrop-blur-md border-b border-white/5 h-14 flex items-center px-4">
                        <div className="max-w-6xl mx-auto w-full flex justify-between items-center text-right">
                            <a href="/" className="flex items-center gap-2 cursor-pointer text-right group">
                                <Logo className="w-8 h-8 group-hover:scale-110" />
                                <span className="font-serif text-xl font-bold text-white tracking-tight">שירת הגוף</span>
                            </a>
                            <div className="hidden md:flex gap-6 text-right">
                                {NAV_ITEMS.map((item) => (
                                    <a key={item.id} href={item.href} className={`font-serif text-base py-1 transition-all border-b ${view === item.id && !showBook ? 'text-white border-white' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>{item.label}</a>
                                ))}
                            </div>
                            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <Icon name="X" size={24} /> : <Icon name="Menu" size={24} />}</button>
                        </div>
                    </nav>

                    {mobileMenuOpen && (
                        <div className="md:hidden fixed inset-0 top-14 bg-black z-50 p-6 flex flex-col gap-6 text-right animate-fade-in text-right backdrop-blur-xl">
                           {NAV_ITEMS.map((item) => (
                              <a key={item.id} href={item.href} className="text-3xl font-serif border-b border-white/5 pb-4 text-white text-right">{item.label}</a>
                            ))}
                        </div>
                    )}

                    {showBook && <ImageFlipBook onClose={() => setShowBook(false)} />}

                    <main className="pt-14">
                        {view === 'song' && <SongText data={pageData} partId={route.part} onOpenBook={() => setShowBook(true)} />}

                        {view === 'home' && (
                            <div className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-stone-900 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
                                <div className="mb-8 animate-fade-in relative"><div className="anim-breathe-slow"><Logo className="w-32 h-32 md:w-48 md:h-48 shadow-lg" /></div></div>
                                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif tracking-tighter leading-none uppercase text-right md:text-center">שירת הגוף</h1>
                                <p className="text-xl md:text-2xl text-stone-500 max-w-2xl mb-12 font-serif italic font-light px-2 text-right md:text-center leading-relaxed">"לשמוע ולהקשיב לשירת גופי אליך"</p>
                                <div className="flex flex-col md:flex-row gap-5 text-right"><a href="/shirat-haguf/" className="px-10 py-3 bg-white text-black rounded-full text-lg font-bold hover:bg-stone-100 transition-all shadow-md active:scale-95 text-center">שירת הגוף</a><a href="/hashraa/" className="px-10 py-3 bg-black text-white border border-white/20 rounded-full text-lg font-bold hover:bg-white/5 transition-all text-center active:scale-95">השראה אישית</a><a href="/tirgul/" className="px-10 py-3 bg-black text-white border border-white/20 rounded-full text-lg font-bold hover:bg-white/5 transition-all text-center active:scale-95">תרגול ומחשבה</a></div>
                            </div>
                        )}

                        {view === 'practice' && (
                            <div className="max-w-3xl mx-auto px-4 py-16 text-right">
                                <h1 className="text-4xl font-serif font-bold text-center mb-12 text-white tracking-tight">פרקי תרגול ומחשבה</h1>
                                <div className="grid gap-4 text-right">
                                    {practiceData.map((section, idx) => (
                                        <div key={idx} id={`perek-${idx + 1}`} className="song-anchor bg-stone-900/20 border border-white/5 rounded-xl overflow-hidden shadow-md text-right hover:border-white/10 transition-colors">
                                            <details className="group" open={idx === 0}>
                                                <summary className="list-none p-5 flex justify-between items-center cursor-pointer hover:bg-white/[0.01] transition-colors text-right">
                                                    <h3 className="text-lg md:text-xl font-bold font-serif text-stone-100 text-right">{section.title}</h3>
                                                    <span className="inline-block text-stone-600 group-open:rotate-180 transition-transform"><Icon name="ChevronDown" size={20} /></span>
                                                </summary>
                                                <div className="p-5 pt-0 border-t border-white/5 text-right">
                                                    {section.content.map((p, pIdx) => <p key={pIdx} className="mb-4 text-lg text-stone-400 font-light last:mb-0 leading-relaxed text-right">{p}</p>)}
                                                </div>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                                <a href="/hashraa/" className="mt-12 flex items-center justify-between gap-4 bg-stone-900/40 border border-white/5 rounded-2xl p-6 md:p-8 text-right shadow-xl hover:border-white/20 transition-colors">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-serif font-bold mb-2 flex items-center gap-3 text-white"><Icon name="Sparkles" size={20} className="text-stone-400" /> השראה אישית מפרק שירה</h3>
                                        <p className="text-stone-400 font-light">בחרו אבר או תחושה, וקבלו פסוק מהשירה, השראה ותרגול קצר.</p>
                                    </div>
                                    <span className="text-white text-2xl shrink-0">←</span>
                                </a>
                            </div>
                        )}

                        {view === 'inspire' && (
                            <div className="max-w-3xl mx-auto px-4 py-16 text-right">
                                <h1 className="text-4xl font-serif font-bold text-center mb-4 text-white tracking-tight">השראה אישית מפרק שירה</h1>
                                <p className="text-lg text-stone-400 font-light text-center mb-10 leading-relaxed">כתבו אבר בגוף או תחושה שמבקשת תשומת לב, וקבלו פסוק מתוך שירת הגוף, מילים של השראה ותרגול נוכחות קצר.</p>
                                <InspirePage />
                            </div>
                        )}

                        {view === 'about' && (
                            <div className="max-w-3xl mx-auto px-4 py-16 text-center text-right">
                                <Logo className="w-16 h-16 mx-auto mb-8 shadow-md" />
                                <h1 className="text-4xl font-serif font-bold mb-8 text-white tracking-tighter">אודות המיזם</h1>
                                <div className="bg-stone-900/10 border border-white/5 p-8 rounded-3xl text-right shadow-sm relative overflow-hidden">
                                    <p className="text-xl text-stone-400 leading-relaxed mb-4 font-light italic text-right">אתר זה נבנה כבית דיגיטלי לטקסטים "שירת הגוף" ו"פרקי תרגול ומחשבה". המטרה היא להנגיש את התוכן הרוחני והעמוק העוסק בחיבור שבין הגוף לנפש.</p>
                                    
                                    {/* תוספת יצירת קשר */}
                                    <div className="mt-8 mb-4 p-6 bg-black/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-center sm:text-right">
                                            <h3 className="text-xl font-serif font-bold text-white mb-1 flex items-center justify-center sm:justify-start gap-2">
                                                <Icon name="Mail" size={20} className="text-stone-400" /> נשמח לשמור על קשר
                                            </h3>
                                            <p className="text-stone-400 text-sm font-light">לשיתופים, הארות, שאלות או כל דבר אחר שעל לבכם</p>
                                        </div>
                                        <a href="mailto:bodysong4@gmail.com" dir="ltr" className="bg-stone-800 hover:bg-stone-700 text-white px-6 py-2.5 rounded-full transition-all border border-white/10 font-sans tracking-wide shrink-0 shadow-lg flex items-center gap-2">
                                            bodysong4@gmail.com
                                        </a>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center"><div className="text-white/40 animate-pulse mb-3"><Icon name="Heart" size={32} /></div><p className="text-base text-stone-500 font-serif italic text-right md:text-center">מוקדש באהבה לכל מבקשי הנשמה בתוך הגוף.</p></div>
                                </div>
                            </div>
                        )}
                    </main>

                    <footer className="bg-stone-950/20 py-16 text-center border-t border-white/5 mt-20 opacity-50">
                        <Logo className="w-10 h-10 mx-auto mb-4 opacity-30" />
                        <p className="font-serif text-xl text-stone-500 italic mb-6 text-center">"נִשְׁמַת כָּל חַי תְּבָרֵךְ אֶת שִׁמְךָ ה' אֱלֹהֵינוּ"</p>
                        <p className="text-[10px] opacity-20 tracking-widest uppercase text-center">&copy; {new Date().getFullYear()} Shirat Haguf</p>
                    </footer>
                </div>
            );
        };

        // בבנייה (build) הקובץ רץ בשרת כדי להפיק HTML מוכן; בדפדפן הוא מציג את האתר
        globalThis.__APP__ = { App, practiceData };
        if (!globalThis.__SSR__ && typeof document !== 'undefined' && document.getElementById('root')) {
            const route = window.__ROUTE__ || { view: 'home' };
            const pageData = window.__PAGE_DATA__ || null;
            ReactDOM.createRoot(document.getElementById('root')).render(<App route={route} pageData={pageData} />);
        }
