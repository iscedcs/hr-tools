'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Employee, User } from '@prisma/client';
import { createDepartment } from '@/actions/department-actions';

const departmentSchema = z.object({
	name: z.string().min(2, 'Department name must be at least 2 characters'),
	description: z.string().optional(),
	managerId: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
	employees: (Employee & { user: User })[];
}

export function DepartmentForm({ employees }: DepartmentFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<DepartmentFormData>({
		resolver: zodResolver(departmentSchema),
	});

	const onSubmit = async (data: DepartmentFormData) => {
		setIsLoading(true);
		const formData = new FormData();

		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined && value !== '') {
				formData.append(key, value.toString());
			}
		});

		const result = await createDepartment(formData);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success('Department created successfully');
			router.push('/hr/departments');
		}
		setIsLoading(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Department Information</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-6'
				>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Department Name *</Label>
							<Input
								id='name'
								{...register('name')}
								placeholder='Engineering'
							/>
							{errors.name && (
								<p className='text-sm text-destructive'>
									{errors.name.message}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='description'>Description</Label>
							<Textarea
								id='description'
								{...register('description')}
								placeholder='Brief description of the department'
								rows={4}
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='managerId'>
								Department Manager
							</Label>
							<Select
								onValueChange={(value) =>
									setValue('managerId', value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select manager (optional)' />
								</SelectTrigger>
								<SelectContent>
									{employees.map((emp) => (
										<SelectItem
											key={emp.id}
											value={emp.id}
										>
											{emp.user.name} (
											{emp.employeeCodeId})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className='flex gap-4'>
						<Button
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? 'Creating...' : 'Create Department'}
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => router.back()}
						>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
