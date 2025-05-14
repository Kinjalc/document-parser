import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

// Define the document type enum
enum DocumentType {
  LAB_RESULTS = 'LAB_RESULTS',
  VISIT_NOTE = 'VISIT_NOTE'
}

// Create a schema for the classification response
const ClassificationResponse = z.object({
  documentType: z.nativeEnum(DocumentType)
});

async function classifyDocument(pdfPath: string): Promise<DocumentType> {
  // Read the PDF file
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString('base64');

  // Create the prompt for classification
  const prompt = `You are a medical document classifier. Your task is to analyze the provided PDF document and classify it as either a LAB_RESULTS or VISIT_NOTE.

Please analyze the document and respond with a JSON object in the following format:
{
  "documentName": "the pdf file name",
  "documentType": "LAB_RESULTS" | "VISIT_NOTE"
}

Base your classification on the following criteria:
- LAB_RESULTS: Documents containing laboratory test results, blood work, diagnostic tests, etc.
- VISIT_NOTE: Documents containing clinical notes, progress notes, consultation notes, referrals etc.

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

    // Parse the response
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

  for (const file of pdfFiles) {
    const pdfPath = path.join(documentsDir, file);
    try {
      console.log(`Classifying document: ${file}`);
      const documentType = await classifyDocument(pdfPath);
      console.log(`Document Type for ${file}:`, documentType);
    } catch (error) {
      console.error(`Failed to classify document ${file}:`, error);
    }
  }
}

main();
