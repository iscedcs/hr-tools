import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuditLogs } from "@/actions/admin-actions";
import { AuditLogsTable } from "@/components/admin/audit-logs-table";

export default async function AdminAuditLogsPage() {
  const result = await getAuditLogs(200);
  const logs = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all system activities and user actions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Logs</CardTitle>
            <CardDescription>All recorded activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs?.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Activities</CardTitle>
            <CardDescription>Actions performed today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {
                logs?.filter(
                  (log) =>
                    new Date(log.createdAt).toDateString() ===
                    new Date().toDateString()
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unique Users</CardTitle>
            <CardDescription>Active users today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(logs?.map((log) => log.employeeId)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system activities and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogsTable logs={logs ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
