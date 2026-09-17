export const initialIssues = [
  {
    id: "issue-1",
    title: "Hazardous Deep Pothole on Main Market Road",
    description: "A large 2-foot deep pothole has formed right in front of the Central Market entrance. It has caused multiple two-wheeler accidents during evening rush hours.",
    category: "Roads & Traffic",
    status: "in_progress",
    priority: "High",
    location: "Market Road, Sector 14, Central Ward",
    coordinates: { lat: 28.6139, lng: 77.2090 },
    upvotes: 142,
    upvotedByUser: false,
    commentsCount: 18,
    createdAt: "2026-09-15T10:30:00Z",
    reporter: {
      name: "Rahul Sharma",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      badge: "Active Citizen"
    },
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
    assignedAuthority: "Municipal Public Works Department (PWD)",
    timeline: [
      { status: "Reported", date: "Sep 15, 2026 - 10:30 AM", detail: "Issue reported by Rahul S. with 15 initial upvotes." },
      { status: "Verified", date: "Sep 15, 2026 - 02:15 PM", detail: "Verified by Ward Inspector #42." },
      { status: "In Progress", date: "Sep 16, 2026 - 09:00 AM", detail: "Contractor assigned. Material dispatched for asphalt patch work." }
    ],
    comments: [
      { id: "c1", author: "Priya Mehta", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", text: "I almost fell off my scooter here yesterday! Glad it's being addressed.", date: "1 day ago" },
      { id: "c2", author: "Official Response (PWD)", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150", text: "Repair crew has scheduled filling work for tonight 11 PM to avoid traffic disruption.", date: "12 hours ago" }
    ]
  },
  {
    id: "issue-2",
    title: "Overflowing Garbage Bin & Waste Dumping near Green Park",
    description: "The commercial waste bin at Green Park East gate hasn't been cleared in over 4 days. Waste is spilling onto the pedestrian path causing foul odor and health hazard.",
    category: "Sanitation & Waste",
    status: "pending",
    priority: "Medium",
    location: "Green Park East Gate, Block C",
    coordinates: { lat: 28.6210, lng: 77.2150 },
    upvotes: 89,
    upvotedByUser: true,
    commentsCount: 7,
    createdAt: "2026-09-16T14:15:00Z",
    reporter: {
      name: "Ananya Iyer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      badge: "Community Lead"
    },
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800",
    assignedAuthority: "Sanitation & Waste Management Corp",
    timeline: [
      { status: "Reported", date: "Sep 16, 2026 - 02:15 PM", detail: "Issue flagged by Ananya I. Pending authority dispatch." }
    ],
    comments: [
      { id: "c3", author: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", text: "The stray animals are tearing open bags every night. Needs urgent clearance!", date: "8 hours ago" }
    ]
  },
  {
    id: "issue-3",
    title: "Broken Streetlight Array on Outer Ring Road Flyover",
    description: "Four consecutive solar streetlights have stopped functioning on the northbound lane near Metro Pillar 114, rendering the road pitch black at night.",
    category: "Electricity & Lighting",
    status: "resolved",
    priority: "High",
    location: "Outer Ring Road, Pillar 114",
    coordinates: { lat: 28.6280, lng: 77.2200 },
    upvotes: 210,
    upvotedByUser: false,
    commentsCount: 24,
    createdAt: "2026-09-12T18:00:00Z",
    reporter: {
      name: "David Miller",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      badge: "Verified Resident"
    },
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800",
    assignedAuthority: "City Electrical Dept",
    timeline: [
      { status: "Reported", date: "Sep 12, 2026 - 06:00 PM", detail: "Reported by David M." },
      { status: "Verified", date: "Sep 13, 2026 - 11:00 AM", detail: "Inspection confirmed faulty relay box." },
      { status: "In Progress", date: "Sep 14, 2026 - 01:00 PM", detail: "Replacement LEDs installed." },
      { status: "Resolved", date: "Sep 15, 2026 - 05:30 PM", detail: "Power restored. All 4 lights verified operational." }
    ],
    comments: [
      { id: "c4", author: "Sunita Rao", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", text: "Checked tonight, all lights are working great now! Thanks CivicSense!", date: "2 days ago" }
    ]
  },
  {
    id: "issue-4",
    title: "Clean Water Pipeline Leakage Flooding Sub-lane 3",
    description: "A major main line leak is wasting drinking water and causing localized waterlogging near residential complex entrance.",
    category: "Water Supply",
    status: "in_progress",
    priority: "Critical",
    location: "Sub-lane 3, Lakeview Apartments",
    coordinates: { lat: 28.6190, lng: 77.2010 },
    upvotes: 175,
    upvotedByUser: true,
    commentsCount: 14,
    createdAt: "2026-09-16T08:00:00Z",
    reporter: {
      name: "Amitav Roy",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150",
      badge: "Active Citizen"
    },
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800",
    assignedAuthority: "Jal Board / Water Utility Dept",
    timeline: [
      { status: "Reported", date: "Sep 16, 2026 - 08:00 AM", detail: "Reported by Amitav R." },
      { status: "Verified", date: "Sep 16, 2026 - 10:30 AM", detail: "Pressure valve issue confirmed." },
      { status: "In Progress", date: "Sep 17, 2026 - 08:30 AM", detail: "Valves shut for pipe welding repair." }
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
