import * as fs from 'fs';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { DocumentType } from '../types';
import { ClassificationResponse } from '../schemas/document-schemas';

export class DocumentClassifier {
  async classifyDocument(pdfPath: string): Promise<DocumentType> {
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
} 