import { redirect } from "next/navigation";
import { Container, Title, Text, Card, Badge, Stack } from "@mantine/core";
import {
  IconChartBar,
  IconActivity,
  IconSettings,
} from "@tabler/icons-react";
import { getSession } from "~/server/better-auth/server";
import { DashboardHeader } from "~/app/_components/dashboard-header";

export default async function Dashboard() {
  const session = await getSession();

  // If not logged in, redirect to home
  if (!session) {
    redirect("/");
  }

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
          <Title order={3} style={{ fontWeight: 700, color: "#212529" }}>
            Mini<span style={{ color: "#228be6" }}>Mom</span>
          </Title>

          <DashboardHeader session={session} />
        </Container>
      </header>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Welcome Section */}
          <div>
            <Title order={1} size="2.5rem" c="gray.9" mb="xs">
              Welcome back, {session.user?.name || "User"}!
            </Title>
            <Text size="lg" c="gray.6">
              Here's what's happening with your account today.
            </Text>
          </div>

          {/* Dashboard Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <IconChartBar size={28} color="#228be6" />
                <Badge color="blue" variant="light">
                  Active
                </Badge>
              </div>
              <Title order={3} c="gray.9" mb="xs">
                Quick Stats
              </Title>
              <Text size="sm" c="gray.6">
                Your dashboard statistics will appear here. Track your
                performance and key metrics.
              </Text>
            </Card>

            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <IconActivity size={28} color="#40c057" />
                <Badge color="green" variant="light">
                  Live
                </Badge>
              </div>
              <Title order={3} c="gray.9" mb="xs">
                Recent Activity
              </Title>
              <Text size="sm" c="gray.6">
                Recent activities will be displayed here. Stay updated with
                real-time changes.
              </Text>
            </Card>

            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <IconSettings size={28} color="#fd7e14" />
                <Badge color="orange" variant="light">
                  Config
                </Badge>
              </div>
              <Title order={3} c="gray.9" mb="xs">
                Settings
              </Title>
              <Text size="sm" c="gray.6">
                Manage your account settings and preferences. Customize your
                experience.
              </Text>
            </Card>
          </div>
        </Stack>
      </Container>
    </div>
  );
}
