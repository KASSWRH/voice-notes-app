# Voice Notes Application

<div align="center">
  <img src="screenshots/logo.png" alt="Voice Notes Logo" width="200"/>
  <h3>تطبيق المذكرات الصوتية والمهام</h3>
  <p>تطبيق ويب لتسجيل الملاحظات الصوتية، وتحويل الكلام إلى نص، واستخراج المهام، وإدارة التذكيرات</p>
</div>

## 🌟 المميزات

- ✅ **تسجيل الصوت**: تسجيل ملاحظات صوتية بجودة عالية
- ✅ **تحويل الصوت إلى نص**: تحويل تلقائي للتسجيلات الصوتية إلى نص
- ✅ **استخراج المهام**: تحليل النص تلقائيًا لاستخراج المهام
- ✅ **إدارة التذكيرات**: إنشاء وتنظيم التذكيرات المرتبطة بالملاحظات والمهام
- ✅ **التصنيف**: تنظيم الملاحظات حسب الفئات مع ألوان مخصصة
- ✅ **البحث**: البحث بسهولة عن الملاحظات والمهام
- ✅ **الأرشفة**: أرشفة الملاحظات القديمة للحفاظ على النظام
- ✅ **دعم اللغة العربية**: واجهة مستخدم كاملة باللغة العربية والإنجليزية

## 📷 لقطات شاشة

<div align="center">
  <img src="screenshots/home.png" alt="الصفحة الرئيسية" width="45%"/>
  <img src="screenshots/tasks.png" alt="صفحة المهام" width="45%"/>
  <img src="screenshots/reminders.png" alt="صفحة التذكيرات" width="45%"/>
  <img src="screenshots/archived.png" alt="صفحة الأرشيف" width="45%"/>
</div>

## 🛠️ التقنيات المستخدمة

- **الواجهة الخلفية**: Flask (Python)
- **قاعدة البيانات**: PostgreSQL
- **الواجهة الأمامية**: HTML, CSS, JavaScript
- **تحويل الصوت إلى نص**: Web Speech API
- **معالجة الصوت**: Web Audio API
- **ORM**: SQLAlchemy

## ⚙️ متطلبات التشغيل

- Python 3.11 أو أحدث
- PostgreSQL
- متصفح حديث يدعم Web Audio API و Web Speech API

## 🚀 التثبيت والتشغيل

### 1. استنساخ المستودع

```bash
git clone https://github.com/your-username/voice-notes-app.git
cd voice-notes-app
```

### 2. إنشاء بيئة افتراضية وتثبيت التبعيات

```bash
python -m venv venv
source venv/bin/activate  # لتفعيل البيئة في أنظمة Linux/Mac
# أو
venv\Scripts\activate  # لتفعيل البيئة في نظام Windows

pip install -r requirements.txt
```

### 3. إعداد قاعدة البيانات

إنشاء قاعدة بيانات PostgreSQL وتعديل متغيرات البيئة في ملف `.env`

```bash
# مثال لملف .env
DATABASE_URL=postgresql://username:password@localhost:5432/voicenotes
SESSION_SECRET=your_session_secret_key
```

### 4. تشغيل التطبيق

```bash
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

أو

```bash
python run.py
```

## 🧠 معالجة اللغة الطبيعية واستخراج المهام

يستخدم التطبيق خوارزميات معالجة اللغة الطبيعية البسيطة لاستخراج المهام من النص المحول من التسجيلات الصوتية. تبحث الخوارزمية عن عبارات مثل "يجب أن"، "تذكر"، "لا تنسى" وما إلى ذلك لاستخراج المهام المحتملة.

## 📋 هيكل المشروع

```
/
├── app/                    # الحزمة الرئيسية للتطبيق
│   ├── __init__.py         # ملف تهيئة التطبيق
│   ├── models/             # نماذج قاعدة البيانات
│   ├── routes/             # مسارات API والصفحات
│   ├── static/             # الملفات الثابتة (CSS، JS، الصور)
│   ├── templates/          # قوالب HTML
│   └── utils/              # أدوات مساعدة
├── screenshots/            # لقطات الشاشة للتوثيق
├── main.py                 # نقطة دخول التطبيق
├── run.py                  # ملف تشغيل التطبيق
├── requirements.txt        # قائمة التبعيات
└── README.md               # التوثيق
```

## 🤝 المساهمة

نرحب بالمساهمات! يرجى اتباع هذه الخطوات:

1. Fork المستودع
2. إنشاء فرع لميزتك (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات الخاصة بك (`git commit -m 'Add some amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📝 الرخصة

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 📧 التواصل

إذا كان لديك أي أسئلة أو اقتراحات، يرجى فتح issue في هذا المستودع أو التواصل عبر البريد الإلكتروني.

---

<div align="center">
  صنع بـ ❤️ لتيسير إدارة المذكرات الصوتية والمهام
</div>