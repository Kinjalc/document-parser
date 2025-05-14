import * as fs from 'fs';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { VisitNoteSchema, LabResultSchema } from '../schemas/document-schemas';

export class DocumentParser {
  async parseVisitNote(pdfPath: string) {
    const prompt = `You are a medical document parser. Extract structured information from this visit note and return it as a JSON object.

The JSON object must have the following structure:
{
  "date": "YYYY-MM-DD", // The date of the visit in YYYY-MM-DD format
  "provider": "string", // The name of the healthcare provider
  "notes": "string", // Patient's chief complaint, assessment, plan, history and additional notes
  "status": "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled" // The status of the encounter
}

Focus on extracting:
- Visit date (in YYYY-MM-DD format)
- Provider name
- Chief complaint
- Assessment
- Treatment plan
- Additional clinical notes
- Encounter status (planned, arrived, triaged, in-progress, onleave, finished, or cancelled)

Respond ONLY with the JSON object, nothing else.`;

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: VisitNoteSchema,
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

    return VisitNoteSchema.parse(object);
  }

  async parseLabResults(pdfPath: string) {
    const prompt = `You are a medical document parser. Extract structured information from this lab report and return it as a JSON object.

The JSON object must have the following structure:
{
  "date": "YYYY-MM-DD", // The date of the lab test in YYYY-MM-DD format
  "issued": "YYYY-MM-DD", // The date when the report was issued in YYYY-MM-DD format
  "orderingProvider": "string", // The name of the provider who ordered the test
  "status": "registered" | "preliminary" | "final" | "amended" | "corrected" | "appended" | "cancelled" | "entered-in-error" | "unknown", // The status of the report
  "code": "string", // The name or code for the panel of lab tests
  "results": [
    {
      "testName": "string", // Name of the biomarker or test
      "value": number, // The numeric value of the test result
      "unit": "string", // The unit of measurement
      "referenceRange": "string", // The normal reference range
      "interpretation": "string", // Interpretation of the result (normal, high, low, etc.)
      "status": "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown" // The status of the observation
    }
  ],
  "conclusion": "string" // The final conclusion of the lab report
}

Focus on extracting:
- Test date (in YYYY-MM-DD format)
- Report date (in YYYY-MM-DD format)
- Ordering provider
- Report status (registered, preliminary, final, amended, corrected, appended, cancelled, entered-in-error, or unknown)
- For each test result:
  - Test name
  - Value
  - Unit
  - Reference range
  - Interpretation (normal, high, low, etc.)
  - Status (registered, preliminary, final, amended, corrected, cancelled, entered-in-error, or unknown)
- Conclusion (The final conclusion of the lab report)

Respond ONLY with the JSON object, nothing else.`;

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: LabResultSchema,
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

    return LabResultSchema.parse(object);
  }
} 