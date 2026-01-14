export function calculateProfileCompletion({
  hasCv,
  hasAcceptanceLetter,
  hasNda,
  hasHandbook,
  hasProfilePicture,
  hasBankDetails,
}: {
  hasCv: boolean;
  hasAcceptanceLetter: boolean;
  hasNda: boolean;
  hasHandbook: boolean;
  hasProfilePicture: boolean;
  hasBankDetails: boolean;
}) {
  const items = [
    hasCv,
    hasAcceptanceLetter,
    hasNda,
    hasHandbook,
    hasProfilePicture,
    hasBankDetails,
  ];

  const completed = items.filter(Boolean).length;
  const percentage = Math.round((completed / items.length) * 100);

  const missing: string[] = [];
  if (!hasCv) missing.push("CV");
  if (!hasAcceptanceLetter) missing.push("Acceptance letter");
  if (!hasNda) missing.push("NDA");
  if (!hasHandbook) missing.push("Employee handbook");
  if (!hasProfilePicture) missing.push("Profile picture");
  if (!hasBankDetails) missing.push("Bank details");

  return { percentage, missing };
}
