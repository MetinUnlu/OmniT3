"use server";

import { db } from "~/server/db";
import { getSession } from "~/server/better-auth/server";

interface CreateCompanyInput {
    name: string;
    slug: string;
}

export async function createCompanyAction(input: CreateCompanyInput) {
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

        // Only SUPER_USER can create companies
        if (currentUser.role !== "SUPER_USER") {
            return { success: false, error: "Only Super Users can create companies" };
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(input.slug)) {
            return {
                success: false,
                error: "Slug must be lowercase letters, numbers, and hyphens only",
            };
        }

        // Check if company with slug already exists
        const existingCompany = await db.company.findUnique({
            where: { slug: input.slug },
        });

        if (existingCompany) {
            return { success: false, error: "Company with this slug already exists" };
        }

        // Create company
        const company = await db.company.create({
            data: {
                name: input.name,
                slug: input.slug,
            },
        });

        return {
            success: true,
            company: {
                id: company.id,
                name: company.name,
                slug: company.slug,
            },
        };
    } catch (error) {
        console.error("Error creating company:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create company",
        };
    }
}

interface UpdateCompanyInput {
    companyId: string;
    name: string;
    slug?: string; // Optional, will auto-generate if not provided
}

export async function updateCompanyAction(input: UpdateCompanyInput) {
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

        // Only SUPER_USER can update companies
        if (currentUser.role !== "SUPER_USER") {
            return { success: false, error: "Only Super Users can update companies" };
        }

        // Get target company
        const company = await db.company.findUnique({
            where: { id: input.companyId },
        });

        if (!company) {
            return { success: false, error: "Company not found" };
        }

        // Auto-generate slug from name if not provided
        const slug = input.slug || input.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        // Validate slug format
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(slug)) {
            return {
                success: false,
                error: "Slug must be lowercase letters, numbers, and hyphens only",
            };
        }

        // Check if slug is already taken by another company
        const existingCompany = await db.company.findFirst({
            where: {
                slug: slug,
                NOT: { id: input.companyId },
            },
        });

        if (existingCompany) {
            return { success: false, error: "Company with this slug already exists" };
        }

        // Update company
        const updatedCompany = await db.company.update({
            where: { id: input.companyId },
            data: {
                name: input.name,
                slug: slug,
            },
        });

        return {
            success: true,
            company: {
                id: updatedCompany.id,
                name: updatedCompany.name,
                slug: updatedCompany.slug,
            },
        };
    } catch (error) {
        console.error("Error updating company:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update company",
        };
    }
}

export async function archiveCompanyAction(companyId: string) {
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

        // Only SUPER_USER can archive companies
        if (currentUser.role !== "SUPER_USER") {
            return { success: false, error: "Only Super Users can archive companies" };
        }

        // Get target company
        const company = await db.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return { success: false, error: "Company not found" };
        }

        if (company.archivedAt) {
            return { success: false, error: "Company is already archived" };
        }

        // Archive company with 30-day grace period
        const now = new Date();
        const deletionDate = new Date(now);
        deletionDate.setDate(deletionDate.getDate() + 30);

        await db.company.update({
            where: { id: companyId },
            data: {
                archivedAt: now,
                deletedAt: deletionDate,
            },
        });

        return {
            success: true,
            message: `Company archived successfully. Scheduled for permanent deletion on ${deletionDate.toLocaleDateString()}`,
            deletionDate: deletionDate,
        };
    } catch (error) {
        console.error("Error archiving company:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to archive company",
        };
    }
}

export async function restoreCompanyAction(companyId: string) {
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

        // Only SUPER_USER can restore companies
        if (currentUser.role !== "SUPER_USER") {
            return { success: false, error: "Only Super Users can restore companies" };
        }

        // Get target company
        const company = await db.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return { success: false, error: "Company not found" };
        }

        if (!company.archivedAt) {
            return { success: false, error: "Company is not archived" };
        }

        // Restore company
        await db.company.update({
            where: { id: companyId },
            data: {
                archivedAt: null,
                deletedAt: null,
            },
        });

        return {
            success: true,
            message: "Company restored successfully",
        };
    } catch (error) {
        console.error("Error restoring company:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to restore company",
        };
    }
}

export async function deleteCompanyAction(companyId: string, force: boolean = false) {
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

        // Only SUPER_USER can delete companies
        if (currentUser.role !== "SUPER_USER") {
            return { success: false, error: "Only Super Users can delete companies" };
        }

        // Get target company
        const company = await db.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return { success: false, error: "Company not found" };
        }

        // If not forcing and company is not archived, require archive first
        if (!force && !company.archivedAt) {
            return { 
                success: false, 
                error: "Company must be archived before deletion. Use archive feature or force delete." 
            };
        }

        // If not forcing and grace period hasn't passed, prevent deletion
        if (!force && company.deletedAt && company.deletedAt > new Date()) {
            const daysRemaining = Math.ceil(
                (company.deletedAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            return { 
                success: false, 
                error: `Grace period active. ${daysRemaining} days remaining until automatic deletion. Use force delete if needed.` 
            };
        }

        // Permanently delete company (cascades to all related data)
        await db.company.delete({
            where: { id: companyId },
        });

        return {
            success: true,
            message: "Company permanently deleted",
        };
    } catch (error) {
        console.error("Error deleting company:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete company",
        };
    }
}
