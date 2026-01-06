"use server";

import { auth } from "~/server/better-auth";
import { db } from "~/server/db";
import { getSession } from "~/server/better-auth/server";

interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role: "SUPER_USER" | "ADMIN" | "MEMBER";
    companyId?: string;
    departmentId?: string;
}

export async function createUserAction(input: CreateUserInput) {
    try {
        // Get current session
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        // Get current user with role
        const currentUser = await db.user.findUnique({
            where: { id: session.user.id },
        });

        if (!currentUser) {
            return { success: false, error: "User not found" };
        }

        // Check permissions
        if (currentUser.role !== "SUPER_USER" && currentUser.role !== "ADMIN") {
            return { success: false, error: "Insufficient permissions" };
        }

        // ADMIN can only create ADMIN and MEMBER roles
        if (currentUser.role === "ADMIN" && input.role === "SUPER_USER") {
            return { success: false, error: "Admins cannot create Super Users" };
        }

        // ADMIN must assign users to their own company
        let companyId = input.companyId;
        if (currentUser.role === "ADMIN") {
            if (!currentUser.companyId) {
                return { success: false, error: "Admin must be assigned to a company" };
            }
            companyId = currentUser.companyId;
        }

        // Validate company exists if provided
        if (companyId) {
            const company = await db.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                return { success: false, error: "Company not found" };
            }
        }

        // Validate department exists if provided and belongs to the company
        if (input.departmentId) {
            const department = await db.department.findUnique({
                where: { id: input.departmentId },
            });
            if (!department) {
                return { success: false, error: "Invalid department selection" };
            }
            // Ensure department belongs to the selected company (prevent cross-tenant access)
            if (companyId && department.companyId !== companyId) {
                return { success: false, error: "Invalid department selection" };
            }
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email: input.email },
        });

        if (existingUser) {
            return { success: false, error: "User with this email already exists" };
        }

        // Create user using Better Auth API
        const result = await auth.api.signUpEmail({
            body: {
                email: input.email,
                password: input.password,
                name: input.name,
            },
        });

        if (!result) {
            return { success: false, error: "Failed to create user account" };
        }

        // Update user with role and company
        const updatedUser = await db.user.update({
            where: { email: input.email },
            data: {
                role: input.role,
                companyId: companyId || null,
                departmentId: input.departmentId || null,
            },
        });

        return {
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create user",
        };
    }
}
