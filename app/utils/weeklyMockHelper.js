/**
 * Department to core 3 subjects mapping.
 * Aptitude is always automatically appended as the 4th compulsory subject.
 */
export const DEPARTMENT_SUBJECT_MAP = {
  // Medicine & Health Sciences / Biological
  'Medicine and Surgery': ['Biology', 'Chemistry', 'Physics'],
  'Nursing Science': ['Biology', 'Chemistry', 'Physics'],
  'Pharmacy': ['Biology', 'Chemistry', 'Physics'],
  'Medical Rehabilitation': ['Biology', 'Chemistry', 'Physics'],
  'Dentistry': ['Biology', 'Chemistry', 'Physics'],
  'Microbiology': ['Biology', 'Chemistry', 'Physics'],
  'Biochemistry': ['Biology', 'Chemistry', 'Physics'],
  'Botany': ['Biology', 'Chemistry', 'Physics'],
  'Zoology': ['Biology', 'Chemistry', 'Physics'],

  // Technology & Engineering / Physical Sciences
  'Computer Science': ['Mathematics', 'Physics', 'Chemistry'],
  'Computer Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Civil Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Mechanical Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Electrical and Electronics Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Chemical Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Physics': ['Mathematics', 'Physics', 'Chemistry'],
  'Chemistry': ['Mathematics', 'Physics', 'Chemistry'],
  'Mathematics': ['Mathematics', 'Physics', 'Chemistry'],

  // Administration & Social Sciences
  'Accounting': ['Mathematics', 'Economics', 'English'],
  'Business Administration': ['Mathematics', 'Economics', 'English'],
  'Economics': ['Mathematics', 'Economics', 'Government'],
  'Political Science': ['Government', 'Economics', 'English'],
  'Sociology and Anthropology': ['Government', 'Economics', 'English'],
  'International Relations': ['Government', 'Economics', 'English'],

  // Law & Arts
  'Law': ['English', 'Literature in English', 'Government'],
  'English Studies': ['English', 'Literature in English', 'Government'],
  'History': ['History', 'Government', 'Literature in English'],
  'Philosophy': ['Government', 'Literature in English', 'English'],
};

/**
 * Returns the 4 subject names for a candidate's department.
 */
export function getDepartmentMockSubjects(departmentName) {
  const threeSubjects = DEPARTMENT_SUBJECT_MAP[departmentName] || ['English', 'Mathematics', 'Economics'];
  return ['Aptitude', ...threeSubjects];
}

/**
 * Computes Friday 10:00 AM – 2:00 PM WAT window & countdown status.
 */
export function getWeeklyMockWindowStatus() {
  const now = new Date();
  
  // Convert now to Lagos / UTC+1 representation
  const watOffsetMinutes = 60;
  const localOffsetMinutes = -now.getTimezoneOffset();
  const diffMinutes = watOffsetMinutes - localOffsetMinutes;
  const nowWAT = new Date(now.getTime() + diffMinutes * 60 * 1000);

  const dayOfWeek = nowWAT.getDay(); // 5 = Friday
  const currentHour = nowWAT.getHours();
  const currentMinute = nowWAT.getMinutes();
  const currentTimeDec = currentHour + currentMinute / 60;

  const isFriday = dayOfWeek === 5;
  const isOpen = isFriday && currentTimeDec >= 10.0 && currentTimeDec < 14.0;

  // Next Friday 10:00 AM WAT Calculation
  const nextFriday = new Date(nowWAT);
  let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  if (dayOfWeek === 5 && currentTimeDec >= 14.0) {
    daysUntilFriday = 7;
  } else if (dayOfWeek === 5 && currentTimeDec < 10.0) {
    daysUntilFriday = 0;
  }

  nextFriday.setDate(nowWAT.getDate() + daysUntilFriday);
  nextFriday.setHours(10, 0, 0, 0);

  let diffMs = isOpen
    ? new Date(nowWAT).setHours(14, 0, 0, 0) - nowWAT
    : nextFriday - nowWAT;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    isOpen,
    isFriday,
    hoursLeft: Math.max(0, hours),
    minutesLeft: Math.max(0, minutes),
    secondsLeft: Math.max(0, seconds),
    activeFridayDate: nextFriday.toISOString().split('T')[0],
  };
}

/**
 * Determines whether results and corrections can be displayed.
 * Released Saturday 00:00 AM WAT.
 */
export function areResultsReleased(activeFridayDate) {
  if (!activeFridayDate) return true;
  const now = new Date();
  const watOffsetMinutes = 60;
  const localOffsetMinutes = -now.getTimezoneOffset();
  const nowWAT = new Date(now.getTime() + (watOffsetMinutes - localOffsetMinutes) * 60 * 1000);

  const unlockTimeWAT = new Date(activeFridayDate);
  unlockTimeWAT.setHours(23, 59, 59, 999);

  return nowWAT.getTime() > unlockTimeWAT.getTime();
}