import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generateReport = (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const filename = `report_${data.userId}_${Date.now()}.pdf`;
        const path = `uploads/reports/${filename}`;

        if (!fs.existsSync('uploads/reports')) {
            fs.mkdirSync('uploads/reports', { recursive: true });
        }

        const stream = fs.createWriteStream(path);
        doc.pipe(stream);

        doc.fontSize(25).text('Cognitive Health Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`Patient Name: ${data.fullName}`);
        doc.text(`Age: ${data.age}`);
        doc.text(`Assessment Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.text(`Cognitive Index: ${data.cognitiveIndex}%`);
        doc.text(`Brain Age: ${data.brainAge} years`);
        doc.text(`Risk Level: ${data.riskLevel}`);
        doc.moveDown();
        doc.fontSize(14).text('Doctor Remarks:', { underline: true });
        doc.text(data.remarks || 'No remarks provided.');

        doc.end();

        stream.on('finish', () => {
            resolve(path);
        });

        stream.on('error', reject);
    });
};
