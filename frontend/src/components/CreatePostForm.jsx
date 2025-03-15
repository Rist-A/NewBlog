import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Define the schema for the form
const postFormSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .max(100, {
      message: "Title must not be longer than 100 characters.",
    }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  image: z.instanceof(File).optional(),
});

// Default values for the form
const defaultValues = {
  title: "",
  content: "",
  image: undefined,
};

const CreatePostForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    try {
      // Decode the JWT token to get the user_id
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const decodedToken = jwtDecode(token);
      const user_id = decodedToken.id; // Ensure the token contains user_id

      if (!user_id) {
        throw new Error("User ID not found in token.");
      }

      // Convert the image file to base64
      let imageBase64 = "";
      if (data.image) {
        imageBase64 = await convertFileToBase64(data.image);
      }

      // Send the POST request to the backend
      const response = await axios.post(
        "http://localhost:5000/posts", // Full backend URL
        {
          title: data.title,
          content: data.content,
          image_url: imageBase64,
          user_id, // Include the user_id in the payload
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Post created successfully:", response.data);
      alert("Post created successfully!");
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      alert(`Failed to create post: ${error.response?.data?.error || error.message}`);
    }
  };

  // Helper function to convert a file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="container">
        <div className="flex flex-col md:flex-row gap-8 justify-between pb-12">
          <div className="w-full md:w-[35%]">
            <h2 className="text-lg font-semibold leading-7">Create New Post</h2>
            <p className="mt-1 leading-6 text-gray-300">
              Share your thoughts and ideas with the world.
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-4 rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600"
            >
              Go Back
            </button>
          </div>

          <div className="w-full md:w-[65%] bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* Title Field */}
              <div className="sm:col-span-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium leading-6"
                >
                  Title
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="title"
                    placeholder="Enter post title"
                    className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...register("title")}
                  />
                </div>
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Content Field */}
              <div className="col-span-full">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium leading-6"
                >
                  Content
                </label>
                <div className="mt-2">
                  <textarea
                    id="content"
                    rows={5}
                    placeholder="Write your post content..."
                    className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...register("content")}
                  />
                </div>
                {errors.content && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Image Field */}
              <div className="col-span-full">
                <label
                  htmlFor="image"
                  className="block text-sm font-medium leading-6"
                >
                  Image
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("image", file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600"
                onClick={() => reset()}
              >
                Reset
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;