import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
function formatKeyForSixHours(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hour = date.getHours();
  // Determine the start of the 6-hour block
  const startHour = Math.floor(hour / 6) * 6;
  const endHour = startHour + 5; // For a 6-hour window: 0-5, 6-11, etc.

  // Format it in a more human-readable way:
  // Example: "2024-12-06 (00:00-05:59)" for hours 0 through 5
  return `${year}-${month}-${day} (${String(startHour).padStart(
    2,
    "0"
  )}:00-${String(endHour).padStart(2, "0")}:59)`;
}

function getIsoWeek(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const week = Math.ceil(
    ((d.getTime() - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7
  );
  return { year, week };
}

function determinePeriodType2(diffInDays: number): {
  type: string;
  formatKey: (date: Date) => string;
} {
  if (diffInDays < 3) {
    // Under 2 days: hourly grouping
    return {
      type: "hour",
      formatKey: (date: Date) => date.toISOString().substring(0, 13), // YYYY-MM-DDTHH
    };
  } else if (diffInDays < 14) {
    // Under 5 days: every 12 hours grouping
    return {
      type: "6hour",
      formatKey: (date: Date) => formatKeyForSixHours(date),
    };
  } else if (diffInDays < 30) {
    // Under 2 weeks: daily grouping
    return {
      type: "day",
      formatKey: (date: Date) => date.toISOString().substring(0, 10), // YYYY-MM-DD
    };
  } else if (diffInDays < 120) {
    // Under 2 months: weekly grouping
    return {
      type: "week",
      formatKey: (date: Date) => {
        const { year, week } = getIsoWeek(date);
        return `${year}-W${String(week).padStart(2, "0")}`;
      },
    };
  } else {
    // Over 2 months: monthly grouping
    return {
      type: "month",
      formatKey: (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`; // YYYY-MM
      },
    };
  }
}

function determinePeriodType(diffInDays: number): {
  type: string;
  formatKey: (date: Date) => string;
} {
  console.log("🚀 ~ determinePeriodType ~ diffInDays:", diffInDays);
  if (diffInDays < 3) {
    // Under 2 days: hourly grouping
    return {
      type: "hour",
      formatKey: (date: Date) => date.toISOString().substring(0, 13), // YYYY-MM-DDTHH
    };
  } else if (diffInDays < 14) {
    // Under 5 days: every 12 hours grouping
    return {
      type: "6hour",
      formatKey: (date: Date) => formatKeyForSixHours(date),
    };
  } else if (diffInDays < 30) {
    // Under 2 weeks: daily grouping
    return {
      type: "day",
      formatKey: (date: Date) => date.toISOString().substring(0, 10), // YYYY-MM-DD
    };
  } else if (diffInDays < 60) {
    // Under 2 months: weekly grouping
    return {
      type: "week",
      formatKey: (date: Date) => {
        const { year, week } = getIsoWeek(date);
        return `${year}-W${String(week).padStart(2, "0")}`;
      },
    };
  } else {
    // Over 2 months: monthly grouping
    return {
      type: "month",
      formatKey: (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`; // YYYY-MM
      },
    };
  }
}

export async function getRevenueChart(
  req: Request,
  res: Response
): Promise<void | any> {
  const roleId = res.locals.roleId;
  if (!roleId || roleId < 2) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { from, to } = req.query;

  const validatedParams = z.object({
    from: z.string().date(),
    to: z.string().date(),
  });

  const parsed = validatedParams.safeParse({ from, to });
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: parsed.error.flatten().fieldErrors });
  }

  const fromDate = new Date(parsed.data.from);
  const toDate = new Date(parsed.data.to);

  // Calculate time difference in days
  const diffInDays =
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);

  try {
    // Determine period type and formatter
    const { type: periodType, formatKey } = determinePeriodType2(diffInDays);

    // Fetch orders in the given date range
    const orders = await prisma.order.findMany({
      where: {
        created_at: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        total_price_in_oere: true,
        created_at: true,
      },
    });

    // Group the orders based on the interval
    const grouped: Record<string, number> = {};

    for (const order of orders) {
      const key = formatKey(order.created_at);
      grouped[key] = (grouped[key] || 0) + Number(order.total_price_in_oere);
    }

    // Convert object to array of { period, revenue }
    const result = Object.entries(grouped)
      .map(([period, revenue]) => ({
        period,
        revenue: revenue / 100,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.json({ period_type: periodType, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getRevenueChart;
