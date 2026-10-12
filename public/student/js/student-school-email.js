const STUDENT_EMAIL_PATTERN = /^[^\s@]+@bnbu\.edu\.cn$/i;

export function isStudentSchoolEmail(value) {
  return typeof value === 'string' && value.trim().length <= 254 && STUDENT_EMAIL_PATTERN.test(value.trim());
}

export function isNewStudentSchoolEmail(value) {
  return typeof value === 'string' && /^[a-z][0-9]{9}@bnbu\.edu\.cn$/.test(value.trim());
}
