// Keep lengths aligned with MallPartnerContentService.submitApplication.
export function partnerValidationError(form, configuredFields) {
  const fields = [
    ["realName", "真实姓名", 2, 64], ["idNo", "身份证号码", 15, 18],
    ["region", "所在地区", 2, 128], ["address", "详细地址", 3, 255],
    ["phone", "联系电话", 11, 11], ["reason", "申请理由", 5, 500],
  ];
  for (const [key, label, min, max] of fields) {
    const value = String(form[key] || "").trim();
    const configured = configuredFields?.find(field => field.key === key);
    if (!value && configured?.required === false) continue;
    const actualMin = configured?.min ?? min, actualMax = configured?.max ?? max;
    if (value.length < actualMin || value.length > actualMax) return `${configured?.label || label}长度需为${actualMin}-${actualMax}个字符`;
  }
  if (form.idNo.trim() && !/^(?:\d{15}|\d{17}[0-9Xx])$/.test(form.idNo.trim())) return "身份证号码格式不正确";
  if (form.phone.trim() && !/^1[3-9]\d{9}$/.test(form.phone.trim())) return "联系电话格式不正确";
  if (!form.agreed) return "请阅读并同意合伙人服务协议";
  return "";
}
