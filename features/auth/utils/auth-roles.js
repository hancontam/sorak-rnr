export const AUTH_ROLES = {
  teacher: 'TEACHER_GV',
  parent: 'PARENT_PH',
};

export function isMobileRole(role) {
  return role === AUTH_ROLES.teacher || role === AUTH_ROLES.parent;
}

export function roleLabel(role) {
  return role === AUTH_ROLES.teacher ? 'Giáo viên' : 'Phụ huynh';
}

export const WEB_ACCOUNT_NOTICE = 'Tài khoản Ban giám hiệu vui lòng sử dụng Sorak trên web.';
