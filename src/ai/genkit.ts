import {genkit} from 'genkit';
// import {azureOpenAi} from 'genkitx-azure-openai'; // Problematic import due to package structure issue

export const ai = genkit({
  plugins: [
    // azureOpenAi({ // Usage of the problematic plugin
    //   apiKey: process.env.AZURE_OPENAI_API_KEY,
    //   endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    //   // You may also need to specify apiVersion depending on your Azure setup and plugin requirements.
    //   // e.g., apiVersion: '2024-02-01' // Example, adjust if needed for your specific Azure OpenAI deployment
    //   // deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME, // This might be needed if not implicitly handled by model string
    // }),
  ],
  // The model configuration below depends on the Azure OpenAI plugin.
  // It's commented out as the plugin itself is causing a build error.
  // model: `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`, 
  
  // Note: Without a configured model and plugin, AI generation calls will fail.
  // You may need to configure a default model if other plugins are added,
  // or ensure process.env.AZURE_OPENAI_DEPLOYMENT_NAME is not used if no model is set.
});

