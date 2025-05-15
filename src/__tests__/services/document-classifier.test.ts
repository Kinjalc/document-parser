import { DocumentClassifier } from '../../services/document-classifier';
import { generateText } from 'ai';
import { DocumentType } from '../../types';
import * as fs from 'fs';

jest.mock('ai', () => ({
  generateText: jest.fn()
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn()
}));

describe('DocumentClassifier Unit Tests', () => {
  let classifier: DocumentClassifier;
  const mockPdfPath = 'test.pdf';
  const mockPdfContent = Buffer.from('mock pdf content');

  beforeEach(() => {
    classifier = new DocumentClassifier();
    jest.clearAllMocks();
    (fs.readFileSync as jest.Mock).mockReturnValue(mockPdfContent);
  });

  describe('classifyDocument', () => {
    it('should read PDF file content', async () => {
      const mockClassification = {
        documentType: DocumentType.VISIT_NOTE
      };

      (generateText as jest.Mock).mockResolvedValueOnce({ text: JSON.stringify(mockClassification) });

      await classifier.classifyDocument(mockPdfPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(mockPdfPath);
    });

    it('should classify a visit note correctly', async () => {
      const mockClassification = {
        documentType: DocumentType.VISIT_NOTE
      };

      (generateText as jest.Mock).mockResolvedValueOnce({ text: JSON.stringify(mockClassification) });

      const result = await classifier.classifyDocument(mockPdfPath);
      expect(result).toBe(DocumentType.VISIT_NOTE);
    });

    it('should classify a lab result correctly', async () => {
      const mockClassification = {
        documentType: DocumentType.LAB_RESULTS
      };

      (generateText as jest.Mock).mockResolvedValueOnce({ text: JSON.stringify(mockClassification) });

      const result = await classifier.classifyDocument(mockPdfPath);
      expect(result).toBe(DocumentType.LAB_RESULTS);
    });

    it('should handle invalid document types', async () => {
      const mockClassification = {
        documentType: 'INVALID_TYPE'
      };

      (generateText as jest.Mock).mockResolvedValueOnce({ text: JSON.stringify(mockClassification) });

      await expect(classifier.classifyDocument(mockPdfPath)).rejects.toThrow('Invalid enum value');
    });

    it('should handle AI service errors', async () => {
      (generateText as jest.Mock).mockRejectedValueOnce(new Error('AI service error'));

      await expect(classifier.classifyDocument(mockPdfPath)).rejects.toThrow('AI service error');
    });

    it('should handle file read errors', async () => {
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File read error');
      });

      await expect(classifier.classifyDocument(mockPdfPath)).rejects.toThrow('File read error');
    });
  });
}); 
