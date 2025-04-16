const express = require('express');
const router = express.Router();
const { default: createModelClient, isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
require('dotenv').config();

// Initialize client
const endpoint = process.env.AZURE_AI_ENDPOINT || "https://models.github.ai/inference";
const credential = new AzureKeyCredential(process.env.AZURE_AI_KEY);
const client = createModelClient(endpoint, credential);
const modelName = process.env.AZURE_AI_MODEL || "openai/gpt-4.1";

// POST /api/openai/generate
router.post('/generate', async (req, res) => {
  try {
    const { task, title, content } = req.body;

    // Validate required fields
    if (!task) {
      return res.status(400).json({ error: "Task is required" });
    }

    // Initialize prompt with default value
    let prompt = "";
    
    // Generate appropriate prompt
    switch (task.toLowerCase()) {
      case 'caption':
        if (!title) {
          return res.status(400).json({ error: "Title is required for caption generation" });
        }
        prompt = `Write a short, engaging social media caption (1-2 sentences) about: "${title}"`;
        break;
        
      case 'title':
        if (!content) {
          return res.status(400).json({ error: "Content is required for title generation" });
        }
        prompt = `Generate a catchy title for this content:\n\n${content}`;
        break;
        
      case 'category':
        if (!content) {
          return res.status(400).json({ error: "Content is required for category generation" });
        }
        prompt = `Suggest the most appropriate category (single word or short phrase) for this content:\n\n${content}`;
        break;
        
      default:
        return res.status(400).json({ error: "Invalid task type. Use 'caption', 'title', or 'category'" });
    }

    // Make API call
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful content generator." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 100,
        model: modelName
      }
    });

    // Handle response
    if (isUnexpected(response)) {
      throw new Error(response.body?.error?.message || "API request failed");
    }

    // Return successful response
    res.json({
      result: response.body.choices[0]?.message?.content?.trim() || "No response generated"
    });

  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({
      error: err.message || "Processing failed",
      details: err.body || null
    });
  }
});

module.exports = router;