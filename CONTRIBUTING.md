# دليل المساهمة في تطبيق المذكرات الصوتية

شكرًا لاهتمامك بالمساهمة في تطبيق المذكرات الصوتية! هذا الدليل يوضح عملية المساهمة وأفضل الممارسات.

## جدول المحتويات

- [كيفية المساهمة](#كيفية-المساهمة)
- [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
- [أسلوب البرمجة](#أسلوب-البرمجة)
- [إرشادات لواجهة المستخدم](#إرشادات-لواجهة-المستخدم)
- [الإبلاغ عن المشكلات](#الإبلاغ-عن-المشكلات)
- [طلبات السحب](#طلبات-السحب)

## كيفية المساهمة

1. **ابحث عن المشكلات**: ابدأ بالبحث عن المشكلات المفتوحة أو قم بإنشاء مشكلة جديدة لمناقشة التغييرات التي ترغب في إجرائها.
2. **خذ نسخة (Fork)**: قم بعمل fork للمستودع إلى حسابك الخاص.
3. **أنشئ فرعًا (Branch)**: أنشئ فرعًا جديدًا للعمل عليه.
4. **قم بالتغييرات**: قم بإجراء التغييرات وفقًا لإرشادات هذا الدليل.
5. **اختبر**: تأكد من أن التغييرات تعمل كما هو متوقع واختبرها على متصفحات مختلفة.
6. **أرسل طلب سحب (Pull Request)**: قم بإرسال طلب سحب إلى المستودع الرئيسي.

## إعداد بيئة التطوير

### المتطلبات

- Python 3.11 أو أحدث
- PostgreSQL
- Git

### الخطوات

1. استنسخ المستودع من نسختك (fork):
   ```bash
   git clone https://github.com/your-username/voice-notes-app.git
   cd voice-notes-app
   ```

2. أنشئ بيئة افتراضية وفعلها:
   ```bash
   python -m venv venv
   source venv/bin/activate  # لنظام Linux/Mac
   # أو
   venv\Scripts\activate     # لنظام Windows
   ```

3. قم بتثبيت التبعيات:
   ```bash
   pip install -r requirements.txt
   ```

4. أنشئ ملف `.env` وضبط متغيرات البيئة:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/voicenotes
   SESSION_SECRET=your_secret_key
   ```

5. قم بتشغيل التطبيق للتطوير:
   ```bash
   python run.py
   ```

## أسلوب البرمجة

### Python

- اتبع معيار PEP 8 لأسلوب كتابة كود Python.
- استخدم اصطلاحات التسمية المناسبة:
  - الدوال والمتغيرات: `snake_case`
  - الفئات: `PascalCase`
  - الثوابت: `UPPER_CASE`
- اكتب تعليقات توثيقية للفئات والدوال المهمة.

### JavaScript

- استخدم ES6+ مع الوظائف المعياسة.
- اتبع اصطلاحات التسمية التالية:
  - الدوال والمتغيرات: `camelCase`
  - الفئات: `PascalCase`
  - الثوابت: `UPPER_CASE`
- استخدم التعليقات بشكل معقول لتوضيح العمليات المعقدة.

### HTML/CSS

- استخدم SCSS/SASS عند الإمكان.
- اتبع تسلسل هرمي منطقي للعناصر.
- ضمن تجربة مستخدم متجاوبة على جميع أحجام الشاشات.

## إرشادات لواجهة المستخدم

- الحفاظ على تناسق واجهة المستخدم عبر التطبيق.
- استخدام نظام الألوان الحالي.
- التأكد من توافق التطبيق مع معايير الوصول (a11y).
- دعم وضع الظلام (Dark Mode) والخط العربي بشكل جيد.

## الإبلاغ عن المشكلات

عند الإبلاغ عن مشكلة، يرجى تضمين:

- خطوات محددة لإعادة إنتاج المشكلة.
- السلوك المتوقع والسلوك الفعلي.
- لقطات شاشة إذا كان ذلك مناسبًا.
- معلومات عن النظام والمتصفح.

## طلبات السحب

لإرسال طلب سحب (PR):

1. تأكد من أن الكود يتبع إرشادات الأسلوب المذكورة أعلاه.
2. أضف اختبارات لوظائفك الجديدة إذا كان ذلك ممكنًا.
3. تأكد من أن جميع الاختبارات تمر.
4. قدم وصفًا واضحًا لطلب السحب الخاص بك:
   - ما الذي تم تغييره؟
   - لماذا تم إجراء هذه التغييرات؟
   - كيف يمكن اختبار التغييرات؟

---

<div align="center">
  شكرًا مرة أخرى على المساهمة في تطبيق المذكرات الصوتية!
</div>