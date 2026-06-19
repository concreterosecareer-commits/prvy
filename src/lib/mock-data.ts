export const MOCK_RECENT_ACTIVITY = [
  { id: "1", name: "Janet",      username: "janetofficial", message: "Can't wait to see you tonight 😊", time: "9:34 AM",  unread: 2, avatar: "/dancer 1.jpeg" },
  { id: "2", name: "Sapphire",   username: "sapphire",      message: "Photo",                            time: "Yesterday", unread: 0, avatar: "/dancer 2.jpeg" },
  { id: "3", name: "Baby Jules", username: "babyjules",     message: "Voice message",                   time: "Yesterday", unread: 0, avatar: "/dancer 3.jpeg" },
  { id: "4", name: "Maxine",     username: "maxine",        message: "Hope you're free this weekend!",  time: "May 18",    unread: 0, avatar: "/dancer 4.jpg"  },
  { id: "5", name: "Luna",       username: "luna_star",     message: "Video",                           time: "May 17",    unread: 0, avatar: "/dancer 5.jpeg" },
];

export const MOCK_EARNINGS_SERIES = [
  { date: "May 1", earnings: 800 },
  { date: "May 7", earnings: 2400 },
  { date: "May 14", earnings: 3100 },
  { date: "May 21", earnings: 4600 },
  { date: "May 28", earnings: 6890 },
];

export const MOCK_HOT_SPOTS = [
  {
    id: "4", name: "Rick's Cabaret", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.38 0.20 20 / 0.92), oklch(0.45 0.12 55))",
    image: "/Rick's Cabaret dfw.jpg",
    address: "3113 Bering Dr, Houston, TX 77057",
    hours: { Mon: "11 AM – 2 AM", Tue: "11 AM – 2 AM", Wed: "11 AM – 2 AM", Thu: "11 AM – 2 AM", Fri: "11 AM – 2 AM", Sat: "11 AM – 2 AM", Sun: "6 PM – 2 AM" },
  },
  {
    id: "5", name: "Treasures", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.55 0.16 65 / 0.92), oklch(0.22 0.05 55))",
    image: "/Treasures.jpeg",
    address: "5647 Westheimer Rd, Houston, TX 77056",
    hours: { Mon: "11 AM – 2 AM", Tue: "11 AM – 2 AM", Wed: "11 AM – 2 AM", Thu: "11 AM – 2 AM", Fri: "11 AM – 2 AM", Sat: "11 AM – 2 AM", Sun: "6 PM – 2 AM" },
  },
  {
    id: "6", name: "Vivid Cabaret", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.45 0.22 340 / 0.92), oklch(0.20 0.10 300))",
    image: "/Vivid Cabaret.jpeg",
    address: "9999 Westheimer Rd, Houston, TX 77042",
    hours: { Mon: "11 AM – 2 AM", Tue: "11 AM – 2 AM", Wed: "11 AM – 2 AM", Thu: "11 AM – 2 AM", Fri: "11 AM – 2 AM", Sat: "11 AM – 2 AM", Sun: "6 PM – 2 AM" },
  },
  {
    id: "7", name: "XTC Cabaret", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.40 0.22 280 / 0.92), oklch(0.16 0.01 25))",
    image: "/XTC Cabaret.jpeg",
    address: "13103 Northwest Fwy, Houston, TX 77040",
    hours: { Mon: "11 AM – 2 AM", Tue: "11 AM – 2 AM", Wed: "11 AM – 2 AM", Thu: "11 AM – 2 AM", Fri: "11 AM – 2 AM", Sat: "11 AM – 2 AM", Sun: "6 PM – 2 AM" },
  },
  {
    id: "8", name: "Centerfolds", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.42 0.14 185 / 0.92), oklch(0.16 0.01 25))",
    image: "/centerfolds.png",
    address: "2220 Southwest Fwy, Houston, TX 77098",
    hours: { Mon: "11 AM – 2 AM", Tue: "11 AM – 2 AM", Wed: "11 AM – 2 AM", Thu: "11 AM – 2 AM", Fri: "11 AM – 2 AM", Sat: "11 AM – 2 AM", Sun: "6 PM – 2 AM" },
  },
  {
    id: "9", name: "Scores Houston", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.35 0.16 250 / 0.92), oklch(0.16 0.01 25))",
    image: "/scores houston.webp",
    address: "2315 Southwest Fwy, Houston, TX 77098",
    hours: { Mon: "11 AM – 2 AM", Tue: "11 AM – 2 AM", Wed: "11 AM – 2 AM", Thu: "11 AM – 2 AM", Fri: "11 AM – 2 AM", Sat: "11 AM – 2 AM", Sun: "6 PM – 2 AM" },
  },
  {
    id: "10", name: "Club Onyx", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.28 0.04 285 / 0.95), oklch(0.55 0.14 65 / 0.60))",
    image: "/Club Onyx.jpg",
    address: "3718 W Alabama St, Houston, TX 77027",
    hours: { Mon: "Closed", Tue: "Closed", Wed: "9 PM – 3 AM", Thu: "9 PM – 3 AM", Fri: "9 PM – 4 AM", Sat: "9 PM – 4 AM", Sun: "9 PM – 3 AM" },
  },
  {
    id: "11", name: "Fantasy Club", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.40 0.18 350 / 0.92), oklch(0.22 0.08 290))",
    image: "/fantasy club.jpg",
    address: "5707 Airline Dr, Houston, TX 77076",
    hours: { Mon: "11 AM – 2 AM", Tue: "11 AM – 2 AM", Wed: "11 AM – 2 AM", Thu: "11 AM – 2 AM", Fri: "11 AM – 2 AM", Sat: "11 AM – 2 AM", Sun: "6 PM – 2 AM" },
  },
  {
    id: "12", name: "Doll House", location: "Houston, TX",
    gradient: "linear-gradient(135deg, oklch(0.48 0.10 15 / 0.92), oklch(0.28 0.06 340))",
    image: "/dollhouse.jpeg",
    address: "7929 Airline Dr, Houston, TX 77037",
    hours: { Mon: "11 AM – 2 AM", Tue: "11 AM – 2 AM", Wed: "11 AM – 2 AM", Thu: "11 AM – 2 AM", Fri: "11 AM – 2 AM", Sat: "11 AM – 2 AM", Sun: "6 PM – 2 AM" },
  },
];

export const MOCK_TOP_DANCERS = [
  { id: "1", name: "Janet", username: "janetofficial", earnings: 12560 },
  { id: "2", name: "Sapphire", username: "sapphire", earnings: 9870 },
  { id: "3", name: "Baby Jules", username: "babyjules", earnings: 8430 },
];

export const MOCK_RECENT_TRANSACTIONS = [
  { id: "1", type: "Purchased Gems", date: "May 20, 2024", amount: 1000, positive: true },
  { id: "2", type: "Tip from David M.", date: "May 20, 2024", amount: 300, positive: true },
  { id: "3", type: "Tip to Marcus K.", date: "May 19, 2024", amount: -200, positive: false },
  { id: "4", type: "Subscription", date: "May 18, 2024", amount: -29.99, positive: false },
];

export const MOCK_CONVERSATION: Array<{
  id: string;
  from: "me" | "them";
  text?: string;
  image?: string;
  time: string;
}> = [
  { id: "1", from: "them", text: "Hey beautiful 😊", time: "9:31 AM" },
  { id: "2", from: "me", text: "Hey! How are you?", time: "9:32 AM" },
  { id: "3", from: "them", text: "Can't wait to see you tonight", time: "9:33 AM" },
  { id: "4", from: "me", text: "See you soon 😊", time: "9:34 AM" },
];

export const MOCK_CONNECTIONS = [
  { id: "1", name: "Janet",      username: "janetofficial", status: "Active",  earnings: 12560, patrons: 234, avatar: "/dancer 1.jpeg" },
  { id: "2", name: "Sapphire",   username: "sapphire",      status: "Active",  earnings: 9870,  patrons: 182, avatar: "/dancer 2.jpeg" },
  { id: "3", name: "Baby Jules", username: "babyjules",     status: "Away",    earnings: 8430,  patrons: 156, avatar: "/dancer 3.jpeg" },
  { id: "4", name: "Maxine",     username: "maxine",        status: "Active",  earnings: 7120,  patrons: 129, avatar: "/dancer 4.jpg"  },
  { id: "5", name: "Luna",       username: "luna_star",     status: "Offline", earnings: 5430,  patrons: 98,  avatar: "/dancer 5.jpeg" },
  { id: "6", name: "Raven",      username: "raven_xo",      status: "Active",  earnings: 4980,  patrons: 87,  avatar: "/dancer 6.jpg"  },
];

const CONNECTED_IDS = new Set(["1", "2", "3", "4", "5", "6"]);

export const MOCK_ALL_DANCERS = [
  ...MOCK_CONNECTIONS.map((d) => ({ ...d, isConnected: true })),
  { id: "7",  name: "Destiny",   username: "destiny_x",   status: "Active",  earnings: 4310, patrons: 74,  avatar: "", isConnected: false },
  { id: "8",  name: "Coco",      username: "coco_vibes",  status: "Active",  earnings: 3870, patrons: 61,  avatar: "", isConnected: false },
  { id: "9",  name: "Amara",     username: "amara_rose",  status: "Away",    earnings: 3120, patrons: 55,  avatar: "", isConnected: false },
  { id: "10", name: "Diamond",   username: "diamond_d",   status: "Active",  earnings: 2980, patrons: 49,  avatar: "", isConnected: false },
  { id: "11", name: "Alexis",    username: "alexis_luxe", status: "Offline", earnings: 2640, patrons: 43,  avatar: "", isConnected: false },
  { id: "12", name: "Serena",    username: "serena_vip",  status: "Active",  earnings: 2210, patrons: 38,  avatar: "", isConnected: false },
];

export const MOCK_PATRON_CONNECTIONS = [
  { id: "1", name: "David M.", username: "davidm", avatar_url: null, location: "Miami, FL", status: "Active" },
  { id: "2", name: "Marcus K.", username: "marcusk", avatar_url: null, location: "Atlanta, GA", status: "Active" },
  { id: "3", name: "James T.", username: "jamest", avatar_url: null, location: "Houston, TX", status: "Away" },
  { id: "4", name: "Chris L.", username: "chrisl", avatar_url: null, location: "Las Vegas, NV", status: "Active" },
  { id: "5", name: "Brian W.", username: "brianw", avatar_url: null, location: "New York, NY", status: "Offline" },
  { id: "6", name: "Tyler R.", username: "tylerr", avatar_url: null, location: "Los Angeles, CA", status: "Active" },
];

export const MOCK_ALL_PATRONS = [
  { id: "1",  name: "David M.",   username: "davidm",    location: "Miami, FL",         status: "Active",  gems: 4200, isConnected: true  },
  { id: "2",  name: "Marcus K.",  username: "marcusk",   location: "Atlanta, GA",        status: "Active",  gems: 3800, isConnected: true  },
  { id: "3",  name: "James T.",   username: "jamest",    location: "Houston, TX",        status: "Away",    gems: 2900, isConnected: true  },
  { id: "4",  name: "Chris L.",   username: "chrisl",    location: "Las Vegas, NV",      status: "Active",  gems: 5100, isConnected: true  },
  { id: "5",  name: "Brian W.",   username: "brianw",    location: "New York, NY",       status: "Offline", gems: 1800, isConnected: true  },
  { id: "6",  name: "Tyler R.",   username: "tylerr",    location: "Los Angeles, CA",    status: "Active",  gems: 3300, isConnected: true  },
  { id: "7",  name: "Jordan K.",  username: "jordank",   location: "Dallas, TX",         status: "Active",  gems: 2600, isConnected: false },
  { id: "8",  name: "Nathan B.",  username: "nathanb",   location: "Chicago, IL",        status: "Active",  gems: 2100, isConnected: false },
  { id: "9",  name: "Elijah W.",  username: "elijahw",   location: "Phoenix, AZ",        status: "Away",    gems: 1500, isConnected: false },
  { id: "10", name: "Ryan T.",    username: "ryant",     location: "Seattle, WA",        status: "Active",  gems: 3700, isConnected: false },
  { id: "11", name: "Devon S.",   username: "devons",    location: "Denver, CO",         status: "Offline", gems: 980,  isConnected: false },
  { id: "12", name: "Cameron A.", username: "camerona",  location: "Nashville, TN",      status: "Active",  gems: 2450, isConnected: false },
];

export const MOCK_TRANSACTIONS_TABLE = [
  { id: "1", type: "Purchase", description: "Purchased Gems", party: "-", date: "May 20, 2024", amount: 1000, status: "Completed" },
  { id: "2", type: "Tip", description: "Tip to Janet", party: "@janetofficial", date: "May 20, 2024", amount: -200, status: "Completed" },
  { id: "3", type: "Tip", description: "Tip to Sapphire", party: "@sapphire", date: "May 19, 2024", amount: -300, status: "Completed" },
  { id: "4", type: "Subscription", description: "Monthly Subscription", party: "-", date: "May 18, 2024", amount: -29.99, status: "Completed" },
  { id: "5", type: "Purchase", description: "Purchased Gems", party: "-", date: "May 18, 2024", amount: 500, status: "Completed" },
  { id: "6", type: "Tip", description: "Tip to Baby Jules", party: "@babyjules", date: "May 17, 2024", amount: -150, status: "Completed" },
  { id: "7", type: "Purchase", description: "Purchased Gems", party: "-", date: "May 16, 2024", amount: 2500, status: "Completed" },
];

export const MOCK_INVITES = [
  { id: "1", name: "Luna",     username: "luna_star",  message: "Hey! I'd love to connect with you on PRVY.",          time: "2h ago",    status: "pending" },
  { id: "2", name: "Raven",    username: "raven_xo",   message: "Looking forward to getting to know you better!",       time: "5h ago",    status: "pending" },
  { id: "3", name: "Kiki",     username: "kiki_v",     message: "Heard great things — let's connect!",                 time: "Yesterday", status: "pending" },
  { id: "4", name: "Sapphire", username: "sapphire",   message: "Would love to chat sometime 💎",                      time: "May 17",    status: "pending" },
];

export const MOCK_NOTIFICATIONS = [
  { id: "1", type: "tip", title: "New Tip Received", body: "You received a tip of 200 gems from David M.", time: "Just now", unread: true },
  { id: "2", type: "message", title: "New Message", body: "David M. sent you a message", time: "2 min ago", unread: true },
  { id: "3", type: "subscriber", title: "New Subscriber", body: "Marcus K. subscribed to your profile", time: "1 hour ago", unread: true },
  { id: "4", type: "payout", title: "Payout Processed", body: "Your payout of $1,230 has been processed", time: "3 hours ago", unread: true },
  { id: "5", type: "invite", title: "Invite Bonus", body: "You earned 150 gems from Luna's activity", time: "1 day ago", unread: true },
];

export const MOCK_EARNINGS_BY_SOURCE = [
  { name: "Tips", value: 65 },
  { name: "Subscriptions", value: 20 },
  { name: "Other", value: 15 },
];
