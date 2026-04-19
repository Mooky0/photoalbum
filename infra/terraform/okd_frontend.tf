resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "photoalbum-frontend"
    namespace = var.okd_namespace
  }
  spec {
    replicas = 1
    selector {
      match_labels = { app = "photoalbum-frontend" }
    }
    template {
      metadata {
        labels = { app = "photoalbum-frontend" }
      }
      spec {
        container {
          name              = "frontend"
          image             = var.frontend_image
          image_pull_policy = "Always"
          port { container_port = 3000 }

          env {
            name  = "NODE_ENV"
            value = "production"
          }
          env {
            name  = "NEXT_PUBLIC_API_URL"
            value = var.backend_api_url
          }

          readiness_probe {
            tcp_socket { port = 3000 }
            initial_delay_seconds = 15
            period_seconds        = 10
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "photoalbum-frontend"
    namespace = var.okd_namespace
  }
  spec {
    selector = { app = "photoalbum-frontend" }
    port {
      port        = 3000
      target_port = 3000
    }
  }
}

resource "null_resource" "frontend_route" {
  triggers = {
    service = kubernetes_service.frontend.metadata[0].name
    ns      = var.okd_namespace
  }

  provisioner "local-exec" {
    command = <<-SHELL
      kubectl apply -f - << 'YAML'
      apiVersion: route.openshift.io/v1
      kind: Route
      metadata:
        name: photoalbum-frontend
        namespace: ${var.okd_namespace}
      spec:
        to:
          kind: Service
          name: photoalbum-frontend
        port:
          targetPort: "3000"
        tls:
          termination: edge
          insecureEdgeTerminationPolicy: Redirect
      YAML
    SHELL
  }

  depends_on = [kubernetes_service.frontend]
}
