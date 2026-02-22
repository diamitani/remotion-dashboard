# Azure CLI Deployment Runbook

## Prerequisites

- Azure CLI installed (`az --version`)
- Logged in (`az login`)
- GitHub repo connected

## 1) Create resource group

```bash
az group create --name remotion-dashboard-rg --location eastus
```

## 2) Create Static Web App

```bash
az staticwebapp create \
  --name remotion-dashboard-app \
  --resource-group remotion-dashboard-rg \
  --location eastus2 \
  --source https://github.com/<org>/<repo> \
  --branch main \
  --app-location / \
  --output-location dist
```

## 3) Get deployment token

```bash
az staticwebapp secrets list \
  --name remotion-dashboard-app \
  --resource-group remotion-dashboard-rg
```

Copy `apiKey` to GitHub Actions secret:

- `AZURE_STATIC_WEB_APPS_API_TOKEN`

## 4) GitHub Actions

Workflow file is already present at:

- `/Users/patrickdiamitani/Desktop/ReMotion Web App/.github/workflows/azure-static-web-apps.yml`

Push to `main` to deploy.

## 5) Environment variables

Set frontend env vars in Azure Static Web Apps configuration:

- `VITE_REMOTION_PREVIEW_BASE_URL`
- `VITE_OPENCODE_API_BASE_URL`
- `VITE_AUTH_PROVIDER`

## 6) Verify

- Workflow succeeds in GitHub Actions.
- Site URL opens from Azure portal.
- Chat input and preview panel render correctly.
