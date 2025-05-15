import * as fs from 'fs';
import * as path from 'path';
import { DocumentProcessor } from '../src/document-processor';

async function main() {
  // Read PDF files from the documents directory
  const documentsDir = path.join(process.cwd(), 'documents');
  const pdfFiles = fs.readdirSync(documentsDir).filter(file => file.endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log('No PDF files found in the documents directory');
    return;
  }

  // Get patient ID from environment variable
  const patientId = process.env.PATIENT_ID;
  if (!patientId) {
    console.error('PATIENT_ID environment variable is required');
    process.exit(1);
  }

  // Initialize document processor
  const documentProcessor = new DocumentProcessor();

  // Process each PDF file
  for (const file of pdfFiles) {
    try {
      const pdfPath = path.join(documentsDir, file);
      console.log(`Processing document: ${file}`);
      
      // Process the document using DocumentProcessor
      await documentProcessor.processDocument(pdfPath, patientId);
    } catch (error) {
      console.error(`Failed to process document ${file}:`, error);
    }
  }
}

main().catch(console.error); 