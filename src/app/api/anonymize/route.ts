import { NextResponse } from 'next/server';
import { ai } from '../ai/genkit'; // Assuming 'ai' is your configured genkit instance

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const textToAnonymize = body.text || body.fileContent;

    if (!textToAnonymize) {
      return NextResponse.json({ error: 'No text or file content provided' }, { status: 400 });
    }

    // Call the Azure OpenAI model for anonymization
    const response = await ai.generate({
      prompt: `Anonymize the following text by replacing all project names, client names, and any other identifying information with the word 'dummy':\n\n${textToAnonymize}`,
      // You might need to specify the model name based on your genkit configuration
      // model: 'azureOpenAi/YOUR_AZURE_DEPLOYMENT_NAME',
      // You can add other model parameters here if needed, e.g., temperature, maxTokens
    });

    const anonymizedText = response.text();

    if (!anonymizedText) {
      return NextResponse.json({ error: 'Anonymization failed or returned empty response' }, { status: 500 });
    }

    return NextResponse.json({ anonymizedText });
  } catch (error) {
    console.error('Error during anonymization:', error);
    return NextResponse.json({ error: 'An error occurred during the anonymization process' }, { status: 500 });
  }
}