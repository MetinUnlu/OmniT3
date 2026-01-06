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

interface UpdateUserInput {
    userId: string;
    name?: string;
    role?: "SUPER_USER" | "ADMIN" | "MEMBER";
    departmentId?: string | null;
}

export async function updateUserAction(input: UpdateUserInput) {
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

        // Get target user
        const targetUser = await db.user.findUnique({
            where: { id: input.userId },
            include: { company: true },
        });

        if (!targetUser) {
            return { success: false, error: "User not found" };
        }

        // ADMIN can only update users in their own company
        if (currentUser.role === "ADMIN") {
            if (!currentUser.companyId) {
                return { success: false, error: "Admin must be assigned to a company" };
            }
            if (targetUser.companyId !== currentUser.companyId) {
                return { success: false, error: "Insufficient permissions" };
            }
        }

        // ADMIN cannot change role to SUPER_USER
        if (currentUser.role === "ADMIN" && input.role === "SUPER_USER") {
            return { success: false, error: "Admins cannot assign Super User role" };
        }

        // Validate department if provided
        if (input.departmentId) {
            const department = await db.department.findUnique({
                where: { id: input.departmentId },
            });
            if (!department) {
                return { success: false, error: "Invalid department selection" };
            }
            // Ensure department belongs to user's company
            if (targetUser.companyId && department.companyId !== targetUser.companyId) {
                return { success: false, error: "Invalid department selection" };
            }
        }

        // Prepare update data
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.role !== undefined) updateData.role = input.role;
        if (input.departmentId !== undefined) {
            updateData.departmentId = input.departmentId;
        }

        // Update user
        const updatedUser = await db.user.update({
            where: { id: input.userId },
            data: updateData,
            include: { company: true, department: true },
        });

        return {
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                department: updatedUser.department,
            },
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update user",
        };
    }
}

export async function deleteUserAction(userId: string) {
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

        // Prevent self-deletion
        if (currentUser.id === userId) {
            return { success: false, error: "Cannot delete your own account" };
        }

        // Get target user
        const targetUser = await db.user.findUnique({
            where: { id: userId },
        });

        if (!targetUser) {
            return { success: false, error: "User not found" };
        }

        // ADMIN can only delete users in their own company
        if (currentUser.role === "ADMIN") {
            if (!currentUser.companyId) {
                return { success: false, error: "Admin must be assigned to a company" };
            }
            if (targetUser.companyId !== currentUser.companyId) {
                return { success: false, error: "Insufficient permissions" };
            }
            // ADMIN cannot delete other ADMIN or SUPER_USER
            if (targetUser.role === "ADMIN" || targetUser.role === "SUPER_USER") {
                return { success: false, error: "Insufficient permissions to delete this user" };
            }
        }

        // Delete user (cascades handled by Prisma)
        await db.user.delete({
            where: { id: userId },
        });

        return {
            success: true,
            message: "User deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete user",
        };
    }
}

interface ChangePasswordInput {
    userId: string;
    currentPassword?: string;
    newPassword: string;
}

export async function changePasswordAction(input: ChangePasswordInput) {
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

        // Get target user
        const targetUser = await db.user.findUnique({
            where: { id: input.userId },
        });

        if (!targetUser) {
            return { success: false, error: "User not found" };
        }

        const isOwnPassword = currentUser.id === input.userId;

        // Check permissions
        if (isOwnPassword) {
            // Users changing their own password must provide current password
            if (!input.currentPassword) {
                return { success: false, error: "Current password is required" };
            }

            // Verify current password using Better Auth
            const verifyResult = await auth.api.signInEmail({
                body: {
                    email: currentUser.email,
                    password: input.currentPassword,
                },
            });

            if (!verifyResult) {
                return { success: false, error: "Current password is incorrect" };
            }
        } else {
            // Changing someone else's password
            if (currentUser.role === "ADMIN") {
                // ADMIN can only change passwords in their own company
                if (!currentUser.companyId) {
                    return { success: false, error: "Admin must be assigned to a company" };
                }
                if (targetUser.companyId !== currentUser.companyId) {
                    return { success: false, error: "Insufficient permissions" };
                }
                // ADMIN can only change MEMBER passwords
                if (targetUser.role !== "MEMBER") {
                    return { success: false, error: "Admins can only change Member passwords" };
                }
            } else if (currentUser.role === "MEMBER") {
                // MEMBERs cannot change other users' passwords
                return { success: false, error: "Insufficient permissions" };
            }
            // SUPER_USER can change anyone's password
        }

        // Validate new password
        if (input.newPassword.length < 8) {
            return { success: false, error: "New password must be at least 8 characters" };
        }

        // Get account to update password
        const account = await db.account.findFirst({
            where: {
                userId: input.userId,
                providerId: "credential",
            },
        });

        if (!account) {
            return { success: false, error: "Account not found" };
        }

        // Hash new password (using Better Auth's hashing)
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);

        // Update password in account
        await db.account.update({
            where: { id: account.id },
            data: { password: hashedPassword },
        });

        return {
            success: true,
            message: isOwnPassword 
                ? "Password changed successfully" 
                : "User password changed successfully",
        };
    } catch (error) {
        console.error("Error changing password:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to change password",
        };
    }
}
