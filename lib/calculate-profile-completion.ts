export function calculateProfileCompletion({
  hasCv,
  hasAcceptanceLetter,
  hasProfilePicture,
  hasBankDetails,
}: {
  hasCv: boolean;
  hasAcceptanceLetter: boolean;
  hasProfilePicture: boolean;
  hasBankDetails: boolean;
}) {
  const items = [hasCv, hasAcceptanceLetter, hasProfilePicture, hasBankDetails];

  const completed = items.filter(Boolean).length;
  const percentage = Math.round((completed / items.length) * 100);

  const missing: string[] = [];
  if (!hasCv) missing.push("CV");
  if (!hasAcceptanceLetter) missing.push("Acceptance letter");
  if (!hasProfilePicture) missing.push("Profile picture");
  if (!hasBankDetails) missing.push("Bank details");

  return { percentage, missing };
}
