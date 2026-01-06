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
    ActionIcon,
    Modal,
    Tooltip,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconBuilding, IconEdit, IconTrash, IconArchive, IconRestore } from "@tabler/icons-react";
import { 
    createCompanyAction, 
    updateCompanyAction, 
    archiveCompanyAction, 
    restoreCompanyAction, 
    deleteCompanyAction 
} from "../../../server/actions/company-actions";

interface CompanyManagementProps {
    companies: Array<{ 
        id: string; 
        name: string; 
        slug: string;
        archivedAt?: Date | null;
        deletedAt?: Date | null;
    }>;
}

export function CompanyManagement({ companies: initialCompanies }: CompanyManagementProps) {
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
    });
    const [editData, setEditData] = useState<{
        companyId: string;
        name: string;
        slug: string;
    } | null>(null);
    const [archiveCompanyId, setArchiveCompanyId] = useState<string | null>(null);
    const [deleteCompanyData, setDeleteCompanyData] = useState<{
        companyId: string;
        force: boolean;
    } | null>(null);
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

    const handleEdit = async () => {
        if (!editData) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await updateCompanyAction({
                companyId: editData.companyId,
                name: editData.name,
                slug: editData.slug,
            });

            if (result.success && result.company) {
                setSuccess("Company updated successfully!");
                setCompanies(companies.map(c => 
                    c.id === editData.companyId 
                        ? { ...c, name: editData.name, slug: editData.slug }
                        : c
                ));
                setEditData(null);
            } else {
                setError(result.error || "Failed to update company");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!archiveCompanyId) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await archiveCompanyAction(archiveCompanyId);

            if (result.success) {
                setSuccess(result.message || "Company archived successfully!");
                setCompanies(companies.map(c => 
                    c.id === archiveCompanyId 
                        ? { ...c, archivedAt: new Date(), deletedAt: result.deletionDate }
                        : c
                ));
                setArchiveCompanyId(null);
            } else {
                setError(result.error || "Failed to archive company");
                setArchiveCompanyId(null);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
            setArchiveCompanyId(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (companyId: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await restoreCompanyAction(companyId);

            if (result.success) {
                setSuccess("Company restored successfully!");
                setCompanies(companies.map(c => 
                    c.id === companyId 
                        ? { ...c, archivedAt: null, deletedAt: null }
                        : c
                ));
            } else {
                setError(result.error || "Failed to restore company");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteCompanyData) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await deleteCompanyAction(deleteCompanyData.companyId, deleteCompanyData.force);

            if (result.success) {
                setSuccess("Company deleted successfully!");
                setCompanies(companies.filter(c => c.id !== deleteCompanyData.companyId));
                setDeleteCompanyData(null);
            } else {
                setError(result.error || "Failed to delete company");
                setDeleteCompanyData(null);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
            setDeleteCompanyData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Edit Company Modal */}
            <Modal
                opened={editData !== null}
                onClose={() => setEditData(null)}
                title="Edit Company"
                size="md"
            >
                {editData && (
                    <Stack gap="md">
                        <TextInput
                            label="Company Name"
                            value={editData.name}
                            onChange={(e) => {
                                const name = e.currentTarget.value;
                                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                                setEditData({ ...editData, name, slug });
                            }}
                        />
                        <TextInput
                            label="Slug"
                            value={editData.slug}
                            onChange={(e) => setEditData({ ...editData, slug: e.currentTarget.value })}
                            description="URL-friendly identifier"
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => setEditData(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEdit} loading={loading}>
                                Save Changes
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Archive Confirmation Modal */}
            <Modal
                opened={archiveCompanyId !== null}
                onClose={() => setArchiveCompanyId(null)}
                title="Confirm Archive"
                size="sm"
            >
                <Stack gap="md">
                    <Text>Are you sure you want to archive this company? It will be scheduled for deletion in 30 days. You can restore it before then.</Text>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setArchiveCompanyId(null)}>
                            Cancel
                        </Button>
                        <Button color="orange" onClick={handleArchive} loading={loading}>
                            Archive Company
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteCompanyData !== null}
                onClose={() => setDeleteCompanyData(null)}
                title="Confirm Permanent Deletion"
                size="sm"
            >
                <Stack gap="md">
                    <Alert color="red" title="Warning" icon={<IconAlertCircle />}>
                        This action is PERMANENT and will delete all company data including users, departments, orders, and more. This cannot be undone.
                    </Alert>
                    <Text fw={500}>Are you absolutely sure?</Text>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setDeleteCompanyData(null)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDelete} loading={loading}>
                            Permanently Delete
                        </Button>
                    </Group>
                </Stack>
            </Modal>

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
                                    <Table.Th style={{ width: 150, textAlign: "right" }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {companies.map((company) => {
                                    const isArchived = company.archivedAt !== null && company.archivedAt !== undefined;
                                    const daysRemaining = company.deletedAt 
                                        ? Math.ceil((new Date(company.deletedAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                        : null;
                                    
                                    return (
                                        <Table.Tr key={company.id}>
                                            <Table.Td>{company.name}</Table.Td>
                                            <Table.Td>
                                                <code style={{ fontSize: "0.875rem" }}>{company.slug}</code>
                                            </Table.Td>
                                            <Table.Td>
                                                {isArchived ? (
                                                    <Badge color="orange" variant="light">
                                                        Archived {daysRemaining ? `(${daysRemaining}d remaining)` : ''}
                                                    </Badge>
                                                ) : (
                                                    <Badge color="green" variant="light">
                                                        Active
                                                    </Badge>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs" justify="flex-end">
                                                    {!isArchived && (
                                                        <>
                                                            <Tooltip label="Edit company">
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="blue"
                                                                    onClick={() => setEditData({
                                                                        companyId: company.id,
                                                                        name: company.name,
                                                                        slug: company.slug,
                                                                    })}
                                                                >
                                                                    <IconEdit size={18} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                            <Tooltip label="Archive company (30-day grace period)">
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="orange"
                                                                    onClick={() => setArchiveCompanyId(company.id)}
                                                                >
                                                                    <IconArchive size={18} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    {isArchived && (
                                                        <Tooltip label="Restore company">
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="green"
                                                                onClick={() => handleRestore(company.id)}
                                                            >
                                                                <IconRestore size={18} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip label="Force delete (permanent)">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            onClick={() => setDeleteCompanyData({
                                                                companyId: company.id,
                                                                force: true,
                                                            })}
                                                        >
                                                            <IconTrash size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
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
        </>
    );
}
