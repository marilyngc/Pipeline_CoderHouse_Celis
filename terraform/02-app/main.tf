terraform {
  required_version = ">= 1.6.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.31"
    }
  }
}

data "terraform_remote_state" "infra" {
  backend = "local"

  config = {
    path = "${path.module}/../01-infra/terraform.tfstate"
  }
}

provider "kubernetes" {
  config_path = data.terraform_remote_state.infra.outputs.kubeconfig_path
}

resource "kubernetes_namespace_v1" "demo" {
  metadata {
    name = var.namespace
  }
}

resource "kubernetes_deployment_v1" "demo_app" {
  metadata {
    name      = var.app_name
    namespace = kubernetes_namespace_v1.demo.metadata[0].name
    labels = {
      app = var.app_name
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = var.app_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.app_name
        }
      }

      spec {
        container {
          name  = var.app_name
          image = var.app_image

          port {
            container_port = var.container_port
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = var.container_port
            }
            initial_delay_seconds = 5
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = var.container_port
            }
            initial_delay_seconds = 3
            period_seconds        = 5
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "demo_app" {
  metadata {
    name      = var.app_name
    namespace = kubernetes_namespace_v1.demo.metadata[0].name
  }

  spec {
    selector = {
      app = var.app_name
    }

    port {
      port        = 80
      target_port = var.container_port
    }

    type = "ClusterIP"
  }
}

output "namespace" {
  value = kubernetes_namespace_v1.demo.metadata[0].name
}

output "service_name" {
  value = kubernetes_service_v1.demo_app.metadata[0].name
}

output "port_forward_hint" {
  value = "kubectl --kubeconfig ${data.terraform_remote_state.infra.outputs.kubeconfig_path} port-forward -n ${kubernetes_namespace_v1.demo.metadata[0].name} svc/${kubernetes_service_v1.demo_app.metadata[0].name} 3000:80"
}
