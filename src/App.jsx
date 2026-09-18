import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import ReportModal from './components/report/ReportModal';
import Feed from './Pages/Feed';
import Issue from './Pages/Issue';
import Profile from './Pages/Profile';
import { initialIssues } from './data/mockIssues';
import { issueService } from './services/issueService';

export default function App() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('upvotes');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch issues from backend API (falls back to mock data if offline)
  const fetchIssues = useCallback(async () => {
    try {
      const res = await issueService.getIssues({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort: sortBy === 'upvotes' ? 'popular' : 'latest'
      });
      const data = res.issues || res.data?.issues || res;
      if (Array.isArray(data) && data.length > 0) {
        setIssues(data);
      } else {
        setIssues(initialIssues);
      }
    } catch (err) {
      console.warn('API unavailable, using local mock data:', err.message);
      setIssues(initialIssues);
    }
  }, []);

  // Fetch issues on mount
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Toggle upvote on an issue
  const handleToggleUpvote = (issueId) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const newUpvoted = !issue.upvotedByUser;
          return {
            ...issue,
            upvotedByUser: newUpvoted,
            upvotes: newUpvoted ? issue.upvotes + 1 : issue.upvotes - 1
          };
        }
        return issue;
      })
    );
  };

  // Add comment to an issue
  const handleAddComment = (issueId, comment) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            commentsCount: (issue.commentsCount || 0) + 1,
            comments: [comment, ...(issue.comments || [])]
          };
        }
        return issue;
      })
    );
  };

  // Create a new reported issue, then re-fetch from backend
  const handleCreateIssue = async (newIssue) => {
    // Optimistically add to state immediately
    setIssues((prev) => [newIssue, ...prev]);
    navigate(`/issue/${newIssue.id || newIssue.ticketId}`);
    // Re-fetch from backend to sync with DB
    try {
      await fetchIssues();
    } catch {
      // Already added optimistically, no action needed
    }
  };

  // Filter & sort issues for display
  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = issue.title.toLowerCase().includes(q);
          const matchDesc = issue.description.toLowerCase().includes(q);
          const matchLoc = issue.location.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        // Category Filter
        if (selectedCategory !== 'All' && issue.category !== selectedCategory) {
          return false;
        }

        // Status Filter
        if (statusFilter !== 'All' && issue.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') {
          return b.upvotes - a.upvotes;
        } else {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [issues, searchQuery, selectedCategory, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          totalIssuesCount={issues.length}
        />

        {/* Dynamic Page Router Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route
              path="/"
              element={
                <Feed
                  issues={filteredIssues}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onToggleUpvote={handleToggleUpvote}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                />
              }
            />
            <Route
              path="/issue/:id"
              element={
                <Issue
                  issues={issues}
                  onToggleUpvote={handleToggleUpvote}
                  onAddComment={handleAddComment}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <Profile
                  issues={issues}
                  onToggleUpvote={handleToggleUpvote}
                />
              }
            />
          </Routes>
        </div>

      </main>

      {/* Global Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIssue={handleCreateIssue}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 text-center text-xs text-slate-500 mt-12">
        <p>© 2026 CivicSense Platform • Empowering Communities through Open Civic Action</p>
      </footer>

    </div>
  );
}
