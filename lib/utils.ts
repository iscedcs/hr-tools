import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toNull = (val: FormDataEntryValue | null) =>
  val === null || val === "" ? null : val;
