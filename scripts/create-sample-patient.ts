import { initMedplumClient } from "../lib/medplum";

async function createSamplePatient() {
  console.log("Create sample patient starting...");

  try {
    const medplum = await initMedplumClient();

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

if (require.main === module) {
  createSamplePatient().catch((error) => {
    console.error(`Error in create sample patient: ${error}`);
    process.exit(1);
  });
}

export default createSamplePatient;
