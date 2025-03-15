import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, ArrowLeft } from "lucide-react";
import like from "../Asset/icons8-like-48.png";
import comment from "../Asset/icons8-comment.gif";
import { useNavigate, useLocation } from "react-router-dom";
import CommentList from "./CommentList";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState(null); // Track the selected post ID for comments
  const postsPerPage = 4;
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch all posts from the backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        const sortedPosts = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // Get the 3 most recent posts for the "Recent blog posts" section
  const recentPosts = posts.slice(0, 3);

  // Get the posts for the current page in the "All Blog Post" section
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Calculate total number of pages
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Handle "Next" button click
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle "Previous" button click
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle like button
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      // Check if the user has already liked the post
      const likeCheckResponse = await fetch(
        `http://localhost:5000/posts/${postId}/likes/check`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!likeCheckResponse.ok) {
        throw new Error("Failed to check like status");
      }

      const likeCheckData = await likeCheckResponse.json();
      const hasLiked = likeCheckData.hasLiked; // Assuming the backend returns { hasLiked: true/false }

      // If the user has already liked the post, send a DELETE request to remove the like (dislike)
      if (hasLiked) {
        const dislikeResponse = await fetch(
          `http://localhost:5000/posts/${postId}/like`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!dislikeResponse.ok) {
          throw new Error("Failed to dislike the post");
        }
      } else {
        // If the user hasn't liked the post, send a POST request to add a like
        const likeResponse = await fetch(
          `http://localhost:5000/posts/${postId}/like`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!likeResponse.ok) {
          throw new Error("Failed to like the post");
        }
      }

      // Fetch updated posts after liking/disliking
      const updatedPosts = await fetch("http://localhost:5000/posts").then((res) =>
        res.json()
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error handling like:", error);
      alert("Failed to like/dislike the post.");
    }
  };

  // Handle comment button click
  const handleCommentClick = (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setSelectedPostId(selectedPostId === postId ? null : postId); // Toggle comments for the clicked post
  };

  const backgroundImages = [
    "https://assets.vogue.com/photos/5f651e490f204e69b53eacbd/master/pass/VO080119_DESIGNERS_46.jpg",
    "https://media.bleacherreport.com/image/upload/v1719242794/teiolpjmhprr7izmwo3f.jpg",
    "https://media.glamour.com/photos/66f5c2777e09bc43bcee2067/master/w_2560%2Cc_limit/men%25E2%2580%2599s%2520fashion%2520trends.jpg",
    "https://imr.ie/wp-content/uploads/2021/01/shutterstock_1584020461-scaled.jpg",
    "https://www.macromedia-fachhochschule.de/wp-content/uploads/2021/04/210412-macromedia-hochschule-bachelor-fashion-management-5440x1700-ll.jpg",
    "https://onpost.shop/cdn/shop/articles/Music_festival_outfits-Header.png?v=1738696404"

  ];

  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full bg-[#181818] w-full">
      {/* Sliding Background Section */}
      <div
  className="w-full h-screen relative overflow-hidden"
  style={{
    backgroundImage: `url(${backgroundImages[currentBackgroundIndex]})`,
    backgroundSize: "cover", // Ensures the image covers the entire container
    backgroundPosition: "center", // Centers the image
    backgroundRepeat: "no-repeat", // Prevents the image from repeating
    transition: "background-image 1s ease-in-out", // Smooth transition between images
    backgroundColor: "#181818", // Fallback background color
  }}
>

        <div className="flex h-fit w-full text-[black] flex-nowrap justify-center">
          <div className="w-fit h-fit">
            <div className="font-semibold text-[#B8FF8C]">Our blog</div>
            <div className="text-5xl font-semibold w-[284px] mt-9 text-white">
              What’s New?
            </div>
            <div className="text-[20px] w-[394px] mt-[19px] text-[#c0c0c0]">
              Lorem ipsum Neque porro quisquam est qui dolorem ipsum quia dolor
              sit amet
            </div>
            <div className="flex gap-x-4 w-fit h-fit mt-16">
              <div className="w-[360px] h-12 border border-[#BCBCBC] pt-2.5 px-4 rounded-lg">
                <div className="text-[#7b7b7b]">Enter your email</div>
              </div>
              <div className="w-[118px] h-12 bg-[#B8FF8C] font-semibold flex items-center justify-center rounded-lg">
                Subscribe
              </div>
            </div>
          </div>
          <div className="h-fit mb-28 w-full">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex gap-[42px] w-fit h-fit mb-[42px]">
                <div className="w-fit h-fit shrink-0 grow-0">
                  <div className="font-medium text-[13px] text-white w-full">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="w-fit h-fit">
                  <div className="text-lg font-bold text-white leading-[25.5px] w-fit h-fit">
                    {post.title}
                  </div>
                  <div className="text-sm mt-3 text-[#c0c0c0ff] w-fit h-fit">
                    {post.content}
                  </div>
                  <div className="w-[140px] h-[46px] rounded-md border border-[#B8FF8C] flex items-center justify-center gap-x-2.5 mt-[18px]">
                    <div className="text-[#B8FF8C]">Learn More</div>
                    <ArrowRight className="text-[#B8FF8C] w-[22px] h-[22px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Blog Posts Section */}
      <div className="font-semibold text-white text-[34px] ml-28">
        Recent blog posts
      </div>
      <div className="flex w-fit h-fit ml-28 mt-8">
      {recentPosts.map((post) => (
  <div key={post.id} className="w-fit h-fit">
    <div className="w-[592px] h-[228px]">
      <img
        src={post.image_url || "https://via.placeholder.com/600x400"} // Fallback image
        alt="Blog Post"
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error("Image failed to load:", e.target.src); // Debugging
          e.target.src = "https://via.placeholder.com/600x400"; // Fallback image on error
        }}
      />
    </div>
    <div className="text-[#B8FF8C] text-sm font-semibold mt-8">
      {post.user_name} - {new Date(post.created_at).toLocaleDateString()}
    </div>
    <div className="flex items-center justify-between h-fit my-3 w-[592px]">
      <div className="text-white text-2xl font-semibold w-[420px]">
        {post.title}
      </div>
      <ArrowUpRight className="text-white" />
    </div>
    <div className="text-[#7B7B7B] w-[434px]">
      {post.content}
    </div>
    <div className="flex gap-x-2 w-fit h-fit mt-6">
      <div
        className="text-[#B8FF8C] bg-[#B8FF8C33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 cursor-pointer"
        onClick={() => handleLike(post.id)}
      >
        <img src={like} alt="Like" />
        <span className="ml-1">{post.likes}</span>
      </div>
      <div
        className="text-[#B8FF8C] bg-[#B8FF8C33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 cursor-pointer"
        onClick={() => handleCommentClick(post.id)}
      >
        <img src={comment} alt="Comment" />
        <span className="ml-1">{post.comments.length}</span>
      </div>
    </div>
    {/* Render CommentList below the post if it's selected */}
    {selectedPostId === post.id && (
      <CommentList postId={post.id} />
    )}
  </div>
))}
      </div>

      {/* All Blog Posts Section */}
      <div className="font-semibold text-white text-[34px] ml-28 mt-24">
        All Blog Post
      </div>
      <div className="w-fit h-fit ml-28 mt-8">
        <div className="flex gap-x-8 w-fit h-fit">
          {currentPosts.map((post) => (
            <div key={post.id} className="w-fit h-fit">
              <div className="bg-white w-96 h-60">
                <img
                  src={post.image_url}
                  alt="Blog Post"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[#B8FF8C] text-sm font-semibold mt-8">
                {post.user_name} - {new Date(post.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center justify-between h-fit my-3 w-96">
                <div className="text-white text-2xl font-semibold w-[420px]">
                  {post.title}
                </div>
                <ArrowUpRight className="text-white" />
              </div>
              <div className="text-[#7B7B7B] w-96">
                {post.content}
              </div>
              <div className="flex gap-x-2 w-fit h-fit mt-6">
                <div
                  className="text-[#B8FF8C] bg-[#B8FF8C33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 cursor-pointer"
                  onClick={() => handleLike(post.id)}
                >
                  <img src={like} alt="Like" />
                  <span className="ml-1">{post.likes}</span>
                </div>
                <div
                  className="text-[#B8FF8C] bg-[#B8FF8C33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 cursor-pointer"
                  onClick={() => handleCommentClick(post.id)}
                >
                  <img src={comment} alt="Comment" />
                  <span className="ml-1">{post.comments.length}</span>
                </div>
              </div>
              {/* Render CommentList below the post if it's selected */}
              {selectedPostId === post.id && (
                <CommentList postId={post.id} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Section */}
      <div className="bg-white w-[1216px] h-px ml-28 mt-16" />
      <div className="flex items-center justify-between h-fit w-auto mt-5 mx-28">
        <div className="flex gap-x-2 items-center w-fit h-fit">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`flex gap-x-2 items-center ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ArrowLeft className="text-white w-[22px] h-[22px]" />
            <div className="text-white text-sm font-medium">Previous</div>
          </button>
        </div>
        <div className="flex w-fit h-fit">
          {Array.from({ length: totalPages }, (_, index) => (
            <div
              key={index + 1}
              className={`text-sm font-medium flex justify-center items-center w-fit rounded-lg px-4 py-2.5 h-fit ${
                currentPage === index + 1
                  ? "text-[#B8FF8C] bg-[#B8FF8C33]"
                  : "text-white"
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="flex gap-x-2 items-center w-fit h-fit">
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`flex gap-x-2 items-center ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="text-white text-sm font-medium">Next</div>
            <ArrowRight className="text-white w-[22px] h-[22px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;