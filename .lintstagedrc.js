module.exports = {
  // เลือกเฉพาะไฟล์ JS, TS, React ที่ถูกแก้ไขใน Commit นี้นำมารัน Lint และ Format
  '**/*.(js|jsx|ts|tsx)': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
    // หากมีการเขียน Unit Test ด้วย Jest สามารถเปิดคอมเมนต์บรรทัดล่างเพื่อเทสเฉพาะไฟล์ที่แก้ได้ครับ
    // `jest --bail --findRelatedTests ${filenames.join(' ')}`
  ],
  // จัดฟอร์แมตไฟล์เอกสารและสไตล์ที่ถูกแก้ไข
  '**/*.(json|css|scss|md)': (filenames) => [
    `prettier --write ${filenames.join(' ')}`
  ]
};
