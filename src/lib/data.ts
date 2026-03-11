import type { Employee, Achievement, NewsArticle } from '@/lib/types';
import { subDays, format } from 'date-fns';

const today = new Date();

export const employees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@itg.com',
    department: 'Engineering',
    profilePhotoUrl: "https://picsum.photos/seed/101/200/200",
    profilePhotoHint: "woman portrait",
    birthDate: format(today, 'yyyy-MM-dd'),
    achievements: [
      { id: 'a1', employeeId: '1', title: 'Launched Project Phoenix', description: 'Successfully led the cross-functional team to launch the new platform ahead of schedule.', date: subDays(today, 10).toISOString() },
    ],
  },
  {
    id: '2',
    name: 'David Lee',
    email: 'david.lee@itg.com',
    department: 'Marketing',
    profilePhotoUrl: "https://picsum.photos/seed/102/200/200",
    profilePhotoHint: "man portrait",
    birthDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    achievements: [],
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@itg.com',
    department: 'Sales',
    profilePhotoUrl: "https://picsum.photos/seed/103/200/200",
    profilePhotoHint: "woman smiling",
    birthDate: format(new Date(new Date().setFullYear(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3)), 'yyyy-MM-dd'),
    achievements: [
      { id: 'a2', employeeId: '3', title: 'Exceeded Quarterly Sales Target', description: 'Achieved 150% of the sales target for Q2, setting a new company record.', date: subDays(today, 25).toISOString() },
    ],
  },
  {
    id: '4',
    name: 'Shinji Ikari',
    email: 'shinji.ikari@itg.com',
    department: 'Engineering',
    profilePhotoUrl: "https://picsum.photos/seed/104/200/200",
    profilePhotoHint: "man professional",
    birthDate: '1995-06-04',
    achievements: [
        { id: 'a3', employeeId: '4', title: 'Refactored Legacy Authentication Service', description: 'Improved security and performance of the user login service by 40%.', date: subDays(today, 40).toISOString() },
        { id: 'a4', employeeId: '4', title: 'Won Company Hackathon', description: 'Developed an innovative internal tool for API monitoring during the annual hackathon.', date: subDays(today, 90).toISOString() },
    ],
  },
];

export const achievements: Achievement[] = [
  {
    id: 'ach1',
    employeeId: '1',
    employeeName: 'Sarah Chen',
    employeePhotoUrl: 'https://picsum.photos/seed/101/200/200',
    employeePhotoHint: "woman portrait",
    title: 'Launched Project Phoenix',
    description: 'Successfully led the cross-functional team to launch the new platform ahead of schedule.',
    date: subDays(today, 10).toISOString(),
  },
  {
    id: 'ach2',
    employeeId: '3',
    employeeName: 'Maria Rodriguez',
    employeePhotoUrl: 'https://picsum.photos/seed/103/200/200',
    employeePhotoHint: "woman smiling",
    title: 'Exceeded Quarterly Sales Target',
    description: 'Achieved 150% of the sales target for Q2, setting a new company record.',
    date: subDays(today, 25).toISOString(),
  },
  {
    id: 'ach3',
    employeeId: '4',
    employeeName: 'Shinji Ikari',
    employeePhotoUrl: 'https://picsum.photos/seed/104/200/200',
    employeePhotoHint: "man professional",
    title: 'Refactored Legacy Authentication Service',
    description: 'Improved security and performance of the user login service by 40%.',
    date: subDays(today, 40).toISOString(),
  },
];

export const news: NewsArticle[] = [
  {
    id: 'news1',
    title: 'ITG Opens New Branch in London',
    content: 'We are thrilled to announce the grand opening of our new office in the heart of London. This expansion marks a significant milestone in our global growth strategy and will allow us to better serve our European clients. The office features state-of-the-art facilities and a collaborative workspace designed to foster innovation.',
    imageUrl: 'https://picsum.photos/seed/301/600/400',
    imageHint: 'modern office',
    publishedDate: subDays(today, 7).toISOString(),
    author: 'Corporate Communications',
  },
  {
    id: 'news2',
    title: 'Annual Charity Drive Raises Record Amount',
    content: 'Thanks to the generous contributions of our employees, this year\'s annual charity drive for "Tech for Tots" was a massive success. We raised a record-breaking $50,000 to help provide underprivileged children with access to technology and education. A huge thank you to everyone who participated!',
    imageUrl: 'https://picsum.photos/seed/302/600/400',
    imageHint: 'people volunteering',
    publishedDate: subDays(today, 14).toISOString(),
    author: 'Community Outreach Team',
  },
];

export const currentUser = employees.find(e => e.id === '4');
