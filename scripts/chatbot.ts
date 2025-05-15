import * as readline from 'readline';
import { ChatbotService } from '../src/services/chatbot-service';

async function main() {
  // Get patient ID from environment variable
  const patientId = process.env.PATIENT_ID;
  if (!patientId) {
    console.error('PATIENT_ID environment variable is required');
    process.exit(1);
  }

  // Initialize chatbot service
  const chatbot = new ChatbotService();

  // Create readline interface for interactive input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Welcome to the Medical Assistant Chatbot!');
  console.log('Type your questions about the patient\'s data. Type "exit" to quit.\n');

  // Start interactive loop
  const askQuestion = () => {
    rl.question('Your question: ', async (query) => {
      if (query.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }

      try {
        console.log('\nChecking...please wait...\n');
        const response = await chatbot.generateResponse(patientId, query);
        console.log('Response:', response, '\n');
      } catch (error) {
        console.error('Error:', error);
      }

      // Ask next question
      askQuestion();
    });
  };

  // Start the conversation
  askQuestion();
}

main().catch(console.error); 