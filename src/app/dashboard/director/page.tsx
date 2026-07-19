import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DirectorWorkspace } from "./director-workspace";

export default async function DirectorPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DIRECTOR") {
    redirect("/login?clear=1");
  }

  // Fetch pending review vouchers
  const pendingVouchers = await prisma.voucher.findMany({
    where: {
      status: {
        in: ["PENDING", "DRAFT"],
      },
    },
    include: {
      employee: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch approved/rejected history
  const historyVouchers = await prisma.voucher.findMany({
    where: {
      status: {
        in: ["APPROVED", "REJECTED"],
      },
    },
    include: {
      employee: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates and strip Prisma prototype chains for Client Component safety
  const serialize = (items: any[]) => JSON.parse(JSON.stringify(items));

  return (
    <DirectorWorkspace
      initialPending={serialize(pendingVouchers)}
      initialHistory={serialize(historyVouchers)}
      user={user}
    />
  );
}
