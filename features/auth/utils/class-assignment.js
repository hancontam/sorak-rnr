export function assignedClass(user) {
  const classes = user?.assignedClasses;
  if (!Array.isArray(classes))
    return {
      error: 'Tài khoản chưa có thông tin phân lớp. Hãy đăng nhập lại hoặc liên hệ nhà trường.',
    };
  if (classes.length > 1)
    return {
      error: 'Tài khoản được gắn nhiều lớp. Vui lòng liên hệ nhà trường kiểm tra phân công.',
    };
  if (!classes.length) return { classId: null };
  if (!classes[0]?.classId)
    return { error: 'Thông tin phân lớp thiếu mã lớp. Vui lòng liên hệ nhà trường.' };
  return { ...classes[0] };
}
