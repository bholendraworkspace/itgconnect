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

export type Event = {
    id: string;
    title: string;
    description: string;
    date: string; // ISO 8601
    location: string;
    organizerId: string;
    rsvps: string[]; // array of employee IDs
};
