# شاشتك فـ جيبك - Shashtak TV Platform

منصة عربية حديثة وبث حي للقنوات التلفزيونية والفضائية تعمل مباشرة عبر متصفحات الويب وجميع الأجهزة (الهواتف الذكية، الحواسيب، الشاشات الذكية) بواجهة عربية احترافية سريعة وخفيفة.

---

## 🌟 المميزات الرئيسية (Key Features)

- **واجهة مستخدم عصرية وسريعة**: مبنية باستخدام React 19 و TypeScript و Tailwind CSS مع دعم كامل للاتجاه العربي (RTL) وخطوط حديثة (Cairo & Alexandria).
- **مشغل فيديو HLS مخصص**: يدعم بث HLS (.m3u8) المباشر مع تحكم بالصوت، الشاشة الكاملة، وإعادة المحاولة التلقائية عند انقطاع الاتصال.
- **قاعدة بيانات سحابية متزامنة في الوقت الفعلي**: ربط مباشر مع Firebase Firestore لتحديث القنوات، الترتيب، والتصنيفات لحظياً لجميع الزوار بدون الحاجة لإعادة تحميل الصفحة.
- **لوحة تحكم إدارية متكاملة (`/admin`)**:
  - إضافة، تعديل، وحذف القنوات الفضائية (CRUD).
  - تفعيل/تعطيل القناة وتحديد القنوات المميزة بنقرة واحدة.
  - مصادقة آمنة عبر Firebase Authentication.
  - نموذج أمان صارم Zero-Trust يعتمد على التحقق من الصلاحيات من الخادم.
- **نظام المفضلات والبحث**: حفظ القنوات المفضلة للمستخدم محلياً والبحث الفوري عن القنوات بالاسم، التصنيف، أو الكلمات المفتاحية.
- **دعم النشر الثابت والسحابي (Static & Cloud Ready)**: مهيأ للنشر على Firebase Hosting, Vercel, Netlify, Cloudflare Pages مع دعم كامل للمسارات المباشرة (SPA Rewrite).

---

## 🛠 المتطلبات الأساسية (Prerequisites)

- **Node.js**: الإصدار 18.0.0 أو أحدث (يُفضل LTS 20+)
- **npm**: الإصدار 9.0.0 أو أحدث
- **حساب Firebase مجاني**: لإدارة المصادقة وقاعدة البيانات السحابية (Firestore & Authentication).

---

## 🚀 التثبيت والتشغيل المحلي (Getting Started)

### 1. استنساخ المشروع (Clone Repository)
```bash
git clone https://github.com/your-username/shashtak-tv.git
cd shashtak-tv
```

### 2. تثبيت الحزم والاعتماديات (Install Dependencies)
```bash
npm install
```

### 3. إعداد متغيرات البيئة (Environment Variables)
قم بنسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

افتح ملف `.env` وقم بملء مفاتيح مشروع Firebase الخاص بك:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=shashtak-tv.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=shashtak-tv
VITE_FIREBASE_STORAGE_BUCKET=shashtak-tv.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:...
```

> **ملاحظة:** يمكنك الحصول على هذه البيانات من:
> `Firebase Console > Project Settings > General > Your Apps > Web app (SDK setup and configuration)`.

### 4. تشغيل خادم التطوير (Run Development Server)
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 🔒 متطلبات وإعداد Firebase (Firebase Setup Requirements)

يعتمد التطبيق على مشروعي Firebase Authentication و Cloud Firestore:

### أ) تفعيل Firebase Authentication
1. ادخل إلى **Firebase Console** واختر مشروعك.
2. انتقل إلى **Build > Authentication > Sign-in method**.
3. قم بتفعيل موفر **Email/Password**.
4. انتقل إلى تبويب **Users** واضغط على **Add user** لإنشاء حساب المشرف (Admin Email & Password).

### ب) تفعيل Cloud Firestore
1. انتقل إلى **Build > Firestore Database** واضغط على **Create database**.
2. اختر الموقع الجغرافي الأقرب لمستخدميك.

### ج) نشر قواعد الأمان (Firestore Rules)
يحتوي المشروع على ملف `firestore.rules` جاهز ومحمي بالكامل بنمط Zero-Trust. قم بنسخ محتواه ولصقه في:
`Firebase Console > Firestore Database > Rules` ثم اضغط **Publish**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.admin == true ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }

    // مجموعة القنوات (channels): القراءة للعامة، والتعديل للمشرف فقط
    match /channels/{channelId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // مجموعة المشرفين (admins): القراءة لصاحب الحساب فقط، وممنوع الكتابة من العميل
    match /admins/{userId} {
      allow read: if isSignedIn() && request.auth.uid == userId;
      allow write: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### د) منح صلاحية الأدمن لحسابك (Authorizing Admin UID)
بعد تسجيل الدخول لأول مرة في التطبيق بحساب المشرف عبر `/admin/login`:
1. انسخ رقم **معرف الحساب (Auth UID)** الظاهر في البطاقة بالأعلى.
2. انتقل إلى **Firebase Console > Firestore Database > Data**.
3. اضغط على **Start collection**:
   - Collection ID: `admins`
   - Document ID: ضع الـ **UID** المنسوخ نفسه.
   - أضف الحقول التالية:
     - `role` (string) = `"admin"`
     - `email` (string) = `البريد الإلكتروني الخاص بك`
     - `grantedAt` (string) = التاريخ الحالي بصيغة ISO
4. احفظ المستند، وستتحول حالة لوحة التحكم فوراً إلى **صلاحية الأدمن مفعلة (Authorized)**.

---

## 🏗 البناء والإنتاج (Build for Production)

للتحقق من سلامة الأكواد والأنواع البرمجية:
```bash
npm run lint
```

لبناء ملفات الإنتاج النهائية:
```bash
npm run build
```
سيتم إنشاء مجلد `dist/` يحتوي على كامل الملفات الثابتة والمحسنة للإنتاج.

لمعاينة نسخة الإنتاج محلياً:
```bash
npm run preview
```

---

## 🌐 خيارات النشر على الويب (Production Deployment)

### 1. النشر التلقائي عبر GitHub Actions (موصى به)
المشروع مزود بـ Workflow تلقائي داخل:
`.github/workflows/deploy.yml`

يقوم تلقائياً عند كل `push` إلى فرع `main` أو `master` بتنفيذ:
- `npm install`
- `npm run lint`
- `npm run build`
- نشر محتويات مجلد `dist/` فقط كـ Artifact مستقل إلى GitHub Pages.

**خطوات التفعيل في مستودع GitHub:**
1. اذهب إلى **Settings** داخل مستودع GitHub.
2. من القائمة الجانبية اختر **Pages** (تحت قسم Code and automation).
3. في قسم **Build and deployment > Source**، اختر:
   `GitHub Actions` (بدلاً من Deploy from a branch).
4. بمجرد عمل `git push` لملفات المشروع، سيبدأ الـ Workflow في تبويب **Actions** ويتم نشر الموقع بنجاح.

---

### 2. النشر اليدوي على GitHub Pages
إذا أردت النشر اليدوي بدون Actions:
1. نفّذ أمر البناء:
   ```bash
   npm run build
   ```
2. ارفع محتويات مجلد `dist/` بالكامل إلى فرع `gh-pages`.
3. الرابط المباشر:
   `https://<username>.github.io/<repository-name>/`

---

### 2. النشر على Firebase Hosting
المشروع مزود بملف `firebase.json` مهيأ مسبقاً لإعادة توجيه SPA:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting # اختر مجلد dist ووافق على إعداد Single-Page App
npm run build
firebase deploy
```

### 3. النشر على Vercel
المشروع مزود بملف `vercel.json` جاهز:
1. اربط مستودع GitHub على موقع [Vercel](https://vercel.com).
2. قم بإضافة متغيرات البيئة (`VITE_FIREBASE_*`) في لوحة Vercel Settings > Environment Variables.
3. اضغط **Deploy**.

### 3. النشر على Netlify أو Cloudflare Pages
المشروع مزود بملف `public/_redirects` لدعم توجيه المسارات المباشرة إلى `/index.html`:
1. اربط المستودع في Netlify / Cloudflare Pages.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. أضف متغيرات البيئة (`VITE_FIREBASE_*`).

---

## 📁 هيكلية المشروع (Project Structure)

```text
├── firestore.rules          # قواعد أمان Firebase Firestore الصارمة
├── firebase.json            # إعدادات نشر Firebase Hosting & Rules
├── vercel.json              # إعدادات إعادة التوجيه لـ Vercel
├── .env.example             # نموذج متغيرات البيئة المطلوبة
├── package.json             # تعريف الحزم وأوامر التشغيل
├── tsconfig.json            # إعدادات TypeScript الصارمة
├── vite.config.ts           # إعدادات Vite
├── index.html               # نقطة الدخول وتهيئة SEO وخطوط الواجهة
├── public/
│   └── _redirects           # توجيه SPA لـ Netlify و Cloudflare Pages
└── src/
    ├── main.tsx             # نقطة انطلاق تطبيق React
    ├── App.tsx              # المكون الرئيسي وإدارة المسارات والحالات
    ├── index.css            # استيراد أنماط Tailwind CSS
    ├── config/              # إعدادات المنصة والهوية البصرية
    ├── context/             # سياق إدارة جلسة ومصادقة المستخدم (AuthContext)
    ├── data/                # تصنيفات القنوات الافتراضية
    ├── lib/                 # تهيئة وتصدير Firebase SDK Singleton
    ├── services/            # طبقة الخدمات (Channels, Auth, Admin, Favorites)
    ├── types/               # تعريفات الأنواع البرمجية (TypeScript Interfaces)
    └── components/          # مكونات الواجهة والمشغل ولوحة التحكم
        └── admin/           # لوحة تحكم المشرف وإدارة القنوات والمصادقة
```

---

## 📜 الترخيص (License)
هذا المشروع متاح تحت ترخيص MIT للاستخدام والتطوير.
