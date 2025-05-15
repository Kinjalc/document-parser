# Document Parser

Application that processes medical documents (visit notes and lab results) and creates FHIR resources in Medplum.

## Features

- Document Classification: Automatically identifies document types (visit notes vs lab results)
- Document Parsing: Extracts structured information from PDF documents using AI
- FHIR Resource Creation: Creates appropriate FHIR resources in Medplum
- Chatbot Interface: Interactive chatbot to query patient data

## Project Structure

```
src/
├── services/
│   ├── medplum/
│   │   ├── base-service.ts      # Base class for Medplum services
│   │   ├── encounter-service.ts # Handles encounter resource creation
│   │   ├── diagnostic-service.ts # Handles diagnostic reports and observations
│   │   └── fhir-service.ts      # Handles FHIR resource retrieval
│   ├── document-classifier.ts   # Classifies document types
│   ├── document-parser.ts       # Parses document content
│   └── chatbot-service.ts       # Handles chatbot interactions
├── schemas/
│   └── document-schemas.ts      # Zod schemas for document validation
├── types/
│   └── index.ts                 # Type definitions
└── document-processor.ts        # Main document processing logic
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Medplum account and API credentials
- Anthropic API key for AI features


## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd document-parser
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```
## Environment Variables

Create a `.env.local` file with the following variables:

```env
MEDPLUM_CLIENT_ID=your_client_id
MEDPLUM_CLIENT_SECRET=your_client_secret
PATIENT_ID=your_patient_id
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Available Scripts

- `npm run document-agent` - Process documents
- `npm run chatbot` - Start the chatbot server

## Usage

### Processing Documents

1. Place your PDF documents in the `documents` directory
2. Run the document processor:
   ```bash
   npm run document-agent
   ```

The script will:
- Classify each document
- Parse the content
- Create appropriate FHIR resources in Medplum

### Using the Chatbot

1. Start the chatbot server:
   ```bash
   npm run chatbot
   ```

2. You can ask questions about:
   - Recent encounters
   - Lab results
   - Observations

Example queries:
- "What are the patient's recent lab results?"
- "Show me the last visit note"
- "What was the patient's blood pressure in the last visit?"


## License

This project is licensed under the MIT License - see the LICENSE file for details.
