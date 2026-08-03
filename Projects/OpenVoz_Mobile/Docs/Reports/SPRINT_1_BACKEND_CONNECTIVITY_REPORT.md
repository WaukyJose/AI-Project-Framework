# Sprint 1 Backend Connectivity Report

## Purpose

This report records the implementation and validation outcome of Sprint 1 for OpenVoz Mobile.

Sprint 1 establishes the shared backend communication layer required before authentication, speaking, or assessment features are implemented in the mobile client.

## Implemented Features

- Environment-aware backend configuration for development, staging, and production through `utils/env.ts` and Expo app configuration.
- Shared API client in `services/api/api-client.ts` with:
  - base URL selection
  - request timeouts
  - JSON and text response handling
  - common request headers
  - interceptor-style request, response, and error hooks
  - centralized error normalization
- Thin API wrappers for:
  - `services/api/auth-api.ts`
  - `services/api/speaking-api.ts`
  - `services/api/assessment-api.ts`
- Development-only structured logging through `utils/logger.ts`
- Connectivity diagnostics screen on the application home route
- Environment selection via client-side infrastructure state

## Tested Endpoints

### Production

- `GET https://www.openvoz.com/usersvoicechat/login/`
  - Result: reachable
  - HTTP status: `200 OK`
  - Purpose: validated secure backend reachability through an existing server-rendered route

- `GET https://www.openvoz.com/api/version/`
  - Result: not exposed
  - HTTP status: `404 Not Found`

- `GET https://www.openvoz.com/api/v1/health/`
  - Result: not exposed
  - HTTP status: `404 Not Found`

### Additional Probes

- `GET https://www.openvoz.com/api/`
  - Result: not exposed
  - HTTP status: `404 Not Found`

- `GET https://www.openvoz.com/version/`
  - Result: not exposed
  - HTTP status: `404 Not Found`

## Known Limitations

- The repository does not contain the OpenVoz Django source tree, so a new backend endpoint could not be implemented from this workspace.
- As verified on **August 3, 2026**, the live production deployment does not expose a dedicated read-only JSON `health` or `version` endpoint at the obvious paths tested during Sprint 1.
- A development backend URL is configured for local use, but it was not validated from this repository because no local OpenVoz backend application is present here.
- A staging backend URL is configured structurally, but it was not validated because no staging deployment details are documented in the repository.

## Outcome

Sprint 1 successfully established the mobile-side communication layer and validated that OpenVoz Mobile can reach the production backend securely over HTTPS.

The API client, environment configuration, logging, diagnostics UI, and error normalization are ready to support Sprint 2.

The remaining backend gap is the absence of a dedicated lightweight health or version endpoint that the mobile client can use for authoritative API diagnostics.

## Next Steps

- Add a read-only backend endpoint such as `/api/version/` or `/api/v1/health/` in the OpenVoz Django application repository.
- Repoint the mobile diagnostics screen to the new endpoint once it exists.
- Begin Sprint 2 authentication work on top of the shared API client and environment configuration introduced here.
