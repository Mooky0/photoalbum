resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "photoalbum-postgresql-data"
    namespace = var.okd_namespace
    annotations = {
      # Data survives `terraform destroy` — must be deleted manually.
      "terraform.io/ignore-changes" = "true"
    }
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "1Gi"
      }
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "photoalbum-postgresql"
    namespace = var.okd_namespace
  }
  spec {
    replicas = 1
    selector {
      match_labels = { app = "photoalbum-postgresql" }
    }
    template {
      metadata {
        labels = { app = "photoalbum-postgresql" }
      }
      spec {
        container {
          name  = "postgresql"
          image = "postgres:16"
          port { container_port = 5432 }

          env {
            name  = "POSTGRES_USER"
            value = var.db_user
          }
          env {
            name  = "POSTGRES_DB"
            value = var.db_name
          }
          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }
          env {
            name  = "PGDATA"
            value = "/var/lib/postgresql/data/pgdata"
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_user]
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }

          volume_mount {
            name       = "data"
            mount_path = "/var/lib/postgresql/data"
          }
        }
        volume {
          name = "data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = "photoalbum-postgresql"
    namespace = var.okd_namespace
  }
  spec {
    selector = { app = "photoalbum-postgresql" }
    port {
      port        = 5432
      target_port = 5432
    }
  }
}
