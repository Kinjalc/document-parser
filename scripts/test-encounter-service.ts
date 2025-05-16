import { EncounterService } from '../src/services/medplum/encounter-service.ts';
import { VisitNoteSchema } from '../src/schemas/document-schemas.ts';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testEncounterService() {
  const encounterService = new EncounterService();

  // Mock visit note data
  const mockVisitNote = {
    date: '2024-03-20',
    provider: '',
    notes: 'Patient presented with fever and cough. Diagnosed with upper respiratory infection.',
    status: 'finished' as const
  };

  // Validate mock data against schema
  const parsedVisit = VisitNoteSchema.parse(mockVisitNote);

  try {
    // Use a test patient ID
    const testPatientId = process.env.TEST_PATIENT_ID || 'test-patient-123';
    
    console.log('Creating encounter with data:', parsedVisit);
    await encounterService.createEncounterResource(parsedVisit, testPatientId);
    console.log('Encounter created successfully!');
  } catch (error) {
    console.error('Error creating encounter:', error);
  }
}

testEncounterService(); 