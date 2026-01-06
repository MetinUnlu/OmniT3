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
    ActionIcon,
    Modal,
    Tooltip,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconUserPlus, IconEdit, IconTrash, IconUser, IconKey } from "@tabler/icons-react";
import { createUserAction, updateUserAction, deleteUserAction, changePasswordAction } from "~/server/actions/user-actions";

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
        department: { name: string } | null;
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
    const [editData, setEditData] = useState<{
        userId: string;
        name: string;
        role: string;
        departmentId: string;
    } | null>(null);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [passwordData, setPasswordData] = useState<{
        userId: string;
        userName: string;
        isOwnPassword: boolean;
    } | null>(null);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
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
                            : null,
                    department: formData.departmentId
                        ? { name: availableDepartments.find(d => d.id === formData.departmentId)?.name || "Unknown" }
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

    const handleEdit = async () => {
        if (!editData) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await updateUserAction({
                userId: editData.userId,
                name: editData.name,
                role: editData.role as "SUPER_USER" | "ADMIN" | "MEMBER",
                departmentId: editData.departmentId || null,
            });

            if (result.success) {
                setSuccess("User updated successfully!");
                // Update user in the list
                setUsers(users.map(u => 
                    u.id === editData.userId 
                        ? { ...u, name: editData.name, role: editData.role }
                        : u
                ));
                setEditData(null);
            } else {
                setError(result.error || "Failed to update user");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteUserId) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await deleteUserAction(deleteUserId);

            if (result.success) {
                setSuccess("User deleted successfully!");
                // Remove user from the list
                setUsers(users.filter(u => u.id !== deleteUserId));
                setDeleteUserId(null);
            } else {
                setError(result.error || "Failed to delete user");
                setDeleteUserId(null);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
            setDeleteUserId(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Validate passwords match
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("New passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const result = await changePasswordAction({
                userId: passwordData.userId,
                currentPassword: passwordData.isOwnPassword ? passwordForm.currentPassword : undefined,
                newPassword: passwordForm.newPassword,
            });

            if (result.success) {
                setSuccess(result.message || "Password changed successfully!");
                setPasswordData(null);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setError(result.error || "Failed to change password");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const canChangePassword = (targetUser: typeof users[0]) => {
        // Users can always change their own password
        if (targetUser.id === user.id) return true;
        
        // SUPER_USER can change anyone's password
        if (user.role === "SUPER_USER") return true;
        
        // ADMIN can change MEMBER passwords in their company
        if (user.role === "ADMIN" && targetUser.role === "MEMBER") return true;
        
        return false;
    };

    return (
        <>
            {/* Edit User Modal */}
            <Modal
                opened={editData !== null}
                onClose={() => setEditData(null)}
                title="Edit User"
                size="md"
            >
                {editData && (
                    <Stack gap="md">
                        <TextInput
                            label="Name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.currentTarget.value })}
                        />
                        <Select
                            label="Role"
                            data={availableRoles}
                            value={editData.role}
                            onChange={(value) => setEditData({ ...editData, role: value || "MEMBER" })}
                        />
                        {availableDepartments.length > 0 && (
                            <Select
                                label="Department"
                                placeholder="Select department (optional)"
                                data={availableDepartments.map((d) => ({ value: d.id, label: d.name }))}
                                value={editData.departmentId}
                                onChange={(value) => setEditData({ ...editData, departmentId: value || "" })}
                                clearable
                            />
                        )}
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
                opened={deleteUserId !== null}
                onClose={() => setDeleteUserId(null)}
                title="Confirm Deletion"
                size="sm"
            >
                <Stack gap="md">
                    <Text>Are you sure you want to delete this user? This action cannot be undone.</Text>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setDeleteUserId(null)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDelete} loading={loading}>
                            Delete User
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                opened={passwordData !== null}
                onClose={() => {
                    setPasswordData(null);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                title={passwordData?.isOwnPassword ? "Change Your Password" : `Change Password for ${passwordData?.userName}`}
                size="md"
            >
                {passwordData && (
                    <Stack gap="md">
                        {passwordData.isOwnPassword && (
                            <PasswordInput
                                label="Current Password"
                                placeholder="Enter your current password"
                                required
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.currentTarget.value })}
                            />
                        )}
                        <PasswordInput
                            label="New Password"
                            placeholder="Enter new password (min 8 characters)"
                            required
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.currentTarget.value })}
                        />
                        <PasswordInput
                            label="Confirm New Password"
                            placeholder="Re-enter new password"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.currentTarget.value })}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => {
                                setPasswordData(null);
                                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handlePasswordChange} loading={loading}>
                                Change Password
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>

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
                                    {user.role === "SUPER_USER" && <Table.Th>Company</Table.Th>}
                                    <Table.Th>Department</Table.Th>
                                    <Table.Th style={{ width: 100, textAlign: "right" }}>Actions</Table.Th>
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
                                        {user.role === "SUPER_USER" && <Table.Td>{u.company?.name || "-"}</Table.Td>}
                                        <Table.Td>
                                            {u.department ? (
                                                <Badge color="cyan" variant="light">
                                                    {u.department.name}
                                                </Badge>
                                            ) : (
                                                <Text c="dimmed" size="sm">-</Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs" justify="flex-end">
                                                <Tooltip label="Edit user">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        onClick={() => setEditData({
                                                            userId: u.id,
                                                            name: u.name,
                                                            role: u.role,
                                                            departmentId: "",
                                                        })}
                                                    >
                                                        <IconEdit size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                {canChangePassword(u) && (
                                                    <Tooltip label="Change password">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="violet"
                                                            onClick={() => setPasswordData({
                                                                userId: u.id,
                                                                userName: u.name,
                                                                isOwnPassword: u.id === user.id,
                                                            })}
                                                        >
                                                            <IconKey size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )}
                                                {u.id !== user.id && (
                                                    <Tooltip label="Delete user">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            onClick={() => setDeleteUserId(u.id)}
                                                        >
                                                            <IconTrash size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )}
                                            </Group>
                                        </Table.Td>
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
        </>
    );
}
