"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { comparePassword, hashPassword } from "@/lib/hash";
import { signJWT, getCurrentUser } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let redirectPath = "";

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const matches = comparePassword(password, user.password);
    if (!matches) {
      return { error: "Invalid credentials" };
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
      sameSite: "lax",
    });

    if (user.role === "EMPLOYEE") {
      redirectPath = "/dashboard/employee";
    } else if (user.role === "DIRECTOR") {
      redirectPath = "/dashboard/director";
    } else if (user.role === "ACCOUNTS") {
      redirectPath = "/dashboard/accounts";
    } else {
      redirectPath = "/login";
    }
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Something went wrong" };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function createEmployeeAction(data: { name: string; email: string; passwordSecret: string }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "DIRECTOR") {
    return { error: "Unauthorized. Only directors can provision new employees." };
  }

  const { name, email, passwordSecret } = data;

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters long." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid work email address." };
  }
  if (!passwordSecret || passwordSecret.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "A user with this email address already exists." };
    }

    const hashedPassword = hashPassword(passwordSecret);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Failed to provision employee:", error);
    return { error: "Database error: " + error.message };
  }
}

export async function saveSignatureAction(url: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  if (!url || !url.startsWith("/uploads/")) {
    return { error: "Invalid signature file path." };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { signatureUrl: url },
    });

    return { success: true, signatureUrl: updated.signatureUrl };
  } catch (error: any) {
    console.error("Failed to save signature profile:", error);
    return { error: "Database error: " + error.message };
  }
}

export async function deleteSignatureAction() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { signatureUrl: null },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete signature profile:", error);
    return { error: "Database error: " + error.message };
  }
}
