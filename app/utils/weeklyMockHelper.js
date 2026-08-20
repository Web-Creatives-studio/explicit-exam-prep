/**
 * Department to core 3 subjects mapping.
 * Aptitude is always automatically appended as the 4th compulsory subject.
 */
export const DEPARTMENT_SUBJECT_MAP = {
  // ==========================================
  // 1. Administration
  // ==========================================
  'Accounting': ['Mathematics', 'Economics', 'Use of English'],
  'Banking and Finance': ['Mathematics', 'Economics', 'Use of English'],
  'Business Administration': ['Mathematics', 'Economics', 'Use of English'],
  'International Relations': ['Government & Current Affairs', 'Economics', 'Use of English'],
  'Public Administration': ['Government & Current Affairs', 'Economics', 'Use of English'],
  'Local Government and Development Studies': ['Government & Current Affairs', 'Economics', 'Use of English'],

  // ==========================================
  // 2. Agriculture
  // ==========================================
  'Agricultural Economics': ['Biology', 'Chemistry', 'Physics'],
  'Animal Sciences': ['Biology', 'Chemistry', 'Physics'],
  'Agricultural Extension and Rural Sociology': ['Biology', 'Chemistry', 'Physics'],
  'Crop Production and Protection': ['Biology', 'Chemistry', 'Physics'],
  'Soil Science and Land Resources Management': ['Biology', 'Chemistry', 'Physics'],
  'Family, Nutrition and Consumer Sciences': ['Biology', 'Chemistry', 'Physics'],

  // ==========================================
  // 3. Arts
  // ==========================================
  'English Language': ['Use of English', 'Literature in English', 'Government & Current Affairs'],
  'Literature in English': ['Use of English', 'Literature in English', 'Government & Current Affairs'],
  'History': ['History', 'Government & Current Affairs', 'Literature in English'],
  'Philosophy': ['Government & Current Affairs', 'Literature in English', 'Use of English'],
  'Religious Studies': ['Christian Religious Studies', 'Government & Current Affairs', 'Literature in English'],
  'Foreign Languages (French/German/Portuguese)': ['Use of English', 'Literature in English', 'Government & Current Affairs'],
  'Linguistics and African Languages': ['Use of English', 'Literature in English', 'Government & Current Affairs'],
  'Dramatic Arts': ['Literature in English', 'Use of English', 'Government & Current Affairs'],
  'Music': ['Use of English', 'Literature in English', 'Government & Current Affairs'],

  // ==========================================
  // 4. Basic Medical Sciences
  // ==========================================
  'Anatomy': ['Biology', 'Chemistry', 'Physics'],
  'Physiology': ['Biology', 'Chemistry', 'Physics'],
  'Medical Biochemistry': ['Biology', 'Chemistry', 'Physics'],
  'Nursing Science': ['Biology', 'Chemistry', 'Physics'],
  'Medical Rehabilitation (Physiotherapy)': ['Biology', 'Chemistry', 'Physics'],

  // ==========================================
  // 5. Clinical Sciences
  // ==========================================
  'Medicine and Surgery': ['Biology', 'Chemistry', 'Physics'],

  // ==========================================
  // 6. Dentistry
  // ==========================================
  'Dentistry': ['Biology', 'Chemistry', 'Physics'],

  // ==========================================
  // 7. Education
  // ==========================================
  'Educational Administration and Planning': ['Government & Current Affairs', 'Economics', 'Use of English'],
  'Educational Foundations and Counselling': ['Government & Current Affairs', 'Economics', 'Use of English'],
  'Adult Education and Lifelong Learning': ['Government & Current Affairs', 'Economics', 'Use of English'],
  'Arts and Social Sciences Education': ['Literature in English', 'Government & Current Affairs', 'Use of English'],
  'Science and Technology Education': ['Mathematics', 'Physics', 'Chemistry'],
  'Physical and Health Education': ['Biology', 'Chemistry', 'Physics'],

  // ==========================================
  // 8. Environmental Design and Management (EDM)
  // ==========================================
  'Architecture': ['Mathematics', 'Physics', 'Chemistry'],
  'Building': ['Mathematics', 'Physics', 'Chemistry'],
  'Estate Management': ['Mathematics', 'Economics', 'Use of English'],
  'Quantity Surveying': ['Mathematics', 'Physics', 'Chemistry'],
  'Urban and Regional Planning': ['Mathematics', 'Geography', 'Economics'],
  'Fine and Applied Arts': ['Literature in English', 'Use of English', 'Government & Current Affairs'],

  // ==========================================
  // 9. Law
  // ==========================================
  'Law': ['Use of English', 'Literature in English', 'Government & Current Affairs'],

  // ==========================================
  // 10. Pharmacy
  // ==========================================
  'Pharmacy': ['Biology', 'Chemistry', 'Physics'],

  // ==========================================
  // 11. Science
  // ==========================================
  'Biochemistry and Molecular Biology': ['Biology', 'Chemistry', 'Physics'],
  'Botany': ['Biology', 'Chemistry', 'Physics'],
  'Chemistry': ['Chemistry', 'Physics', 'Mathematics'],
  'Geology': ['Physics', 'Chemistry', 'Mathematics'],
  'Mathematics': ['Mathematics', 'Physics', 'Chemistry'],
  'Microbiology': ['Biology', 'Chemistry', 'Physics'],
  'Physics': ['Physics', 'Mathematics', 'Chemistry'],
  'Zoology': ['Biology', 'Chemistry', 'Physics'],

  // ==========================================
  // 12. Social Sciences
  // ==========================================
  'Demography and Social Statistics': ['Mathematics', 'Economics', 'Government & Current Affairs'],
  'Economics': ['Mathematics', 'Economics', 'Government & Current Affairs'],
  'Geography': ['Geography', 'Mathematics', 'Economics'],
  'Political Science': ['Government & Current Affairs', 'Economics', 'Use of English'],
  'Psychology': ['Biology', 'Economics', 'Government & Current Affairs'],
  'Sociology and Anthropology': ['Government & Current Affairs', 'Economics', 'Use of English'],

  // ==========================================
  // 13. Technology / Engineering
  // ==========================================
  'Agricultural and Environmental Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Chemical Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Civil Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Computer Science and Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Computer Science with Economics': ['Mathematics', 'Physics', 'Economics'],
  'Computer Science with Mathematics': ['Mathematics', 'Physics', 'Chemistry'],
  'Electronic and Electrical Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Food Science and Technology': ['Chemistry', 'Biology', 'Physics'],
  'Material Science and Engineering': ['Mathematics', 'Physics', 'Chemistry'],
  'Mechanical Engineering': ['Mathematics', 'Physics', 'Chemistry'],
};

/**
 * Returns the 4 subject names for a candidate's department.
 */
export function getDepartmentMockSubjects(departmentName) {
  const threeSubjects = DEPARTMENT_SUBJECT_MAP[departmentName] || ['Use of English', 'Mathematics', 'Economics'];
  return ['Aptitude', ...threeSubjects];
}

/**
 * Calculates current West Africa Time (UTC+1).
 */
export function getNowWAT() {
  const now = new Date();
  const watOffsetMinutes = 60; // UTC+1
  const localOffsetMinutes = -now.getTimezoneOffset();
  const diffMinutes = watOffsetMinutes - localOffsetMinutes;
  return new Date(now.getTime() + diffMinutes * 60 * 1000);
}

/**
 * Computes Friday 10:00 AM – 2:00 PM WAT window and live countdown status.
 */
export function getWeeklyMockWindowStatus() {
  const nowWAT = getNowWAT();
  const dayOfWeek = nowWAT.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const currentHour = nowWAT.getHours();
  const currentMinute = nowWAT.getMinutes();
  const currentSecond = nowWAT.getSeconds();
  const currentTimeDec = currentHour + currentMinute / 60 + currentSecond / 3600;

  // Friday Window: 10:00 AM (10.0) to 2:00 PM (14.0)
  const isFriday = dayOfWeek === 5;
  const isOpen = isFriday && currentTimeDec >= 10.0 && currentTimeDec < 14.0;
  const isSaturday = dayOfWeek === 6;

  // Compute countdown target
  let targetDate = new Date(nowWAT);

  if (isOpen) {
    // Window is open -> Count down to 2:00 PM close today
    targetDate.setHours(14, 0, 0, 0);
  } else {
    // Window is closed -> Count down to upcoming Friday 10:00 AM
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (isFriday && currentTimeDec >= 14.0) {
      daysUntilFriday = 7; // Friday after 2 PM -> Next Friday
    } else if (isFriday && currentTimeDec < 10.0) {
      daysUntilFriday = 0; // Friday before 10 AM -> Today at 10 AM
    }
    targetDate.setDate(nowWAT.getDate() + daysUntilFriday);
    targetDate.setHours(10, 0, 0, 0);
  }

  const diffMs = Math.max(0, targetDate.getTime() - nowWAT.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  // Active Friday ISO Date string (YYYY-MM-DD)
  const activeFriday = new Date(nowWAT);
  const diffToCurrentFriday = (5 - dayOfWeek + 7) % 7;
  activeFriday.setDate(nowWAT.getDate() + (dayOfWeek <= 5 ? diffToCurrentFriday : diffToCurrentFriday - 7));
  const activeFridayDateStr = activeFriday.toISOString().split('T')[0];

  return {
    isOpen,
    isFriday,
    isSaturday,
    activeFridayDateStr,
    hours,
    minutes,
    seconds,
  };
}

/**
 * Determines whether results and explanations can be released.
 * Unlocks on Saturday at 12:00 AM WAT (Midnight following Friday's test).
 */
export function areResultsReleased(activeFridayDateStr) {
  if (!activeFridayDateStr) return false;

  const nowWAT = getNowWAT();

  // Create release point: Saturday 00:00:00 WAT directly after the active Friday
  const [year, month, day] = activeFridayDateStr.split('-').map(Number);
  const releaseDateWAT = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  // Add 1 day to reach Saturday and adjust for UTC+1 (subtract 1 hour from UTC representation)
  releaseDateWAT.setUTCDate(releaseDateWAT.getUTCDate() + 1);
  releaseDateWAT.setUTCHours(releaseDateWAT.getUTCHours() - 1);

  return nowWAT.getTime() >= releaseDateWAT.getTime();
}