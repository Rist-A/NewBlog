import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get("http://localhost:5000/categories", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Check if response.data is an array, if not, try response.data.categories
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.categories || [];

        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setServerError("Failed to load categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
    <div className="bg-gray-900 min-h-screen p-8 text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="container">
        <div className="flex flex-col md:flex-row gap-8 justify-between pb-12">
          {/* Left side */}
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
              <img src={back2} alt="" />
            </button>
          </div>

          {/* Right side - form */}
          <div className="w-full md:w-[65%] bg-gray-800 p-6 rounded-lg shadow-md">
            {serverError && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-md">
                {serverError}
              </div>
            )}

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* Title */}
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium leading-6">
                  Title
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="title"
                    className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...register("title")}
                  />
                </div>
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Content */}
              <div className="col-span-full">
                <label htmlFor="content" className="block text-sm font-medium leading-6">
                  Content
                </label>
                <div className="mt-2">
                  <textarea
                    id="content"
                    rows={5}
                    className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...register("content")}
                  />
                </div>
                {errors.content && (
                  <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
                )}
              </div>

              {/* Image */}
              <div className="col-span-full">
                <label htmlFor="image" className="block text-sm font-medium leading-6">
                  Image (Optional)
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                    onChange={(e) => setValue("image", e.target.files?.[0] || undefined)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="col-span-full">
                <label htmlFor="category" className="block text-sm font-medium leading-6">
                  Category *
                </label>
                <div className="mt-2 relative">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-700 h-10 rounded-md"></div>
                  ) : (
                    <select
                      id="category_id"
                      className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      {...register("category_id")}
                      disabled={isLoading}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name || category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {errors.category_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.category_id.message}</p>
                )}
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
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Creating..." : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;

//old

// import React, { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import back2 from "../Asset/back2.png";

// const postFormSchema = z.object({
//   title: z
//     .string()
//     .min(2, { message: "Title must be at least 2 characters." })
//     .max(100, { message: "Title must not be longer than 100 characters." }),
//   content: z.string().min(10, { message: "Content must be at least 10 characters." }),
//   image: z.instanceof(File).optional(),
//   category_id: z.string().min(1, { message: "Category is required" }),
// });

// const defaultValues = {
//   title: "",
//   content: "",
//   image: undefined,
//   category_id: "",
// };

// const CreatePostForm = () => {
//   const navigate = useNavigate();
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     reset,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: zodResolver(postFormSchema),
//     defaultValues,
//   });

//   const [categories, setCategories] = useState([]);
//   const [serverError, setServerError] = useState("");
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//           throw new Error("No authentication token found");
//         }

//         const response = await axios.get("http://localhost:5000/categories", {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         // Check if response.data is an array, if not, try response.data.categories
//         const categoriesData = Array.isArray(response.data) 
//           ? response.data 
//           : response.data.categories || [];

//         setCategories(categoriesData);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//         setServerError("Failed to load categories. Please try again.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const onSubmit = async (data) => {
//     try {
//       const token = sessionStorage.getItem("token");
//       if (!token) throw new Error("No token found. Please log in.");
  
//       const formData = new FormData();
// formData.append("title", data.title);
// formData.append("content", data.content);
// formData.append("category_id", data.category_id);
// if (data.image instanceof File) {
//   formData.append("image", data.image);
// }

  
//       const response = await axios.post("http://localhost:5000/posts", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
  
//       if (response.status === 201) {
//         alert("Post created successfully!");
//         navigate("/");
//       }
//     } catch (error) {
//       console.error("Post creation error:", error);
//       setServerError(error.response?.data?.error || error.message || "Failed to create post");
//     }
//   };

//   return (
//     <div className="bg-gray-900 min-h-screen p-8 text-white">
//       <form onSubmit={handleSubmit(onSubmit)} className="container">
//         <div className="flex flex-col md:flex-row gap-8 justify-between pb-12">
//           {/* Left side */}
//           <div className="w-full md:w-[35%]">
//             <h2 className="text-lg font-semibold leading-7">Create New Post</h2>
//             <p className="mt-1 leading-6 text-gray-300">
//               Share your thoughts and ideas with the world.
//             </p>
//             <button
//               type="button"
//               onClick={() => navigate(-1)}
//               className="mt-4 rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600"
//             >
//               <img src={back2} alt="" />
//             </button>
//           </div>

//           {/* Right side - form */}
//           <div className="w-full md:w-[65%] bg-gray-800 p-6 rounded-lg shadow-md">
//             {serverError && (
//               <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-md">
//                 {serverError}
//               </div>
//             )}

//             <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
//               {/* Title */}
//               <div className="sm:col-span-4">
//                 <label htmlFor="title" className="block text-sm font-medium leading-6">
//                   Title
//                 </label>
//                 <div className="mt-2">
//                   <input
//                     type="text"
//                     id="title"
//                     className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//                     {...register("title")}
//                   />
//                 </div>
//                 {errors.title && (
//                   <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
//                 )}
//               </div>

//               {/* Content */}
//               <div className="col-span-full">
//                 <label htmlFor="content" className="block text-sm font-medium leading-6">
//                   Content
//                 </label>
//                 <div className="mt-2">
//                   <textarea
//                     id="content"
//                     rows={5}
//                     className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//                     {...register("content")}
//                   />
//                 </div>
//                 {errors.content && (
//                   <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
//                 )}
//               </div>

//               {/* Image */}
//               <div className="col-span-full">
//                 <label htmlFor="image" className="block text-sm font-medium leading-6">
//                   Image (Optional)
//                 </label>
//                 <div className="mt-2">
//                   <input
//                     type="file"
//                     id="image"
//                     accept="image/*"
//                     className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
//                     onChange={(e) => setValue("image", e.target.files?.[0] || undefined)}
//                   />
//                 </div>
//               </div>

//               {/* Category */}
//               <div className="col-span-full">
//                 <label htmlFor="category" className="block text-sm font-medium leading-6">
//                   Category *
//                 </label>
//                 <div className="mt-2 relative">
//                   {isLoading ? (
//                     <div className="animate-pulse bg-gray-700 h-10 rounded-md"></div>
//                   ) : (
//                     <select
//                       id="category_id"
//                       className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//                       {...register("category_id")}
//                       disabled={isLoading}
//                     >
//                       <option value="">Select a category</option>
//                       {categories.map((category) => (
//                         <option key={category.id} value={category.id}>
//                           {category.category_name || category.name}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </div>
//                 {errors.category_id && (
//                   <p className="text-sm text-red-500 mt-1">{errors.category_id.message}</p>
//                 )}
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end gap-2">
//               <button
//                 type="button"
//                 className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600"
//                 onClick={() => reset()}
//                 disabled={isSubmitting}
//               >
//                 Reset
//               </button>
//               <button
//                 type="submit"
//                 className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
//                 disabled={isSubmitting || isLoading}
//               >
//                 {isSubmitting ? "Creating..." : "Create Post"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreatePostForm;