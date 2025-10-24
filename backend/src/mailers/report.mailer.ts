import type { ReportType } from "../@types/report.type.js";
import { formatCurrency } from "../utils/format-currency.js";
import { sendEmail } from "./mailers.js";
import { getReportEmailTemplate } from "./templates/report.template.js";

export type ReportEmailParams = {
  email: string;
  username: string;
  report: ReportType;
  frequency: string;
};

export const sendReportEmail = async (params: ReportEmailParams) => {
  const { email, frequency, report, username } = params;
  const html = getReportEmailTemplate(
    {
      username,
      ...report,
    },
    frequency
  );

  const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${formatCurrency(report.totalIncome)}
    Expenses: ${formatCurrency(report.totalExpenses)}
    Balance: ${formatCurrency(report.availableBalance)}
    Savings Rate: ${report.savingsRate.toFixed(2)}%

    ${report.insights.join("\n")}
`;

  console.log(text, "text mail");

  return sendEmail({
    to: email,
    subject: `${frequency} Financial Report - ${report.period}`,
    text,
    html,
  });
};
