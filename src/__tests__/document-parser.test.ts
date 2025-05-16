import { DocumentParser } from '../services/document-parser';
import { generateObject } from 'ai';
import { VisitNoteSchema, LabResultSchema } from '../schemas/document-schemas';
import { DocumentType } from '../types';
import * as fs from 'fs';

jest.mock('ai', () => ({
  generateObject: jest.fn()
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('mock pdf content'))
}));

describe('DocumentParser Unit Tests', () => {
  let parser: DocumentParser;
  const mockPdfPath = 'test.pdf';

  beforeEach(() => {
    parser = new DocumentParser();
    jest.clearAllMocks();
  });

  describe('parseVisitNote', () => {
    it('should parse visit note correctly', async () => {
      const mockParsedContent = {
        date: '2024-02-20',
        provider: 'Dr. Smith',
        status: 'finished',
        notes: 'Patient visit notes'
      };

      (generateObject as jest.Mock).mockResolvedValueOnce({ object: mockParsedContent });

      const result = await parser.parseVisitNote(mockPdfPath);
      expect(result).toEqual(mockParsedContent);
    });

    it('should handle AI service errors', async () => {
      (generateObject as jest.Mock).mockRejectedValueOnce(new Error('AI service error'));

      await expect(parser.parseVisitNote(mockPdfPath)).rejects.toThrow('AI service error');
    });

    it('should validate parsed content against schema', async () => {
      const mockParsedContent = {
        date: '2024-02-20',
        provider: 'Dr. Smith',
        status: 'finished',
        notes: 'Patient visit notes'
      };

      (generateObject as jest.Mock).mockResolvedValueOnce({ object: mockParsedContent });

      const result = await parser.parseVisitNote(mockPdfPath);
      expect(() => VisitNoteSchema.parse(result)).not.toThrow();
    });

    it('should handle file read errors', async () => {
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File read error');
      });

      await expect(parser.parseVisitNote(mockPdfPath)).rejects.toThrow('File read error');
    });
  });

  describe('parseLabResults', () => {
    it('should parse lab results correctly', async () => {
      const mockParsedContent = {
        date: '2024-02-20',
        issued: '2024-02-20',
        orderingProvider: 'LabCorp',
        status: 'final',
        code: '58410-2',
        results: [
          {
            testName: 'Complete Blood Count',
            value: 12.5,
            unit: '10^9/L',
            referenceRange: '4.5-11.0',
            status: 'final',
            interpretation: 'Normal'
          }
        ],
        conclusion: 'Normal results'
      };

      (generateObject as jest.Mock).mockResolvedValueOnce({ object: mockParsedContent });

      const result = await parser.parseLabResults(mockPdfPath);
      expect(result).toEqual(mockParsedContent);
    });

   
    it('should validate parsed content against schema', async () => {
      const mockParsedContent = {
        date: '2024-02-20',
        issued: '2024-02-20',
        orderingProvider: 'LabCorp',
        status: 'final',
        code: '58410-2',
        results: [
          {
            testName: 'Complete Blood Count',
            value: 12.5,
            unit: '10^9/L',
            referenceRange: '4.5-11.0',
            status: 'final',
            interpretation: 'Normal'
          }
        ],
        conclusion: 'Normal results'
      };

      (generateObject as jest.Mock).mockResolvedValueOnce({ object: mockParsedContent });

      const result = await parser.parseLabResults(mockPdfPath);
      expect(() => LabResultSchema.parse(result)).not.toThrow();
    });

    it('should handle multiple lab results', async () => {
      const mockParsedContent = {
        date: '2024-02-20',
        issued: '2024-02-20',
        orderingProvider: 'LabCorp',
        status: 'final',
        code: '58410-2',
        results: [
          {
            testName: 'Complete Blood Count',
            value: 12.5,
            unit: '10^9/L',
            referenceRange: '4.5-11.0',
            status: 'final',
            interpretation: 'Normal'
          },
          {
            testName: 'Hemoglobin',
            value: 14.2,
            unit: 'g/dL',
            referenceRange: '13.5-17.5',
            status: 'final',
            interpretation: 'Normal'
          }
        ],
        conclusion: 'Normal results'
      };

      (generateObject as jest.Mock).mockResolvedValueOnce({ object: mockParsedContent });

      const result = await parser.parseLabResults(mockPdfPath);
      expect(result.results).toHaveLength(2);
    });

    it('should handle invalid result status values', async () => {
      const mockParsedContent = {
        date: '2024-02-20',
        issued: '2024-02-20',
        orderingProvider: 'LabCorp',
        status: 'final',
        code: '58410-2',
        results: [
          {
            testName: 'Complete Blood Count',
            value: 12.5,
            unit: '10^9/L',
            referenceRange: '4.5-11.0',
            status: 'invalid_status',
            interpretation: 'Normal'
          }
        ],
        conclusion: 'Normal results'
      };

      (generateObject as jest.Mock).mockResolvedValueOnce({ object: mockParsedContent });

      await expect(parser.parseLabResults(mockPdfPath)).rejects.toThrow();
    });

    it('should handle file read errors', async () => {
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File read error');
      });

      await expect(parser.parseLabResults(mockPdfPath)).rejects.toThrow('File read error');
    });
  });
}); 