import { MedplumClient } from '@medplum/core';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function getEncounters() {
  const medplum = new MedplumClient({
    clientId: process.env.MEDPLUM_CLIENT_ID,
    clientSecret: process.env.MEDPLUM_CLIENT_SECRET,
  });

  try {
    // Get all encounters
    const encounters = await medplum.search('Encounter');
    console.log('Encounters:', JSON.stringify(encounters, null, 2));

    // You can also add filters like:
    // const encounters = await medplum.search('Encounter', { status: 'finished' });
    // const encounters = await medplum.search('Encounter', { patient: 'Patient/[ID]' });
    // const encounters = await medplum.search('Encounter', { date: 'ge2024-01-01' });

  } catch (error) {
    console.error('Error fetching encounters:', error);
  }
}

getEncounters(); 