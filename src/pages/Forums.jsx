import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { FaSearch, FaUser, FaRegComment, FaEye, FaClock, FaPlus } from 'react-icons/fa';

function Forums() {
  // State for categories and forums
  const [categories, setCategories] = useState([]);
  const [forumTopics, setForumTopics] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Sample data
  const sampleCategories = [
    { id: 'all', name: 'All Categories', icon: '🌐' },
    { id: 'career-guidance', name: 'Career Guidance', icon: '🧭' },
    { id: 'college-admissions', name: 'College Admissions', icon: '🎓' },
    { id: 'internships', name: 'Internship Opportunities', icon: '💼' },
    { id: 'tech-careers', name: 'Technology Careers', icon: '💻' },
    { id: 'skill-development', name: 'Skill Development', icon: '🚀' },
    { id: 'job-search', name: 'Job Search Tips', icon: '🔍' },
    { id: 'interview-prep', name: 'Interview Preparation', icon: '🗣️' },
  ];

  const sampleForumTopics = [
    {
      id: 1,
      category: 'tech-careers',
      title: 'Is a Computer Science degree still worth it in 2023?',
      author: 'Rahul Sharma',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: '2023-05-10T12:34:56',
      comments: 24,
      views: 345,
      isPinned: true,
      isHot: true,
      lastActivity: '2023-05-15T09:23:45',
      excerpt: 'With the rise of bootcamps and self-taught developers, I\'m wondering if a traditional CS degree is still valuable...'
    },
    {
      id: 2,
      category: 'career-guidance',
      title: 'Switching from Engineering to Product Management',
      author: 'Priya Patel',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: '2023-05-08T10:15:30',
      comments: 18,
      views: 212,
      isPinned: false,
      isHot: true,
      lastActivity: '2023-05-14T16:42:12',
      excerpt: 'After 5 years as a software engineer, I\'m considering a switch to product management. Looking for advice on this transition...'
    },
    {
      id: 3,
      category: 'internships',
      title: 'Summer Internship opportunities for 2nd year students',
      author: 'Arjun Singh',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      date: '2023-05-05T14:22:18',
      comments: 32,
      views: 456,
      isPinned: true,
      isHot: false,
      lastActivity: '2023-05-15T11:30:00',
      excerpt: 'I\'m currently in my second year of BTech and looking for summer internship opportunities. Any recommendations for...'
    },
    {
      id: 4,
      category: 'college-admissions',
      title: 'How important are extracurriculars for IIT admissions?',
      author: 'Ananya Gupta',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      date: '2023-05-03T09:17:43',
      comments: 27,
      views: 389,
      isPinned: false,
      isHot: false,
      lastActivity: '2023-05-14T18:55:23',
      excerpt: 'I\'m preparing for IIT-JEE and focusing mainly on academics. How important are extracurricular activities for...'
    },
    {
      id: 5,
      category: 'skill-development',
      title: 'Best resources to learn Data Science in 2023',
      author: 'Vikram Malhotra',
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
      date: '2023-05-01T16:45:22',
      comments: 19,
      views: 276,
      isPinned: false,
      isHot: true,
      lastActivity: '2023-05-13T12:34:56',
      excerpt: 'I\'m looking to upskill in Data Science and Machine Learning. What are the most up-to-date resources you would recommend?'
    },
    {
      id: 6,
      category: 'job-search',
      title: 'How to build a standout resume as a fresh graduate',
      author: 'Nisha Reddy',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
      date: '2023-04-29T11:32:09',
      comments: 22,
      views: 301,
      isPinned: false,
      isHot: false,
      lastActivity: '2023-05-12T10:23:45',
      excerpt: 'I\'m graduating next month and starting my job search. What are some tips to make my resume stand out despite having limited experience?'
    },
    {
      id: 7,
      category: 'interview-prep',
      title: 'Common behavioral interview questions and how to answer them',
      author: 'Karan Kapoor',
      avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
      date: '2023-04-25T13:54:36',
      comments: 35,
      views: 412,
      isPinned: false,
      isHot: true,
      lastActivity: '2023-05-14T09:12:34',
      excerpt: 'I\'ve got technical interviews down, but I struggle with behavioral questions. Can anyone share common questions and effective ways to answer them?'
    },
    {
      id: 8,
      category: 'tech-careers',
      title: 'Future scope of AI and ML in India',
      author: 'Deepak Joshi',
      avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
      date: '2023-04-22T10:11:22',
      comments: 29,
      views: 356,
      isPinned: false,
      isHot: false,
      lastActivity: '2023-05-10T15:43:21',
      excerpt: 'What does the future look like for AI and ML professionals in India? Which industries are adopting these technologies the fastest?'
    }
  ];

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCategories(sampleCategories);
      setForumTopics(sampleForumTopics);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Filter topics based on active category and search query
  const filteredTopics = forumTopics.filter(topic => {
    const matchesCategory = activeCategory === 'all' || topic.category === activeCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          topic.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl font-bold text-white">Discussion Forums</h1>
          <p className="text-purple-100 mt-2 max-w-3xl">
            Join the conversation with fellow students, mentors, and industry professionals. Ask questions, share experiences, and learn from the community.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search discussions..."
                className="w-full px-5 py-4 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-6">
                <Link 
                  to="/forums/new" 
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  <span>Start New Discussion</span>
                </Link>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
              
              <nav className="space-y-2">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  ))
                ) : (
                  categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeCategory === category.id
                          ? 'bg-purple-100 text-purple-800'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))
                )}
              </nav>
              
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Forum Statistics</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Total Topics:</span>
                    <span className="font-medium text-gray-900">128</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Posts:</span>
                    <span className="font-medium text-gray-900">1,245</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span className="font-medium text-gray-900">3,872</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Newest Member:</span>
                    <span className="font-medium text-purple-600">Anika R.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-xl shadow-md">
              {/* Category Title */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {categories.find(cat => cat.id === activeCategory)?.name || 'All Discussions'}
                </h2>
              </div>
              
              {/* Topics List */}
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="mt-4 flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTopics.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-7xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No discussions found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 
                      `No results match your search "${searchQuery}"` : 
                      'No discussions in this category yet'}
                  </p>
                  <Link 
                    to="/forums/new" 
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    <span>Start the first discussion</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredTopics.map(topic => (
                    <div key={topic.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        <img 
                          src={topic.avatar} 
                          alt={topic.author} 
                          className="w-10 h-10 rounded-full mr-4"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {topic.isPinned && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                Pinned
                              </span>
                            )}
                            {topic.isHot && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                Hot
                              </span>
                            )}
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              {categories.find(cat => cat.id === topic.category)?.name}
                            </span>
                          </div>
                          
                          <Link 
                            to={`/forums/topic/${topic.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-purple-600 transition-colors"
                          >
                            {topic.title}
                          </Link>
                          
                          <p className="text-gray-600 mt-2">{topic.excerpt}</p>
                          
                          <div className="flex flex-wrap items-center text-sm text-gray-500 mt-3 gap-4">
                            <div className="flex items-center">
                              <FaUser className="mr-1 text-gray-400" />
                              <span>{topic.author}</span>
                            </div>
                            <div className="flex items-center">
                              <FaRegComment className="mr-1 text-gray-400" />
                              <span>{topic.comments} comments</span>
                            </div>
                            <div className="flex items-center">
                              <FaEye className="mr-1 text-gray-400" />
                              <span>{topic.views} views</span>
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-1 text-gray-400" />
                              <span>Last activity {formatRelativeTime(topic.lastActivity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination (if needed) */}
              {!isLoading && filteredTopics.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredTopics.length} of {forumTopics.length} discussions
                  </div>
                  <div className="flex">
                    <button className="px-3 py-1 border border-gray-300 rounded-l-lg text-gray-600 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 border-l-0 bg-purple-100 text-purple-700">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-300 border-l-0 text-gray-600 hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 border border-gray-300 border-l-0 text-gray-600 hover:bg-gray-50">
                      3
                    </button>
                    <button className="px-3 py-1 border border-gray-300 border-l-0 rounded-r-lg text-gray-600 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Forums; 