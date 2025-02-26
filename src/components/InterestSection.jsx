import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function InterestSection() {
  const [visibleSections, setVisibleSections] = useState({
    science: false,
    technology: false,
    engineering: false,
    arts: false,
    mathematics: false,
    business: false
  });

  const toggleSection = (section) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const careerFields = {
    science: [
      { name: "Geneticist", path: "/mcq" },
      { name: "Environmental Scientist", path: "/mcq" },
      { name: "Microbiologist", path: "/mcq" },
      { name: "Physicist", path: "/mcq" },
      { name: "Biochemist", path: "/mcq" }
    ],
    technology: [
      { name: "Software Developer", path: "/mcq" },
      { name: "Cybersecurity Analyst", path: "/mcq" },
      { name: "Data Scientist", path: "/mcq" },
      { name: "AI/Machine Learning Engineer", path: "/mcq" },
      { name: "IT Support Specialist", path: "/mcq" }
    ],
    engineering: [
      { name: "Civil Engineer", path: "/mcq" },
      { name: "Mechanical Engineer", path: "/mcq" },
      { name: "Electrical Engineer", path: "/mcq" },
      { name: "Chemical Engineer", path: "/mcq" },
      { name: "Aerospace Engineer", path: "/mcq" }
    ],
    arts: [
      { name: "Graphic Designer", path: "/mcq" },
      { name: "Content Writer", path: "/mcq" },
      { name: "Digital Marketer", path: "/mcq" },
      { name: "UX/UI Designer", path: "/mcq" },
      { name: "Multimedia Artist", path: "/mcq" }
    ],
    mathematics: [
      { name: "Statistician", path: "/mcq" },
      { name: "Actuary", path: "/mcq" },
      { name: "Financial Analyst", path: "/mcq" },
      { name: "Mathematician", path: "/mcq" },
      { name: "Operations Research Analyst", path: "/mcq" }
    ],
    business: [
      { name: "Business Analyst", path: "/mcq" },
      { name: "Project Manager", path: "/mcq" },
      { name: "Marketing Manager", path: "/mcq" },
      { name: "Human Resources Manager", path: "/mcq" },
      { name: "Entrepreneur", path: "/mcq" }
    ]
  };

  return (
    <section className="py-16 bg-darkblue">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {Object.entries(careerFields).map(([field, careers]) => (
            <div key={field} className="mb-6">
              <div 
                className="flex justify-between items-center bg-darkblue-light p-4 rounded-lg shadow-sm cursor-pointer hover:bg-darkblue-dark transition-colors border border-gray-700"
                onClick={() => toggleSection(field)}
              >
                <h3 className="text-xl font-bold text-white capitalize">{field}</h3>
                <span className="text-primary">
                  {visibleSections[field] ? (
                    <i className="fas fa-chevron-up"></i>
                  ) : (
                    <i className="fas fa-chevron-down"></i>
                  )}
                </span>
              </div>
              
              {visibleSections[field] && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-darkblue-dark rounded-lg shadow-inner">
                  {careers.map((career, index) => (
                    <Link 
                      key={index}
                      to={career.path}
                      className="bg-darkblue border border-gray-700 rounded-lg p-4 text-center text-white hover:bg-primary hover:text-white transition-colors shadow-sm hover:shadow-md"
                    >
                      {career.name}
                    </Link>
                  ))}
                </div>
              )}
              
              <hr className="my-6 border-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InterestSection;