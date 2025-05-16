import { DiagnosticService } from '../src/services/medplum/diagnostic-service';
import { LabResultSchema } from '../src/schemas/document-schemas';

async function testDiagnosticService() {
  const diagnosticService = new DiagnosticService();

  // Mock lab result data
  const mockLabResult = {
    date: '2024-03-20',
    issued: '2024-03-21',
    orderingProvider: '<UNKNOWN>',
    status: 'final' as const,
    code: 'CBC',
    results: [
      {
        testName: 'WBC',
        value: 7.5,
        unit: '10^9/L',
        referenceRange: '4.5-11.0',
        interpretation: 'normal',
        status: 'final' as const
      },
      {
        testName: 'RBC',
        value: 4.8,
        unit: '10^12/L',
        referenceRange: '4.0-5.2',
        interpretation: 'normal',
        status: 'final' as const
      }
    ],
    conclusion: 'All values within normal range'
  };

  // Validate mock data against schema
  const parsedLab = LabResultSchema.parse(mockLabResult);

  try {
    // Log environment variables for debugging
    console.log('Environment variables:');
    console.log('MEDPLUM_CLIENT_ID:', process.env.MEDPLUM_CLIENT_ID);
    console.log('MEDPLUM_CLIENT_SECRET:', process.env.MEDPLUM_CLIENT_SECRET);
    console.log('PRACTITIONER_ID:', process.env.PRACTITIONER_ID);
    console.log('PATIENT_ID:', process.env.PATIENT_ID);
    
    // Use a test patient ID
    const testPatientId = process.env.PATIENT_ID || 'test-patient-123';
    
    console.log('Creating diagnostic report with data:', parsedLab);
    await diagnosticService.createDiagnosticReportResource(parsedLab, testPatientId);
    console.log('Diagnostic report created successfully!');
  } catch (error) {
    console.error('Error creating diagnostic report:', error);
  }
}

testDiagnosticService(); 