# Sanitized Platform Architecture

This document presents a **reference architecture** derived from the CirroCore infrastructure project. It is intentionally simplified and excludes production addresses, hostnames, credentials, account details, and private recovery material.

## Design goals

The platform was designed to provide a low-cost home for new persistent workloads while preserving existing managed-platform services that were already working well.

The goals were:

- avoid unnecessary migration risk;
- keep infrastructure cost proportional to actual demand;
- provide a practical Docker hosting platform for small applications and automation workloads;
- keep databases and internal services private;
- preserve a clear recovery path;
- retain Azure for workloads that need Microsoft-heavy or higher-assurance infrastructure.

## Platform boundaries

```text
                         Cloudflare
                             |
              +--------------+--------------+
              |                             |
           Netlify                       Ubuntu VPS
              |                             |
      Existing web workloads              Coolify
                                             |
                                           Docker
                                      +------+------+
                                      |             |
                                 Applications    PostgreSQL
                                      |             |
                                      +-- private --+
                                             |
                                        Restic
                                             |
                                      Backblaze B2
```

### Netlify

Used for existing website and mostly-static workloads that did not justify migration merely because a VPS became available.

### Ubuntu VPS

Used as a low-cost application host for workloads that benefit from persistent processes or containerized services, such as APIs, automation workers, internal tools, and small database-backed applications.

### Azure

Retained as the appropriate direction for Windows Server, SQL Server, Entra-integrated, regulated, advanced-DR, or higher-SLA workloads.

## Container and database boundaries

The reference design assumes:

- public traffic reaches only the application proxy layer;
- application containers communicate with databases across private Docker networks;
- PostgreSQL is not published directly to the Internet;
- each application receives its own database and login;
- applications do not use the PostgreSQL superuser;
- credentials remain outside Git;
- container separation is treated as operational isolation, not equivalent to dedicated-host tenant isolation.

## Deployment model

```text
Developer
   |
   v
GitHub
   |
   v
Coolify
   |
   v
Docker build
   |
   v
Health-gated application container
```

A production deployment should have an explicit repository, branch, build definition, health check, domain, resource policy, backup classification, and owner.

The prior known-good application image should remain available through the observation window so application rollback is possible if runtime validation fails.

## Availability assumptions

The initial platform is intentionally a single low-cost server. It does not provide:

- multi-region failover;
- active-active clustering;
- zero-RPO recovery;
- zero-RTO recovery;
- enterprise high availability.

Recovery is expected to take **hours rather than minutes** because host replacement, platform reconstruction, data recovery, and application validation dominate a full outage scenario.

## Architecture principle

> Use the simplest platform that satisfies the workload's operational, security, recovery, integration, and business requirements.

The VPS is therefore an additional workload option, not a replacement for every managed service or enterprise cloud platform.
