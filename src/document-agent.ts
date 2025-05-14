import * as fs from 'fs';
import * as path from 'path';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { DocumentType } from './types';
import { DocumentParser } from './services/document-parser';
import { MedplumService } from './services/medplum-service';
import { ClassificationResponse } from './schemas/document-schemas';

async function classifyDocument(pdfPath: string): Promise<DocumentType> {
  const prompt = `You are a medical document classifier. Your task is to analyze the provided PDF document and classify it as either a LAB_RESULTS or VISIT_NOTE.

Please analyze the document and respond with a JSON object in the following format:
{
  "documentType": "LAB_RESULTS" | "VISIT_NOTE"
}

Base your classification on the following criteria:
- LAB_RESULTS: Documents containing laboratory test results, blood work, diagnostic tests, etc.
- VISIT_NOTE: Documents containing clinical notes, progress notes, consultation notes, etc.

Respond ONLY with the JSON object, nothing else.`;

  try {
    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'file',
              data: fs.readFileSync(pdfPath),
              mimeType: 'application/pdf',
            },
          ],
        },
      ],
    });

    const parsedResponse = ClassificationResponse.parse(JSON.parse(result.text));
    return parsedResponse.documentType;
  } catch (error) {
    console.error('Error classifying document:', error);
    throw error;
  }
}

async function main() {
  const documentsDir = './documents';
  const files = fs.readdirSync(documentsDir);
  const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
  const patientId = process.env.PATIENT_ID;

  if (!patientId) {
    console.error('PATIENT_ID not found in environment variables');
    process.exit(1);
  }

  const documentParser = new DocumentParser();
  const medplumService = new MedplumService();

  for (const file of pdfFiles) {
    const pdfPath = path.join(documentsDir, file);
    try {
      console.log(`Processing document: ${file}`);
      
      // First classify the document
      const documentType = await classifyDocument(pdfPath);
      console.log(`Document Type: ${documentType}`);

      // Then parse and create FHIR resources based on type
      if (documentType === DocumentType.VISIT_NOTE) {
        const parsedNote = await documentParser.parseVisitNote(pdfPath);
        await medplumService.createEncounterResource(parsedNote, patientId);
      } else if (documentType === DocumentType.LAB_RESULTS) {
        const parsedLab = await documentParser.parseLabResults(pdfPath);
        await medplumService.createDiagnosticReportResource(parsedLab, patientId);
      }
    } catch (error) {
      console.error(`Failed to process document ${file}:`, error);
    }
  }
}

main(); 