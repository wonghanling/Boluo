const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

async function convertImages() {
  for (let i = 1; i <= 11; i++) {
    const inputPath = path.join(publicDir, `${i}.jpg`);
    const outputPath = path.join(publicDir, `${i}.webp`);

    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);

      const inputSize = fs.statSync(inputPath).size;
      const outputSize = fs.statSync(outputPath).size;
      const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

      console.log(`✅ ${i}.jpg → ${i}.webp (${(inputSize/1024).toFixed(0)}KB → ${(outputSize/1024).toFixed(0)}KB, 节省 ${savings}%)`);
    } catch (error) {
      console.error(`❌ 转换 ${i}.jpg 失败:`, error.message);
    }
  }

  console.log('\n🎉 图片转换完成！');
}

convertImages();
