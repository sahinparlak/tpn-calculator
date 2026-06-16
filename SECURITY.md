# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue.

Use GitHub's private vulnerability reporting: go to the repository's **Security**
tab → **Report a vulnerability**. We aim to acknowledge reports within a few days.

## Clinical-safety reports

Because this is a clinical decision-support tool, a **wrong calculation is a
safety issue**, not just a bug. If you believe the engine produces an incorrect
or unsafe result, please report it through the same private channel and include:

- the input (patient values and the profile used),
- the output you observed and the output you expected,
- the source (guideline / protocol) supporting the expected value.

Always independently verify any result before clinical use — see
[`DISCLAIMER.md`](DISCLAIMER.md).

## Supported versions

The project is in early development; only the latest `main` is supported. Once
versioned releases exist, this section will list the supported range.
