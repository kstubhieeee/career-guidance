import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { FaSearch, FaCalendarAlt, FaUser, FaTags, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Sample blog data (would be fetched from an API in a real app)
export const sampleBlogs = [
  {
    id: 1,
    title: "The Future of AI in Career Development",
    subtitle: "How artificial intelligence is reshaping career paths",
    content: `<p>Artificial Intelligence is revolutionizing how we think about career development and job searching. From AI-powered resume screening to predictive career path analysis, the technology is creating both challenges and opportunities for job seekers.</p>
    
    <p>Recent studies show that 67% of HR professionals now use AI tools to screen candidates, while 89% of job seekers believe AI will significantly impact their career trajectories over the next decade. This shift is especially relevant for students and recent graduates who are entering a job market increasingly mediated by intelligent systems.</p>
    
    <h3>Key AI Technologies Influencing Careers</h3>
    
    <p>Several AI technologies are particularly influential in the career landscape:</p>
    
    <ul>
      <li><strong>Natural Language Processing (NLP)</strong>: Used in resume screening and job matching</li>
      <li><strong>Predictive Analytics</strong>: Forecasting industry trends and skill demands</li>
      <li><strong>Recommendation Systems</strong>: Suggesting personalized career paths based on skills and interests</li>
      <li><strong>Automated Assessment</strong>: Evaluating soft skills and cultural fit through video interviews</li>
    </ul>
    
    <p>For students preparing to enter the workforce, developing technical literacy in these areas can provide a significant advantage. Understanding how AI systems evaluate resumes and applications can help candidates optimize their materials for both human and algorithmic readers.</p>
    
    <h3>Preparing for an AI-Influenced Career Landscape</h3>
    
    <p>To thrive in this evolving environment, consider the following strategies:</p>
    
    <ol>
      <li>Develop a baseline understanding of AI technologies and their applications in your field</li>
      <li>Focus on uniquely human skills like creativity, emotional intelligence, and complex problem-solving</li>
      <li>Create a digital portfolio that showcases your work in formats that AI systems can analyze effectively</li>
      <li>Use AI tools proactively in your job search rather than simply responding to them</li>
    </ol>
    
    <p>As AI continues to reshape career development, the most successful professionals will be those who understand how to work alongside these technologies rather than competing against them.</p>`,
    image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    date: "2023-03-15",
    author: {
      name: "Dr. Rajesh Kumar",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "AI Researcher and Career Counselor"
    },
    category: "Technology",
    tags: ["Artificial Intelligence", "Career Development", "Future of Work"],
    source: "AI Today Research",
    sourceLink: "https://example.com/ai-research"
  },
  {
    id: 2,
    title: "Top Summer Internship Opportunities for 2023",
    subtitle: "Comprehensive guide to securing valuable internship experience",
    content: `<p>Summer internships remain one of the most effective ways for students to gain practical experience, build professional networks, and test-drive potential career paths. This comprehensive guide highlights the most competitive and rewarding internship opportunities available for the summer of 2023.</p>
    
    <h3>Technology Sector</h3>
    
    <p>Tech internships continue to offer some of the most competitive compensation and learning opportunities:</p>
    
    <ul>
      <li><strong>Google STEP Program</strong>: Aimed at first and second-year undergraduate students, offering mentorship and real-world project experience</li>
      <li><strong>Microsoft Explore</strong>: A 12-week program rotating through software development, program management, and UX design</li>
      <li><strong>Amazon Future Engineer</strong>: Focused on students from underrepresented backgrounds interested in computer science</li>
      <li><strong>Indian tech startups</strong>: Companies like Razorpay, Cred, and Zerodha offer intensive learning experiences with significant responsibility</li>
    </ul>
    
    <h3>Finance and Consulting</h3>
    
    <p>For business-minded students, these opportunities provide exceptional training:</p>
    
    <ul>
      <li><strong>JP Morgan Summer Analyst Program</strong>: A highly structured program across multiple business lines</li>
      <li><strong>McKinsey Summer Business Analyst</strong>: Work alongside consultants on real client engagements</li>
      <li><strong>Goldman Sachs Summer Internship</strong>: Offers rotations through various investment banking functions</li>
    </ul>
    
    <h3>Application Strategies</h3>
    
    <p>Competition for premier internships is intense. To maximize your chances:</p>
    
    <ol>
      <li>Apply early - most programs open applications 6-8 months before the internship start date</li>
      <li>Customize your resume for each application, highlighting relevant coursework and projects</li>
      <li>Prepare for technical interviews with practice problems and mock interviews</li>
      <li>Leverage your university's alumni network for referrals</li>
      <li>Develop a compelling personal story that explains your interest in the specific company</li>
    </ol>
    
    <p>Remember that smaller companies and startups often offer equally valuable experiences with less competition. Consider balancing your applications between high-profile companies and emerging organizations in your field of interest.</p>`,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
    date: "2023-02-28",
    author: {
      name: "Priya Sharma",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      bio: "Career Counselor at Delhi University"
    },
    category: "Internships",
    tags: ["Internships", "Summer Programs", "Career Development"],
    source: "Career Development Center",
    sourceLink: "https://example.com/career-center"
  },
  {
    id: 3,
    title: "Emerging Technology Fields in India: 2023 and Beyond",
    subtitle: "The most promising tech sectors for career growth in the Indian market",
    content: `<p>India's technology landscape is evolving rapidly, creating new career opportunities across multiple sectors. Understanding these emerging fields can help students and professionals make informed decisions about specialization and skill development.</p>
    
    <h3>1. Quantum Computing</h3>
    
    <p>India is making significant investments in quantum technology, with the government allocating ₹8,000 crore for the National Mission on Quantum Technologies and Applications. Companies like TCS, Infosys, and Tech Mahindra are building quantum computing capabilities, creating demand for:</p>
    
    <ul>
      <li>Quantum algorithm developers</li>
      <li>Quantum hardware engineers</li>
      <li>Quantum security specialists</li>
    </ul>
    
    <p>Educational requirements typically include advanced degrees in physics, computer science, or mathematics, though specialized quantum computing courses are increasingly available through platforms like NPTEL and Coursera.</p>
    
    <h3>2. Green Technology</h3>
    
    <p>With India committing to net-zero emissions by 2070, green technology is experiencing unprecedented growth. Key areas include:</p>
    
    <ul>
      <li><strong>Renewable Energy</strong>: Solar and wind power engineering and implementation</li>
      <li><strong>Energy Storage</strong>: Battery technology and alternative storage solutions</li>
      <li><strong>Sustainable Transportation</strong>: Electric vehicles and charging infrastructure</li>
      <li><strong>Smart Grid Technology</strong>: Optimizing energy distribution and consumption</li>
    </ul>
    
    <p>Companies like ReNew Power, Tata Power Solar, and Ola Electric are leading employers in this space, with opportunities for engineers, data scientists, and project managers.</p>
    
    <h3>3. Health Technology</h3>
    
    <p>The pandemic accelerated digital transformation in healthcare, creating sustained demand for health technology solutions. Growing areas include:</p>
    
    <ul>
      <li>Telemedicine platforms and infrastructure</li>
      <li>AI-powered diagnostic tools</li>
      <li>Electronic health records systems</li>
      <li>Wearable health monitoring devices</li>
    </ul>
    
    <p>Startups like Practo, PharmEasy, and Portea Medical are expanding rapidly, while established players like Apollo Hospitals are investing heavily in digital health initiatives.</p>
    
    <h3>4. Cybersecurity</h3>
    
    <p>As digital adoption increases across sectors, cybersecurity has become critical. India faces a significant skills gap in this area, with over 500,000 unfilled cybersecurity positions. Specialized roles in high demand include:</p>
    
    <ul>
      <li>Cloud security architects</li>
      <li>Security operations center (SOC) analysts</li>
      <li>Application security engineers</li>
      <li>Cyber forensics specialists</li>
    </ul>
    
    <p>Certifications like CISSP, CEH, and CompTIA Security+ can significantly enhance employability in this field, which offers some of the highest compensation packages in the technology sector.</p>`,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    date: "2023-01-20",
    author: {
      name: "Vikram Mehta",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      bio: "Technology Analyst and Career Consultant"
    },
    category: "Technology",
    tags: ["Emerging Technologies", "Career Growth", "Indian Tech Market"],
    source: "Indian Tech Trends Report",
    sourceLink: "https://example.com/tech-trends"
  },
  {
    id: 4,
    title: "Building a Portfolio That Stands Out: A Guide for Students",
    subtitle: "Beyond academics: Showcasing your skills effectively to potential employers",
    content: `<p>In today's competitive job market, academic qualifications alone are rarely sufficient to secure desirable positions. Employers increasingly look for evidence of practical skills, initiative, and the ability to apply classroom knowledge to real-world situations. A well-crafted portfolio addresses these needs by providing tangible proof of your capabilities.</p>
    
    <h3>Why Portfolios Matter</h3>
    
    <p>Unlike resumes, which provide a high-level overview of your experience, portfolios offer depth and context. They allow you to:</p>
    
    <ul>
      <li>Demonstrate the process behind your work, not just the outcomes</li>
      <li>Showcase skills that might not be evident from academic credentials</li>
      <li>Provide evidence of your problem-solving approach</li>
      <li>Express your professional identity and values</li>
    </ul>
    
    <h3>Essential Elements for Student Portfolios</h3>
    
    <p>Regardless of your field, effective portfolios typically include:</p>
    
    <ol>
      <li><strong>Case studies or project breakdowns</strong>: Detailed analyses of significant projects, including objectives, methodologies, challenges, and solutions</li>
      <li><strong>Technical samples</strong>: Code repositories, design files, writing samples, or other field-specific work products</li>
      <li><strong>Process documentation</strong>: Sketches, wireframes, outlines, or other materials showing how you approach problems</li>
      <li><strong>Results and impacts</strong>: Quantifiable outcomes or testimonials demonstrating the effectiveness of your work</li>
      <li><strong>Personal statement</strong>: An articulation of your professional interests, values, and aspirations</li>
    </ol>
    
    <h3>Digital Portfolio Platforms</h3>
    
    <p>Several platforms are particularly well-suited for student portfolios:</p>
    
    <ul>
      <li><strong>GitHub</strong>: Essential for computer science and software engineering students</li>
      <li><strong>Behance or Dribbble</strong>: Ideal for design-focused portfolios</li>
      <li><strong>WordPress</strong>: Versatile option suitable for various disciplines</li>
      <li><strong>LinkedIn</strong>: Underutilized portfolio features that integrate with your professional profile</li>
      <li><strong>Medium</strong>: Excellent for writing-intensive fields</li>
    </ul>
    
    <h3>Field-Specific Advice</h3>
    
    <h4>Engineering and Computer Science</h4>
    <p>Focus on demonstrating technical proficiency through actual code samples or engineering projects. Include explanations accessible to non-technical recruiters while providing sufficient technical depth for specialist reviewers.</p>
    
    <h4>Business and Management</h4>
    <p>Highlight case competitions, business analyses, and leadership experiences. Quantify results wherever possible, and demonstrate analytical capabilities through data visualization and insight generation.</p>
    
    <h4>Creative Fields</h4>
    <p>Curate carefully rather than including everything you've created. Show range while maintaining a coherent personal style. Include context about briefs or constraints for each project.</p>`,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    date: "2023-02-10",
    author: {
      name: "Arjun Nair",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      bio: "Career Development Specialist"
    },
    category: "Career Tips",
    tags: ["Portfolio Development", "Job Search", "Personal Branding"],
    source: "Career Advancement Institute",
    sourceLink: "https://example.com/portfolio-guide"
  }
];

// Categories for filtering
const categories = [
  { name: "All Categories", value: "all" },
  { name: "Technology", value: "Technology" },
  { name: "Internships", value: "Internships" },
  { name: "Career Tips", value: "Career Tips" },
  { name: "Market Trends", value: "Market Trends" }
];

function Blog() {
  const { currentUser } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  // Fetch blogs (simulating API call with sample data)
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Try to fetch blogs from the API
        const response = await fetch('http://localhost:3250/api/blogs');
        if (response.ok) {
          const data = await response.json();
          setBlogs(data.blogs);
          setFilteredBlogs(data.blogs);
        } else {
          // If API fails, fall back to local data
          console.error('Failed to fetch blogs from API. Using local data instead.');
          // Get user blogs from localStorage as fallback
          const userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
          // Combine sample blogs with user blogs
          const allBlogs = [...sampleBlogs, ...userBlogs];
          setBlogs(allBlogs);
          setFilteredBlogs(allBlogs);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        // Fallback to local data in case of error
        const userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
        const allBlogs = [...sampleBlogs, ...userBlogs];
        setBlogs(allBlogs);
        setFilteredBlogs(allBlogs);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  // Filter blogs by category and search term
  useEffect(() => {
    let result = blogs;

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(blog => blog.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(term) || 
        blog.subtitle.toLowerCase().includes(term) ||
        blog.content.toLowerCase().includes(term) ||
        blog.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredBlogs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCategory, searchTerm, blogs]);

  // Get current blogs for pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-poppins">Career Guidant Blog</h1>
          <p className="text-xl mb-8 max-w-2xl">
            Insights, opportunities, and guidance for navigating your career journey
          </p>
          
          {/* Search bar */}
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full py-3 px-5 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            {/* Category tabs */}
            <div className="flex overflow-x-auto mb-8 pb-2 scrollbar-hide">
              {categories.map(category => (
                <button
                  key={category.value}
                  className={`px-6 py-2 rounded-full whitespace-nowrap mr-3 ${
                    selectedCategory === category.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Blog Cards */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading articles...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600">No articles found matching your criteria.</p>
                <button 
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {currentBlogs.map(blog => (
                  <div key={blog.id} className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img 
                          src={blog.image} 
                          alt={blog.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center space-x-2 text-sm text-blue-600 mb-3">
                          <span className="px-3 py-1 bg-blue-50 rounded-full">{blog.category}</span>
                          <span className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {blog.date}
                          </span>
                        </div>
                        <h2 className="text-gray-800 text-xl md:text-2xl font-bold mb-2 hover:text-blue-600 transition-colors">
                          <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
                        </h2>
                        <p className="text-gray-600 mb-4">{blog.subtitle}</p>
                        <div className="flex items-center space-x-4 mb-4">
                          <img src={blog.author.avatar} alt={blog.author.name} className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="font-medium text-gray-800">{blog.author.name}</p>
                            <p className="text-sm text-gray-500">{blog.author.bio}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.map((tag, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <Link 
                          to={`/blog/${blog.id}`} 
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Read More <FaChevronRight className="ml-1 text-sm" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {filteredBlogs.length > blogsPerPage && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex rounded-md shadow-sm">
                      <button 
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                            currentPage === number
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-8">
            {/* Write a Blog Panel - Only for mentors */}
            {currentUser?.isMentor && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-md">
                <h3 className="text-xl font-bold mb-3">Share Your Insights</h3>
                <p className="mb-4">
                  Got expertise to share? Write a blog post to help others in their career journey.
                </p>
                <Link 
                  to="/add-blog" 
                  className="inline-block px-5 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Write a Blog
                </Link>
              </div>
            )}
            
            {/* Popular Tags */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-blue-600">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer">
                  #CareerDevelopment
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer">
                  #Internships
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer">
                  #ArtificialIntelligence
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer">
                  #JobSearch
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer">
                  #RemoteWork
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer">
                  #SkillDevelopment
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer">
                  #Networking
                </span>
              </div>
            </div>
            
            {/* Featured Articles */}
            <div className="bg-white rounded-xl p-6 shadow-md text-gray-800">
              <h3 className="text-xl font-bold mb-4 text-blue-600">Featured Articles</h3>
              <div className="space-y-4">
                {blogs.slice(0, 3).map((blog, index) => (
                  <div key={`featured-${blog.title}-${index}`} className="flex space-x-3">
                    <img 
                      src={blog.image} 
                      alt={blog.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0" 
                    />
                    <div>
                      <Link to={`/blog/${blog.id}`} className="font-medium hover:text-blue-600 line-clamp-2">
                        {blog.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{blog.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Advertisement */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-md">
              <div className="text-xs uppercase tracking-wider mb-2">Sponsored</div>
              <h3 className="text-xl font-bold mb-3">Boost Your Technical Skills</h3>
              <p className="mb-4">
                Join our online workshops to master in-demand programming languages and tools.
              </p>
              <a 
                href="https://example.com/workshops" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-5 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Blog; 