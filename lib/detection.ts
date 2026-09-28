export type Subscription = {
  merchant: string;
  amount: number;
  frequency: "weekly" | "monthly" | "quarterly" | "annual" | "recurring";
  occurrences: number;
  monthlyEquivalent: number;
};

export type ScanResult = {
  subscriptions: Subscription[];
  monthlyTotal: number;
};

type Tx = {
  date: Date;
  merchant: string;
  amount: number;
};

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  cells.push(current.trim());
  return cells;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\d{5,}/g, " ")           // strip transaction reference numbers embedded
    .replace(/[^a-z0-9]+/g, " ")       // in the description itself (common in Indian
    .trim();                            // bank/UPI exports) before comparing merchants
}

function findIndex(headers: string[], names: string[]) {
  return headers.findIndex((h) => names.some((name) => normalize(h).includes(name)));
}

function parseAmount(value: string) {
  const cleaned = value.replace(/[₹$€£,\s]/g, "").replace(/[()]/g, "-");
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.abs(n) : NaN;
}

function parseDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function frequencyFromDays(days: number): Subscription["frequency"] {
  if (days <= 10) return "weekly";
  if (days <= 45) return "monthly";
  if (days <= 120) return "quarterly";
  if (days <= 500) return "annual";
  return "recurring";
}

function monthlyEquivalent(amount: number, frequency: Subscription["frequency"]) {
  if (frequency === "weekly") return amount * 52 / 12;
  if (frequency === "monthly") return amount;
  if (frequency === "quarterly") return amount / 3;
  if (frequency === "annual") return amount / 12;
  return amount;
}

export function analyzeCsv(csv: string): ScanResult {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("The CSV needs a header row and at least one transaction.");

  const headers = splitCsvLine(lines[0]);
  const dateIndex = findIndex(headers, ["date", "transaction date", "txn date"]);
  const merchantIndex = findIndex(headers, ["description", "merchant", "narration", "details", "name"]);
  const amountIndex = findIndex(headers, ["amount", "debit", "withdrawal", "transaction amount"]);
  const typeIndex = findIndex(headers, ["type", "transaction type", "dr cr", "dr/cr"]);

  if (dateIndex < 0 || merchantIndex < 0 || amountIndex < 0) {
    throw new Error("Could not identify Date, Description/Merchant, and Amount columns.");
  }

  const txs: Tx[] = [];

  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const date = parseDate(cells[dateIndex] ?? "");
    const merchant = (cells[merchantIndex] ?? "").trim();
    const amount = parseAmount(cells[amountIndex] ?? "");

    // Skip money coming IN (salary, refunds, transfers received). Without this,
    // a recurring salary credit gets misread as a "subscription" and dominates
    // the total — confirmed by testing against a real salary + Netflix CSV.
    if (typeIndex >= 0) {
      const typeValue = (cells[typeIndex] ?? "").toLowerCase();
      const isCredit = typeValue.includes("credit") || typeValue.trim() === "cr";
      if (isCredit) continue;
    }

    if (date && merchant && Number.isFinite(amount) && amount > 0) {
      txs.push({ date, merchant, amount });
    }
  }

  if (!txs.length) throw new Error("No usable transactions were found in this CSV.");

  const groups = new Map<string, Tx[]>();

  for (const tx of txs) {
    const key = normalize(tx.merchant);
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }

  const subscriptions: Subscription[] = [];

  for (const [, list] of groups) {
    if (list.length < 2) continue;

    list.sort((a, b) => a.date.getTime() - b.date.getTime());

    const gaps: number[] = [];
    for (let i = 1; i < list.length; i++) {
      gaps.push((list[i].date.getTime() - list[i - 1].date.getTime()) / 86400000);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const frequency = frequencyFromDays(avgGap);

    const variation = Math.max(...list.map((x) => x.amount)) / Math.min(...list.map((x) => x.amount));
    const roughlySameAmount = variation <= 1.25;
    const recurringGap = avgGap >= 5 && avgGap <= 500;

    if (!roughlySameAmount || !recurringGap) continue;

    const avgAmount = list.reduce((sum, x) => sum + x.amount, 0) / list.length;

    subscriptions.push({
      merchant: list[list.length - 1].merchant,
      amount: avgAmount,
      frequency,
      occurrences: list.length,
      monthlyEquivalent: monthlyEquivalent(avgAmount, frequency)
    });
  }

  subscriptions.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);

  return {
    subscriptions,
    monthlyTotal: subscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0)
  };
}
