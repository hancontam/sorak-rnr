// Bản tin trường là thông báo Ban giám hiệu gửi hàng loạt, backend gắn data.batch_id (type
// SCHOOL_ANNOUNCEMENT trên test2). Còn lại là thông báo tự động về hoạt động lớp. Cùng cách tách
// như hai tab trên web.
export function isSchoolNews(item) {
  return Boolean(item?.data?.batch_id);
}
