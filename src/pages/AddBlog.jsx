import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FaImage, FaLink, FaTimes, FaArrowLeft } from 'react-icons/fa';

function AddBlog() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Error and submission states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress the image before setting it as preview
        compressImage(reader.result, file.type, (compressedImage) => {
          setImagePreview(compressedImage);
        });
      };
      reader.readAsDataURL(file);
      setImage(file);
    }
  };

  // Function to compress image
  const compressImage = (dataUrl, fileType, callback) => {
    const image = new Image();
    image.src = dataUrl;
    
    image.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max width of 1200px)
      const maxWidth = 1200;
      let width = image.width;
      let height = image.height;
      
      if (width > maxWidth) {
        height = Math.floor(height * (maxWidth / width));
        width = maxWidth;
      }
      
      // Set canvas dimensions and draw the resized image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
      
      // Convert to compressed dataURL with reduced quality
      const quality = 0.7; // Adjust quality (0.1 = low, 1.0 = high)
      const compressedDataUrl = canvas.toDataURL(fileType, quality);
      
      callback(compressedDataUrl);
    };
  };

  // Handle tag input
  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = "Title is required";
    if (!subtitle.trim()) newErrors.subtitle = "Subtitle is required";
    if (!content.trim()) newErrors.content = "Content is required";
    if (!category) newErrors.category = "Category is required";
    if (!image) newErrors.image = "Featured image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create blog post object with user information
      const blogData = {
        title,
        subtitle,
        content,
        category,
        tags,
        image: imagePreview, // In a real app, this would be the URL after uploading to cloud storage
        author: {
          id: currentUser?.uid || currentUser?._id || 'anonymous',
          name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Anonymous User',
          avatar: currentUser?.photoURL || currentUser?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
          bio: currentUser ? `${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})` : 'Guest Contributor',
          email: currentUser?.email || ''
        },
        source: '',
        sourceLink: '',
        isPublished: true
      };
      
      console.log("Current user info:", currentUser);
      console.log("Blog author info:", blogData.author);
      
      // Try to submit to the API first
      try {
        const response = await fetch('http://localhost:3250/api/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(blogData),
          credentials: 'include'
        });
        
        if (response.ok) {
          // Successfully saved to database
          console.log('Blog saved to database successfully');
          setSuccessMessage('Your blog post has been submitted successfully and is published to the database.');
        } else {
          // If API submission fails, store in localStorage as fallback
          console.error('Failed to save blog to database. Falling back to localStorage.');
          const newBlog = {
            ...blogData,
            id: Date.now(), // Generate a unique ID for localStorage
            date: new Date().toISOString().split('T')[0]
          };
          
          const existingBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
          localStorage.setItem('userBlogs', JSON.stringify([...existingBlogs, newBlog]));
          
          setSuccessMessage('Your blog post has been saved locally and will be synced when connection is restored.');
        }
      } catch (error) {
        // If API request fails, store in localStorage
        console.error('Error saving blog to database:', error);
        const newBlog = {
          ...blogData,
          id: Date.now(), // Generate a unique ID for localStorage
          date: new Date().toISOString().split('T')[0]
        };
        
        const existingBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
        localStorage.setItem('userBlogs', JSON.stringify([...existingBlogs, newBlog]));
        
        setSuccessMessage('Your blog post has been saved locally and will be synced when connection is restored.');
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/blog');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting blog post:', error);
      setErrors({ submit: 'Failed to submit blog post. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // List of categories
  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Internships', label: 'Internships' },
    { value: 'Career Tips', label: 'Career Tips' },
    { value: 'Market Trends', label: 'Market Trends' },
    { value: 'Education', label: 'Education' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-white mb-6 hover:text-blue-200 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Blogs
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Write a Blog Post</h1>
          <p className="text-blue-100 mt-2">Share your knowledge, experiences, and insights with the community</p>
        </div>
      </div>
      
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-lg">
            <p className="font-medium">{successMessage}</p>
            <p className="text-sm mt-1">You will be redirected to the blog page shortly.</p>
          </div>
        )}
        
        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-10 text-gray-800">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Blog Title*
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter a compelling title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              
              {/* Subtitle */}
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle*
                </label>
                <input
                  type="text"
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className={`w-full px-4 py-2 border ${errors.subtitle ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="A brief subtitle that summarizes your post"
                />
                {errors.subtitle && <p className="mt-1 text-sm text-red-500">{errors.subtitle}</p>}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
              
              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tags relevant to your post"
                    onKeyPress={(e) => e.key === 'Enter' ? handleAddTag(e) : null}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                {/* Display added tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <div key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                      <span className="mr-1">{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-800 hover:text-blue-600"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image*
                </label>
                <div className={`border-2 border-dashed ${errors.image ? 'border-red-500' : 'border-gray-300'} rounded-lg p-6 text-center`}>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded" />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          Upload Image
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
                {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
              </div>
              
              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content*
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="10"
                  className={`w-full px-4 py-2 border ${errors.content ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Write your blog post content here. You can use HTML tags for basic formatting."
                ></textarea>
                {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  Tip: You can use HTML tags like &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, and &lt;strong&gt; for formatting.
                </p>
              </div>
              
              {/* Submit Button */}
              <div className="border-t border-gray-200 pt-6">
                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {errors.submit}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Link 
                    to="/blog" 
                    className="mr-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Blog Post'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default AddBlog; 