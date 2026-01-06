"use server";

import { db } from "~/server/db";
import { getSession } from "~/server/better-auth/server";

interface CreateDepartmentInput {
    name: string;
    companyId?: string;
}

export async function createDepartmentAction(input: CreateDepartmentInput) {
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

        // Check permissions - only SUPER_USER and ADMIN can create departments
        if (currentUser.role !== "SUPER_USER" && currentUser.role !== "ADMIN") {
            return { success: false, error: "Insufficient permissions" };
        }

        // Determine which company to create the department for
        let companyId = input.companyId;
        if (currentUser.role === "ADMIN") {
            if (!currentUser.companyId) {
                return { success: false, error: "Admin must be assigned to a company" };
            }
            companyId = currentUser.companyId;
        } else if (currentUser.role === "SUPER_USER" && !companyId) {
            return { success: false, error: "Company ID is required for Super User" };
        }

        // Validate company exists
        if (companyId) {
            const company = await db.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                return { success: false, error: "Company not found" };
            }
        }

        // Check if department with same name already exists in this company
        const existingDepartment = await db.department.findFirst({
            where: {
                companyId: companyId!,
                name: input.name,
            },
        });

        if (existingDepartment) {
            return { success: false, error: "Department with this name already exists in this company" };
        }

        // Create department
        const department = await db.department.create({
            data: {
                name: input.name,
                companyId: companyId!,
            },
            include: {
                company: true,
            },
        });

        return {
            success: true,
            department: {
                id: department.id,
                name: department.name,
                companyId: department.companyId,
                companyName: department.company.name,
            },
        };
    } catch (error) {
        console.error("Error creating department:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create department",
        };
    }
}

export async function getDepartmentsAction(companyId?: string) {
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

        // Determine which company's departments to fetch
        let targetCompanyId = companyId;
        if (currentUser.role === "ADMIN") {
            if (!currentUser.companyId) {
                return { success: false, error: "Admin must be assigned to a company" };
            }
            targetCompanyId = currentUser.companyId;
        }

        // Fetch departments
        const departments = targetCompanyId
            ? await db.department.findMany({
                where: { companyId: targetCompanyId },
                include: { company: true },
                orderBy: { name: "asc" },
            })
            : await db.department.findMany({
                include: { company: true },
                orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
            });

        return {
            success: true,
            departments: departments.map(d => ({
                id: d.id,
                name: d.name,
                companyId: d.companyId,
                companyName: d.company.name,
            })),
        };
    } catch (error) {
        console.error("Error fetching departments:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch departments",
        };
    }
}

interface UpdateDepartmentInput {
    departmentId: string;
    name: string;
}

export async function updateDepartmentAction(input: UpdateDepartmentInput) {
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

        // Get target department
        const department = await db.department.findUnique({
            where: { id: input.departmentId },
            include: { company: true },
        });

        if (!department) {
            return { success: false, error: "Department not found" };
        }

        // ADMIN can only update departments in their own company
        if (currentUser.role === "ADMIN") {
            if (!currentUser.companyId) {
                return { success: false, error: "Admin must be assigned to a company" };
            }
            if (department.companyId !== currentUser.companyId) {
                return { success: false, error: "Insufficient permissions" };
            }
        }

        // Check if department with same name already exists in this company
        const existingDepartment = await db.department.findFirst({
            where: {
                companyId: department.companyId,
                name: input.name,
                NOT: { id: input.departmentId },
            },
        });

        if (existingDepartment) {
            return { success: false, error: "Department with this name already exists in this company" };
        }

        // Update department
        const updatedDepartment = await db.department.update({
            where: { id: input.departmentId },
            data: { name: input.name },
            include: { company: true },
        });

        return {
            success: true,
            department: {
                id: updatedDepartment.id,
                name: updatedDepartment.name,
                companyId: updatedDepartment.companyId,
                companyName: updatedDepartment.company.name,
            },
        };
    } catch (error) {
        console.error("Error updating department:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update department",
        };
    }
}

export async function deleteDepartmentAction(departmentId: string) {
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

        // Get target department
        const department = await db.department.findUnique({
            where: { id: departmentId },
        });

        if (!department) {
            return { success: false, error: "Department not found" };
        }

        // ADMIN can only delete departments in their own company
        if (currentUser.role === "ADMIN") {
            if (!currentUser.companyId) {
                return { success: false, error: "Admin must be assigned to a company" };
            }
            if (department.companyId !== currentUser.companyId) {
                return { success: false, error: "Insufficient permissions" };
            }
        }

        // Delete department (users' departmentId will be set to null due to onDelete: SetNull)
        await db.department.delete({
            where: { id: departmentId },
        });

        return {
            success: true,
            message: "Department deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting department:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete department",
        };
    }
}
