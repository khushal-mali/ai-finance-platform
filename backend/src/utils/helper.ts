import { addMonths, startOfMonth } from "date-fns";

export const calculateNextReportDate = (lastSentDate?: Date): Date => {
  const now = new Date();
  const lastSent = lastSentDate || now;

  const nextDate = startOfMonth(addMonths(lastSent, 1));
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
};

// new Date(new Date().setMonth(new Date().getMonth() + 1));
