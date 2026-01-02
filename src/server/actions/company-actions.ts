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
