import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaTags, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaLink,
  FaArrowLeft
} from 'react-icons/fa';

// Import the sample blogs from the Blog page
// In a real app, you would fetch this data from an API
import { sampleBlogs } from './Blog'; 

function BlogPost() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      console.log("Fetching blog with ID:", blogId);
      
      // First try to get blog from local data if blogId is undefined or API fails
      if (!blogId) {
        console.error("Blog ID is undefined - falling back to local data");
        setBlog(null);
        setLoading(false);
        return;
      }

      try {
        // Try to find the blog in local data first (faster)
        const userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
        const allBlogs = [...sampleBlogs, ...userBlogs];
        const localBlog = allBlogs.find(blog => 
          blog.id === parseInt(blogId) || 
          blog.id === blogId || 
          blog._id === blogId ||
          (typeof blog.id === 'string' && blog.id === blogId)
        );
        
        if (localBlog) {
          console.log("Found blog in local data:", localBlog.title);
          
          // Ensure the blog has a comments array
          localBlog.comments = localBlog.comments || [];
          
          setBlog(localBlog);
          
          // Find related posts based on category or tags
          const related = allBlogs
            .filter(post => {
              // Don't include the current post in related
              const isSamePost = (localBlog.id && post.id === localBlog.id) || 
                               (localBlog._id && post._id === localBlog._id);
              
              // Check if category or tags match
              const matchesCategory = post.category === localBlog.category;
              const matchesTags = post.tags && localBlog.tags && 
                                post.tags.some(tag => localBlog.tags.includes(tag));
              
              return !isSamePost && (matchesCategory || matchesTags);
            })
            .slice(0, 3);
          setRelatedPosts(related);
          setLoading(false);
          return;
        }
        
        // If not found locally, try the API
        console.log("Blog not found locally, trying API with ID:", blogId);
        const response = await fetch(`http://localhost:3250/api/blogs/${blogId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("API returned blog data:", data.blog.title);
          
          // Ensure the blog has a comments array
          data.blog.comments = data.blog.comments || [];
          
          setBlog(data.blog);
          
          // Try to fetch related posts
          const allBlogsResponse = await fetch('http://localhost:3250/api/blogs');
          if (allBlogsResponse.ok) {
            const allBlogsData = await allBlogsResponse.json();
            const related = allBlogsData.blogs
              .filter(post => {
                // Don't include the current post
                const isSamePost = post._id === data.blog._id;
                
                // Check if category or tags match
                const matchesCategory = post.category === data.blog.category;
                const matchesTags = post.tags && data.blog.tags && 
                                  post.tags.some(tag => data.blog.tags.includes(tag));
                
                return !isSamePost && (matchesCategory || matchesTags);
              })
              .slice(0, 3);
            setRelatedPosts(related);
          }
        } else {
          console.error('Failed to fetch blog from API. Response status:', response.status);
          setBlog(null);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [blogId]);

  // Copy URL to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  // Handle comment form input changes
  const handleCommentInput = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setSubmittingComment(true);
    setCommentError(null);
    setCommentSuccess(false);

    // Validate form
    if (!commentForm.name || !commentForm.email || !commentForm.content) {
      setCommentError('Please fill in all fields');
      setSubmittingComment(false);
      return;
    }

    try {
      // First check if we have the blog from the API (has _id) or local data
      if (blog._id) {
        // Try to submit to API
        const response = await fetch(`http://localhost:3250/api/blogs/${blog._id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userName: commentForm.name,
            email: commentForm.email,
            content: commentForm.content
          })
        });

        if (response.ok) {
          const updatedBlog = await response.json();
          setBlog(updatedBlog.blog);
          setCommentSuccess(true);
          
          // Reset form
          setCommentForm({
            name: '',
            email: '',
            content: ''
          });
        } else {
          setCommentError('Failed to submit comment. Please try again.');
        }
      } else {
        // Handle local blogs (no API)
        // Create a new comment
        const newComment = {
          userId: null,
          userName: commentForm.name,
          userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(commentForm.name)}`,
          content: commentForm.content,
          createdAt: new Date()
        };

        // Add comment to blog
        const updatedBlog = {
          ...blog,
          comments: blog.comments ? [...blog.comments, newComment] : [newComment]
        };

        // Update the blog state
        setBlog(updatedBlog);

        // If this is from sample data, also try to save to localStorage
        const userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
        const updatedUserBlogs = userBlogs.map(b => 
          b.id === blog.id ? updatedBlog : b
        );
        localStorage.setItem('userBlogs', JSON.stringify(updatedUserBlogs));

        setCommentSuccess(true);
        
        // Reset form
        setCommentForm({
          name: '',
          email: '',
          content: ''
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentError('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Blog Post Not Found</h1>
          <p className="text-xl text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Check if it's a Date object
    if (dateString instanceof Date) {
      return dateString.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Try to parse the date string
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (e) {
      // If parsing fails, return the original string
    }
    
    return dateString;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div 
        className="w-full h-96 bg-center bg-cover relative" 
        style={{ backgroundImage: `url(${blog.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40"></div>
        <div className="w-full h-full flex items-center relative z-10">
          <div className="container mx-auto max-w-4xl px-4">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-white mb-6 hover:text-blue-300 transition-colors bg-blue-600/20 px-4 py-2 rounded-full backdrop-blur-sm"
            >
              <FaArrowLeft className="mr-2" /> Back to Blogs
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-md">{blog.title}</h1>
            <p className="text-xl text-blue-100 mb-6 max-w-3xl drop-shadow-md">{blog.subtitle}</p>
            
            <div className="flex flex-wrap items-center text-white text-sm gap-4">
              <div className="flex items-center bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                <img 
                  src={blog.author.avatar} 
                  alt={blog.author.name} 
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white/50"
                />
                <div>
                  <p className="font-medium">{blog.author.name}</p>
                  <p className="text-blue-200 text-xs">{blog.author.bio}</p>
                </div>
              </div>
              
              <div className="flex items-center bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                <FaCalendarAlt className="mr-2" />
                {formatDate(blog.date)}
              </div>
              
              <div className="px-3 py-2 bg-blue-600/50 rounded-lg backdrop-blur-sm">
                {blog.category}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <div className="bg-white text-black rounded-xl shadow-md p-6 md:p-10">
              {/* Blog content */}
              <div 
                className="prose prose-lg max-w-none 
                  prose-headings:text-gray-800 
                  prose-h3:text-xl prose-h3:font-bold prose-h3:my-6 
                  prose-h4:text-lg prose-h4:font-medium prose-h4:my-4
                  prose-p:text-gray-700 prose-p:my-4 prose-p:leading-relaxed
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-800 prose-strong:font-bold
                  prose-li:text-gray-700 prose-li:my-1
                  prose-ul:my-4 prose-ol:my-4
                  prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              ></div>
              
              {/* Source and Tags */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                {blog.source && (
                  <div className="mb-4">
                    <p className="text-gray-600">
                      <span className="font-semibold">Source:</span>{' '}
                      <a href={blog.sourceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {blog.source}
                      </a>
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <FaTags className="text-gray-500 mr-1" />
                  {blog.tags && blog.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Share */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Share this article</h3>
                <div className="flex space-x-4">
                  <a 
                    href={`https://facebook.com/sharer/sharer.php?u=${window.location.href}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <FaFacebookF />
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition-colors"
                  >
                    <FaTwitter />
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-800 text-white flex items-center justify-center hover:bg-blue-900 transition-colors"
                  >
                    <FaLinkedinIn />
                  </a>
                  <button 
                    onClick={copyToClipboard}
                    className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <FaLink />
                  </button>
                </div>
              </div>
              
              {/* Author Bio */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-800">About the Author</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <img 
                    src={blog.author.avatar} 
                    alt={blog.author.name} 
                    className="w-20 h-20 rounded-full border-2 border-white shadow-md"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{blog.author.name}</h4>
                    <p className="text-gray-600 mt-1">{blog.author.bio}</p>
                    <button className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View all posts by this author
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6 md:p-10">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Comments {blog.comments && blog.comments.length > 0 ? `(${blog.comments.length})` : ''}</h3>
              
              {/* Comment Form */}
              <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-medium mb-4 text-gray-800">Leave a comment</h4>
                
                {commentError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
                    {commentError}
                  </div>
                )}
                
                {commentSuccess && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
                    Your comment has been posted successfully!
                  </div>
                )}
                
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      name="name"
                      value={commentForm.name}
                      onChange={handleCommentInput}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      name="email"
                      value={commentForm.email}
                      onChange={handleCommentInput}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                  <textarea 
                    placeholder="Your Comment" 
                    rows="4"
                    name="content"
                    value={commentForm.content}
                    onChange={handleCommentInput}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  ></textarea>
                  <button 
                    type="submit"
                    disabled={submittingComment}
                    className={`px-6 py-3 bg-blue-600 text-white rounded-lg transition-colors ${
                      submittingComment ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              </div>
              
              {/* Comments List */}
              {blog.comments && blog.comments.length > 0 ? (
                <div className="space-y-6">
                  {blog.comments.map((comment, index) => (
                    <div key={`comment-${index}`} className={index !== blog.comments.length - 1 ? "border-b border-gray-200 pb-6" : ""}>
                      <div className="flex items-start space-x-4">
                        <img 
                          src={comment.userAvatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(comment.userName)} 
                          alt={comment.userName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap">
                            <h4 className="font-bold text-gray-800">{comment.userName}</h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.createdAt || new Date())}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-2">
                            {comment.content}
                          </p>
                          <button className="text-blue-600 text-sm mt-2 hover:text-blue-800">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-8">
            {/* Related Posts */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Related Articles</h3>
              {relatedPosts.length > 0 ? (
                <div className="space-y-6">
                  {relatedPosts.map((post, index) => (
                    <div key={post._id || post.id || `related-${index}`} className="group">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-32 object-cover rounded-lg mb-2 shadow-sm hover:shadow-md transition-shadow" 
                      />
                      <Link 
                        to={`/blog/${post._id || post.id}`} 
                        className="font-medium group-hover:text-blue-600 transition-colors text-gray-800 block leading-tight"
                      >
                        {post.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(post.date)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No related articles found</p>
              )}
            </div>
            
            {/* Categories */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Categories</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/blog?category=Technology" className="text-gray-700 hover:text-blue-600 flex justify-between items-center py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                    Technology <span className="bg-blue-100 text-blue-600 rounded-full px-2 py-1 text-xs">15</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=Internships" className="text-gray-700 hover:text-blue-600 flex justify-between items-center py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                    Internships <span className="bg-blue-100 text-blue-600 rounded-full px-2 py-1 text-xs">8</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=Career Tips" className="text-gray-700 hover:text-blue-600 flex justify-between items-center py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                    Career Tips <span className="bg-blue-100 text-blue-600 rounded-full px-2 py-1 text-xs">12</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=Market Trends" className="text-gray-700 hover:text-blue-600 flex justify-between items-center py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                    Market Trends <span className="bg-blue-100 text-blue-600 rounded-full px-2 py-1 text-xs">7</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=Education" className="text-gray-700 hover:text-blue-600 flex justify-between items-center py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                    Education <span className="bg-blue-100 text-blue-600 rounded-full px-2 py-1 text-xs">9</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Advertisement */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-md">
              <div className="text-xs uppercase tracking-wider mb-2">Sponsored</div>
              <h3 className="text-xl font-bold mb-3">Career Counseling</h3>
              <p className="mb-4">
                Get personalized guidance from industry experts. First session free!
              </p>
              <a 
                href="#" 
                className="inline-block px-5 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Book Now
              </a>
            </div>
            
            {/* Newsletter Signup */}
            <div className="bg-blue-50 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-gray-800">Stay Updated</h3>
              <p className="text-gray-600 mb-4">
                Get the latest career advice and opportunities delivered to your inbox.
              </p>
              <form className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default BlogPost; 