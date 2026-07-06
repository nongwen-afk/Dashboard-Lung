# 🚌 Project Lung
**Decision Support System for EV Bus Dispatch Operations.**

## 🛠️ Tech Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Neon Database (Postgres)
- Drizzle ORM
- Better Auth
- npm

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Build project
```bash
npm run build
```

## 📂 Project Structure
```text
src/
 ├── app/
 ├── components/
 ├── features/
 ├── lib/
 ├── hooks/
 ├── services/
 ├── types/
 ├── constants/
 └── utils/
```

---

## 🔄 CI/CD & Development Workflow

โปรเจกต์นี้มีการตั้งค่าระบบ CI/CD อัตโนมัติ (GitHub Actions) และระบบตรวจสอบโค้ดก่อน Commit (Husky + lint-staged) เพื่อให้โค้ดของทีมมีมาตรฐานและปราศจากบั๊ก

### 🛠️ การตั้งค่าระบบตรวจโค้ดอัตโนมัติ (Husky)
หลังจากรัน `npm install` แล้ว ให้เตรียมระบบ Husky โดยรัน 2 คำสั่งนี้ (ทำแค่ครั้งแรก):

```bash
# 1. แทรกคำสั่ง prepare เข้าไปใน package.json (ใช้ npm แทรกโค้ดได้ปกติครับ)
npm pkg set scripts.prepare="husky"

# 2. เปิดใช้งาน Husky ในเครื่อง
npm run prepare
```
> **Note:** ทุกครั้งที่คุณพิมพ์ `git commit` ระบบจะทำการรัน Lint และ Format โค้ดให้เฉพาะไฟล์ที่คุณเพิ่งแก้ไขไปโดยอัตโนมัติ!

### 🔄 ขั้นตอนการทำงานของทีม (Git Workflow)
โปรเจกต์เราแบ่งการทำงานออกเป็น 3 ระยะ:
1. **Feature Branch (`feature/*`)**: 
   - แตก branch จาก `dev` ทำงานเสร็จให้เปิด Pull Request (PR) ไปที่ `dev`
   - ระบบจะรันเทส (Unit & E2E) และสร้าง Preview URL ให้อัตโนมัติ (พร้อมจำลอง Database Branch ด้วย Neon)
2. **Staging Branch (`dev`)**: 
   - เมื่อโค้ดถูกรวมเข้า `dev` ระบบจะรันเทสเต็มรูปแบบเช็ค UI ด้วย Chromatic และตรวจ Code Smells ด้วย SonarCloud
   - โค้ดจะถูก Deploy ไปที่ Staging พร้อมรัน Migration เข้า Staging Database
3. **Production Branch (`main`)**: 
   - เมื่อพร้อมปล่อยของ ทีมจะสร้าง PR จาก `dev` ไป `main`
   - ระบบจะทำ Smoke Test, Deploy ขึ้นเซิร์ฟเวอร์จริง (Production) และสร้างบันทึกการปล่อยอัปเดตลง Sentry

### 🔑 การตั้งค่า Environment Variables (สำหรับผู้ดูแลระบบ)
เพื่อให้ GitHub Actions ทำงานได้สมบูรณ์ ผู้ดูแลโปรเจกต์ต้องไปเพิ่ม **Secrets** เหล่านี้ในหน้า `Settings > Secrets and variables > Actions` บน GitHub:
- `NEON_API_KEY`: API Key สำหรับสร้าง Neon Database Branch อัตโนมัติ
- `NEON_PROJECT_ID`: รหัสโปรเจกต์ Neon
- `DATABASE_URL_STAGING`: Connection String สำหรับเชื่อมต่อ Staging Database
- `DATABASE_URL_PROD`: Connection String สำหรับเชื่อมต่อ Production Database
- `SONAR_TOKEN`: Token สำหรับอัปโหลดรีพอร์ตไปที่ SonarCloud
- `CHROMATIC_PROJECT_TOKEN`: Token สำหรับเทส UI ด้วย Chromatic
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`: สำหรับตั้งค่าแจ้ง Sentry Release ตอนขึ้น Production
