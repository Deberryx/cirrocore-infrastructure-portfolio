# Security Design

This document describes the **sanitized security baseline** used for the CirroCore infrastructure project. It focuses on simple, reviewable controls appropriate for a small Linux/Docker platform.

## Host baseline

The reference host uses Ubuntu 24.04 LTS with a minimal operating-system footprint.

Core controls include:

- a named non-root administrator;
- SSH key authentication;
- sudo access rather than routine root sessions;
- SSH hardening only after an independent key-authenticated session has been verified;
- default-deny ingress firewall policy;
- minimal Fail2ban protection for SSH;
- unattended security updates;
- controlled reboots when the OS reports that a reboot is required;
- bounded system and Docker logs;
- reviewed configuration changes with rollback paths.

## Public exposure

The platform follows a minimal-exposure model.

Public access is limited to services that genuinely require it. Databases, caches, Docker API sockets, and internal platform services are not intended to be directly Internet-reachable.

```text
Internet
   |
   +--> SSH (administration, controlled)
   +--> HTTP/HTTPS (only when applications require web exposure)

Private only
   |
   +--> PostgreSQL
   +--> cache services
   +--> application-internal networks
   +--> Docker daemon
```

## Application isolation

For small compatible workloads on a shared host:

- applications use separate databases and logins;
- application credentials are unique;
- applications do not connect as PostgreSQL superuser;
- application containers communicate with data services across private networks;
- credentials are injected through runtime configuration rather than committed to Git.

Container separation is useful operational isolation, but the design does not claim that a single shared VPS provides the same security boundary as separate dedicated hosts or cloud accounts.

## Secret handling

The public portfolio repository contains no production secrets.

The operational rules behind the project include:

- no real `.env` files in Git;
- no private keys in Git;
- no credentials in Docker images or Compose files;
- no database dumps in source control;
- no secrets in shell history where avoidable;
- staged-diff review before commits;
- placeholder-only sample values in public examples.

## Patch management

Security updates are applied through Ubuntu's supported update mechanism. Automatic security updates are enabled, while operating-system reboot requirements are treated as maintenance work rather than forcing uncontrolled automatic reboots.

The platform also uses infrastructure automation elsewhere in the broader portfolio, including Ansible-based Ubuntu patching.

## Change safety

Security changes are sequenced to reduce lockout and outage risk.

Examples:

- verify a separate SSH key-authenticated admin session before disabling password access;
- validate configuration syntax before reload;
- prefer reload to restart where supported;
- preserve provider-console access during high-risk remote changes;
- stop when observed state differs from the runbook;
- retain rollback instructions before applying a material configuration change.

## Backup security

Backups are encrypted with Restic and stored off-host. Recovery credentials are kept outside Git.

The design does not overstate its protection model: the runtime backup credential requires enough permissions for normal Restic repository operations, including deletion used by lock cleanup and retention. Therefore host compromise remains a risk to backup availability.

## Security philosophy

The project favors controls that are:

1. understandable;
2. testable;
3. recoverable;
4. proportionate to the workload;
5. explicit about their limitations.

The goal is not to label a small VPS as "enterprise secure." The goal is to build a defensible security baseline and know when a workload has outgrown it.
