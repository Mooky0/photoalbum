terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }

  # Remote state in Azure Blob Storage.
  # Bootstrap: create the storage account "photoalbumtfstate" manually ONCE,
  # then run: terraform init -backend-config="access_key=<key>"
  backend "azurerm" {
    resource_group_name  = "photoalbum-tf-state"
    storage_account_name = "photoalbumtfstate"
    container_name       = "tfstate"
    key                  = "photoalbum.tfstate"
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

provider "kubernetes" {
  host  = var.okd_host
  token = var.okd_token
  # TLS verification is skipped for university OKD clusters that use self-signed certs.
  # Set okd_ca_cert in production instead.
  insecure = var.okd_ca_cert == "" ? true : false
  cluster_ca_certificate = var.okd_ca_cert != "" ? base64decode(var.okd_ca_cert) : null
}
