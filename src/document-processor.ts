import * as fs from 'fs';
import { DocumentType } from './types';
import { DocumentParser } from './services/document-parser';
import { MedplumService } from './services/medplum-service';
import { DocumentClassifier } from './services/document-classifier';

export class DocumentProcessor {
  private documentParser: DocumentParser;
  private medplumService: MedplumService;
  private documentClassifier: DocumentClassifier;

  constructor() {
    this.documentParser = new DocumentParser();
    this.medplumService = new MedplumService();
    this.documentClassifier = new DocumentClassifier();
  }

  async processDocument(pdfPath: string, patientId: string): Promise<void> {
    // First classify the document
    const documentType = await this.documentClassifier.classifyDocument(pdfPath);
    console.log(`Document Type: ${documentType}`);

    // Then parse and create FHIR resources based on type
    if (documentType === DocumentType.VISIT_NOTE) {
      const parsedNote = await this.documentParser.parseVisitNote(pdfPath);
      await this.medplumService.createEncounterResource(parsedNote, patientId);
    } else if (documentType === DocumentType.LAB_RESULTS) {
      const parsedLab = await this.documentParser.parseLabResults(pdfPath);
      await this.medplumService.createDiagnosticReportResource(parsedLab, patientId);
    }
  }
} 