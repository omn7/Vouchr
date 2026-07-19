import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AccountsWorkspace } from "./accounts-workspace";

export default async function AccountsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ACCOUNTS") {
    redirect("/login?clear=1");
  }

  // Fetch all vouchers for ledger inspection
  const vouchers = await prisma.voucher.findMany({
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
  const serializedVouchers = JSON.parse(JSON.stringify(vouchers));

  return <AccountsWorkspace initialVouchers={serializedVouchers} user={user} />;
}
