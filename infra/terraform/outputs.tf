output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "storage_primary_access_key" {
  value     = azurerm_storage_account.main.primary_access_key
  sensitive = true
}

# Route hostnames are assigned by OKD after creation.
# Check them with: kubectl get route -n <namespace>
