import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { AttendanceLog, Employee, User } from '@prisma/client';

interface AdminRecentActivityProps {
	activities: (AttendanceLog & {
		employee: Employee & { user: User };
	})[];
}

export function AdminRecentActivity({ activities }: AdminRecentActivityProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{activities.map((activity) => (
						<div
							key={activity.id}
							className='flex items-center justify-between border-b pb-3 last:border-0'
						>
							<div className='flex-1'>
								<p className='font-medium text-sm'>
									{activity.employee.user.name}
								</p>
								<p className='text-xs text-muted-foreground'>
									{activity.employee.employeeCodeId}
								</p>
							</div>
							<div className='flex items-center gap-3'>
								<Badge
									variant={
										activity.status === 'checked_in'
											? 'default'
											: 'secondary'
									}
								>
									{activity.status === 'checked_in'
										? 'Check In'
										: 'Check Out'}
								</Badge>
								<span className='text-xs text-muted-foreground'>
									{formatDistanceToNow(
										new Date(activity.checkInTime),
										{
											addSuffix: true,
										}
									)}
								</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
