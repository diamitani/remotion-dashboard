# Video AI SaaS Platform Model

This is the operating model for turning this project into a running multi-tenant platform.

## 1) Remotion account model

Use one platform-owned rendering account and infrastructure.

- Users do not need direct access to your Remotion account.
- Users interact with your app, not your render host.
- Your backend executes render jobs in isolated worker environments per project.

## 2) Library installation model

Install Remotion and design libraries once in a base worker image/template.

- Build a golden worker image with all libraries pre-installed.
- Every job starts from that image.
- User projects only store prompts, metadata, and generated source diffs.

## 3) Token model and billing

Support two token modes per workspace/project.

- `platform-managed`: your keys are used, you bill users in your app.
- `bring-your-own-key`: users store their own provider keys, usage is charged to them.

Store all keys server-side only.

- Encrypt secrets in Azure Key Vault.
- Never send provider secrets to the browser.
- Inject keys into worker jobs at runtime.

## 4) OpenCode project model

Create one logical OpenCode project namespace per user workspace.

- Map: `workspace_id -> opencode_project_ref`.
- Every prompt creates a job tied to `workspace_id` and `project_id`.
- Workers patch only that project scope.

## 5) Recommended Azure architecture

- Frontend: Azure Static Web Apps.
- API: Azure Container Apps or Azure Functions (auth + jobs + projects).
- Queue: Azure Service Bus.
- Workers: Azure Container Apps Jobs or VM scale set workers running OpenCode + Remotion.
- Storage: Blob Storage for rendered outputs.
- DB: Postgres/Cosmos for users, workspaces, jobs, revisions.
- Secrets: Azure Key Vault.

## 6) Request flow

1. User logs in.
2. User selects project/workspace.
3. User sends prompt.
4. API validates auth and quotas.
5. API enqueues render/edit job.
6. Worker checks out workspace state and runs OpenCode patch.
7. Worker renders preview with Remotion.
8. Worker uploads artifact to Blob.
9. API returns updated preview URL + revision metadata.

## 7) Security and tenancy

- Enforce row-level access by `tenant_id` and `workspace_id`.
- Use signed URLs for preview/video downloads.
- Keep strict job-level filesystem isolation.
- Add audit logs per prompt and render operation.

## 8) Migration from scaffold

- Replace mock platform API with real backend endpoints.
- Add Azure AD B2C auth and JWT validation.
- Add project/workspace tables and persistent chat history.
- Add queue-backed worker execution and callback status updates.
