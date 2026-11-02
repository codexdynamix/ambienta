import { HealthCategory, Patient, RefillRecord, ReminderRule, RefillStatus } from '../types/pharmacy';

/**
 * Calculates remaining days from a reference date (or today) to a target date string.
 */
export function calculateDaysRemaining(targetDateStr: string, referenceDateStr?: string): number {
  if (!targetDateStr) return 0;
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date('2026-11-02T12:00:00Z');
  const targetDate = new Date(targetDateStr);
  const diffTime = targetDate.getTime() - refDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Computes refill status based on remaining refills and days remaining.
 */
export function determineRefillStatus(remainingRefills: number, daysRemaining: number): RefillStatus {
  if (remainingRefills <= 0) {
    return 'Renewal Required';
  }
  if (daysRemaining < 0) {
    return 'Overdue';
  }
  if (daysRemaining <= 5) {
    return 'Due Soon';
  }
  return 'Active';
}

/**
 * Replaces token placeholders like {{patient_name}}, {{rx_number}}, {{medication}}, {{renewal_date}} with actual values.
 */
export function interpolateEmailTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, val || '');
  }
  return result;
}

/**
 * Filters patient list by health category segment.
 */
export function filterPatientsByHealthCategory(
  patients: Patient[],
  category: HealthCategory | 'All Patients'
): Patient[] {
  if (category === 'All Patients') {
    return patients;
  }
  return patients.filter((p) => p.healthCategory === category);
}

export interface CsvParseResult {
  patients: Partial<Patient>[];
  errors: string[];
  totalParsed: number;
}

/**
 * Parses raw CSV string containing leads / patient records.
 * Supports standard CSV formats with headers:
 * first_name,last_name,email,phone,health_category,medication_name,rx_number,renewal_date,primary_doctor
 */
export function parseLeadsCsv(csvText: string): CsvParseResult {
  const errors: string[] = [];
  const patients: Partial<Patient>[] = [];

  if (!csvText || !csvText.trim()) {
    return { patients: [], errors: ['CSV content is empty.'], totalParsed: 0 };
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { patients: [], errors: ['CSV must have a header row and at least one data row.'], totalParsed: 0 };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  const findIdx = (names: string[]) => {
    return headers.findIndex((h) => names.some((n) => h.includes(n)));
  };

  const fnIdx = findIdx(['first_name', 'firstname', 'first']);
  const lnIdx = findIdx(['last_name', 'lastname', 'last']);
  const emailIdx = findIdx(['email', 'mail']);
  const phoneIdx = findIdx(['phone', 'mobile', 'tel']);
  const catIdx = findIdx(['health_category', 'category', 'condition', 'health']);
  const medIdx = findIdx(['medication', 'drug', 'medicine', 'product']);
  const rxIdx = findIdx(['rx_number', 'rx', 'item_code', 'code', 'ref_id']);
  const dateIdx = findIdx(['renewal_date', 'due_date', 'renewal', 'refill_date']);
  const docIdx = findIdx(['doctor', 'physician', 'provider', 'specialist']);

  if (emailIdx === -1 && phoneIdx === -1) {
    errors.push('CSV header must contain at least an email or phone column.');
    return { patients: [], errors, totalParsed: 0 };
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // basic CSV split handling quoted comma values
    const cols: string[] = [];
    let insideQuote = false;
    let currentCell = '';

    for (let charIdx = 0; charIdx < rawLine.length; charIdx++) {
      const char = rawLine[charIdx];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        cols.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cols.push(currentCell.trim());

    const clean = (val?: string) => (val || '').replace(/^["']|["']$/g, '').trim();

    const firstName = fnIdx !== -1 ? clean(cols[fnIdx]) : 'Patient';
    const lastName = lnIdx !== -1 ? clean(cols[lnIdx]) : `#${i}`;
    const email = emailIdx !== -1 ? clean(cols[emailIdx]) : '';
    const phone = phoneIdx !== -1 ? clean(cols[phoneIdx]) : '';
    const rawCat = catIdx !== -1 ? clean(cols[catIdx]) : 'General Care';
    const medName = medIdx !== -1 ? clean(cols[medIdx]) : '';
    const rxNumber = rxIdx !== -1 ? clean(cols[rxIdx]) : `RX-${100000 + i}`;
    const renewalDate = dateIdx !== -1 ? clean(cols[dateIdx]) : '2026-11-20';
    const primaryDoctor = docIdx !== -1 ? clean(cols[docIdx]) : 'Dr. M. Stevens, MD';

    if (!email && !phone) {
      errors.push(`Row ${i + 1}: Skipped row due to missing both email and phone contact.`);
      continue;
    }

    // Match health category safely
    let healthCategory: HealthCategory = 'General Care';
    const catLower = rawCat.toLowerCase();
    if (catLower.includes('sleep') || catLower.includes('insomnia') || catLower.includes('rest')) {
      healthCategory = 'Sleep';
    } else if (catLower.includes('weight') || catLower.includes('diet') || catLower.includes('metabol') || catLower.includes('slim')) {
      healthCategory = 'Weight Loss';
    } else if (catLower.includes('energy') || catLower.includes('focus') || catLower.includes('vitality')) {
      healthCategory = 'Energy & Focus';
    } else if (catLower.includes('diabet')) {
      healthCategory = 'Diabetes Care';
    } else if (catLower.includes('cardio') || catLower.includes('heart') || catLower.includes('hypertens') || catLower.includes('blood pressure')) {
      healthCategory = 'Cardiology / Hypertension';
    } else if (catLower.includes('digest') || catLower.includes('gut') || catLower.includes('stomach')) {
      healthCategory = 'Digestive Health';
    } else if (catLower.includes('asthma') || catLower.includes('respirat') || catLower.includes('lung')) {
      healthCategory = 'Asthma & Respiratory';
    } else if (catLower.includes('well') || catLower.includes('vitamin') || catLower.includes('daily')) {
      healthCategory = 'Daily Wellness';
    }

    const patientRecord: Partial<Patient> = {
      firstName,
      lastName,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@patientmail.com`,
      phone: phone || '+1 (555) 234-5678',
      healthCategory,
      primaryDoctor,
      leadSource: 'CSV Upload',
      nextRenewalDate: renewalDate,
      activeMedicationsCount: medName ? 1 : 0,
      refillHistory: medName
        ? [
            {
              id: `refill-csv-${Date.now()}-${i}`,
              rxNumber,
              medicationName: medName,
              strength: 'Standard Dosage',
              dosageForm: 'Oral Tablet',
              quantity: 30,
              daysSupply: 30,
              providerDoctor: primaryDoctor,
              doctorClinic: 'Regional Health Partners',
              dateFilled: '2026-10-21',
              nextRefillDue: renewalDate,
              remainingRefills: 2,
              status: 'Active',
              refillInstructions: 'Take once daily as directed by your physician.',
            },
          ]
        : [],
    };

    patients.push(patientRecord);
  }

  return { patients, errors, totalParsed: patients.length };
}

/**
 * Generates sample CSV string for users to download and inspect.
 */
export function generateSampleCsv(): string {
  return [
    'first_name,last_name,email,phone,health_category,medication_name,rx_number,renewal_date,primary_doctor',
    'Robert,Miller,robert.miller@example.com,+1 (555) 304-8891,Sleep,Deep Sleep Neuro Rest,RX-774012,2026-11-06,Dr. Helen Brody, MD',
    'Sarah,Jenkins,sarah.j@example.com,+1 (555) 441-9923,Weight Loss,Semaglutide Metabolic Kit,RX-663810,2026-11-04,Dr. Kenneth Lee, MD',
    'David,Kim,dkim.archive@example.com,+1 (555) 912-3341,Energy & Focus,Lion’s Mane & B-Complex,RX-992144,2026-11-08,Dr. Patricia Ross, MD',
    'Margaret,Thurston,margaret.t@example.com,+1 (555) 883-1200,Cardiology / Hypertension,Lisinopril 10mg,RX-334109,2026-11-05,Dr. Helen Brody, MD',
    'Claire,Delaney,claire.delaney@example.com,+1 (555) 762-4419,Daily Wellness,Liposomal Vitamin C 1000mg,RX-551902,2026-11-12,Dr. Marcus Vance, MD',
  ].join('\n');
}

/**
 * Identifies upcoming renewal triggers for patient refill records based on configured reminder rules.
 */
export function evaluateDueReminders(
  patients: Patient[],
  rules: ReminderRule[],
  currentDateStr = '2026-11-02'
): { patient: Patient; record: RefillRecord; rule: ReminderRule; daysLeft: number }[] {
  const matches: { patient: Patient; record: RefillRecord; rule: ReminderRule; daysLeft: number }[] = [];
  const activeRules = rules.filter((r) => r.isActive);

  for (const patient of patients) {
    for (const record of patient.refillHistory) {
      const daysLeft = calculateDaysRemaining(record.nextRefillDue, currentDateStr);

      for (const rule of activeRules) {
        // Trigger if daysLeft equals rule days or is within threshold
        if (daysLeft <= rule.daysBeforeDue && daysLeft >= 0) {
          matches.push({ patient, record, rule, daysLeft });
          break; // Avoid duplicate rule firings for the same record in one scan
        }
      }
    }
  }

  return matches;
}
