import { MedplumClient } from '@medplum/core';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function createSamplePatient() {
  console.log("Create sample patient starting...");

  try {
    // Check for required environment variables
    if (!process.env.MEDPLUM_CLIENT_ID || !process.env.MEDPLUM_CLIENT_SECRET) {
      throw new Error('MEDPLUM_CLIENT_ID and MEDPLUM_CLIENT_SECRET must be set in .env.local');
    }

    const medplum = new MedplumClient({
      clientId: process.env.MEDPLUM_CLIENT_ID,
      clientSecret: process.env.MEDPLUM_CLIENT_SECRET,
    });

    // Generate random 6-character alphabetical string (first letter capitalized)
    const generateRandomString = (length: number): string => {
      const uppercaseCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lowercaseCharacters = "abcdefghijklmnopqrstuvwxyz";

      // First character is uppercase
      let result = uppercaseCharacters.charAt(
        Math.floor(Math.random() * uppercaseCharacters.length)
      );

      // Rest of characters are lowercase
      for (let i = 1; i < length; i++) {
        result += lowercaseCharacters.charAt(
          Math.floor(Math.random() * lowercaseCharacters.length)
        );
      }
      return result;
    };

    const randomString = generateRandomString(6);

    const patient = await medplum.createResource({
      resourceType: "Patient",
      name: [
        {
          given: ["John"],
          family: `Doe ${randomString}`,
        },
      ],
    });

    console.log(`created patient ${patient.id}`);
  } catch (error) {
    console.error("Error in create sample patient:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createSamplePatient().catch((error) => {
    console.error(`Error in create sample patient: ${error}`);
    process.exit(1);
  });
}

export default createSamplePatient;
