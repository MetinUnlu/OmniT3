"use client";

import { Avatar, Group, Menu, Text, Loader } from "@mantine/core";
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "~/server/better-auth/client";

interface DashboardHeaderProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
    } | null;
  };
}

export function DashboardHeader({ session }: DashboardHeaderProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      setIsSigningOut(false);
    }
  };

  return (
    <Group gap="md">
      <Text size="sm" c="gray.6">
        {session.user?.email}
      </Text>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Avatar color="blue" radius="xl" style={{ cursor: "pointer" }}>
            {session.user?.name?.[0]?.toUpperCase() || "U"}
          </Avatar>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item leftSection={<IconUser size={16} />}>Profile</Menu.Item>
          <Menu.Item
            leftSection={<IconSettings size={16} />}
            onClick={() => router.push("/dashboard/settings")}
          >
            Settings
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={
              isSigningOut ? (
                <Loader size={16} color="red" />
              ) : (
                <IconLogout size={16} />
              )
            }
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
