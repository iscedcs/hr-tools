import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllUsers } from "@/actions/admin-actions";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const result = await getAllUsers();
  const users: User[] = result.success && result.data ? result.data : [];

  const activeUsers = users.filter((u) => !u.deletedAt).length;
  const inactiveUsers = users.filter((u) => u.deletedAt).length;
  const superadmins = users.filter(
    (u) => u.employee?.role === "superadmin"
  ).length;
  const hrAdmins = users?.filter((u) => u.employee?.role === "hr_admin").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage all system users, roles, and permissions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users?.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Currently active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {activeUsers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inactive Users</CardTitle>
            <CardDescription>Currently non-active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {inactiveUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Superadmins</CardTitle>
            <CardDescription>System administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {superadmins}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HR Admins</CardTitle>
            <CardDescription>HR administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{hrAdmins}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage user accounts, roles, and access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
