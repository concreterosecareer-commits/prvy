export const MOCK_PLATFORM_STATS = {
  totalUsers:        12480,
  totalEntertainers: 1820,
  totalPatrons:      10660,
  totalRevenue:      482300,
  gemsSold:          2_410_000,
  activeNow:         3140,
};

export const MOCK_PLATFORM_HEALTH = {
  messagesSentToday:    8420,
  connectionsMadeToday: 312,
  hotSpotsActive:       9,
};

export const MOCK_USERS_TABLE = [
  { id: "1", name: "Sasha Fierce", username: "sasha_fierce",  role: "Patron",      status: "Active",    joined: "Jan 12, 2024", avatar: "" },
  { id: "2", name: "Janet",        username: "janetofficial",  role: "Entertainer", status: "Active",    joined: "Feb 3, 2024",  avatar: "/dancer 1.jpeg" },
  { id: "3", name: "Sapphire",     username: "sapphire",       role: "Entertainer", status: "Active",    joined: "Feb 18, 2024", avatar: "/dancer 2.jpeg" },
  { id: "4", name: "David M.",     username: "david_m",        role: "Patron",      status: "Suspended", joined: "Mar 2, 2024",  avatar: "" },
  { id: "5", name: "Baby Jules",   username: "babyjules",      role: "Entertainer", status: "Pending",   joined: "Apr 9, 2024",  avatar: "/dancer 3.jpeg" },
  { id: "6", name: "Marcus K.",    username: "marcusk",        role: "Patron",      status: "Active",    joined: "Apr 14, 2024", avatar: "" },
  { id: "7", name: "Luna",         username: "luna_star",      role: "Entertainer", status: "Active",    joined: "May 1, 2024",  avatar: "/dancer 5.jpeg" },
  { id: "8", name: "Brian W.",     username: "brianw",         role: "Patron",      status: "Banned",    joined: "May 10, 2024", avatar: "" },
];

export const MOCK_RECENT_SIGNUPS = [
  { id: "1", name: "Cameron A.", username: "camerona",  role: "Patron",      joined: "Today, 9:14 AM"       },
  { id: "2", name: "Raven",      username: "raven_xo",  role: "Entertainer", joined: "Today, 8:02 AM"       },
  { id: "3", name: "Devon S.",   username: "devons",    role: "Patron",      joined: "Yesterday, 11:55 PM"  },
  { id: "4", name: "Destiny",    username: "destiny_x", role: "Entertainer", joined: "Yesterday, 6:30 PM"   },
  { id: "5", name: "Ryan T.",    username: "ryant",     role: "Patron",      joined: "Jun 17, 3:12 PM"      },
];

export const MOCK_ADMIN_TRANSACTIONS = [
  { id: "1", user: "Sasha Fierce", type: "Purchase",     amount: 500,    date: "May 20, 2024", status: "Completed" },
  { id: "2", user: "David M.",     type: "Tip",          amount: -200,   date: "May 19, 2024", status: "Completed" },
  { id: "3", user: "Janet",        type: "Withdrawal",   amount: -1200,  date: "May 18, 2024", status: "Pending"   },
  { id: "4", user: "Marcus K.",    type: "Subscription", amount: -29.99, date: "May 17, 2024", status: "Completed" },
  { id: "5", user: "Sapphire",     type: "Withdrawal",   amount: -3400,  date: "May 16, 2024", status: "Failed"    },
];

export const MOCK_REPORTS = [
  { id: "1", reporter: "David M.",  target: "@unknown_user", reason: "Harassment",    date: "May 15, 2024", status: "Open"     },
  { id: "2", reporter: "Janet",     target: "@spam_account", reason: "Spam",          date: "May 14, 2024", status: "Resolved" },
  { id: "3", reporter: "Marcus K.", target: "@fake_profile", reason: "Impersonation", date: "May 12, 2024", status: "Open"     },
];

export const MOCK_REVENUE_SERIES = [
  { date: "Jan", revenue: 32000 },
  { date: "Feb", revenue: 41000 },
  { date: "Mar", revenue: 38000 },
  { date: "Apr", revenue: 52000 },
  { date: "May", revenue: 61000 },
  { date: "Jun", revenue: 74000 },
];
