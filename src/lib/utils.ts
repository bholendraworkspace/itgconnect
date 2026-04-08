import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  //hello word
  return twMerge(clsx(inputs))
}

import { Employee } from "./types";

export const PROFILE_FIELDS: { key: keyof Employee; label: string; weight: number }[] = [
  { key: "name", label: "Full Name", weight: 1 },
  { key: "email", label: "Email", weight: 1 },
  { key: "department", label: "Department", weight: 1 },
  { key: "profilePhotoUrl", label: "Profile Photo", weight: 1 },
  { key: "birthDate", label: "Date of Birth", weight: 1 },
  { key: "role", label: "Role / Designation", weight: 1 },
  { key: "aboutMe", label: "About Me", weight: 1 },
  { key: "jobLove", label: "What I love about my job", weight: 1 },
  { key: "interests", label: "Interests & Hobbies", weight: 1 },
  { key: "mobileNumber", label: "Mobile Number", weight: 1 },
  { key: "gender", label: "Gender", weight: 1 },
  { key: "workAnniversary", label: "Work Anniversary", weight: 1 },
];

export function calculateCompletion(emp: Employee | null | undefined): { percentage: number; missing: string[] } {
  if (!emp) return { percentage: 0, missing: [] };
  const missing: string[] = [];
  let filled = 0;
  for (const f of PROFILE_FIELDS) {
    const val = emp[f.key];
    if (val && String(val).trim() && val !== "1990-01-01") {
      filled += f.weight;
    } else {
      missing.push(f.label);
    }
  }
  return { percentage: Math.round((filled / PROFILE_FIELDS.length) * 100), missing };
}
