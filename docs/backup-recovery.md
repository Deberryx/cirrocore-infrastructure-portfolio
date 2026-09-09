# Backup & Recovery Case Study

This document summarizes the backup-and-recovery validation performed for the CirroCore platform using **Restic**, **Backblaze B2**, synthetic PostgreSQL data, and disposable restore targets.

## Objective

The recovery design had to prove that the platform could recover:

- application files;
- PostgreSQL data;
- selected platform recovery material;
- from an encrypted off-site repository;
- after the original synthetic source had been deliberately removed.

The guiding rule was:

> A backup is not considered proven until a restore succeeds.

## Backup approach

The validated design used:

- Restic for encrypted repository backups;
- Backblaze B2 as off-site object storage;
- PostgreSQL custom-format dumps for database recovery;
- a reviewed retention model;
- scheduled service execution with logs and failure propagation;
- restore rehearsals using disposable targets.

No production customer data was used during the validation.

## Retention model

The reference retention policy is:

- 7 daily snapshots;
- 4 weekly snapshots;
- 3 monthly snapshots.

Retention selection was reviewed using a dry run before any destructive pruning behavior.

## Repository verification

The Restic repository was validated through:

- successful repository initialization;
- successful backups;
- a full `restic check --read-data` verification;
- retention-policy dry run;
- retrieval of data from the off-site repository during restore testing.

This checks both repository structure and the stored backup data rather than relying only on job-success messages.

## PostgreSQL recovery rehearsal

A disposable PostgreSQL environment was used with clearly synthetic data.

The recovery sequence was:

1. create a synthetic database;
2. produce a custom-format PostgreSQL dump;
3. verify the dump with `pg_restore --list`;
4. include the dump in the encrypted off-site backup;
5. remove the source container, volume, local dump, and source files;
6. retrieve the dump from the off-site repository;
7. restore into a new empty database;
8. compare expected row count, schema state, and deterministic integrity evidence.

The restored database matched the synthetic source.

## File recovery rehearsal

The file test followed the same principle:

1. create deterministic source files;
2. record count, content checksums, and permissions;
3. back them up off-site;
4. remove the source;
5. restore from Restic/B2;
6. compare file count, aggregate content checksum, and permissions.

The restored files matched the expected source state.

## Platform recovery material

Selected control-plane recovery material was also restored into a **separate disposable directory**, not over the live platform.

The test verified that expected recovery files were present off-site and could be restored with matching integrity and permissions.

This should not be confused with a full replacement-server rebuild. It proves backup content availability, not complete end-to-end disaster recovery of an entirely new host.

## Security considerations

The design keeps recovery credentials outside Git and uses encrypted repository data. It also accepts an important limitation: the direct Restic runtime credential requires repository-object deletion capability for normal Restic lock and retention operations.

That means host compromise can still create backup-repository deletion risk. The design therefore does **not** claim immutable or write-only protection.

## Recovery objectives

The initial platform is intentionally low-cost and single-host.

Its recovery expectation is therefore:

```text
RPO: up to the last successful scheduled backup
RTO: hours, not minutes
High availability: no
```

Individual applications should define tighter requirements only when business impact justifies additional infrastructure and operational cost.

## Interview summary

> I implemented and validated an encrypted Restic/Backblaze B2 backup workflow, performed full repository data verification, deliberately removed synthetic PostgreSQL and file sources, restored them into clean targets, and verified integrity after recovery. I treated restore testing as the acceptance criterion rather than backup-job success alone.
