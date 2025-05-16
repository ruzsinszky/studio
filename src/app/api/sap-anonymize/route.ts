
import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const textToAnonymize = body.text;
    const customProjectPlaceholder = body.customProjectPlaceholder;
    const customClientPlaceholder = body.customClientPlaceholder;

    if (!textToAnonymize || typeof textToAnonymize !== 'string' || !textToAnonymize.trim()) {
      return NextResponse.json({ error: 'No text provided or text is invalid' }, { status: 400 });
    }

    if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
       console.warn("Azure OpenAI environment variables might not be fully configured. Anonymization may use a default model if available or fail.");
    }
    
    const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME 
      ? `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`
      : undefined;

    // Define placeholders
    const projectPlaceholder = customProjectPlaceholder || "[PROJECT_NAME_REDACTED]";
    const clientPlaceholder = customClientPlaceholder || "[CLIENT_NAME_REDACTED]";
    const otherPiiPlaceholder = "[SENSITIVE_INFO_REDACTED]";

    const prompt = `You are an expert text anonymizer specializing in SAP architecture documents, project notes, and client communications.
Your task is to process the following text and replace sensitive information according to these rules:

1.  Project Names: Identify all specific mentions of project names (e.g., "Project Phoenix", "Alpha Initiative"). Replace them with: '${projectPlaceholder}'.
2.  Client/Company Names: Identify all specific mentions of client names or company names (e.g., "Acme Corp", "XYZ Solutions"). Replace them with: '${clientPlaceholder}'.
3.  Other PII: Identify and replace all of the following with '${otherPiiPlaceholder}':
    *   Personal names (e.g., "John Doe", "Maria Garcia"), unless they are widely known public figures in a relevant technical SAP context (like authors of standards or well-known researchers).
    *   Contact information (e.g., email addresses, phone numbers, Slack handles).
    *   Specific street addresses or locations that could identify a private site.
    *   Any other details that could be considered sensitive or personally identifiable information (PII) not covered by project or client names.

Do not change technical SAP terminology, architectural descriptions, or general business context unless it directly reveals PII.
Preserve the original formatting (like line breaks and paragraphs) as much as possible.

Original Text:
---
${textToAnonymize}
---

Anonymized Text:`;


    const response = await ai.generate({
      prompt: prompt,
      ...(modelName && { model: modelName }),
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }
    });

    const anonymizedText = response.text;

    if (anonymizedText === undefined) {
      return NextResponse.json({ error: 'Anonymization failed or returned no text. The model might have refused to generate content.' }, { status: 500 });
    }
    
    if (anonymizedText.trim() === "") {
        console.warn("Anonymization resulted in empty text. This might indicate a content generation refusal by the model or an issue with the prompt/model response.");
        return NextResponse.json({ error: 'Anonymization resulted in empty text. Please check the input or model behavior.' }, { status: 500 });
    }

    return NextResponse.json({ anonymizedText });

  } catch (error: any) {
    console.error('Error during SAP anonymization:', error);
    let errorMessage = 'An error occurred during the anonymization process.';
    if (error.message) {
      errorMessage = error.message;
    }
    if (error.cause && typeof error.cause === 'string' && error.cause.includes('authentication')) {
        errorMessage = "Authentication failed. Please check your Azure OpenAI API key and endpoint configuration."
    } else if (error.message && error.message.toLowerCase().includes('deployment not found')) {
        errorMessage = "The specified Azure OpenAI deployment name was not found. Please check your configuration."
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
