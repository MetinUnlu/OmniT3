"use client";

import { authClient } from "~/server/better-auth/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Alert,
  Stack,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Paper
      shadow="sm"
      p="xl"
      radius="md"
      style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "#ffffff",
      }}
    >
      <Title order={2} ta="center" mb="xl" c="gray.9">
        Login
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Email"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            size="md"
            styles={{
              input: {
                borderColor: "#e1e4e8",
              },
            }}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            size="md"
            styles={{
              input: {
                borderColor: "#e1e4e8",
              },
            }}
          />

          {error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Error"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            size="md"
            loading={loading}
            color="dark"
            mt="sm"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
