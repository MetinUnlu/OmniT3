"use client";

import { useState } from "react";
import {
    Card,
    Title,
    Text,
    TextInput,
    Select,
    Button,
    Stack,
    Group,
    Alert,
    PasswordInput,
    Table,
    Badge,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconUserPlus } from "@tabler/icons-react";
import { createUserAction } from "~/server/actions/user-actions";

interface AccountManagementProps {
    user: {
        id: string;
        role: string;
        companyId: string | null;
        company: { id: string; name: string } | null;
    };
    companies: Array<{ id: string; name: string }>;
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

export function AccountManagement({ user, companies, initialUsers, initialDepartments }: AccountManagementProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "MEMBER",
        companyId: user.companyId || "",
        departmentId: "",
    });
    const [users, setUsers] = useState(initialUsers);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filter departments based on selected company
    const availableDepartments = formData.companyId
        ? initialDepartments.filter(d => d.companyId === formData.companyId)
        : user.companyId
            ? initialDepartments.filter(d => d.companyId === user.companyId)
            : [];

    // Determine available roles based on user's role
    const availableRoles =
        user.role === "SUPER_USER"
            ? [
                { value: "SUPER_USER", label: "Super User" },
                { value: "ADMIN", label: "Admin" },
                { value: "MEMBER", label: "Member" },
            ]
            : [
                { value: "ADMIN", label: "Admin" },
                { value: "MEMBER", label: "Member" },
            ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await createUserAction({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role as "SUPER_USER" | "ADMIN" | "MEMBER",
                companyId: formData.companyId || undefined,
                departmentId: formData.departmentId || undefined,
            });

            if (result.success && result.user) {
                setSuccess(`User ${formData.email} created successfully!`);

                // Add new user to the list
                const newUser = {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                    company: formData.companyId
                        ? { name: companies.find(c => c.id === formData.companyId)?.name || "Unknown" }
                        : user.role === "ADMIN" && user.company
                            ? { name: user.company.name }
                            : null
                };
                setUsers([newUser, ...users]);

                // Reset form
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "MEMBER",
                    companyId: user.companyId || "",
                    departmentId: "",
                });
            } else {
                setError(result.error || "Failed to create user");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="xl">
            <Card shadow="sm" padding="lg" radius="md">
                <Stack gap="md">
                    <div>
                        <Title order={2} c="gray.9" mb="xs">
                            Create New Account
                        </Title>
                        <Text size="sm" c="gray.6">
                            {user.role === "SUPER_USER"
                                ? "Create accounts with any role and assign to any company."
                                : "Create Admin or Member accounts for your company."}
                        </Text>
                    </div>

                    {error && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            title="Error"
                            color="red"
                            withCloseButton
                            onClose={() => setError(null)}
                        >
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert
                            icon={<IconCheck size={16} />}
                            title="Success"
                            color="green"
                            withCloseButton
                            onClose={() => setSuccess(null)}
                        >
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack gap="md">
                            <TextInput
                                label="Full Name"
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.currentTarget.value })
                                }
                            />

                            <TextInput
                                label="Email"
                                placeholder="john@example.com"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.currentTarget.value })
                                }
                            />

                            <PasswordInput
                                label="Password"
                                placeholder="Secure password"
                                required
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.currentTarget.value })
                                }
                            />

                            <Select
                                label="Role"
                                placeholder="Select role"
                                required
                                data={availableRoles}
                                value={formData.role}
                                onChange={(value) =>
                                    setFormData({ ...formData, role: value || "MEMBER" })
                                }
                            />

                            {user.role === "SUPER_USER" && (
                                <Select
                                    label="Company"
                                    placeholder="Select company (optional for Super User)"
                                    data={companies.map((c) => ({ value: c.id, label: c.name }))}
                                    value={formData.companyId}
                                    onChange={(value) => {
                                        setFormData({ ...formData, companyId: value || "", departmentId: "" });
                                    }}
                                    clearable
                                />
                            )}

                            {user.role === "ADMIN" && user.company && (
                                <TextInput
                                    label="Company"
                                    value={user.company.name}
                                    disabled
                                    description="Users will be automatically assigned to your company"
                                />
                            )}

                            {(formData.companyId || user.companyId) && (
                                <Select
                                    label="Department"
                                    placeholder="Select department (optional)"
                                    data={availableDepartments.map((d) => ({ value: d.id, label: d.name }))}
                                    value={formData.departmentId}
                                    onChange={(value) =>
                                        setFormData({ ...formData, departmentId: value || "" })
                                    }
                                    clearable
                                    description="Optionally assign user to a department"
                                />
                            )}

                            <Group justify="flex-end" mt="md">
                                <Button
                                    type="submit"
                                    leftSection={<IconUserPlus size={16} />}
                                    loading={loading}
                                >
                                    Create Account
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md">
                <Stack gap="md">
                    <div>
                        <Title order={2} c="gray.9" mb="xs">
                            Existing Accounts
                        </Title>
                        <Text size="sm" c="gray.6">
                            {users.length} {users.length === 1 ? "account" : "accounts"} found
                        </Text>
                    </div>

                    {users.length > 0 ? (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Email</Table.Th>
                                    <Table.Th>Role</Table.Th>
                                    <Table.Th>Company</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {users.map((u) => (
                                    <Table.Tr key={u.id}>
                                        <Table.Td>{u.name}</Table.Td>
                                        <Table.Td>{u.email}</Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={u.role === "SUPER_USER" ? "violet" : u.role === "ADMIN" ? "blue" : "gray"}
                                                variant="light"
                                            >
                                                {u.role}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>{u.company?.name || "-"}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Text c="gray.6" ta="center" py="xl">
                            No accounts found.
                        </Text>
                    )}
                </Stack>
            </Card>
        </Stack>
    );
}
