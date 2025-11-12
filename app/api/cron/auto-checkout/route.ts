import prisma from "@/lib/db";
import { NextResponse } from "next/server";

async function autoCheckoutAllEmployees() {
  const now = new Date();

  // start of today in server time
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // get all logs still checked in today
  const stillCheckedIn = await prisma.attendanceLog.findMany({
    where: {
      status: "checked_in",
      checkInTime: { gte: startOfDay },
    },
  });

  if (!stillCheckedIn.length) {
    return { count: 0 };
  }

  // update them
  for (const log of stillCheckedIn) {
    const totalHours =
      (now.getTime() - log.checkInTime.getTime()) / (1000 * 60 * 60);

    await prisma.attendanceLog.update({
      where: { id: log.id },
      data: {
        checkOutTime: now,
        status: "checked_out",
        checkOutMethod: "auto", // <— important to know it was auto
        totalHours: Number.parseFloat(totalHours.toFixed(2)),
      },
    });
  }

  return { count: stillCheckedIn.length };
}

export async function GET(req: Request) {
  // 1. protect it with a header
  const authHeader = req.headers.get("x-cron-secret");
  if (!authHeader || authHeader !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await autoCheckoutAllEmployees();
    return NextResponse.json({
      ok: true,
      message: "Auto checkout completed",
      ...result,
    });
  } catch (err) {
    console.error("auto-checkout error", err);
    return NextResponse.json(
      { ok: false, error: "Auto checkout failed" },
      { status: 500 }
    );
  }
}
