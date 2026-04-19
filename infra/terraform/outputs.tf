output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "storage_primary_access_key" {
  value     = azurerm_storage_account.main.primary_access_key
  sensitive = true
}

output "backend_route_host" {
  value = kubernetes_manifest.backend_route.manifest.spec.host
}

output "frontend_route_host" {
  value = kubernetes_manifest.frontend_route.manifest.spec.host
}
