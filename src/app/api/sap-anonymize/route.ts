
import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; // Assuming 'ai' is your configured genkit instance

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const textToAnonymize = body.text;

    if (!textToAnonymize || typeof textToAnonymize !== 'string' || !textToAnonymize.trim()) {
      return NextResponse.json({ error: 'No text provided or text is invalid' }, { status: 400 });
    }

    // Check if Azure OpenAI plugin is configured and model name is set
    // This is a placeholder check; actual model availability depends on genkit.ts setup
    if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
       console.warn("Azure OpenAI environment variables might not be fully configured. Anonymization may use a default model if available or fail.");
    }
    
    const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME 
      ? `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`
      : undefined; // Let Genkit pick a default if not specified and Azure is not the only plugin

    const prompt = `You are an expert text anonymizer. Your task is to process the following text, which may contain sensitive information related to SAP architecture documents, project notes, or client communications.
Identify and replace all specific mentions of:
- Project names (e.g., "Project Phoenix", "Alpha Initiative")
- Client names or company names (e.g., "Acme Corp", "XYZ Solutions")
- Personal names (e.g., "John Doe", "Maria Garcia"), unless they are widely known public figures in a relevant technical SAP context (like authors of standards or well-known researchers).
- Contact information (e.g., email addresses, phone numbers, Slack handles)
- Specific street addresses or locations that could identify a private site.
- Any other details that could be considered sensitive or personally identifiable information (PII).

Replace all identified sensitive information with the exact placeholder string: "[DUMMY_SAP_DATA]".
Do not change the technical SAP terminology, architectural descriptions, or general business context unless it directly reveals PII.
Preserve the original formatting (like line breaks and paragraphs) as much as possible.

Original Text:
---
${textToAnonymize}
---

Anonymized Text:`;


    const response = await ai.generate({
      prompt: prompt,
      ...(modelName && { model: modelName }), // Conditionally add model if AZURE_OPENAI_DEPLOYMENT_NAME is set
      config: {
        // Example safety settings - adjust as needed
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }
    });

    const anonymizedText = response.text;

    if (anonymizedText === undefined) { // Check for undefined specifically
      return NextResponse.json({ error: 'Anonymization failed or returned no text. The model might have refused to generate content.' }, { status: 500 });
    }
    
    // If the text is empty string, it means the model generated nothing, which could be a refusal or an issue.
    if (anonymizedText.trim() === "") {
        console.warn("Anonymization resulted in empty text. This might indicate a content generation refusal by the model or an issue with the prompt/model response.");
        // Depending on requirements, you might want to return an error or the empty string.
        // For safety, returning an error if it's unexpectedly empty.
        return NextResponse.json({ error: 'Anonymization resulted in empty text. Please check the input or model behavior.' }, { status: 500 });
    }


    return NextResponse.json({ anonymizedText });

  } catch (error: any) {
    console.error('Error during SAP anonymization:', error);
    let errorMessage = 'An error occurred during the anonymization process.';
    if (error.message) {
      errorMessage = error.message;
    }
    // Check for specific Genkit or API errors if possible
    if (error.cause && typeof error.cause === 'string' && error.cause.includes('authentication')) {
        errorMessage = "Authentication failed. Please check your Azure OpenAI API key and endpoint configuration."
    } else if (error.message && error.message.toLowerCase().includes('deployment not found')) {
        errorMessage = "The specified Azure OpenAI deployment name was not found. Please check your configuration."
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
