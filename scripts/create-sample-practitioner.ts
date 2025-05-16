import { MedplumClient } from '@medplum/core';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function createSamplePractitioner() {
  const medplum = new MedplumClient({
    baseUrl: process.env.MEDPLUM_BASE_URL || 'https://api.medplum.com',
    clientId: process.env.MEDPLUM_CLIENT_ID,
    clientSecret: process.env.MEDPLUM_CLIENT_SECRET,
  });

  const practitioner = await medplum.createResource({
    resourceType: 'Practitioner',
    qualification: [
      {
        code: {
          coding: [
            {
              code: 'PRACTITIONER_CODE',
              system: 'PRACTITIONER_ISSUER',
            },
          ],
        },
      },
    ],
    name: [
      {
        family: 'Carter',
        given: ['Emily'],
      },
    ],
  });

  console.log('Sample practitioner created:', practitioner);
}

createSamplePractitioner().catch(console.error); 