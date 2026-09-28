# Subscription X-Ray

A Next.js SaaS MVP based directly on the supplied Subscription X-Ray landing page.

## Included

- Same landing-page structure and messaging
- `/scanner` real CSV scanner
- Browser-only CSV parsing
- Recurring-payment detection
- Monthly and annual spending estimates
- Responsive UI
- Free / Pro pricing section
- Supabase/Razorpay environment placeholders
- Clear separation between UI and detection logic

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## CSV format

The scanner tries to detect:

- Date / Transaction Date / Txn Date
- Description / Merchant / Narration / Details
- Amount / Debit / Withdrawal / Transaction Amount

The MVP does not upload the raw CSV.

## Next SaaS steps

1. Add Supabase Auth.
2. Store only structured scan results, not raw bank statements.
3. Add Razorpay subscriptions and server-side webhook verification.
4. Add Pro-only scan history and alerts.
5. Add merchant normalization/cancellation-link mapping.
6. Add legal pages and production privacy/security review.

## Important

Do not advertise compatibility with a particular bank/UPI export until that CSV format has been tested. Financial data deserves extra security and privacy review before production launch.
