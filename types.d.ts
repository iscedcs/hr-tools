interface Setting {
  id: string;
  settingKey: string;
  settingValue: string;
  description: string | null;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  deletedAt: Date | null;
  employee?: {
    role?: string;
    employeeCode?: { code?: string } | null;
    department?: { name?: string } | null;
  } | null;
}
