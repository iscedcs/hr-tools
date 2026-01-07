import { requireRole } from '@/lib/auth-utils';
import prisma from '@/lib/db';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DepartmentForm } from '@/components/hr/department-form';

export const dynamic = 'force-dynamic';

export default async function NewDepartmentPage() {
	await requireRole(['superadmin', 'hr_admin']);

	const employees = await prisma.employee.findMany({
		where: { isActive: true },
		include: { user: true },
	});

	return (
		<div className='container mx-auto p-6 max-w-4xl'>
			<div className='mb-6'>
				<Link href='/hr/departments'>
					<Button
						variant='ghost'
						size='sm'
						className='mb-4'
					>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back to Departments
					</Button>
				</Link>
				<h1 className='text-3xl font-bold'>Add New Department</h1>
				<p className='text-muted-foreground mt-2'>
					Create a new department and assign a manager
				</p>
			</div>

			<DepartmentForm employees={employees} />
		</div>
	);
}
