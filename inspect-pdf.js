const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function inspectPDF() {
  const pdfPath = './public/forms/1327-cet-sd.pdf';
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log(`\n=== PDF Form Fields (${fields.length} total) ===\n`);
  
  // Filtrer les champs qui commencent par 'b' (section B)
  const sectionB = fields.filter(f => {
    const name = f.getName();
    return name.startsWith('b') && /^b\d+/.test(name);
  });

  console.log('Section B fields (premiers chiffres après b):');
  sectionB.forEach(field => {
    const name = field.getName();
    const type = field.constructor.name;
    console.log(`  ${name} (${type})`);
  });
}

inspectPDF().catch(console.error);
