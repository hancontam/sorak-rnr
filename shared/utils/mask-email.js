export function maskEmail(email) {
  if (typeof email !== 'string') return null;

  const [local, domain, extra] = email.trim().split('@');
  if (!local || !domain || extra) return null;

  // Backend có thể đã che email; giữ nguyên phần được phép hiển thị.
  if (local.includes('*')) return `${local}@${domain}`;

  if (local.length <= 2) return `${local[0]}***@${domain}`;
  if (local.length <= 4) return `${local[0]}***${local.slice(-1)}@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}
