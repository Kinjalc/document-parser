import { DocumentClassifier } from './services/document-classifier';
import { DocumentParser } from './services/document-parser';
import { EncounterService } from './services/medplum/encounter-service';
import { DiagnosticService } from './services/medplum/diagnostic-service';
import { VisitNoteSchema, LabResultSchema } from './schemas/document-schemas';
import { DocumentType } from './types';
import { z } from 'zod';

export class DocumentProcessor {
  private classifier: DocumentClassifier;
  private parser: DocumentParser;
  private encounterService: EncounterService;
  private diagnosticService: DiagnosticService;

  constructor() {
    this.classifier = new DocumentClassifier();
    this.parser = new DocumentParser();
    this.encounterService = new EncounterService();
    this.diagnosticService = new DiagnosticService();
  }

  async processDocument(pdfPath: string, patientId: string): Promise<void> {
    // Classify the document
    const documentType = await this.classifier.classifyDocument(pdfPath);

    // Parse the document based on its type
    if (documentType === DocumentType.VISIT_NOTE) {
      const parsedNote = await this.parser.parseVisitNote(pdfPath) as z.infer<typeof VisitNoteSchema>;
      await this.encounterService.createEncounterResource(parsedNote, patientId);
    } else if (documentType === DocumentType.LAB_RESULTS) {
      const parsedLab = await this.parser.parseLabResults(pdfPath) as z.infer<typeof LabResultSchema>;
      await this.diagnosticService.createDiagnosticReportResource(parsedLab, patientId);
    }
  }
} 