export type Employee = {
  id: string;
  name: string;
  email: string;
  department?: string;
  profilePhotoUrl: string;
  profilePhotoHint: string;
  birthDate: string; // YYYY-MM-DD
  achievements: Omit<Achievement, 'employeeName' | 'employeePhotoUrl' | 'employeePhotoHint'>[];
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
