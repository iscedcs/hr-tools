"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProfileCompletionCardProps {
  percentage: number;
  missingItems: string[];
}

export function ProfileCompletionCard({
  percentage,
  missingItems,
}: ProfileCompletionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">{percentage}% complete</p>
          <Progress value={percentage} className="mt-2" />
        </div>

        {missingItems.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Missing items:</p>
            <ul className="text-xs text-muted-foreground list-disc pl-4">
              {missingItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
