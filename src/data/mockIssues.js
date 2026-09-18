export const initialIssues = [
  {
    id: "issue-1",
    ticketId: "TKT-DEL-2026-1402",
    title: "Hazardous Deep Pothole on Main Market Road",
    description: "A large 2-foot deep pothole has formed right in front of the Central Market entrance. It has caused multiple two-wheeler accidents during evening rush hours.",
    category: "Roads & Traffic",
    status: "IN_PROGRESS",
    priority: "High",
    location: "Market Road, Sector 14, Central Ward",
    coordinates: { lat: 28.6139, lng: 77.2090 },
    upvotes: 142,
    supportCount: 142,
    reportCount: 18,
    followerCount: 56,
    upvotedByUser: false,
    commentsCount: 18,
    createdAt: "2026-09-15T10:30:00Z",
    authority: "Municipal Public Works Department (PWD)",
    assignedAuthority: "Municipal Public Works Department (PWD)",
    reporter: {
      name: "Rahul Sharma",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      badge: "Active Citizen"
    },
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
    media: {
      url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
      uploader: {
        name: "Rahul Sharma",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
      }
    },
    timeline: [
      { status: "Reported", date: "Sep 15, 2026 - 10:30 AM", detail: "Issue reported by Rahul S. with 15 initial upvotes." },
      { status: "Verified", date: "Sep 15, 2026 - 02:15 PM", detail: "Verified by Ward Inspector #42." },
      { status: "In Progress", date: "Sep 16, 2026 - 09:00 AM", detail: "Contractor assigned. Material dispatched for asphalt patch work." }
    ],
    comments: [
      { id: "c1", author: "Priya Mehta", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", text: "I almost fell off my scooter here yesterday! Glad it's being addressed.", date: "1 day ago" }
    ]
  },
  {
    id: "issue-2",
    ticketId: "TKT-DEL-2026-2819",
    title: "Overflowing Garbage Bin & Waste Dumping near Green Park",
    description: "The commercial waste bin at Green Park East gate hasn't been cleared in over 4 days. Waste is spilling onto the pedestrian path causing foul odor and health hazard.",
    category: "Sanitation & Waste",
    status: "REPORTED",
    priority: "Medium",
    location: "Green Park East Gate, Block C",
    coordinates: { lat: 28.6210, lng: 77.2150 },
    upvotes: 89,
    supportCount: 89,
    reportCount: 7,
    followerCount: 32,
    upvotedByUser: true,
    commentsCount: 7,
    createdAt: "2026-09-16T14:15:00Z",
    authority: "Sanitation & Waste Management Corp",
    assignedAuthority: "Sanitation & Waste Management Corp",
    reporter: {
      name: "Ananya Iyer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      badge: "Community Lead"
    },
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800",
    media: {
      url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800",
      uploader: {
        name: "Ananya Iyer",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
      }
    },
    timeline: [
      { status: "Reported", date: "Sep 16, 2026 - 02:15 PM", detail: "Issue flagged by Ananya I." }
    ],
    comments: []
  },
  {
    id: "issue-3",
    ticketId: "TKT-DEL-2026-9041",
    title: "Broken Streetlight Array on Outer Ring Road Flyover",
    description: "Four consecutive solar streetlights have stopped functioning on the northbound lane near Metro Pillar 114, rendering the road pitch black at night.",
    category: "Electricity & Lighting",
    status: "RESOLVED",
    priority: "High",
    location: "Outer Ring Road, Pillar 114",
    coordinates: { lat: 28.6280, lng: 77.2200 },
    upvotes: 210,
    supportCount: 210,
    reportCount: 24,
    followerCount: 84,
    upvotedByUser: false,
    commentsCount: 24,
    createdAt: "2026-09-12T18:00:00Z",
    authority: "City Electrical Dept",
    assignedAuthority: "City Electrical Dept",
    reporter: {
      name: "David Miller",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      badge: "Verified Resident"
    },
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800",
    media: {
      url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800",
      uploader: {
        name: "David Miller",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
      }
    },
    timeline: [
      { status: "Reported", date: "Sep 12, 2026 - 06:00 PM", detail: "Reported by David M." },
      { status: "Resolved", date: "Sep 15, 2026 - 05:30 PM", detail: "Power restored. All 4 lights verified operational." }
    ],
    comments: []
  }
];

export const userProfile = {
  name: "Prakash Kumar",
  role: "Civic Champion",
  email: "prakash@civicsense.org",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  joined: "August 2026",
  stats: {
    issuesReported: 12,
    issuesResolved: 9,
    upvotesGiven: 148,
    civicKarma: 850
  },
  badges: [
    { title: "First Reporter", icon: "🚀", desc: "Reported first verified civic issue" },
    { title: "Pothole Patrol", icon: "🛣️", desc: "Helped fix 5+ road safety issues" },
    { title: "Community Guardian", icon: "🛡️", desc: "Top 5% active voter in Sector 14" }
  ]
};
