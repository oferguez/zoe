export type AnonymizedDocument = {
  id: string;
  label: string;
  type: string;
  size: number;
  text: string;
};

export type RedactionSummary = {
  emailCount: number;
  phoneCount: number;
  ssnCount: number;
  dateCount: number;
  medicalIdCount: number;
};

const EMPTY_SUMMARY: RedactionSummary = {
  emailCount: 0,
  phoneCount: 0,
  ssnCount: 0,
  dateCount: 0,
  medicalIdCount: 0
};

function replaceAndCount(
  input: string,
  pattern: RegExp,
  replacement: string
): { value: string; count: number } {
  let count = 0;
  const value = input.replace(pattern, () => {
    count += 1;
    return replacement;
  });
  return { value, count };
}

export function anonymizeText(input: string): { text: string; summary: RedactionSummary } {
  let text = input;
  const summary = { ...EMPTY_SUMMARY };

  let result = replaceAndCount(text, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]");
  text = result.value;
  summary.emailCount += result.count;

  result = replaceAndCount(
    text,
    /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
    "[phone]"
  );
  text = result.value;
  summary.phoneCount += result.count;

  result = replaceAndCount(text, /\b\d{3}-\d{2}-\d{4}\b/g, "[ssn]");
  text = result.value;
  summary.ssnCount += result.count;

  result = replaceAndCount(
    text,
    /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g,
    "[date]"
  );
  text = result.value;
  summary.dateCount += result.count;

  result = replaceAndCount(
    text,
    /\b(?:MRN|medical record|patient id|nhs number)\s*[:#-]?\s*[A-Z0-9-]{4,}\b/gi,
    "[medical-id]"
  );
  text = result.value;
  summary.medicalIdCount += result.count;

  return { text, summary };
}

export function mergeSummaries(summaries: RedactionSummary[]) {
  return summaries.reduce(
    (total, item) => ({
      emailCount: total.emailCount + item.emailCount,
      phoneCount: total.phoneCount + item.phoneCount,
      ssnCount: total.ssnCount + item.ssnCount,
      dateCount: total.dateCount + item.dateCount,
      medicalIdCount: total.medicalIdCount + item.medicalIdCount
    }),
    { ...EMPTY_SUMMARY }
  );
}

export function redactionPreview(summary: RedactionSummary) {
  return [
    `${summary.emailCount} emails`,
    `${summary.phoneCount} phone numbers`,
    `${summary.ssnCount} SSNs`,
    `${summary.dateCount} dates`,
    `${summary.medicalIdCount} medical IDs`
  ];
}
