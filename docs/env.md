# Environment (Vite)

## Required
- `VITE_API_BASE`: Quadrakill API base (e.g., `/api/v1` or full URL).
- `VITE_BACKEND_URL`: Legacy backend URL for remaining endpoints (restore/snapshot/etc).
- `VITE_ENGINE`: `quadrakill` (default). Reserved for adapter switching.

## Optional
- `BASE_URL`: Vite base path for assets (fonts/images in `public/`).

## Notes
- Env names must be prefixed with `VITE_` to be exposed to the client.
- Fonts and images now resolve via `import.meta.env.BASE_URL`.
- Legacy endpoints (snapshot/log, revert, etc.) still use `VITE_BACKEND_URL` until migrated.***
