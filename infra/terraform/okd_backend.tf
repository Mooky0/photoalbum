resource "kubernetes_secret" "backend" {
  metadata {
    name      = "photoalbum-backend-secret"
    namespace = var.okd_namespace
  }
  type = "Opaque"
  data = {
    DATABASE_URL      = "postgresql://${var.db_user}:${var.db_password}@photoalbum-postgresql:5432/${var.db_name}"
    POSTGRES_PASSWORD = var.db_password
    AZURE_ACCOUNT_KEY = var.azure_account_key
    DJANGO_SECRET_KEY = var.django_secret_key
  }
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "photoalbum-backend"
    namespace = var.okd_namespace
  }
  spec {
    replicas = 1
    selector {
      match_labels = { app = "photoalbum-backend" }
    }
    template {
      metadata {
        labels = { app = "photoalbum-backend" }
      }
      spec {
        container {
          name              = "backend"
          image             = var.backend_image
          image_pull_policy = "Always"
          port { container_port = 8000 }

          env {
            name  = "RENDER"
            value = "1"
          }
          env {
            name  = "DJANGO_DEBUG"
            value = "False"
          }
          env {
            name  = "DJANGO_ALLOWED_HOSTS"
            value = var.django_allowed_hosts
          }
          env {
            name = "DATABASE_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend.metadata[0].name
                key  = "DATABASE_URL"
              }
            }
          }
          env {
            name = "AZURE_ACCOUNT_KEY"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend.metadata[0].name
                key  = "AZURE_ACCOUNT_KEY"
              }
            }
          }
          env {
            name = "SECRET_KEY"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend.metadata[0].name
                key  = "DJANGO_SECRET_KEY"
              }
            }
          }

          readiness_probe {
            tcp_socket { port = 8000 }
            initial_delay_seconds = 20
            period_seconds        = 10
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "backend" {
  metadata {
    name      = "photoalbum-backend"
    namespace = var.okd_namespace
  }
  spec {
    selector = { app = "photoalbum-backend" }
    port {
      port        = 8000
      target_port = 8000
    }
  }
}

resource "kubernetes_manifest" "backend_route" {
  manifest = {
    apiVersion = "route.openshift.io/v1"
    kind       = "Route"
    metadata = {
      name      = "photoalbum-backend"
      namespace = var.okd_namespace
    }
    spec = {
      to = {
        kind = "Service"
        name = "photoalbum-backend"
      }
      port = {
        targetPort = "8000"
      }
      tls = {
        termination                   = "edge"
        insecureEdgeTerminationPolicy = "Redirect"
      }
    }
  }
}
