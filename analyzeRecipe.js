const { PredictionServiceClient } = require('@google-cloud/aiplatform');

async function analyzeRecipe(recipeText) {
  const clientOptions = { apiEndpoint: 'us-central1-aiplatform.googleapis.com' };
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

  const endpoint = `projects/92899842402/locations/us-central1/publishers/google/models/gemini-pro`;

  const instance = {
    contents: recipeText,
  };

  const parameters = {
    temperature: 0.2,
    maxOutputTokens: 256,
  };

  const request = {
    endpoint,
    instances: [instance],
    parameters,
  };

  try {
    const [response] = await predictionServiceClient.predict(request);
    const prediction = response.predictions[0];
    const result = prediction.content;
    return result;
  } catch (error) {
    console.error('Error analyzing recipe:', error);
    return null;
  }
}

const recipe = `1 cup rice, 10 oz chickpeas`;
analyzeRecipe(recipe).then((result) => {
  console.log('Analysis result:', result);
});