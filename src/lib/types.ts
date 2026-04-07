export type Employee = {
  id: string;
  name: string;
  email: string;
  department?: string;
  profilePhotoUrl: string;
  profilePhotoHint: string;
  birthDate: string; // YYYY-MM-DD
  achievements: Omit<Achievement, 'employeeName' | 'employeePhotoUrl' | 'employeePhotoHint'>[];
  workAnniversary?: string; // YYYY-MM-DD
  // Extended profile
  role?: string; // e.g. "Team Lead- Mobile Apps (Android & Flutter)"
  aboutMe?: string;
  jobLove?: string; // "What I love about my job"
  interests?: string; // hobbies & interests
  // Personal details
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  marriageDate?: string; // YYYY-MM-DD
  nationality?: string;
  // Contact details
  personalEmail?: string;
  mobileNumber?: string;
  workNumber?: string;
  // Work details
  businessUnit?: string;
  subDepartment?: string;
  reportingManager?: string;
};

export type Achievement = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhotoUrl: string;
  employeePhotoHint: string;
  title: string;
  description: string;
  date: string; // ISO 8601
};

export type NewsArticle = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  publishedDate: string; // ISO 8601
  author: string;
};

export type SpecialAnnouncement = {
    id: string;
    employeeId: string;
    employeeName: string;
    employeePhotoUrl: string;
    type: 'car' | 'home' | 'kid' | 'marriage' | 'work_anniversary';
    date: string; // ISO 8601
};

export type Idea = {
    id: string;
    employeeId: string;
    employeeName: string;
    employeePhotoUrl: string;
    title: string;
    description: string;
    votes: number;
    votedBy: string[]; // array of user UIDs
    date: string; // ISO 8601
};

export type Recognition = {
    id: string;
    fromEmployeeId: string;
    fromEmployeeName: string;
    toEmployeeId: string;
    toEmployeeName: string;
    toEmployeePhotoUrl: string;
    message: string;
    date: string; // ISO 8601
};

export type Feedback = {
  id: string;
  submitterId: string;
  submitterName: string;
  isAnonymous: boolean;
  category: "suggestion" | "bug" | "praise" | "other";
  message: string;
  date: string; // ISO 8601
};

export type Event = {
    id: string;
    title: string;
    description: string;
    date: string; // ISO 8601
    location: string;
    organizerId: string;
    rsvps: string[]; // array of employee IDs
};

export type PageSpeedHistory = {
  id: string;
  url: string;
  strategy: "mobile" | "desktop";
  overallScore: number;
  metrics: {
    label: string;
    value: string;
    score: number;
    description: string;
  }[];
  userId: string;
  userName: string;
  createdAt: string; // ISO 8601
};

// ─── API Collections ─────────────────────────────────────────────────────────

export type ApiHeader = {
  key: string;
  value: string;
};

export type ApiEndpoint = {
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  url: string;
  description: string;
  headers: ApiHeader[];
  body: string;
  auth: string;
};

export type ApiFolder = {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
};

export type ApiProject = {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  folders: ApiFolder[];
  endpoints: ApiEndpoint[]; // root-level endpoints not in folders
  importedAt: string; // ISO 8601
  importedBy: string; // user UID
  importedByName: string;
};
