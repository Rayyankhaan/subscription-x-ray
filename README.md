# Subscription X-Ray

A Next.js SaaS MVP based on the Subscription X-Ray landing page.

## Included

* Landing page and pricing section
* `/scanner` CSV scanner
* Browser-only CSV parsing
* Recurring-payment detection
* Monthly and annual spending estimates
* Responsive UI
* Supabase and Razorpay environment placeholders
* Separation between UI and detection logic

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## CSV format

The scanner attempts to detect these columns:

* Date / Transaction Date / Txn Date
* Description / Merchant / Narration / Details
* Amount / Debit / Withdrawal / Transaction Amount

The MVP is designed not to upload the raw CSV.

## Next SaaS steps

1. Configure Supabase Auth and database.
2. Store structured scan results, not raw bank statements.
3. Configure Razorpay and server-side payment verification.
4. Add Pro-only scan history and alerts.
5. Add merchant normalization and cancellation-link mapping.
6. Review legal pages, privacy, and security before launch.

## Important

Do not advertise compatibility with a particular bank or UPI export until that CSV format has been tested. Financial data deserves extra security and privacy review before production launch.

