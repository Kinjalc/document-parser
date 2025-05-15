import { DocumentParser } from '../../services/document-parser';
import { VisitNoteSchema, LabResultSchema } from '../../schemas/document-schemas';
import * as fs from 'fs';
import * as path from 'path';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn()
}));

// Mock AI SDK
jest.mock('ai', () => ({
  generateObject: jest.fn()
}));

jest.mock('@ai-sdk/anthropic', () => ({
  anthropic: jest.fn()
}));

describe('DocumentParser', () => {
  let parser: DocumentParser;
  const mockPdfContent = Buffer.from('mock pdf content');

  beforeEach(() => {
    parser = new DocumentParser();
    (fs.readFileSync as jest.Mock).mockReturnValue(mockPdfContent);
    (generateObject as jest.Mock).mockResolvedValue({
      object: {
        date: '2024-02-20',
        provider: 'Dr. Smith',
        notes: 'Patient visit notes',
        status: 'finished'
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseVisitNote', () => {
    it('should read PDF file content', async () => {
      const pdfPath = path.join(__dirname, '../../../documents/visit-note.pdf');
      await parser.parseVisitNote(pdfPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(pdfPath);
    });

    it('should call AI service with correct parameters', async () => {
      const pdfPath = path.join(__dirname, '../../../documents/visit-note.pdf');
      await parser.parseVisitNote(pdfPath);
      expect(generateObject).toHaveBeenCalledWith({
        model: anthropic('claude-3-5-sonnet-20241022'),
        schema: VisitNoteSchema,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: expect.any(String)
              },
              {
                type: 'file',
                data: mockPdfContent,
                mimeType: 'application/pdf'
              }
            ]
          }
        ]
      });
    });

    it('should handle AI service errors', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('AI service error'));
      const pdfPath = path.join(__dirname, '../../../documents/visit-note.pdf');
      await expect(parser.parseVisitNote(pdfPath)).rejects.toThrow('AI service error');
    });
  });

  describe('parseLabResults', () => {
    beforeEach(() => {
      (generateObject as jest.Mock).mockResolvedValue({
        object: {
          date: '2024-02-20',
          issued: '2024-02-20',
          orderingProvider: 'Dr. Smith',
          status: 'final',
          code: 'LAB-123',
          results: [
            {
              testName: 'Blood Glucose',
              value: 100,
              unit: 'mg/dL',
              referenceRange: '70-140 mg/dL',
              interpretation: 'Normal',
              status: 'final'
            }
          ],
          conclusion: 'All results within normal range'
        }
      });
    });

    it('should read PDF file content', async () => {
      const pdfPath = path.join(__dirname, '../../../documents/lab-results.pdf');
      await parser.parseLabResults(pdfPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(pdfPath);
    });

    it('should call AI service with correct parameters', async () => {
      const pdfPath = path.join(__dirname, '../../../documents/lab-results.pdf');
      await parser.parseLabResults(pdfPath);
      expect(generateObject).toHaveBeenCalledWith({
        model: anthropic('claude-3-5-sonnet-20241022'),
        schema: LabResultSchema,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: expect.any(String)
              },
              {
                type: 'file',
                data: mockPdfContent,
                mimeType: 'application/pdf'
              }
            ]
          }
        ]
      });
    });

    it('should handle AI service errors', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('AI service error'));
      const pdfPath = path.join(__dirname, '../../../documents/lab-results.pdf');
      await expect(parser.parseLabResults(pdfPath)).rejects.toThrow('AI service error');
    });
  });
}); 