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
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        // Try to fetch the blog post from the API
        const response = await fetch(`http://localhost:3250/api/blogs/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setBlog(data.blog);
          
          // Try to fetch related posts
          const allBlogsResponse = await fetch('http://localhost:3250/api/blogs');
          if (allBlogsResponse.ok) {
            const allBlogsData = await allBlogsResponse.json();
            const related = allBlogsData.blogs
              .filter(post => 
                post._id !== data.blog._id && 
                (post.category === data.blog.category || 
                  post.tags.some(tag => data.blog.tags.includes(tag)))
              )
              .slice(0, 3);
            setRelatedPosts(related);
          }
        } else {
          // Fallback to localStorage and sample data if API fails
          console.error('Failed to fetch blog from API. Using local data instead.');
          // Get user blogs from localStorage
          const userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
          
          // Combine sample blogs with user blogs
          const allBlogs = [...sampleBlogs, ...userBlogs];
          
          const foundBlog = allBlogs.find(blog => blog.id === parseInt(id) || blog.id === Number(id));
          setBlog(foundBlog);
          
          // Find related posts based on category or tags
          if (foundBlog) {
            const related = allBlogs
              .filter(post => 
                post.id !== foundBlog.id && 
                (post.category === foundBlog.category || 
                  post.tags.some(tag => foundBlog.tags.includes(tag)))
              )
              .slice(0, 3);
            setRelatedPosts(related);
          }
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        // Fallback to localStorage
        const userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
        const allBlogs = [...sampleBlogs, ...userBlogs];
        const foundBlog = allBlogs.find(blog => blog.id === parseInt(id) || blog.id === Number(id));
        setBlog(foundBlog);
        
        if (foundBlog) {
          const related = allBlogs
            .filter(post => 
              post.id !== foundBlog.id && 
              (post.category === foundBlog.category || 
                post.tags.some(tag => foundBlog.tags.includes(tag)))
            )
            .slice(0, 3);
          setRelatedPosts(related);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [id]);

  // Copy URL to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
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
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" /> Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div 
        className="w-full h-96 bg-center bg-cover" 
        style={{ backgroundImage: `url(${blog.image})` }}
      >
        <div className="w-full h-full flex items-center bg-black bg-opacity-50">
          <div className="container mx-auto max-w-4xl px-4">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-white mb-6 hover:text-blue-300 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Back to Blogs
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{blog.title}</h1>
            <p className="text-xl text-blue-100 mb-6">{blog.subtitle}</p>
            
            <div className="flex flex-wrap items-center text-white text-sm gap-4">
              <div className="flex items-center">
                <img 
                  src={blog.author.avatar} 
                  alt={blog.author.name} 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{blog.author.name}</p>
                  <p className="text-blue-200 text-xs">{blog.author.bio}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                {blog.date}
              </div>
              
              <div className="px-3 py-1 bg-blue-600 bg-opacity-50 rounded-full">
                {blog.category}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-10">
              {/* Blog content */}
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }}></div>
              
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
                
                <div className="flex flex-wrap items-center gap-2">
                  <FaTags className="text-gray-400" />
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Share */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold mb-4">Share this article</h3>
                <div className="flex space-x-4">
                  <a 
                    href={`https://facebook.com/sharer/sharer.php?u=${window.location.href}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                  >
                    <FaFacebookF />
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500"
                  >
                    <FaTwitter />
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-800 text-white flex items-center justify-center hover:bg-blue-900"
                  >
                    <FaLinkedinIn />
                  </a>
                  <button 
                    onClick={copyToClipboard}
                    className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700"
                  >
                    <FaLink />
                  </button>
                </div>
              </div>
              
              {/* Author Bio */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold mb-4">About the Author</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img 
                    src={blog.author.avatar} 
                    alt={blog.author.name} 
                    className="w-20 h-20 rounded-full"
                  />
                  <div>
                    <h4 className="text-xl font-bold">{blog.author.name}</h4>
                    <p className="text-gray-600">{blog.author.bio}</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
                      View all posts by this author
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6 md:p-10">
              <h3 className="text-xl font-bold mb-6">Comments (3)</h3>
              
              {/* Comment Form */}
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4">Leave a comment</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea 
                    placeholder="Your Comment" 
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Post Comment
                  </button>
                </div>
              </div>
              
              {/* Sample Comments */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/64.jpg" 
                      alt="Commenter" 
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold">Meera Patel</h4>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-gray-700 mt-2">
                        This article provided exactly the guidance I needed for my upcoming internship search. The section on application strategies was particularly helpful!
                      </p>
                      <button className="text-blue-600 text-sm mt-2 hover:text-blue-800">Reply</button>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src="https://randomuser.me/api/portraits/men/43.jpg" 
                      alt="Commenter" 
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold">Rahul Singh</h4>
                        <span className="text-sm text-gray-500">5 days ago</span>
                      </div>
                      <p className="text-gray-700 mt-2">
                        I'm curious about how the emerging technologies mentioned here will affect job prospects for new graduates. Any thoughts on which of these fields will have the most entry-level opportunities?
                      </p>
                      <button className="text-blue-600 text-sm mt-2 hover:text-blue-800">Reply</button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start space-x-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/28.jpg" 
                      alt="Commenter" 
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold">Ananya Sharma</h4>
                        <span className="text-sm text-gray-500">1 week ago</span>
                      </div>
                      <p className="text-gray-700 mt-2">
                        Great article! I've been focusing on building my portfolio and this gave me some new ideas. Would love to see more specific examples of effective student portfolios in different fields.
                      </p>
                      <button className="text-blue-600 text-sm mt-2 hover:text-blue-800">Reply</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/4 space-y-8">
            {/* Related Posts */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">Related Articles</h3>
              <div className="space-y-4">
                {relatedPosts.map(post => (
                  <div key={post.id} className="group">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-32 object-cover rounded-lg mb-2" 
                    />
                    <Link 
                      to={`/blog/${post.id}`} 
                      className="font-medium group-hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{post.date}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Categories */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/blog?category=Technology" className="text-gray-700 hover:text-blue-600 flex justify-between">
                    Technology <span className="text-gray-500">15</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=Internships" className="text-gray-700 hover:text-blue-600 flex justify-between">
                    Internships <span className="text-gray-500">8</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=Career Tips" className="text-gray-700 hover:text-blue-600 flex justify-between">
                    Career Tips <span className="text-gray-500">12</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=Market Trends" className="text-gray-700 hover:text-blue-600 flex justify-between">
                    Market Trends <span className="text-gray-500">7</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=Education" className="text-gray-700 hover:text-blue-600 flex justify-between">
                    Education <span className="text-gray-500">9</span>
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
              <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
              <p className="text-gray-600 mb-4">
                Get the latest career advice and opportunities delivered to your inbox.
              </p>
              <form className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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