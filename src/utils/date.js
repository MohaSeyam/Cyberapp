export function formatGregorianDate(dateInput, language = 'ar', withTime = false) {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const options = withTime
      ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, calendar: 'gregory' }
      : { year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' };
    // Intl doesn't accept calendar in options for all environments; fallback by using locale only
    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(date);
  } catch (e) {
    return '' + dateInput;
  }
}