# ── Azure ─────────────────────────────────────────────────────────────────────

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "resource_group_name" {
  description = "Azure resource group name"
  type        = string
  default     = "PaaS-Labor-2026"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "storage_account_name" {
  description = "Azure Storage Account name (globally unique, 3-24 lowercase alphanumeric)"
  type        = string
  default     = "photoalbumf041om"
}

variable "storage_container_name" {
  description = "Blob container name for photo uploads"
  type        = string
  default     = "photos"
}

# ── OKD / Kubernetes ──────────────────────────────────────────────────────────

variable "okd_host" {
  description = "OKD API server URL, e.g. https://api.okd.example.com:6443"
  type        = string
}

variable "okd_token" {
  description = "OKD service account token (store in GitHub secret OKD_TOKEN)"
  type        = string
  sensitive   = true
}

variable "okd_ca_cert" {
  description = "Base64-encoded OKD cluster CA certificate. Leave empty to skip TLS verification."
  type        = string
  default     = ""
}

variable "okd_namespace" {
  description = "OKD namespace to deploy into"
  type        = string
  default     = "photoalbum-f041om"
}

# ── App ───────────────────────────────────────────────────────────────────────

variable "backend_image" {
  description = "Full backend image reference, e.g. ghcr.io/owner/photoalbum-backend:sha"
  type        = string
}

variable "frontend_image" {
  description = "Full frontend image reference, e.g. ghcr.io/owner/photoalbum-frontend:sha"
  type        = string
}

variable "django_secret_key" {
  description = "Django SECRET_KEY"
  type        = string
  sensitive   = true
}

variable "backend_api_url" {
  description = "Public backend URL passed to the frontend as NEXT_PUBLIC_API_URL"
  type        = string
  default     = "https://photoalbum-backend-photoalbum-f041om.apps.okd.fured.cloud.bme.hu/api"
}

variable "django_allowed_hosts" {
  description = "Comma-separated DJANGO_ALLOWED_HOSTS"
  type        = string
}

variable "azure_account_key" {
  description = "Azure Storage Account key"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
  default     = "changeme"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "photoalbum"
}

variable "db_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "photoalbum"
}
