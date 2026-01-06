import { redirect } from "next/navigation";
import Link from "next/link";
import { Container, Title } from "@mantine/core";
import { getSession } from "~/server/better-auth/server";
import { DashboardHeader } from "~/app/_components/dashboard-header";
import { db } from "~/server/db";
import { SettingsTabs } from "../../_components/settings/settings-tabs";

export default async function SettingsPage() {
    const session = await getSession();

    // If not logged in, redirect to home
    if (!session) {
        redirect("/");
    }

    // Get full user data with role and company
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { company: true },
    });

    if (!user) {
        redirect("/");
    }

    // Only SUPER_USER and ADMIN can access settings
    if (user.role !== "SUPER_USER" && user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Get all companies for SUPER_USER
    const companies = user.role === "SUPER_USER"
        ? await db.company.findMany({ 
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                slug: true,
                archivedAt: true,
                deletedAt: true,
            }
        })
        : [];

    // Get users based on role
    const users = user.role === "SUPER_USER"
        ? await db.user.findMany({
            include: { company: true, department: true },
            orderBy: { createdAt: "desc" }
        })
        : await db.user.findMany({
            where: { companyId: user.companyId },
            include: { company: true, department: true },
            orderBy: { createdAt: "desc" }
        });

    // Get departments based on role
    const departments = user.role === "SUPER_USER"
        ? await db.department.findMany({
            include: { company: true },
            orderBy: [{ company: { name: "asc" } }, { name: "asc" }]
        })
        : user.companyId
            ? await db.department.findMany({
                where: { companyId: user.companyId },
                include: { company: true },
                orderBy: { name: "asc" }
            })
            : [];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
            {/* Header */}
            <header
                style={{
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #e9ecef",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                }}
            >
                <Container
                    size="xl"
                    style={{
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        minHeight: "70px",
                    }}
                >
                    <Link href="/dashboard" style={{ textDecoration: "none" }}>
                        <Title
                            order={3}
                            style={{ fontWeight: 700, color: "#212529", cursor: "pointer" }}
                        >
                            Mini<span style={{ color: "#228be6" }}>Mom</span>
                        </Title>
                    </Link>

                    <DashboardHeader session={session} />
                </Container>
            </header>

            {/* Main Content */}
            <Container size="xl" py="xl">
                <Title order={1} size="2.5rem" c="gray.9" mb="md">
                    Settings
                </Title>

                <SettingsTabs
                    user={user}
                    companies={companies}
                    initialUsers={users.map(u => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role,
                        company: u.company ? { name: u.company.name } : null,
                        department: u.department ? { name: u.department.name } : null
                    }))}
                    initialDepartments={departments.map(d => ({
                        id: d.id,
                        name: d.name,
                        companyId: d.companyId,
                        companyName: d.company.name
                    }))}
                />
            </Container>
        </div>
    );
}
