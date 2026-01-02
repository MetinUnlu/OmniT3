"use client";

import { Tabs } from "@mantine/core";
import { IconUsers, IconBuilding } from "@tabler/icons-react";
import { AccountManagement } from "./account-management";
import { CompanyManagement } from "./company-management";

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
}

export function SettingsTabs({ user, companies, initialUsers }: SettingsTabsProps) {
    return (
        <Tabs defaultValue="accounts" variant="outline">
            <Tabs.List>
                <Tabs.Tab value="accounts" leftSection={<IconUsers size={16} />}>
                    Account Management
                </Tabs.Tab>
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
                />
            </Tabs.Panel>

            {user.role === "SUPER_USER" && (
                <Tabs.Panel value="companies" pt="xl">
                    <CompanyManagement companies={companies} />
                </Tabs.Panel>
            )}
        </Tabs>
    );
}
