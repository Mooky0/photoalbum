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
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "PaaS-Labor-2026"
    storage_account_name = "photoalbumf041om"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

provider "kubernetes" {
  host  = var.okd_host
  token = var.okd_token
  config_path = ""
  # TLS verification is skipped for university OKD clusters that use self-signed certs.
  # Set okd_ca_cert in production instead.
  insecure = var.okd_ca_cert == "" ? true : false
  cluster_ca_certificate = var.okd_ca_cert != "" ? base64decode(var.okd_ca_cert) : null
}
