import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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

const EditPostForm = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postFormSchema),
  });

  const watchImage = watch("image");

  // Fetch the post data when the component mounts
  useEffect(() => {
    const fetchPost = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setPost(response.data);
          // Set the form values with the fetched post data
          reset({
            title: response.data.title,
            content: response.data.content,
          });
          // Set initial image preview
          if (response.data.image_url) {
            setImagePreview(response.data.image_url);
          }
        } else {
          setError("Post not found.");
        }
      } catch (error) {
        console.error("Error fetching post:", error.response?.data || error.message);
        setError("Failed to fetch post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, reset]);

  // Handle image preview when a new image is selected
  useEffect(() => {
    if (watchImage && watchImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(watchImage);
    }
  }, [watchImage]);

  // Handle form submission
  const onSubmit = async (data) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }
  
    try {
      console.log("Attempting to update post with ID:", postId); // Add this
      console.log("Form data:", data); // Add this
  
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }
  
      const response = await axios.put(
        `http://localhost:5000/posts/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // ...

      console.log("Post updated successfully:", response.data);
      alert("Post updated successfully!");
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Error updating post:", error.response?.data || error.message);
      setError(`Failed to update post: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-white text-center mt-8">{error}</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="container">
        <div className="flex flex-col md:flex-row gap-8 justify-between pb-12">
          <div className="w-full md:w-[35%]">
            <h2 className="text-lg font-semibold leading-7">Edit Post</h2>
            <p className="mt-1 leading-6 text-gray-300">
              Update your post with new content.
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
                {imagePreview && (
                  <div className="mt-2 mb-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-60 rounded-md object-cover"
                    />
                  </div>
                )}
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
                      } else {
                        setValue("image", undefined);
                        setImagePreview(post?.image_url || null);
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
                disabled={isSubmitting}
              >
                Reset
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Post"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPostForm;