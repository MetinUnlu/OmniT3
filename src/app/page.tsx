import { redirect } from "next/navigation";
import { Container, Title, Text, Center, Stack, Box } from "@mantine/core";

import { LoginForm } from "~/app/_components/login-form";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getSession();

  // If logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <HydrateClient>
      <Box
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container size="sm" py="xl">
          <Center>
            <Stack align="center" gap="xl" style={{ width: "100%" }}>
              <div>
                <Title
                  order={1}
                  size="3.5rem"
                  ta="center"
                  c="gray.9"
                  style={{
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Mini<span style={{ color: "#228be6" }}>Mom</span>
                </Title>
                <Text
                  size="lg"
                  c="gray.6"
                  ta="center"
                  mt="xs"
                  style={{ fontWeight: 400 }}
                >
                  Modern Management Platform
                </Text>
              </div>

              <LoginForm />
            </Stack>
          </Center>
        </Container>
      </Box>
    </HydrateClient>
  );
}
