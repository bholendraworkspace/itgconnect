import type { Employee, Achievement, NewsArticle, SpecialAnnouncement, Idea, Recognition, Event } from '@/lib/types';
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
    workAnniversary: format(subDays(today, 365 * 2), 'yyyy-MM-dd'),
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
    workAnniversary: format(today, 'yyyy-MM-dd'),
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
  // ── Today's birthdays ──
  {
    id: '5',
    name: 'Priya Sharma',
    email: 'priya.sharma@itg.com',
    department: 'Design',
    profilePhotoUrl: "https://picsum.photos/seed/105/200/200",
    profilePhotoHint: "woman creative",
    birthDate: format(today, 'yyyy-MM-dd'),
    achievements: [],
  },
  // ── Past birthdays ──
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@itg.com',
    department: 'Finance',
    profilePhotoUrl: "https://picsum.photos/seed/106/200/200",
    profilePhotoHint: "man suit",
    birthDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    achievements: [],
  },
  {
    id: '7',
    name: 'Aiko Tanaka',
    email: 'aiko.tanaka@itg.com',
    department: 'Engineering',
    profilePhotoUrl: "https://picsum.photos/seed/107/200/200",
    profilePhotoHint: "woman developer",
    birthDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    workAnniversary: format(subDays(today, 365), 'yyyy-MM-dd'),
    achievements: [
      { id: 'a5', employeeId: '7', title: 'Built Real-Time Analytics Dashboard', description: 'Designed and shipped the live metrics dashboard used by the ops team.', date: subDays(today, 60).toISOString() },
    ],
  },
  {
    id: '8',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@itg.com',
    department: 'Operations',
    profilePhotoUrl: "https://picsum.photos/seed/108/200/200",
    profilePhotoHint: "man operations",
    birthDate: format(subDays(today, 4), 'yyyy-MM-dd'),
    achievements: [],
  },
  {
    id: '9',
    name: 'Emily Foster',
    email: 'emily.foster@itg.com',
    department: 'HR',
    profilePhotoUrl: "https://picsum.photos/seed/109/200/200",
    profilePhotoHint: "woman professional",
    birthDate: format(subDays(today, 6), 'yyyy-MM-dd'),
    achievements: [],
  },
  // ── Upcoming birthdays ──
  {
    id: '10',
    name: 'Rahul Patel',
    email: 'rahul.patel@itg.com',
    department: 'Engineering',
    profilePhotoUrl: "https://picsum.photos/seed/110/200/200",
    profilePhotoHint: "man engineer",
    birthDate: format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), 'yyyy-MM-dd'),
    achievements: [
      { id: 'a6', employeeId: '10', title: 'Mentored 5 Junior Engineers', description: 'Guided new hires through onboarding and first projects.', date: subDays(today, 30).toISOString() },
    ],
  },
  {
    id: '11',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@itg.com',
    department: 'Marketing',
    profilePhotoUrl: "https://picsum.photos/seed/111/200/200",
    profilePhotoHint: "woman marketing",
    birthDate: format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), 'yyyy-MM-dd'),
    achievements: [],
  },
  {
    id: '12',
    name: 'Liam O\'Brien',
    email: 'liam.obrien@itg.com',
    department: 'Sales',
    profilePhotoUrl: "https://picsum.photos/seed/112/200/200",
    profilePhotoHint: "man sales",
    birthDate: format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), 'yyyy-MM-dd'),
    workAnniversary: format(subDays(today, 365 * 3), 'yyyy-MM-dd'),
    achievements: [],
  },
  {
    id: '13',
    name: 'Fatima Al-Hassan',
    email: 'fatima.alhassan@itg.com',
    department: 'Product',
    profilePhotoUrl: "https://picsum.photos/seed/113/200/200",
    profilePhotoHint: "woman product manager",
    birthDate: format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), 'yyyy-MM-dd'),
    achievements: [
      { id: 'a7', employeeId: '13', title: 'Shipped Mobile App v2.0', description: 'Led the complete redesign of the mobile experience, increasing engagement by 60%.', date: subDays(today, 15).toISOString() },
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

export const specialAnnouncements: SpecialAnnouncement[] = [
  {
    id: 'sa1',
    employeeId: '1',
    employeeName: 'Sarah Chen',
    employeePhotoUrl: "https://picsum.photos/seed/101/200/200",
    type: 'car',
    date: subDays(today, 2).toISOString(),
  },
  {
    id: 'sa2',
    employeeId: '2',
    employeeName: 'David Lee',
    employeePhotoUrl: "https://picsum.photos/seed/102/200/200",
    type: 'kid',
    date: subDays(today, 15).toISOString(),
  },
  {
     id: 'sa3',
     employeeId: '3',
     employeeName: 'Maria Rodriguez',
     employeePhotoUrl: "https://picsum.photos/seed/103/200/200",
     type: 'work_anniversary',
     date: today.toISOString(),
  }
];

export const ideas: Idea[] = [
  {
    id: 'id1',
    employeeId: '4',
    employeeName: 'Shinji Ikari',
    employeePhotoUrl: "https://picsum.photos/seed/104/200/200",
    title: 'Implement 4-day work week trial',
    description: 'A 6-month trial of a 4-day work week to improve employee wellbeing and productivity.',
    votes: 42,
    date: subDays(today, 5).toISOString(),
  },
  {
     id: 'id2',
     employeeId: '1',
     employeeName: 'Sarah Chen',
     employeePhotoUrl: "https://picsum.photos/seed/101/200/200",
     title: 'Monthly Hackathons',
     description: 'Dedicated time each month for cross-functional teams to build innovative internal tools.',
     votes: 15,
     date: subDays(today, 10).toISOString(),
  }
];

export const recognitions: Recognition[] = [
    {
        id: 'rec1',
        fromEmployeeId: '1',
        fromEmployeeName: 'Sarah Chen',
        toEmployeeId: '4',
        toEmployeeName: 'Shinji Ikari',
        toEmployeePhotoUrl: "https://picsum.photos/seed/104/200/200",
        message: 'Great job refactoring the auth service! The code is much cleaner now.',
        date: subDays(today, 1).toISOString(),
    },
    {
        id: 'rec2',
        fromEmployeeId: '4',
        fromEmployeeName: 'Shinji Ikari',
        toEmployeeId: '3',
        toEmployeeName: 'Maria Rodriguez',
        toEmployeePhotoUrl: "https://picsum.photos/seed/103/200/200",
        message: 'Congratulations on exceeding your Q2 target! Incredible work.',
        date: subDays(today, 3).toISOString(),
    }
];

export const events: Event[] = [
    {
        id: 'ev1',
        title: 'Q3 Townhall',
        description: 'Quarterly company update and AMA with the leadership team.',
        date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        location: 'Main Auditorium / Zoom',
        organizerId: '1',
        rsvps: ['1', '2', '3', '4'],
    },
    {
        id: 'ev2',
        title: 'Engineering Meetup',
        description: 'Monthly tech talk and knowledge sharing session.',
        date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        location: 'Conference Room B',
        organizerId: '4',
        rsvps: ['1', '4'],
    }
]

export const currentUser = employees.find(e => e.id === '4');
