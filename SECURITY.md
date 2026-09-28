# Security Policy

## Supported Versions

Subscription X-Ray is currently under active development. Security updates are provided for the latest version of the project.

| Version         | Supported |
| --------------- | --------- |
| Latest (`main`) | Yes       |
| Older versions  | No        |

## Reporting a Vulnerability

If you discover a security vulnerability in Subscription X-Ray, please report it responsibly.

**Please do not disclose security vulnerabilities publicly until they have been investigated.**

When reporting a vulnerability, include:

* A description of the vulnerability.
* Steps to reproduce the issue.
* The potential impact.
* Any relevant screenshots, logs, or proof-of-concept details.

## Security Practices

Subscription X-Ray is designed to help users identify recurring payments from bank or card statement CSV files.

Our security priorities include:

* **Client-side processing:** Statement files should be processed locally in the browser wherever possible.
* **Data minimization:** Avoid collecting or storing sensitive financial information unnecessarily.
* **Secure authentication:** Use Supabase Auth and appropriate access controls for authenticated features.
* **Environment variables:** Keep API keys, database credentials, and other secrets out of source code.
* **Input validation:** Validate uploaded CSV files and handle malformed or unexpected data safely.
* **Dependency maintenance:** Keep project dependencies updated and address known vulnerabilities.

## Responsible Disclosure

We appreciate responsible security research. Please provide enough information for us to understand and reproduce the issue.

Do not access, modify, or disclose other users' data, and do not disrupt the service while testing.

## Scope

This policy applies to the Subscription X-Ray application and its official repository:

* Repository: https://github.com/Rayyankhaan/subscription-x-ray
* Website: https://subscription-x-ray-85na.vercel.app/

Thank you for helping keep Subscription X-Ray and its users secure.
