"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const VoucherInputSchema = z.object({
  department: z.string().min(2, "Department must be at least 2 characters"),
  expenseTitle: z.string().min(3, "Title must be at least 3 characters"),
  expenseCategory: z.string().min(2, "Category is required"),
  expenseDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

// Helper to generate a unique voucher number
async function generateVoucherNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  let isUnique = false;
  let voucherNum = "";
  
  while (!isUnique) {
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    voucherNum = `VCH-${dateStr}-${random}`;
    
    const existing = await prisma.voucher.findUnique({
      where: { voucherNumber: voucherNum },
    });
    if (!existing) {
      isUnique = true;
    }
  }
  return voucherNum;
}

export async function createVoucher(data: z.infer<typeof VoucherInputSchema>) {
  const user = await getCurrentUser();
  if (!user || user.role !== "EMPLOYEE") {
    return { error: "Unauthorized. Only employees can create vouchers." };
  }

  const parsed = VoucherInputSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const voucherNumber = await generateVoucherNumber();
    const voucher = await prisma.voucher.create({
      data: {
        voucherNumber,
        department: parsed.data.department,
        expenseTitle: parsed.data.expenseTitle,
        expenseCategory: parsed.data.expenseCategory,
        expenseDate: new Date(parsed.data.expenseDate),
        amount: parsed.data.amount,
        description: parsed.data.description || null,
        receiptUrl: parsed.data.receiptUrl || null,
        status: "DRAFT",
        employeeId: user.id,
      },
    });
    revalidatePath("/dashboard/employee");
    return { success: true, voucher };
  } catch (error) {
    console.error("Failed to create voucher:", error);
    return { error: "Failed to create voucher in database" };
  }
}

export async function updateVoucher(
  id: string,
  data: z.infer<typeof VoucherInputSchema>
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "EMPLOYEE") {
    return { error: "Unauthorized." };
  }

  const parsed = VoucherInputSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const existing = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Voucher not found" };
    }

    if (existing.employeeId !== user.id) {
      return { error: "Unauthorized. You do not own this voucher." };
    }

    if (existing.status !== "DRAFT") {
      return { error: "Only draft vouchers can be updated." };
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        department: parsed.data.department,
        expenseTitle: parsed.data.expenseTitle,
        expenseCategory: parsed.data.expenseCategory,
        expenseDate: new Date(parsed.data.expenseDate),
        amount: parsed.data.amount,
        description: parsed.data.description || null,
        receiptUrl: parsed.data.receiptUrl || null,
      },
    });
    revalidatePath("/dashboard/employee");
    return { success: true, voucher };
  } catch (error) {
    console.error("Failed to update voucher:", error);
    return { error: "Failed to update voucher" };
  }
}

export async function deleteVoucher(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "EMPLOYEE") {
    return { error: "Unauthorized." };
  }

  try {
    const existing = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Voucher not found" };
    }

    if (existing.employeeId !== user.id) {
      return { error: "Unauthorized." };
    }

    if (existing.status !== "DRAFT") {
      return { error: "Only draft vouchers can be deleted." };
    }

    await prisma.voucher.delete({
      where: { id },
    });

    revalidatePath("/dashboard/employee");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete voucher:", error);
    return { error: "Failed to delete voucher" };
  }
}

export async function submitVoucher(id: string, signature: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "EMPLOYEE") {
    return { error: "Unauthorized." };
  }

  if (!signature || signature.trim() === "") {
    return { error: "Signature is required to submit voucher." };
  }

  try {
    const existing = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Voucher not found" };
    }

    if (existing.employeeId !== user.id) {
      return { error: "Unauthorized." };
    }

    if (existing.status !== "DRAFT") {
      return { error: "Only draft vouchers can be submitted." };
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        status: "PENDING",
        employeeSignature: signature,
      },
    });

    revalidatePath("/dashboard/employee");
    return { success: true, voucher };
  } catch (error) {
    console.error("Failed to submit voucher:", error);
    return { error: "Failed to submit voucher" };
  }
}

export async function approveVoucher(id: string, signature: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DIRECTOR") {
    return { error: "Unauthorized. Only directors can approve vouchers." };
  }

  if (!signature || signature.trim() === "") {
    return { error: "Director signature is required to approve." };
  }

  try {
    const existing = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Voucher not found" };
    }

    if (existing.status !== "PENDING" && existing.status !== "DRAFT") {
      return { error: "Only pending or draft vouchers can be approved." };
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        status: "APPROVED",
        directorSignature: signature,
        approvalDate: new Date(),
        rejectionReason: null,
      },
    });

    revalidatePath("/dashboard/director");
    revalidatePath("/dashboard/accounts");
    return { success: true, voucher };
  } catch (error) {
    console.error("Failed to approve voucher:", error);
    return { error: "Failed to approve voucher" };
  }
}

export async function rejectVoucher(id: string, reason: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DIRECTOR") {
    return { error: "Unauthorized. Only directors can reject vouchers." };
  }

  if (!reason || reason.trim() === "") {
    return { error: "Rejection reason is required." };
  }

  try {
    const existing = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Voucher not found" };
    }

    if (existing.status !== "PENDING" && existing.status !== "DRAFT") {
      return { error: "Only pending or draft vouchers can be rejected." };
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        directorSignature: null,
        approvalDate: null,
      },
    });

    revalidatePath("/dashboard/director");
    return { success: true, voucher };
  } catch (error) {
    console.error("Failed to reject voucher:", error);
    return { error: "Failed to reject voucher" };
  }
}
