# Engineering Lessons Learned

The CirroCore infrastructure project was deliberately built as a small, cost-conscious platform rather than a miniature enterprise cloud. That constraint produced several useful engineering lessons.

## 1. A new server does not justify migrating everything

One of the most important architecture decisions was to keep workloads on the platform that already suited them.

A VPS was added for new persistent workloads, while existing managed web workloads remained on Netlify and Microsoft-heavy workloads retained an Azure path.

**Lesson:** workload placement should follow operational requirements, not infrastructure ownership.

## 2. Test failure behavior, not only happy-path deployment

A successful deployment proves very little about resilience.

The validation deliberately introduced an unhealthy application version and confirmed that the candidate was rejected while the known-good version remained available.

**Lesson:** deployment acceptance should include controlled failure and rollback evidence.

## 3. Backup completion is not recovery evidence

The backup project only became meaningful after the original synthetic data was deliberately removed and restored from the off-site repository.

**Lesson:** backup monitoring and restore testing solve different problems. Both are required.

## 4. Recovery claims should match what was actually tested

The project restored PostgreSQL data, deterministic files, and selected platform recovery material. It did not perform a complete replacement-host disaster-recovery exercise.

**Lesson:** distinguish clearly between "the backup contains the required material" and "the entire service has been rebuilt from nothing."

## 5. Single-host platforms need explicit limits

A low-cost VPS can be appropriate for small workloads, but it is still a single failure domain.

**Lesson:** document RPO, RTO, tenant-isolation, capacity, and availability limits rather than allowing users to assume enterprise HA behavior.

## 6. Security changes need safe sequencing

Remote SSH and firewall hardening can improve security while simultaneously creating lockout risk.

**Lesson:** security controls should include a safe implementation sequence and rollback path, not just a desired end state.

## 7. Private networking is a baseline, not an advanced feature

Application databases and internal services do not need to be public simply because the host is public.

**Lesson:** expose only the application edge; keep databases, caches, and container-management interfaces private by default.

## 8. Retention has operational consequences

Backup retention is not just a list of numbers. Pruning requires delete permissions, consumes resources, and can destroy the only usable recovery point if handled carelessly.

**Lesson:** review retention selection before destructive pruning and be explicit about the security implications of delete-capable backup credentials.

## 9. Cost optimization includes operational cost

A VPS may have a low monthly hosting price, but it creates patching, backup, security, monitoring, and recovery responsibilities that managed platforms absorb differently.

**Lesson:** "cheaper hosting" is not automatically lower total cost.

## 10. Documentation is part of infrastructure engineering

The private project used architecture notes, validation records, backup policy, recovery guidance, deployment rules, and stop conditions as engineering controls.

**Lesson:** a platform is easier to operate, review, hand over, and recover when decisions and boundaries are documented alongside the technology.

## How this affects future work

The next stage of my infrastructure development builds on these lessons with Infrastructure as Code, CI/CD, Azure governance, and observability. The goal is to increase repeatability without losing the emphasis on validation, recovery, and explicit operational limits.
