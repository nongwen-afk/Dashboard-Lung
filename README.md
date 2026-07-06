## 🚀 CI/CD & Development Workflow

โปรเจกต์นี้มีการตั้งค่าระบบ CI/CD อัตโนมัติ (GitHub Actions) และระบบตรวจสอบโค้ดก่อน Commit (Husky + lint-staged) เพื่อให้โค้ดของทีมมีมาตรฐานและปราศจากบั๊ก

### 🛠️ 1. การตั้งค่าครั้งแรกสำหรับนักพัฒนา (Local Setup)
หลังจากดึง (Clone/Pull) โปรเจกต์ลงเครื่องแล้ว ให้รันคำสั่งต่อไปนี้เพื่อเปิดใช้งานระบบตรวจโค้ดอัตโนมัติ (Husky):

```bash
# ติดตั้ง dependencies ทั้งหมดรวมถึง husky และ lint-staged
npm install

# (ทำแค่ครั้งแรก) แทรกรหัสสำหรับให้ npm รู้จัก husky
npm pkg set scripts.prepare="husky"

# เปิดใช้งาน Husky ในเครื่อง
npm run prepare
```
> **Note:** ทุกครั้งที่คุณพิมพ์ `git commit` ระบบจะทำการรัน Lint และ Format โค้ดให้เฉพาะไฟล์ที่คุณเพิ่งแก้ไขไปโดยอัตโนมัติ!

### 🔄 2. ขั้นตอนการทำงานของทีม (Git Workflow)
โปรเจกต์เราแบ่งการทำงานออกเป็น 3 ระยะ:
1. **Feature Branch (`feature/*`)**: 
   - แตก branch จาก `dev` ทำงานเสร็จให้เปิด Pull Request (PR) ไปที่ `dev`
   - ระบบจะรันเทส (Unit Test เฉพาะจุด) และสร้าง Preview URL ให้อัตโนมัติ
2. **Staging Branch (`dev`)**: 
   - เมื่อโค้ดถูกรวมเข้า `dev` ระบบจะรันเทสเต็มรูปแบบ (Full Test Suite), เช็ค Code Smells ด้วย SonarCloud, และเช็ค UI ด้วย Chromatic
   - โค้ดจะถูก Deploy ไปที่ Staging Environment พร้อมอัปเดต Database
3. **Production Branch (`main`)**: 
   - เมื่อพร้อมปล่อยของ ทีมจะสร้าง PR จาก `dev` ไป `main`
   - ระบบจะทำ Smoke Test และ Deploy ขึ้นเซิร์ฟเวอร์จริง (Production)

### 🔑 3. การตั้งค่า Environment Variables (สำหรับแอดมิน)
เพื่อให้ GitHub Actions ทำงานได้สมบูรณ์ ผู้ดูแลโปรเจกต์ต้องไปเพิ่ม **Secrets** เหล่านี้ในหน้า `Settings > Secrets and variables > Actions` บน GitHub:
- `NEON_API_KEY`: API Key สำหรับสร้าง Neon Database Branch อัตโนมัติ
- `NEON_PROJECT_ID`: รหัสโปรเจกต์ Neon
- `DATABASE_URL_STAGING`: Connection String สำหรับเชื่อมต่อ Staging Database
- `DATABASE_URL_PROD`: Connection String สำหรับเชื่อมต่อ Production Database
- `SONAR_TOKEN`: Token สำหรับอัปโหลดรีพอร์ตไปที่ SonarCloud
- `CHROMATIC_PROJECT_TOKEN`: Token สำหรับเทส UI ด้วย Chromatic
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`: สำหรับตั้งค่าแจ้ง Sentry Release ตอนขึ้น Production
