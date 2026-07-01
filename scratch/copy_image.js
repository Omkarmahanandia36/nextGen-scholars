const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\omkar\\.gemini\\antigravity\\brain\\4ef75713-b08c-4a56-89b4-dcf3f6c377d7\\priyanka_jena_portrait_1779418015916.png';
const dest = 'd:\\nextgen classes\\EduVistaAcademy\\public\\images\\tutors\\priyanka-jena.png';

try {
  // Ensure target folder exists
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(src, dest);
  console.log('Success: Image copied to public/images/tutors/priyanka-jena.png');
} catch (err) {
  console.error('Error copying file:', err);
}
