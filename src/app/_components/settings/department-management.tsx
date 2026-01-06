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
    Table,
    Badge,
    ActionIcon,
    Modal,
    Tooltip,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconBuildingCommunity, IconEdit, IconTrash } from "@tabler/icons-react";
import { createDepartmentAction, updateDepartmentAction, deleteDepartmentAction } from "~/server/actions/department-actions";

interface DepartmentManagementProps {
    user: {
        id: string;
        role: string;
        companyId: string | null;
        company: { id: string; name: string } | null;
    };
    companies: Array<{ id: string; name: string }>;
    initialDepartments: Array<{
        id: string;
        name: string;
        companyId: string;
        companyName: string;
    }>;
}

export function DepartmentManagement({ user, companies, initialDepartments }: DepartmentManagementProps) {
    const [formData, setFormData] = useState({
        name: "",
        companyId: user.companyId || "",
    });
    const [editData, setEditData] = useState<{
        departmentId: string;
        name: string;
    } | null>(null);
    const [deleteDepartmentId, setDeleteDepartmentId] = useState<string | null>(null);
    const [departments, setDepartments] = useState(initialDepartments);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await createDepartmentAction({
                name: formData.name,
                companyId: formData.companyId || undefined,
            });

            if (result.success && result.department) {
                setSuccess(`Department "${formData.name}" created successfully!`);

                // Add new department to the list
                const newDepartment = {
                    id: result.department.id,
                    name: result.department.name,
                    companyId: result.department.companyId,
                    companyName: result.department.companyName,
                };
                setDepartments([newDepartment, ...departments]);

                // Reset form
                setFormData({
                    name: "",
                    companyId: user.companyId || "",
                });
            } else {
                setError(result.error || "Failed to create department");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editData) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await updateDepartmentAction({
                departmentId: editData.departmentId,
                name: editData.name,
            });

            if (result.success && result.department) {
                setSuccess("Department updated successfully!");
                // Update department in the list
                setDepartments(departments.map(d => 
                    d.id === editData.departmentId 
                        ? { ...d, name: editData.name }
                        : d
                ));
                setEditData(null);
            } else {
                setError(result.error || "Failed to update department");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDepartmentId) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await deleteDepartmentAction(deleteDepartmentId);

            if (result.success) {
                setSuccess("Department deleted successfully!");
                // Remove department from the list
                setDepartments(departments.filter(d => d.id !== deleteDepartmentId));
                setDeleteDepartmentId(null);
            } else {
                setError(result.error || "Failed to delete department");
                setDeleteDepartmentId(null);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
            setDeleteDepartmentId(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Edit Department Modal */}
            <Modal
                opened={editData !== null}
                onClose={() => setEditData(null)}
                title="Edit Department"
                size="sm"
            >
                {editData && (
                    <Stack gap="md">
                        <TextInput
                            label="Department Name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.currentTarget.value })}
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

            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteDepartmentId !== null}
                onClose={() => setDeleteDepartmentId(null)}
                title="Confirm Deletion"
                size="sm"
            >
                <Stack gap="md">
                    <Text>Are you sure you want to delete this department? Users in this department will have their department set to null.</Text>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setDeleteDepartmentId(null)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDelete} loading={loading}>
                            Delete Department
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Stack gap="xl">
            <Card shadow="sm" padding="lg" radius="md">
                <Stack gap="md">
                    <div>
                        <Title order={2} c="gray.9" mb="xs">
                            Create New Department
                        </Title>
                        <Text size="sm" c="gray.6">
                            {user.role === "SUPER_USER"
                                ? "Create departments for any company in the system."
                                : "Create departments for your company."}
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
                                label="Department Name"
                                placeholder="Engineering, Sales, HR, etc."
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.currentTarget.value })
                                }
                            />

                            {user.role === "SUPER_USER" && (
                                <Select
                                    label="Company"
                                    placeholder="Select company"
                                    required
                                    data={companies.map((c) => ({ value: c.id, label: c.name }))}
                                    value={formData.companyId}
                                    onChange={(value) =>
                                        setFormData({ ...formData, companyId: value || "" })
                                    }
                                />
                            )}

                            {user.role === "ADMIN" && user.company && (
                                <TextInput
                                    label="Company"
                                    value={user.company.name}
                                    disabled
                                    description="Department will be created for your company"
                                />
                            )}

                            <Group justify="flex-end" mt="md">
                                <Button
                                    type="submit"
                                    leftSection={<IconBuildingCommunity size={16} />}
                                    loading={loading}
                                >
                                    Create Department
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
                            Existing Departments
                        </Title>
                        <Text size="sm" c="gray.6">
                            {departments.length} {departments.length === 1 ? "department" : "departments"} found
                        </Text>
                    </div>

                    {departments.length > 0 ? (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Department Name</Table.Th>
                                    <Table.Th>Company</Table.Th>
                                    <Table.Th style={{ width: 100, textAlign: "right" }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {departments.map((dept) => (
                                    <Table.Tr key={dept.id}>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <IconBuildingCommunity size={16} color="gray" />
                                                <Text fw={500}>{dept.name}</Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color="blue" variant="light">
                                                {dept.companyName}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs" justify="flex-end">
                                                <Tooltip label="Edit department">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        onClick={() => setEditData({
                                                            departmentId: dept.id,
                                                            name: dept.name,
                                                        })}
                                                    >
                                                        <IconEdit size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Delete department">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => setDeleteDepartmentId(dept.id)}
                                                    >
                                                        <IconTrash size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Text c="gray.6" ta="center" py="xl">
                            No departments found. Create one above.
                        </Text>
                    )}
                </Stack>
            </Card>
            </Stack>
        </>
    );
}
