export function maskEmail(email) {
  if (typeof email !== 'string') return null;

  const [local, domain, extra] = email.trim().split('@');
  if (!local || !domain || extra) return null;

  const visible = local.split('*')[0].slice(0, 2);
  return `${visible}***@${domain}`;
}
