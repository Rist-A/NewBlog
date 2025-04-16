import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import back2 from "../Asset/back2.png";

const postFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters." })
    .max(100, { message: "Title must not be longer than 100 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  image: z.instanceof(File).optional(),
  category_id: z.string().min(1, { message: "Category is required" }),
});

const defaultValues = {
  title: "",
  content: "",
  image: undefined,
  category_id: "",
};

const CreatePostForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  const [categories, setCategories] = useState([]);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiCategorySuggestion, setAiCategorySuggestion] = useState(null);
  const [activeAIFunction, setActiveAIFunction] = useState(null);
  const [typingText, setTypingText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [aiGreeting, setAiGreeting] = useState("");

  const title = watch("title");
  const content = watch("content");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get("http://localhost:5000/categories", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCategories(Array.isArray(response.data) ? response.data : response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setServerError("Failed to load categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (title && title.length > 5 && categories.length > 0) {
      suggestCategory();
    }
  }, [title, categories]);

  useEffect(() => {
    if (aiSuggestion && !typingComplete) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < aiSuggestion.length) {
          setTypingText(aiSuggestion.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setTypingComplete(true);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    }
  }, [aiSuggestion, typingComplete]);

  const resetAISuggestion = () => {
    setAiSuggestion("");
    setTypingText("");
    setTypingComplete(false);
    setActiveAIFunction(null);
  };

  const generateGreeting = () => {
    const greetings = [
      "Hello! Let me help you craft an amazing post.",
      "Welcome! Ready to create something great?",
      "Hi there! I'm here to assist with your writing.",
      "Greetings! Let's make your post shine."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const callAzureAI = async (task, promptContent) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await axios.post(
        "http://localhost:5000/api/openai/generate",
        { task, title, content: promptContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000
        }
      );

      if (!response.data.result) {
        throw new Error("Received unexpected response format from AI service");
      }

      return response.data.result;
    } catch (error) {
      console.error("AI API error:", error);
      let errorMessage = "Failed to get AI response. ";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage += "Authentication failed. Please log in again.";
        } else if (error.response.status === 429) {
          errorMessage += "Server is busy. Please wait and try again.";
        } else {
          errorMessage += error.response.data?.error || 'API request failed';
        }
      } else {
        errorMessage += error.message || "Please try again.";
      }
      throw new Error(errorMessage);
    }
  };

  const suggestCategory = async () => {
    try {
      setIsAiThinking(true);
      setActiveAIFunction("category");
      setAiGreeting(generateGreeting());
      
      const result = await callAzureAI("category", title);
      
      const suggestedCategory = categories.find(c => 
        result.toLowerCase().includes(c.category_name.toLowerCase())
      );
      
      if (suggestedCategory) {
        setAiCategorySuggestion(suggestedCategory);
        setAiSuggestion(`Based on your title "${title}", I recommend the "${suggestedCategory.category_name}" category.`);
      } else {
        setAiSuggestion("I couldn't determine the best category match. Please select one manually.");
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      setAiSuggestion(`Error: ${error.message}`);
    } finally {
      setIsAiThinking(false);
    }
  };

  const generateTitleFromContent = async () => {
    try {
      if (!content || content.length < 20) {
        setAiSuggestion("Please provide at least 20 characters of content for me to generate a good title.");
        return;
      }

      setIsAiThinking(true);
      setActiveAIFunction("title");
      resetAISuggestion();
      setAiGreeting(generateGreeting());
      
      const result = await callAzureAI("title", content);
      setAiSuggestion(`Suggested titles:\n\n${result}\n\nClick "Apply" to use the first suggestion.`);
    } catch (error) {
      console.error("AI title generation error:", error);
      setAiSuggestion(`Error: ${error.message}`);
    } finally {
      setIsAiThinking(false);
    }
  };

  const generateContentFromTitle = async () => {
    try {
      if (!title || title.length < 5) {
        setAiSuggestion("Please provide a more descriptive title (at least 5 characters) for me to generate content.");
        return;
      }

      setIsAiThinking(true);
      setActiveAIFunction("content");
      resetAISuggestion();
      setAiGreeting(generateGreeting());
      
      const result = await callAzureAI("caption", title);
      setAiSuggestion(`Here's a draft for your post based on the title "${title}":\n\n${result}\n\nFeel free to edit this content.`);
    } catch (error) {
      console.error("AI content generation error:", error);
      setAiSuggestion(`Error: ${error.message}`);
    } finally {
      setIsAiThinking(false);
    }
  };

  const improveContent = async () => {
    try {
      if (!content || content.length < 20) {
        setAiSuggestion("Please provide more content (at least 20 characters) for me to improve it.");
        return;
      }

      setIsAiThinking(true);
      setActiveAIFunction("improve");
      resetAISuggestion();
      setAiGreeting(generateGreeting());
      
      const result = await callAzureAI("caption", content);
      setAiSuggestion(`Here's an improved version:\n\n${result}\n\nUse this as a starting point.`);
    } catch (error) {
      console.error("AI content improvement error:", error);
      setAiSuggestion(`Error: ${error.message}`);
    } finally {
      setIsAiThinking(false);
    }
  };

  const applyAISuggestion = (type) => {
    try {
      if (type === "category" && aiCategorySuggestion) {
        setValue("category_id", aiCategorySuggestion.id);
        setAiSuggestion(`Category set to "${aiCategorySuggestion.category_name}".`);
      } else if (type === "title" && aiSuggestion) {
        const suggestedTitle = aiSuggestion.split('\n')[2]?.replace(/^\d+\.\s/, '').trim();
        if (suggestedTitle) setValue("title", suggestedTitle);
      } else if (type === "content" && aiSuggestion) {
        const suggestedContent = aiSuggestion.split('\n\n')[2] || aiSuggestion.split('\n\n')[1];
        if (suggestedContent) setValue("content", suggestedContent);
      }
    } catch (error) {
      console.error("Error applying suggestion:", error);
      setAiSuggestion("Failed to apply suggestion. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");
  
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("category_id", data.category_id);
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }
  
      const response = await axios.post("http://localhost:5000/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 201) {
        alert("Post created successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Post creation error:", error);
      setServerError(error.response?.data?.error || error.message || "Failed to create post");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-white relative">
      {/* AI Assistant Button */}
      <button
        onClick={() => {
          setShowAIAssistant(!showAIAssistant);
          if (!showAIAssistant) {
            setAiGreeting(generateGreeting());
            resetAISuggestion();
          }
        }}
        className="fixed bottom-8 right-8 bg-[#91CC6E] hover:bg-[#91CC6E] text-white p-4 rounded-full shadow-lg z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <div className="fixed bottom-24 right-8 w-80 bg-gray-800 rounded-lg shadow-xl p-4 z-10 border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">AI Writing Assistant</h3>
            <button onClick={() => setShowAIAssistant(false)} className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {aiGreeting && !aiSuggestion && (
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <p className="text-sm">{aiGreeting}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={generateTitleFromContent}
                disabled={!content || isAiThinking}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm ${!content || isAiThinking ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#91CC6E] hover:bg-[#91CC6E]'}`}
              >
                Suggest Title
              </button>

              <button
                onClick={generateContentFromTitle}
                disabled={!title || isAiThinking}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm ${!title || isAiThinking ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#91CC6E] hover:bg-[#91CC6E]'}`}
              >
                Generate Content
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={suggestCategory}
                disabled={(!title && !content) || isAiThinking}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm ${(!title && !content) || isAiThinking ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#91CC6E] hover:bg-#91CC6E'}`}
              >
                Suggest Category
              </button>

              <button
                onClick={improveContent}
                disabled={!content || isAiThinking}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm ${!content || isAiThinking ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#91CC6E] hover:bg-[#91CC6E]'}`}
              >
                Improve Content
              </button>
            </div>

            {isAiThinking && (
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-700/50 rounded-lg">
                <div className="animate-spin h-5 w-5 border-2 border-[#91CC6E] border-t-transparent rounded-full"></div>
                <span>Thinking...</span>
              </div>
            )}

            {aiSuggestion && (
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">AI Suggestions:</h4>
                  {activeAIFunction && (
                    <button 
                      onClick={() => applyAISuggestion(activeAIFunction)}
                      className="text-xs bg-[#91CC6E] hover:bg-[#91CC6E] px-2 py-1 rounded"
                    >
                      Apply
                    </button>
                  )}
                </div>
                <div className="text-sm whitespace-pre-line">
                  {typingText}
                  {!typingComplete && <span className="animate-blink">|</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side */}
          <div className="w-full md:w-1/3">
            <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
            <p className="text-gray-300 mb-6">
              Share your thoughts and ideas with the world.
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <img src={back2} alt="Back" className="h-5 w-5" />
              Back
            </button>
          </div>

          {/* Right side - form */}
          <div className="w-full md:w-2/3 bg-gray-800 p-6 rounded-lg">
            {serverError && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-md">
                {serverError}
              </div>
            )}

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full bg-gray-700 rounded-md p-2 text-white"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={8}
                  className="w-full bg-gray-700 rounded-md p-2 text-white"
                  {...register("content")}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
              </div>

              {/* Image */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-1">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="w-full text-sm text-gray-400"
                  onChange={(e) => setValue("image", e.target.files?.[0] || undefined)}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium mb-1">
                  Category *
                </label>
                {isLoading ? (
                  <div className="animate-pulse bg-gray-700 h-10 rounded-md"></div>
                ) : (
                  <select
                    id="category_id"
                    className="w-full bg-gray-700 rounded-md p-2 text-white"
                    {...register("category_id")}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.category_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#91CC6E] rounded-md hover:bg-[#91CC6E] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;