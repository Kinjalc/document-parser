import { initMedplumClient } from "../lib/medplum";

async function createSamplePatient() {
  console.log("Create sample patient starting...");

  try {
    const medplum = await initMedplumClient();
    const patient = await medplum.createResource({
      resourceType: "Patient",
      name: [
        {
          given: ["John"],
          family: "Doe",
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
