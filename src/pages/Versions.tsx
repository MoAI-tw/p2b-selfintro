import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash, faEdit, faCopy, faEye, faChartBar, faHistory, faExchangeAlt, faCodeBranch, faSave, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

interface Version {
  id: string;
  name: string;
  date: string;
  language: string;
  industry: string;
  content: string;
  position: string;
  duration: string;
  isCurrent: boolean;
}

const Versions: React.FC = () => {
  const navigate = useNavigate();

  // In a real application, this would come from a database
  const [versions, setVersions] = useState<Version[]>([
    {
      id: '1',
      name: 'Tech Interview',
      date: '2023-06-15',
      language: 'English',
      industry: 'Technology',
      content: 'Hi, I\'m James, a software engineer with 5 years of experience in full-stack development. I graduated from National Taiwan University with a degree in Computer Science. I currently work at TechCorp as a Senior Developer. My skills include JavaScript, React, Node.js, and Python. I am particularly strong in frontend development, API design, and system architecture. I have worked on projects such as an e-commerce platform and a financial analytics dashboard. I am excited about opportunities in the technology sector, particularly in web development, and would love to discuss how my background aligns with your needs.',
      position: 'Software Engineer',
      duration: '1 minute',
      isCurrent: true
    },
    {
      id: '2',
      name: 'Networking Event',
      date: '2023-07-20',
      language: 'English',
      industry: 'Technology',
      content: 'Hello, I\'m James, a passionate software engineer with a focus on creating intuitive user experiences. I have 5 years of experience building web applications with modern JavaScript frameworks. I excel in collaborative environments and enjoy solving complex problems. My recent projects include developing a real-time analytics dashboard that improved decision-making efficiency by 30%. I\'m always interested in connecting with other professionals in the tech industry to share ideas and explore potential collaborations.',
      position: 'Software Engineer',
      duration: '3 minutes',
      isCurrent: false
    },
    {
      id: '3',
      name: '金融面試',
      date: '2023-08-05',
      language: 'Chinese',
      industry: 'Finance',
      content: '您好，我是張偉，一名擁有3年經驗的金融分析師。我畢業於台灣大學，獲得了金融學的學士學位。我目前在ABC投資公司擔任分析師。我的技能包括財務建模、風險評估和投資組合管理。我特別擅長數據分析、市場研究和財務報告。我參與過的項目包括為高淨值客戶開發投資策略和進行市場趨勢分析。我對金融行業，特別是投資管理方向的機會非常感興趣，希望有機會與您詳細討論我的經驗如何能滿足貴公司的需求。',
      position: 'Financial Analyst',
      duration: '30 seconds',
      isCurrent: false
    },
    {
      id: '4',
      name: '資深前端開發',
      date: '2023-08-28',
      language: 'English',
      industry: 'Technology',
      content: 'I am a senior frontend developer with 10 years of experience in web development. My skills include JavaScript, React, Node.js, and modern frontend frameworks. I am particularly strong in frontend development, API design, and system architecture. I have worked on projects such as an e-commerce platform and a financial analytics dashboard. I am excited about opportunities in the technology sector, particularly in web development, and would love to discuss how my background aligns with your needs.',
      position: 'Senior Frontend Developer',
      duration: '1 minute',
      isCurrent: false
    }
  ]);

  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<{language: string, industry: string}>({
    language: '',
    industry: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const handleVersionSelect = (id: string) => {
    if (selectedVersions.includes(id)) {
      setSelectedVersions(selectedVersions.filter(vId => vId !== id));
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, id]);
      } else {
        setSelectedVersions([selectedVersions[1], id]);
      }
    }
  };

  const handleDeleteVersion = (id: string) => {
    setVersions(versions.filter(version => version.id !== id));
    setSelectedVersions(selectedVersions.filter(vId => vId !== id));
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    // In a real app, you'd show a toast notification
    alert('Content copied to clipboard!');
  };

  const handleEditClick = (version: Version) => {
    setEditingId(version.id);
    setEditingName(version.name);
  };

  const handleSaveEdit = (id: string) => {
    setVersions(versions.map(ver => 
      ver.id === id ? { ...ver, name: editingName } : ver
    ));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const filteredVersions = versions.filter(version => {
    const matchesSearch = version.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          version.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = filter.language === '' || version.language === filter.language;
    const matchesIndustry = filter.industry === '' || version.industry === filter.industry;
    
    return matchesSearch && matchesLanguage && matchesIndustry;
  });

  // Get unique languages and industries for filters
  const languages = Array.from(new Set(versions.map(v => v.language)));
  const industries = Array.from(new Set(versions.map(v => v.industry)));

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      console.log(`Comparing versions: ${selectedVersions[0]} and ${selectedVersions[1]}`);
      // 實際專案中這裡應該顯示對比結果
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <Link 
          to="/" 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-2xl font-bold text-center text-gray-800">Your Saved Versions</h1>
        
        <div className="w-24"></div> {/* Empty div for balanced layout */}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="mb-4 md:mb-0 w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search versions..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              className="px-4 py-2 border rounded-md"
              value={filter.language}
              onChange={(e) => setFilter({...filter, language: e.target.value})}
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            
            <select 
              className="px-4 py-2 border rounded-md"
              value={filter.industry}
              onChange={(e) => setFilter({...filter, industry: e.target.value})}
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedVersions.length === 2 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={selectedVersions.length !== 2}
              onClick={() => setShowComparison(true)}
            >
              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
              Compare ({selectedVersions.length}/2)
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVersions.length > 0 ? (
                filteredVersions.map((version) => (
                  <tr key={version.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedVersions.includes(version.id)}
                        onChange={() => handleVersionSelect(version.id)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === version.id ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveEdit(version.id)}
                            className="ml-2 text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="ml-2 text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{version.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{version.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{version.language}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{version.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => console.log('View details', version.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(version)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          onClick={() => handleCopyContent(version.content)}
                          className="text-green-600 hover:text-green-900"
                          title="Copy content"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                        <button 
                          onClick={() => handleDeleteVersion(version.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No versions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showComparison && selectedVersions.length === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Version Comparison</h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowComparison(false)}
            >
              Close
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedVersions.map(id => {
              const version = versions.find(v => v.id === id);
              if (!version) return null;
              
              return (
                <div key={id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">{version.name}</h3>
                  <div className="mb-2 text-sm text-gray-500">
                    {version.date} • {version.language} • {version.industry}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {version.content}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="font-medium mb-2">Key Differences</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
              <li>Different tone and style approach</li>
              <li>Emphasis on different skills and experiences</li>
              <li>Length and structure variations</li>
              <li>Target audience focus</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <Link 
          to="/profile"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
        >
          Create New Version
        </Link>
      </div>
    </div>
  );
};

export default Versions; 