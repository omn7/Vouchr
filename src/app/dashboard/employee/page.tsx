import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EmployeeWorkspace } from "./employee-workspace";

export default async function EmployeePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "EMPLOYEE") {
    redirect("/login?clear=1");
  }

  // Fetch the employee's vouchers
  const vouchers = await prisma.voucher.findMany({
    where: { employeeId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates and strip Prisma prototype chains for Client Component safety
  const serializedVouchers = JSON.parse(JSON.stringify(vouchers));

  return (
    <EmployeeWorkspace initialVouchers={serializedVouchers} user={user} />
  );
}
