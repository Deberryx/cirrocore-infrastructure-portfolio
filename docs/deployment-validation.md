# Deployment Validation Case Study

This case study summarizes a controlled rehearsal performed against the CirroCore platform using a **disposable stateless application**. No production application, customer data, database, or application secret was required for the test.

## Objective

The goal was to verify that the platform could:

- deploy from Git;
- expose an application safely over HTTPS;
- enforce container health and resource limits;
- reject a bad deployment;
- preserve the prior healthy version during failure;
- redeploy a healthy version;
- roll back to a known-good release;
- cleanly remove temporary public exposure after the test.

## Disposable workload

The validation workload was intentionally simple:

- native Node.js HTTP service;
- non-root container runtime;
- `/health` endpoint;
- no persistent storage;
- no database;
- no authentication;
- no third-party integration;
- no application secrets.

The container was configured with CPU and memory constraints and bounded Docker log rotation.

## Deployment flow

```text
Private Git repository
        |
        v
     Coolify
        |
        v
   Docker build
        |
        v
Health-gated candidate
        |
   +----+----+
   |         |
healthy   unhealthy
   |         |
serve     reject
```

## Validation results

The rehearsal confirmed:

- private-Git build and deployment succeeded;
- HTTP redirected to HTTPS;
- the root endpoint returned HTTP 200;
- the health endpoint returned the expected healthy response;
- a trusted TLS certificate was issued for the test hostname;
- the running application container remained healthy;
- configured CPU and memory limits were visible on the running container;
- no application secret appeared in configuration, deployment output, or runtime logs.

## Failure injection

A controlled change was then introduced so that the candidate release returned HTTP 503 and failed its container health check.

The platform behavior was the important part:

1. the unhealthy candidate failed repeated health probes;
2. the candidate was rejected;
3. the prior healthy container continued serving the application;
4. a corrected release was deployed successfully;
5. the application was later rolled back to the earlier known-good image;
6. the original healthy response was restored.

This validates a practical **health-gated deployment and rollback workflow**, rather than simply demonstrating that a container can start.

## Network exposure validation

During the rehearsal, only the ports required for public web validation were temporarily exposed. Application-internal, database, cache, Docker API, and platform-internal ports remained blocked from the public Internet.

After testing:

- the disposable application was removed;
- temporary DNS was removed;
- temporary web firewall exposure was removed;
- no application container, application network, persistent volume, or application database remained.

## Why this matters

A deployment pipeline should be tested for failure, not only for success.

The most useful evidence from this rehearsal is not that HTTPS worked. It is that a deliberately unhealthy candidate did **not** replace the healthy service and that rollback was validated using a retained known-good image.

## Interview summary

A concise way to describe this work:

> I validated a Docker/Coolify deployment platform with a disposable application, including TLS, health checks, resource limits, controlled failure injection, rejection of an unhealthy release, continued service from the prior version, successful redeployment, and rollback to a known-good image.
