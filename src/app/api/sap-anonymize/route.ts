
import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; 

export async function POST(request: Request) {
  try {
    // Check if Azure OpenAI is intended to be used but might be disabled
    if (process.env.AZURE_OPENAI_DEPLOYMENT_NAME && !ai.listModels().includes(`azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`)) {
        console.error("SAP Anonymization: Azure OpenAI model specified in .env but not available in Genkit. The 'genkitx-azure-openai' plugin might be disabled or misconfigured due to package issues.");
        return NextResponse.json({ 
            error: "SAP Anonymization service is temporarily unavailable due to an issue with the Azure OpenAI integration. Please check server logs or contact support. The 'genkitx-azure-openai' package may need attention." 
        }, { status: 503 }); // Service Unavailable
    }
      
    const body = await request.json();
    const textToAnonymize = body.text;
    const customProjectPlaceholder = body.customProjectPlaceholder;
    const customClientPlaceholder = body.customClientPlaceholder;
    const theme = body.theme;

    if (!textToAnonymize || typeof textToAnonymize !== 'string' || !textToAnonymize.trim()) {
      return NextResponse.json({ error: 'No text provided or text is invalid' }, { status: 400 });
    }

    if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
       console.warn("Azure OpenAI environment variables might not be fully configured. Anonymization may use a default model if available or fail.");
       // If no Azure deployment is specified, we might not want to error out here if a default Genkit model could be used.
       // However, this route is specifically for Azure-based anonymization as per previous logic.
       // For now, if these are not set, the modelName will be undefined, and ai.generate might fail or use a default.
       // Let's add a specific check if the Azure model is expected.
       if (!process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
         return NextResponse.json({ error: 'Azure OpenAI deployment name is not configured in environment variables. Cannot proceed with anonymization.' }, { status: 500 });
       }
    }
    
    const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME 
      ? `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`
      : undefined;

    if (!modelName) {
        // This case should ideally be caught by the check above, but as a safeguard:
        return NextResponse.json({ error: 'Azure OpenAI model configuration is missing.' }, { status: 500 });
    }

    const defaultProjectPlaceholder = "[PROJECT_NAME_REDACTED]";
    const defaultClientPlaceholder = "[CLIENT_NAME_REDACTED]";
    const defaultOtherPiiPlaceholder = "[SENSITIVE_INFO_REDACTED]";

    let projectReplacementInstruction: string;
    if (customProjectPlaceholder) {
      projectReplacementInstruction = `Replace them with: '${customProjectPlaceholder}'`;
    } else if (theme) {
      projectReplacementInstruction = `Replace project names with terms, characters, or concepts fitting the theme: '${theme}'. Be creative and consistent with the theme.`;
    } else {
      projectReplacementInstruction = `Replace them with: '${defaultProjectPlaceholder}'`;
    }

    let clientReplacementInstruction: string;
    if (customClientPlaceholder) {
      clientReplacementInstruction = `Replace them with: '${customClientPlaceholder}'`;
    } else if (theme) {
      clientReplacementInstruction = `Replace client/company names with terms, characters, or concepts fitting the theme: '${theme}'. Be creative and consistent with the theme.`;
    } else {
      clientReplacementInstruction = `Replace them with: '${defaultClientPlaceholder}'`;
    }

    let otherPiiReplacementInstruction: string;
    if (theme) {
      otherPiiReplacementInstruction = `Replace these with terms, characters, or concepts fitting the theme: '${theme}'. For example, instead of 'John Doe', if the theme is 'Star Wars', you might use 'Jedi Master Kit Fisto' or a similar appropriate named entity from the theme.`;
    } else {
      otherPiiReplacementInstruction = `Replace all of the following with '${defaultOtherPiiPlaceholder}'`;
    }

    let thematicGuidance = "";
    if (theme) {
      thematicGuidance = `\nImportant Thematic Guidance: When applying replacements based on the theme ('${theme}'), strive for creativity and relevance to the theme. However, ensure the replacements maintain a level of professionalism suitable for the document's context where possible. For example, if a project name is 'Project Phoenix' and the theme is 'Lord of the Rings', a replacement could be 'The Isengard Initiative' or 'Project Mithril'. If a client is 'Acme Corp', it could become 'Saruman Industries' or 'The Rohan Group'. Try to find analogous professional-sounding terms if the theme is very whimsical. Be consistent in your replacements.`;
    }

    const prompt = `You are an expert text anonymizer and creative writer specializing in SAP architecture documents, project notes, and client communications.
Your task is to process the following text and replace sensitive information according to these rules, prioritizing in the order listed:

1.  Project Names: Identify all specific mentions of project names (e.g., "Project Phoenix", "Alpha Initiative"). ${projectReplacementInstruction}
2.  Client/Company Names: Identify all specific mentions of client names or company names (e.g., "Acme Corp", "XYZ Solutions"). ${clientReplacementInstruction}
3.  Other PII: Identify and ${otherPiiReplacementInstruction}:
    *   Personal names (e.g., "John Doe", "Maria Garcia"), unless they are widely known public figures in a relevant technical SAP context (like authors of standards or well-known researchers). If using a theme, replace with thematic character names or titles.
    *   Contact information (e.g., email addresses, phone numbers, Slack handles). If using a theme, you can create fictional thematic contact details.
    *   Specific street addresses or locations that could identify a private site. If using a theme, replace with thematic locations.
    *   Any other details that could be considered sensitive or personally identifiable information (PII) not covered by project or client names. Apply thematic replacement if a theme is active.
${thematicGuidance}
Do not change technical SAP terminology (like S/4HANA, BTP, Fiori, ABAP, specific T-Codes unless they embed PII), architectural descriptions, or general business context unless it directly reveals PII or is part of the thematic replacement strategy.
The goal is to make the document safe to share while being creatively aligned with the theme if one is provided.
Preserve the original formatting (like line breaks, paragraphs, and markdown if present) as much as possible.

Original Text:
---
${textToAnonymize}
---

Anonymized Text:`;


    const response = await ai.generate({
      prompt: prompt,
      model: modelName, // Explicitly use the configured modelName
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
    // Check for specific error messages that might indicate model not found or auth issues
    if (error.cause && typeof error.cause === 'string' && error.cause.includes('authentication')) {
        errorMessage = "Authentication failed. Please check your Azure OpenAI API key and endpoint configuration."
    } else if (error.message && (error.message.toLowerCase().includes('deployment not found') || error.message.toLowerCase().includes('model not found'))) {
        errorMessage = "The specified Azure OpenAI deployment/model name was not found or is not accessible. Please check your configuration and ensure the model is available in Genkit."
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
