import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { 
  FaArrowLeft, FaUser, FaThumbsUp, FaRegComment, FaEye, FaClock, 
  FaShare, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaFlag,
  FaReply, FaPaperclip, FaBold, FaItalic, FaListUl, FaQuoteRight
} from 'react-icons/fa';

function ForumTopic() {
  const { topicId } = useParams();
  const { currentUser } = useAuth();
  
  // States
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Sample categories
  const categories = [
    { id: 'all', name: 'All Categories', icon: '🌐' },
    { id: 'career-guidance', name: 'Career Guidance', icon: '🧭' },
    { id: 'college-admissions', name: 'College Admissions', icon: '🎓' },
    { id: 'internships', name: 'Internship Opportunities', icon: '💼' },
    { id: 'tech-careers', name: 'Technology Careers', icon: '💻' },
    { id: 'skill-development', name: 'Skill Development', icon: '🚀' },
    { id: 'job-search', name: 'Job Search Tips', icon: '🔍' },
    { id: 'interview-prep', name: 'Interview Preparation', icon: '🗣️' },
  ];

  // Sample topic data
  const sampleTopic = {
    id: 1,
    category: 'tech-careers',
    title: 'Is a Computer Science degree still worth it in 2023?',
    content: `
      <p>Hello everyone,</p>
      
      <p>I'm currently in my final year of high school and trying to decide on my future education path. I've always been interested in programming and technology, but recently I've been hearing mixed opinions about the value of a traditional CS degree.</p>
      
      <p>With the rise of bootcamps, self-taught developers, and online learning platforms, I'm wondering if investing 4 years and a significant amount of money in a CS degree is still the best route.</p>
      
      <p>Some specific questions I have:</p>
      
      <ul>
        <li>How do employers currently view CS degrees vs. alternative education paths?</li>
        <li>Are there certain roles in tech that still strongly prefer or require a CS degree?</li>
        <li>For those working in the industry, how much of what you learned in your CS degree do you actually apply in your day-to-day work?</li>
        <li>If you were in my position today, would you still choose to pursue a CS degree?</li>
      </ul>
      
      <p>I'm particularly interested in web development and AI/ML fields, if that makes any difference to your advice.</p>
      
      <p>Thanks in advance for your insights!</p>
    `,
    author: 'Rahul Sharma',
    authorRole: 'Student',
    authorJoinDate: '2022-10-15',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: '2023-05-10T12:34:56',
    comments: 6,
    views: 345,
    likes: 27,
    isPinned: true,
    isHot: true,
    lastActivity: '2023-05-15T09:23:45'
  };

  // Sample replies
  const sampleReplies = [
    {
      id: 1,
      author: 'Dr. Priya Mehta',
      authorRole: 'Mentor | Professor at IIT Delhi',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: '2023-05-10T14:22:30',
      content: `
        <p>This is a great question and one that I get asked frequently by students.</p>
        
        <p>From an academic and industry perspective, I still believe a CS degree offers significant value that's hard to replicate through other means:</p>
        
        <ul>
          <li><strong>Depth of knowledge:</strong> A good CS program teaches you fundamental concepts and theories that give you a deeper understanding of how and why things work.</li>
          <li><strong>Breadth of exposure:</strong> You'll be exposed to multiple areas within CS, which helps you make more informed decisions about specialization.</li>
          <li><strong>Networking:</strong> The connections you make with professors and peers can be invaluable for your career.</li>
          <li><strong>Research opportunities:</strong> If you're interested in cutting-edge fields like AI/ML, university research experience can be particularly valuable.</li>
        </ul>
        
        <p>That said, a degree is not the only path. The field of CS is constantly evolving, and self-motivation and continuous learning are perhaps more important than your initial education path.</p>
        
        <p>For AI/ML specifically, the mathematical foundations taught in a formal CS or related degree program are quite valuable. Many advanced roles in this field still prefer candidates with at least a master's degree.</p>
      `,
      likes: 18,
      isBestAnswer: true
    },
    {
      id: 2,
      author: 'Vikram Singh',
      authorRole: 'Software Engineer at Google',
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
      date: '2023-05-10T15:45:10',
      content: `
        <p>As someone who has been in the industry for 8+ years and has interviewed countless candidates, I can offer a perspective from the hiring side.</p>
        
        <p>The truth is that it depends on the company and role. At larger tech companies like FAANG, having a CS degree still gives you an edge, especially for entry-level positions. The structured technical interviews often test CS fundamentals that are thoroughly covered in degree programs.</p>
        
        <p>However, I've also worked with brilliant developers who are self-taught or came from bootcamps. What ultimately matters is your ability to solve problems and write good code.</p>
        
        <p>If you're specifically interested in web development, you can absolutely succeed without a CS degree. For AI/ML, as Dr. Mehta mentioned, the theoretical foundation provided by formal education is more valuable.</p>
        
        <p>My advice would be to consider your learning style, financial situation, and long-term goals. If you can afford it and enjoy structured learning environments, a CS degree is still a solid investment. If you're self-motivated and learn well independently, alternative paths can also lead to success.</p>
      `,
      likes: 12,
      isBestAnswer: false
    },
    {
      id: 3,
      author: 'Ananya Gupta',
      authorRole: 'Bootcamp Graduate | Frontend Developer',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      date: '2023-05-10T18:12:45',
      content: `
        <p>I chose the bootcamp route after getting a non-CS bachelor's degree, and I want to share my experience.</p>
        
        <p>Pros of my path:</p>
        <ul>
          <li>Quicker entry into the job market (6 months vs. 4 years)</li>
          <li>More focused learning relevant to my specific career goals</li>
          <li>Lower cost than a full degree</li>
          <li>Practical, project-based learning</li>
        </ul>
        
        <p>Cons:</p>
        <ul>
          <li>Had to work harder to learn CS fundamentals on my own</li>
          <li>Some companies automatically filtered me out in application processes</li>
          <li>Missing some theoretical knowledge that occasionally becomes relevant</li>
          <li>Had to prove myself more in interviews and on the job initially</li>
        </ul>
        
        <p>For web development specifically, I don't feel disadvantaged by not having a CS degree. However, I do sometimes wonder if I missed out on valuable networking and internship opportunities that university students have access to.</p>
        
        <p>Whatever path you choose, be prepared to continuously learn throughout your career!</p>
      `,
      likes: 9,
      isBestAnswer: false
    }
  ];

  // Load data
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTopic(sampleTopic);
      setReplies(sampleReplies);
      setIsLoading(false);
    };
    
    loadData();
  }, [topicId]);

  // Handle reply submission
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;
    
    // In a real app, you would submit the reply to an API
    // For this demo, we'll just add it to the local state
    
    const newReply = {
      id: replies.length + 1,
      author: currentUser ? currentUser.displayName : 'Guest User',
      authorRole: 'Member',
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      date: new Date().toISOString(),
      content: `<p>${replyContent}</p>`,
      likes: 0,
      isBestAnswer: false
    };
    
    setReplies([...replies, newReply]);
    setReplyContent('');
    setShowReplyForm(false);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link 
            to="/forums" 
            className="inline-flex items-center text-white mb-4 hover:text-purple-200 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Forums
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{topic.title}</h1>
          <div className="flex items-center mt-3">
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded mr-2">
              {categories.find(cat => cat.id === topic.category)?.name}
            </span>
            {topic.isPinned && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mr-2">
                Pinned
              </span>
            )}
            {topic.isHot && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Hot
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="md:w-3/4">
            {/* Original Post */}
            <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center">
                  <FaUser className="text-gray-400 mr-2" />
                  <span className="text-sm">Posted by <span className="font-medium text-gray-900">{topic.author}</span></span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(topic.date)}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row">
                  {/* Author Info */}
                  <div className="md:w-1/5 mb-6 md:mb-0">
                    <div className="flex flex-col items-center text-center">
                      <img 
                        src={topic.avatar} 
                        alt={topic.author} 
                        className="w-20 h-20 rounded-full mb-2"
                      />
                      <h3 className="font-medium text-gray-900">{topic.author}</h3>
                      <span className="text-sm text-purple-600">{topic.authorRole}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        Member since {new Date(topic.authorJoinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-500">
                        <div>Posts: 24</div>
                        <div>Replies: 85</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <div className="md:w-4/5 md:pl-6 md:border-l md:border-gray-200">
                    <div 
                      className="prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: topic.content }}
                    />
                    
                    {/* Post Actions */}
                    <div className="flex flex-wrap items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center text-gray-500 hover:text-purple-600">
                          <FaThumbsUp className="mr-1" />
                          <span>Like ({topic.likes})</span>
                        </button>
                        
                        <div className="relative">
                          <button 
                            className="flex items-center text-gray-500 hover:text-purple-600"
                            onClick={() => setShowShareOptions(!showShareOptions)}
                          >
                            <FaShare className="mr-1" />
                            <span>Share</span>
                          </button>
                          
                          {showShareOptions && (
                            <div className="absolute top-full left-0 mt-2 bg-white shadow-md rounded-lg p-3 z-10">
                              <div className="flex space-x-2">
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                                  <FaFacebook />
                                </button>
                                <button className="p-2 text-blue-400 hover:bg-blue-50 rounded-full">
                                  <FaTwitter />
                                </button>
                                <button className="p-2 text-blue-700 hover:bg-blue-50 rounded-full">
                                  <FaLinkedin />
                                </button>
                                <button className="p-2 text-green-500 hover:bg-green-50 rounded-full">
                                  <FaWhatsapp />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="flex items-center text-gray-500 hover:text-purple-600"
                          onClick={() => setShowReplyForm(true)}
                        >
                          <FaReply className="mr-1" />
                          <span>Reply</span>
                        </button>
                      </div>
                      
                      <button className="flex items-center text-gray-500 hover:text-red-500">
                        <FaFlag className="mr-1" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Topic Stats */}
            <div className="bg-white rounded-xl shadow-md mb-6 p-4">
              <div className="flex flex-wrap items-center justify-between text-sm">
                <div className="flex items-center mr-4">
                  <FaRegComment className="text-gray-400 mr-2" />
                  <span>{replies.length} Replies</span>
                </div>
                <div className="flex items-center mr-4">
                  <FaEye className="text-gray-400 mr-2" />
                  <span>{topic.views} Views</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-gray-400 mr-2" />
                  <span>Last activity {formatDate(topic.lastActivity)}</span>
                </div>
              </div>
            </div>
            
            {/* Replies Section */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Replies</h2>
            
            {replies.map((reply) => (
              <div key={reply.id} className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-2" />
                    <span className="text-sm">Reply by <span className="font-medium text-gray-900">{reply.author}</span></span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(reply.date)}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col md:flex-row">
                    {/* Author Info */}
                    <div className="md:w-1/5 mb-6 md:mb-0">
                      <div className="flex flex-col items-center text-center">
                        <img 
                          src={reply.avatar} 
                          alt={reply.author} 
                          className="w-16 h-16 rounded-full mb-2"
                        />
                        <h3 className="font-medium text-gray-900">{reply.author}</h3>
                        <span className="text-xs text-purple-600">{reply.authorRole}</span>
                        
                        {reply.isBestAnswer && (
                          <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Best Answer
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Reply Content */}
                    <div className="md:w-4/5 md:pl-6 md:border-l md:border-gray-200">
                      <div 
                        className="prose prose-blue max-w-none"
                        dangerouslySetInnerHTML={{ __html: reply.content }}
                      />
                      
                      {/* Reply Actions */}
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center text-gray-500 hover:text-purple-600">
                            <FaThumbsUp className="mr-1" />
                            <span>Like ({reply.likes})</span>
                          </button>
                          
                          <button 
                            className="flex items-center text-gray-500 hover:text-purple-600"
                            onClick={() => setShowReplyForm(true)}
                          >
                            <FaReply className="mr-1" />
                            <span>Reply</span>
                          </button>
                        </div>
                        
                        <button className="flex items-center text-gray-500 hover:text-red-500">
                          <FaFlag className="mr-1" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Reply Form */}
            {showReplyForm ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Post a Reply</h3>
                <form onSubmit={handleSubmitReply}>
                  <div className="mb-4">
                    {/* Simple editor controls */}
                    <div className="flex items-center mb-2 space-x-2 border-b border-gray-200 pb-2">
                      <button type="button" className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded">
                        <FaBold />
                      </button>
                      <button type="button" className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded">
                        <FaItalic />
                      </button>
                      <button type="button" className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded">
                        <FaListUl />
                      </button>
                      <button type="button" className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded">
                        <FaQuoteRight />
                      </button>
                      <button type="button" className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded">
                        <FaPaperclip />
                      </button>
                    </div>
                    
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px]"
                      placeholder="Write your reply here..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(false)}
                      className="mr-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Post Reply
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <p className="text-gray-600 mb-4">Have something to contribute to this discussion?</p>
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Post a Reply
                </button>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About This Forum</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Category</h4>
                  <p className="text-sm text-gray-600">{categories.find(cat => cat.id === topic.category)?.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Created</h4>
                  <p className="text-sm text-gray-600">{formatDate(topic.date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Last Activity</h4>
                  <p className="text-sm text-gray-600">{formatDate(topic.lastActivity)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Replies</h4>
                  <p className="text-sm text-gray-600">{replies.length}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Views</h4>
                  <p className="text-sm text-gray-600">{topic.views}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Related Discussions</h3>
              <div className="space-y-4">
                <Link to="/forums/topic/2" className="block">
                  <h4 className="text-sm font-medium text-gray-900 hover:text-purple-600">How important is math for a career in programming?</h4>
                  <p className="text-xs text-gray-500 mt-1">15 replies • 2 days ago</p>
                </Link>
                <Link to="/forums/topic/3" className="block">
                  <h4 className="text-sm font-medium text-gray-900 hover:text-purple-600">Best online courses for beginners in web development</h4>
                  <p className="text-xs text-gray-500 mt-1">8 replies • 3 days ago</p>
                </Link>
                <Link to="/forums/topic/4" className="block">
                  <h4 className="text-sm font-medium text-gray-900 hover:text-purple-600">Career paths after B.Tech in Computer Science</h4>
                  <p className="text-xs text-gray-500 mt-1">22 replies • 1 week ago</p>
                </Link>
                <Link to="/forums/topic/5" className="block">
                  <h4 className="text-sm font-medium text-gray-900 hover:text-purple-600">IIT vs. BITS vs. NITs - Which is best for CS?</h4>
                  <p className="text-xs text-gray-500 mt-1">45 replies • 2 weeks ago</p>
                </Link>
              </div>
              <Link 
                to="/forums" 
                className="mt-4 text-sm text-purple-600 hover:text-purple-800 inline-block"
              >
                View all discussions →
              </Link>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Need Professional Guidance?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Connect with our expert mentors for personalized career advice tailored to your needs.
              </p>
              <Link 
                to="/find-mentors" 
                className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Find a Mentor
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default ForumTopic; 