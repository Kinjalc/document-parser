import { DocumentClassifier } from '../../services/document-classifier';
import { DocumentType } from '../../types';
import * as fs from 'fs';
import * as path from 'path';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn()
}));

// Mock AI SDK
jest.mock('ai', () => ({
  generateText: jest.fn()
}));

jest.mock('@ai-sdk/anthropic', () => ({
  anthropic: jest.fn()
}));

describe('DocumentClassifier', () => {
  let classifier: DocumentClassifier;
  const mockPdfContent = Buffer.from('mock pdf content');

  beforeEach(() => {
    classifier = new DocumentClassifier();
    (fs.readFileSync as jest.Mock).mockReturnValue(mockPdfContent);
    (generateText as jest.Mock).mockResolvedValue({
      text: JSON.stringify({ documentType: 'VISIT_NOTE' })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('classifyDocument', () => {
    it('should read PDF file content', async () => {
      const pdfPath = path.join(__dirname, '../../../documents/visit-note.pdf');
      await classifier.classifyDocument(pdfPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(pdfPath);
    });

    it('should call AI service with correct parameters', async () => {
      const pdfPath = path.join(__dirname, '../../../documents/visit-note.pdf');
      await classifier.classifyDocument(pdfPath);
      expect(generateText).toHaveBeenCalledWith({
        model: anthropic('claude-3-5-sonnet-20241022'),
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

    it('should return correct document type', async () => {
      const pdfPath = path.join(__dirname, '../../../documents/visit-note.pdf');
      const result = await classifier.classifyDocument(pdfPath);
      expect(result).toBe(DocumentType.VISIT_NOTE);
    });

    it('should handle AI service errors', async () => {
      (generateText as jest.Mock).mockRejectedValue(new Error('AI service error'));
      const pdfPath = path.join(__dirname, '../../../documents/visit-note.pdf');
      await expect(classifier.classifyDocument(pdfPath)).rejects.toThrow('AI service error');
    });

    it('should handle invalid JSON response', async () => {
      (generateText as jest.Mock).mockResolvedValue({
        text: 'invalid json'
      });
      const pdfPath = path.join(__dirname, '../../../documents/visit-note.pdf');
      await expect(classifier.classifyDocument(pdfPath)).rejects.toThrow();
    });
  });
}); 