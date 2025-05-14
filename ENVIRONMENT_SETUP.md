# إعداد متغيرات البيئة لتطبيق المذكرات الصوتية

هذا الملف يوضح كيفية إعداد متغيرات البيئة اللازمة لتشغيل تطبيق المذكرات الصوتية.

## المتغيرات المطلوبة

يتطلب التطبيق المتغيرات البيئية التالية:

| المتغير | الوصف | مثال |
|---------|-------|-------|
| `DATABASE_URL` | رابط اتصال قاعدة بيانات PostgreSQL | `postgresql://username:password@localhost:5432/voicenotes` |
| `SESSION_SECRET` | مفتاح سري لتشفير جلسات المستخدم | `a-very-secure-random-string` |

## طرق إعداد المتغيرات

### 1. ملف .env (للتطوير المحلي)

قم بإنشاء ملف `.env` في المجلد الرئيسي للمشروع:

```
DATABASE_URL=postgresql://username:password@localhost:5432/voicenotes
SESSION_SECRET=your-secure-secret-key
```

### 2. متغيرات بيئة النظام (للإنتاج)

#### Linux/macOS
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/voicenotes"
export SESSION_SECRET="your-secure-secret-key"
```

#### Windows (CMD)
```cmd
set DATABASE_URL=postgresql://username:password@localhost:5432/voicenotes
set SESSION_SECRET=your-secure-secret-key
```

#### Windows (PowerShell)
```powershell
$env:DATABASE_URL = "postgresql://username:password@localhost:5432/voicenotes"
$env:SESSION_SECRET = "your-secure-secret-key"
```

### 3. إعداد على منصات الاستضافة

معظم منصات الاستضافة تقدم واجهات سهلة لإعداد متغيرات البيئة:

- **Heroku**: يمكن إعدادها من لوحة التحكم تحت "Settings" > "Config Vars"
- **Vercel**: يمكن إعدادها من "Project Settings" > "Environment Variables"
- **Netlify**: يمكن إعدادها من "Site settings" > "Build & deploy" > "Environment"
- **Replit**: يمكن إعدادها من "Secrets" في قائمة الإعدادات

## إعداد قاعدة البيانات

### PostgreSQL المحلي

1. قم بتثبيت PostgreSQL على جهازك.
2. أنشئ قاعدة بيانات جديدة:
   ```sql
   CREATE DATABASE voicenotes;
   ```
3. أنشئ مستخدمًا جديدًا (اختياري):
   ```sql
   CREATE USER voicenotes_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE voicenotes TO voicenotes_user;
   ```

### خدمات PostgreSQL المستضافة

يمكنك استخدام خدمات مثل:
- Amazon RDS
- Heroku Postgres
- ElephantSQL
- Supabase

ستوفر لك هذه الخدمات عنوان URL لقاعدة البيانات يمكنك استخدامه في متغير `DATABASE_URL`.

## التحقق من الإعداد

للتحقق من صحة إعداد متغيرات البيئة، يمكنك تشغيل:

```python
import os
print(f"DATABASE_URL: {'configured' if os.environ.get('DATABASE_URL') else 'missing'}")
print(f"SESSION_SECRET: {'configured' if os.environ.get('SESSION_SECRET') else 'missing'}")
```

## ملاحظات مهمة

- لا تقم أبدًا بتخزين أو مشاركة ملف `.env` أو بيانات اعتماد قاعدة البيانات في مستودع عام.
- استخدم كلمات مرور قوية وفريدة لقاعدة البيانات.
- قم بتغيير `SESSION_SECRET` بانتظام للحفاظ على الأمان.