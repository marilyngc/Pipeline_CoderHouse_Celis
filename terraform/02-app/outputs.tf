output "service_name" {
  value = module.app.service_name
}

output "namespace" {
  value = module.app.namespace
}

output "port_forward_hint" {
  description = "Comando para probar la app en local"
  value       = "kubectl --kubeconfig ${data.terraform_remote_state.infra.outputs.kubeconfig_path} port-forward -n ${module.app.namespace} svc/${module.app.service_name} 3000:80"
}
