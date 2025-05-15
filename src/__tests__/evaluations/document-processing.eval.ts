import { DocumentParser } from '../../services/document-parser';
import { DocumentClassifier } from '../../services/document-classifier';
import { DocumentType } from '../../types';
import { VisitNoteSchema, LabResultSchema } from '../../schemas/document-schemas';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required in .env.local file');
}

describe('Document Processing Evaluations', () => {
  const parser = new DocumentParser();
  const classifier = new DocumentClassifier();
  const visitNotePath = 'src/__tests__/fixtures/final-visit.pdf';
  const labResultPath = 'src/__tests__/fixtures/follow-up-labs.pdf';

  // Set longer timeout for all tests in this suite
  jest.setTimeout(30000);

  describe('Classification Accuracy', () => {
    it('should correctly classify a visit note', async () => {
      const result = await classifier.classifyDocument(visitNotePath);
      expect(result).toBe(DocumentType.VISIT_NOTE);
    });

    it('should correctly classify a lab result', async () => {
      const result = await classifier.classifyDocument(labResultPath);
      expect(result).toBe(DocumentType.LAB_RESULTS);
    });
  });

  describe('Visit Note Parsing Accuracy', () => {
    it('should correctly parse a visit note', async () => {
      const result = await parser.parseVisitNote(visitNotePath);
      expect(() => VisitNoteSchema.parse(result)).not.toThrow();
      // Placeholder: update with actual expected values from your PDF
      const expectedVisitNote = {
        date: '2025-06-20',
        provider: '<UNKNOWN>',
        notes: "Assessment: Patient demonstrates substantial improvement in Graves' disease symptoms and lab values.\n" +
          '\n' +
          'Plan:\n' +
          '- Continue dietary adjustments and maintain supplementation with Selenium and Vitamin D at maintenance dosages\n' +
          '- Discontinue Omega-3 and herbal adaptogens; reassess if symptoms recur\n' +
          '- Maintain stress management and mindfulness practices\n' +
          '- Labs every 6 months moving forward to monitor thyroid function\n' +
          '- Patient transitioned to maintenance mode; follow-up scheduled in 6 months',
        status: 'finished'
      };
      expect(result).toMatchObject(expectedVisitNote);
    });
  });

  describe('Lab Results Parsing Accuracy', () => {
    it('should correctly parse a lab result', async () => {
      const result = await parser.parseLabResults(labResultPath);
      expect(() => LabResultSchema.parse(result)).not.toThrow();
      // Placeholder: update with actual expected values from your PDF
      const expectedLabResult = {
        date: '2025-06-10',
        issued: '2025-06-13',
        orderingProvider: '<UNKNOWN>',
        status: 'final',
        code: 'Thyroid Panel',
        results: [
          {
            testName: 'TSH',
            value: 0.3,
            unit: 'µIU/mL',
            referenceRange: '0.4 - 4.0 µIU/mL',
            interpretation: 'Improving (slightly low)',
            status: 'final'
          },
          {
            testName: 'Free T4',
            value: 1.9,
            unit: 'ng/dL',
            referenceRange: '0.8 - 1.8 ng/dL',
            interpretation: 'Slightly high (improved)',
            status: 'final'
          },
          {
            testName: 'Free T3',
            value: 5,
            unit: 'pg/mL',
            referenceRange: '2.3 - 4.2 pg/mL',
            interpretation: 'Mildly high (improved)',
            status: 'final'
          },
          {
            testName: 'TPO antibodies',
            value: 120,
            unit: 'IU/mL',
            referenceRange: '< 35 IU/mL',
            interpretation: 'Improved (still high)',
            status: 'final'
          },
          {
            testName: 'TSI',
            value: 220,
            unit: '%',
            referenceRange: '< 140%',
            interpretation: 'Improved (still high)',
            status: 'final'
          }
        ],
        conclusion: 'Labs show significant improvement; thyroid hormone levels trending towards normalization. Continued adherence to current treatment recommended.'
      };
      expect(result).toMatchObject(expectedLabResult);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty documents', async () => {
      await expect(parser.parseVisitNote('')).rejects.toThrow();
    });
  });
}); 