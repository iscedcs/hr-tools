import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { LeaveRequestActions } from '@/components/hr/leave-request-actions';

export const dynamic = 'force-dynamic';

export default async function LeaveRequestsPage() {
	const requests = await prisma.leaveRequest.findMany({
		include: {
			employee: {
				include: {
					user: { select: { name: true } },
					department: { select: { name: true } },
					employeeCode: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
		take: 50,
	});

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-2xl md:text-3xl font-bold mb-2'>
					Leave Requests
				</h2>
				<p className='text-muted-foreground'>
					Review and manage employee leave requests
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Leave Requests</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b border-border'>
									<th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
										Employee
									</th>
									<th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
										Type
									</th>
									<th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
										Start Date
									</th>
									<th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
										End Date
									</th>
									<th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
										Days
									</th>
									<th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
										Status
									</th>
									<th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
										Requested
									</th>
									<th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{requests.map((request) => (
									<tr
										key={request.id}
										className='border-b border-border hover:bg-muted/50'
									>
										<td className='py-3 px-4 text-sm'>
											<div>
												<div className='font-medium'>
													{request.employee.user.name}
												</div>
												<div className='text-muted-foreground text-xs'>
													{
														request.employee
															.employeeCode?.code
													}
												</div>
											</div>
										</td>
										<td className='py-3 px-4 text-sm capitalize'>
											{request.leaveType}
										</td>
										<td className='py-3 px-4 text-sm'>
											{format(
												new Date(request.startDate),
												'MMM d, yyyy'
											)}
										</td>
										<td className='py-3 px-4 text-sm'>
											{format(
												new Date(request.endDate),
												'MMM d, yyyy'
											)}
										</td>
										<td className='py-3 px-4 text-sm'>
											{request.totalDays}
										</td>
										<td className='py-3 px-4 text-sm'>
											<Badge
												variant={
													request.status ===
													'approved'
														? 'default'
														: request.status ===
														  'rejected'
														? 'destructive'
														: 'secondary'
												}
											>
												{request.status}
											</Badge>
										</td>
										<td className='py-3 px-4 text-sm'>
											{format(
												new Date(request.createdAt),
												'MMM d'
											)}
										</td>
										<td className='py-3 px-4 text-sm'>
											<LeaveRequestActions
												requestId={request.id}
												status={request.status}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
