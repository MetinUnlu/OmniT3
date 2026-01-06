"use client";

import { Tabs } from "@mantine/core";
import { IconUsers, IconBuilding, IconBuildingCommunity } from "@tabler/icons-react";
import { AccountManagement } from "./account-management";
import { CompanyManagement } from "./company-management";
import { DepartmentManagement } from "./department-management";

interface SettingsTabsProps {
    user: {
        id: string;
        role: string;
        companyId: string | null;
        company: { id: string; name: string } | null;
    };
    companies: Array<{ id: string; name: string; slug: string }>;
    initialUsers: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        company: { name: string } | null;
    }>;
    initialDepartments: Array<{
        id: string;
        name: string;
        companyId: string;
        companyName: string;
    }>;
}

export function SettingsTabs({ user, companies, initialUsers, initialDepartments }: SettingsTabsProps) {
    return (
        <Tabs defaultValue="accounts" variant="outline">
            <Tabs.List>
                <Tabs.Tab value="accounts" leftSection={<IconUsers size={16} />}>
                    Account Management
                </Tabs.Tab>
                {(user.role === "SUPER_USER" || user.role === "ADMIN") && (
                    <Tabs.Tab value="departments" leftSection={<IconBuildingCommunity size={16} />}>
                        Department Management
                    </Tabs.Tab>
                )}
                {user.role === "SUPER_USER" && (
                    <Tabs.Tab value="companies" leftSection={<IconBuilding size={16} />}>
                        Company Management
                    </Tabs.Tab>
                )}
            </Tabs.List>

            <Tabs.Panel value="accounts" pt="xl">
                <AccountManagement
                    user={user}
                    companies={companies}
                    initialUsers={initialUsers}
                    initialDepartments={initialDepartments}
                />
            </Tabs.Panel>

            {(user.role === "SUPER_USER" || user.role === "ADMIN") && (
                <Tabs.Panel value="departments" pt="xl">
                    <DepartmentManagement
                        user={user}
                        companies={companies}
                        initialDepartments={initialDepartments}
                    />
                </Tabs.Panel>
            )}

            {user.role === "SUPER_USER" && (
                <Tabs.Panel value="companies" pt="xl">
                    <CompanyManagement companies={companies} />
                </Tabs.Panel>
            )}
        </Tabs>
    );
}
