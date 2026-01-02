"use client";

import { useState } from "react";
import {
    Card,
    Title,
    Text,
    TextInput,
    Button,
    Stack,
    Group,
    Alert,
    Table,
    Badge,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconBuilding } from "@tabler/icons-react";
import { createCompanyAction } from "../../../server/actions/company-actions";

interface CompanyManagementProps {
    companies: Array<{ id: string; name: string; slug: string }>;
}

export function CompanyManagement({ companies: initialCompanies }: CompanyManagementProps) {
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
    });
    const [companies, setCompanies] = useState(initialCompanies);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await createCompanyAction({
                name: formData.name,
                slug: formData.slug,
            });

            if (result.success && result.company) {
                setSuccess(`Company "${formData.name}" created successfully!`);
                setCompanies([...companies, result.company]);
                // Reset form
                setFormData({ name: "", slug: "" });
            } else {
                setError(result.error || "Failed to create company");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        setFormData({ name, slug });
    };

    return (
        <Stack gap="xl">
            <Card shadow="sm" padding="lg" radius="md">
                <Stack gap="md">
                    <div>
                        <Title order={2} c="gray.9" mb="xs">
                            Create New Company
                        </Title>
                        <Text size="sm" c="gray.6">
                            Add a new company to the system. Only Super Users can manage companies.
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
                                label="Company Name"
                                placeholder="Acme Corporation"
                                required
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.currentTarget.value)}
                            />

                            <TextInput
                                label="Slug"
                                placeholder="acme-corporation"
                                required
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData({ ...formData, slug: e.currentTarget.value })
                                }
                                description="URL-friendly identifier (auto-generated from name)"
                            />

                            <Group justify="flex-end" mt="md">
                                <Button
                                    type="submit"
                                    leftSection={<IconBuilding size={16} />}
                                    loading={loading}
                                >
                                    Create Company
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
                            Existing Companies
                        </Title>
                        <Text size="sm" c="gray.6">
                            {companies.length} {companies.length === 1 ? "company" : "companies"} in the system
                        </Text>
                    </div>

                    {companies.length > 0 ? (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Slug</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {companies.map((company) => (
                                    <Table.Tr key={company.id}>
                                        <Table.Td>{company.name}</Table.Td>
                                        <Table.Td>
                                            <code style={{ fontSize: "0.875rem" }}>{company.slug}</code>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color="green" variant="light">
                                                Active
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Text c="gray.6" ta="center" py="xl">
                            No companies found. Create your first company above.
                        </Text>
                    )}
                </Stack>
            </Card>
        </Stack>
    );
}
