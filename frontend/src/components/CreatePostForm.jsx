import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import back2 from "../Asset/back2.png";
import { useTheme } from "../ThemeContext";

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
  const { theme } = useTheme();
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

  // Theme-based colors
  const bgColor = theme === 'dark' ? 'bg-[#181818]' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-[#7B7B7B]' : 'text-gray-600';
  const accentColor = theme === 'dark' ? 'text-[#91CC6E]' : 'text-green-600';
  const accentBgColor = theme === 'dark' ? 'bg-[#91CC6E33]' : 'bg-green-100';
  const cardBgColor = theme === 'dark' ? 'bg-[#282828]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const inputBgColor = theme === 'dark' ? 'bg-[#383838]' : 'bg-white';

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
          timeout: 600000
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
    <div className={`${bgColor} min-h-screen p-4 ${textColor}`}>
      {/* AI Assistant Button */}
      <button
        onClick={() => {
          setShowAIAssistant(!showAIAssistant);
          if (!showAIAssistant) {
            setAiGreeting(generateGreeting());
            resetAISuggestion();
          }
        }}
        className={`fixed bottom-8 right-8 ${accentBgColor} ${textColor} p-3 rounded-full shadow-lg z-10`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <div className={`fixed bottom-24 right-8 w-80 ${cardBgColor} rounded-lg shadow-lg p-4 z-10 border ${borderColor}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold text-lg ${textColor}`}>AI Writing Assistant</h3>
            <button onClick={() => setShowAIAssistant(false)} className={`${secondaryTextColor} hover:${textColor}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {aiGreeting && !aiSuggestion && (
              <div className={`${inputBgColor} p-3 rounded-lg text-sm ${textColor}`}>
                <p>{aiGreeting}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={generateTitleFromContent}
                disabled={!content || isAiThinking}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm ${!content || isAiThinking ? `${inputBgColor} cursor-not-allowed` : `${accentBgColor} hover:opacity-80`}`}
              >
                Suggest Title
              </button>

              <button
                onClick={generateContentFromTitle}
                disabled={!title || isAiThinking}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm ${!title || isAiThinking ? `${inputBgColor} cursor-not-allowed` : `${accentBgColor} hover:opacity-80`}`}
              >
                Generate Content
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={suggestCategory}
                disabled={(!title && !content) || isAiThinking}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm ${(!title && !content) || isAiThinking ? `${inputBgColor} cursor-not-allowed` : `${accentBgColor} hover:opacity-80`}`}
              >
                Suggest Category
              </button>

              <button
                onClick={improveContent}
                disabled={!content || isAiThinking}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm ${!content || isAiThinking ? `${inputBgColor} cursor-not-allowed` : `${accentBgColor} hover:opacity-80`}`}
              >
                Improve Content
              </button>
            </div>

            {isAiThinking && (
              <div className={`flex items-center justify-center gap-2 p-3 ${inputBgColor} rounded-lg`}>
                <div className={`animate-spin h-5 w-5 border-2 ${accentColor} border-t-transparent rounded-full`}></div>
                <span>Thinking...</span>
              </div>
            )}

            {aiSuggestion && (
              <div className={`${inputBgColor} p-3 rounded-lg`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-medium ${textColor}`}>AI Suggestions:</h4>
                  {activeAIFunction && (
                    <button 
                      onClick={() => applyAISuggestion(activeAIFunction)}
                      className={`text-xs ${accentBgColor} px-2 py-1 rounded hover:opacity-80`}
                    >
                      Apply
                    </button>
                  )}
                </div>
                <div className={`text-sm whitespace-pre-line ${textColor}`}>
                  {typingText}
                  {!typingComplete && <span className="animate-blink">|</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 ${secondaryTextColor} hover:${textColor}`}
            >
              <img src={back2} alt="Back" className="h-5 w-5" />
              Back
            </button>
            <h2 className={`text-2xl font-bold ${textColor}`}>Create New Post</h2>
          </div>

          <div className={`${cardBgColor} p-6 rounded-lg shadow-md border ${borderColor}`}>
            {serverError && (
              <div className={`mb-4 p-3 ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} ${theme === 'dark' ? 'text-red-200' : 'text-red-700'} rounded-md text-sm`}>
                {serverError}
              </div>
            )}

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className={`block text-sm font-medium mb-1 ${textColor}`}>
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className={`w-full ${inputBgColor} rounded-md p-2 ${textColor} border ${borderColor}`}
                  {...register("title")}
                />
                {errors.title && (
                  <p className={`${accentColor} text-sm mt-1`}>{errors.title.message}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className={`block text-sm font-medium mb-1 ${textColor}`}>
                  Content
                </label>
                <textarea
                  id="content"
                  rows={8}
                  className={`w-full ${inputBgColor} rounded-md p-2 ${textColor} border ${borderColor}`}
                  {...register("content")}
                />
                {errors.content && (
                  <p className={`${accentColor} text-sm mt-1`}>{errors.content.message}</p>
                )}
              </div>

              {/* Image */}
              <div>
                <label htmlFor="image" className={`block text-sm font-medium mb-1 ${textColor}`}>
                  Image (Optional)
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className={`w-full text-sm ${secondaryTextColor}`}
                  onChange={(e) => setValue("image", e.target.files?.[0] || undefined)}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className={`block text-sm font-medium mb-1 ${textColor}`}>
                  Category *
                </label>
                {isLoading ? (
                  <div className={`animate-pulse ${inputBgColor} h-10 rounded-md`}></div>
                ) : (
                  <select
                    id="category_id"
                    className={`w-full ${inputBgColor} rounded-md p-2 ${textColor} border ${borderColor}`}
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
                  <p className={`${accentColor} text-sm mt-1`}>{errors.category_id.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className={`px-4 py-2 ${inputBgColor} rounded-md hover:opacity-80 ${textColor}`}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 ${accentBgColor} rounded-md hover:opacity-80 ${accentColor} disabled:opacity-50`}
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