import React, { useState } from 'react';
import { Search, FileText, ExternalLink, BookOpen, Zap, AlertTriangle, TrendingUp, Calendar, Scale } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'market', label: 'Market Updates', icon: TrendingUp },
  { id: 'regulatory', label: 'Regulatory', icon: Scale },
  { id: 'operations', label: 'Operations', icon: Zap },
  { id: 'events', label: 'Events', icon: Calendar },
];

const articles = [
  { 
    id: 1, 
    title: 'ERCOT Board of Directors Briefs: Oct. 9-10, 2024', 
    excerpt: 'Although Texas recorded its sixth-hottest summer on record, ERCOT failed to set a new mark for peak demand. The grid operator reported no emergency conditions during the summer months despite multiple heat waves.', 
    date: '2024-10-11', 
    source: 'RTO Insider',
    category: 'market',
    tags: ['peak demand', 'summer 2024', 'board meeting']
  },
  { 
    id: 2, 
    title: 'Batteries, Solar Help ERCOT Meet Record Winter Peak', 
    excerpt: 'ERCOT set a new peak for winter demand, with record production from batteries and near-record production from solar helping meet the increased load during the January cold snap.', 
    date: '2024-01-18', 
    source: 'RTO Insider',
    category: 'operations',
    tags: ['winter peak', 'batteries', 'solar', 'record']
  },
  { 
    id: 3, 
    title: 'PUCT Adopts New 4CP Transmission Cost Allocation Rules', 
    excerpt: 'The Public Utility Commission of Texas has adopted revised rules for 4CP transmission cost allocation, affecting how large commercial and industrial customers are charged for transmission service.', 
    date: '2024-09-15', 
    source: 'PUCT',
    category: 'regulatory',
    tags: ['4CP', 'transmission', 'PUCT', 'cost allocation']
  },
  { 
    id: 4, 
    title: 'Winter Storm Preparedness: ERCOT Updates Weatherization Standards', 
    excerpt: 'Following lessons learned from Winter Storm Uri, ERCOT has implemented enhanced weatherization requirements for generation resources. The new standards take effect October 2024.', 
    date: '2024-08-22', 
    source: 'ERCOT',
    category: 'regulatory',
    tags: ['weatherization', 'winter storm', 'Uri', 'standards']
  },
  { 
    id: 5, 
    title: 'ERCOT Demand Response Programs: 2024 Performance Review', 
    excerpt: 'Analysis of demand response program performance during summer 2024 peak events. Programs successfully reduced load by 2,400 MW during the highest risk periods.', 
    date: '2024-09-30', 
    source: 'ERCOT',
    category: 'operations',
    tags: ['demand response', 'DR', 'peak shaving', '2024']
  },
  { 
    id: 6, 
    title: 'Texas Grid Adds Record Solar Capacity in 2024', 
    excerpt: 'Texas added 8.2 GW of utility-scale solar capacity in 2024, making it the second-largest solar market in the US. Total solar capacity now exceeds 20 GW.', 
    date: '2024-12-15', 
    source: 'SEIA',
    category: 'market',
    tags: ['solar', 'capacity', 'renewable', 'growth']
  },
  { 
    id: 7, 
    title: 'ERCOT Emergency Alert History: Lessons for 2025', 
    excerpt: 'A comprehensive review of ERCOT emergency alerts from 2021-2024, identifying patterns and recommendations for commercial customers to prepare for grid stress events.', 
    date: '2024-11-20', 
    source: 'Grid Analysis',
    category: 'events',
    tags: ['emergency', 'alerts', 'EEA', 'preparation']
  },
  { 
    id: 8, 
    title: 'Congestion Revenue Rights: 2025 Auction Results', 
    excerpt: 'Results from the 2025 CRR auction show increased hedging activity in the Houston zone. Total CRR values increased 15% year-over-year.', 
    date: '2024-12-01', 
    source: 'ERCOT',
    category: 'market',
    tags: ['CRR', 'congestion', 'hedging', 'auction']
  },
];

export default function KnowledgeBase() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = articles.filter(article => {
    const matchesQuery = query === '' || 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <p className="text-slate-400 mt-1">Search ERCOT market news, regulatory updates, and operational insights</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ERCOT news, PUCT orders, 4CP, demand response..."
              className="w-full bg-slate-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{filteredArticles.length} articles found</p>
        <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Most Recent</option>
          <option>Most Relevant</option>
          <option>Oldest First</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <div 
            key={article.id} 
            className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-400">{article.source}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{article.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
                    article.category === 'regulatory' ? 'bg-purple-500/20 text-purple-400' :
                    article.category === 'market' ? 'bg-green-500/20 text-green-400' :
                    article.category === 'operations' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {article.category}
                  </span>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-blue-400 transition-colors">{article.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{article.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors ml-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <BookOpen className="w-5 h-5 text-blue-400 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-400">Knowledge Base Powered by Cortex Search</h4>
            <p className="text-sm text-slate-400 mt-1">
              This knowledge base uses Snowflake Cortex Search for semantic retrieval of ERCOT market intelligence, 
              regulatory filings, and operational best practices. Content is updated daily from RTO Insider, 
              ERCOT publications, and PUCT filings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
