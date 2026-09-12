# Proyecto de entrega: Implementar un pipeline completo de CI/CD (REPOSITORY)


### Instalación rápida

#### Windows 

> Recomendado: usar Docker Desktop con WSL2 activado. Kind funciona mejor si corren dentro de WSL2 o con Docker Desktop habilitado.

```powershell
# 1) Node.js + pnpm
winget install OpenJS.NodeJS.LTS
corepack enable
npm install -g pnpm

# 2) Terraform
winget install Hashicorp.Terraform

# 3) kubectl
winget install Kubernetes.kubectl

# 4) kind
winget install --id Kubernetes.kind -e
```


#### Verificación

```bash
docker --version
terraform version
kind --version
kubectl version --client
node --version
pnpm --version
```

---


## 4. Ejecutar la aplicación localmente

### 4.1 Instalar dependencias

```bash
cd app
corepack enable
pnpm install
```

### 4.2 Ejecutar tests

```bash
cd app
pnpm test
```

### 4.3 Ejecutar app localmente

```bash
cd app
pnpm start
```

Luego abrimos en el navegador:

```text
http://localhost:3000/
```
![alt text](image.png)

También podemos probar el health endpoint:

```bash
curl http://localhost:3000/health
```

![alt text](image-1.png)

### 4.4 Verificar que responde correctamente

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/health
```



---

## 5. Ejecutar con Docker localmente

### 5.1 Construir la imagen

Desde la carpeta `app` del proyecto:

```bash
cd app
docker build -t demo-app:dev .
```
![alt text](image-18.png)

![alt text](image-19.png)

2) Cargarla al cluster Kind

```bash
kind load docker-image demo-app:dev --name demo-cluster
```

![alt text](image-31.png)

### 5.2 Ejecutar el contenedor

```bash
docker run --rm -d -p 3000:3000 --name demo-app demo-app:dev
```
![alt text](image-20.png)

![alt text](image-21.png)

### 5.3 Validar funcionamiento

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/health
docker ps
```
![alt text](image-22.png)

### 5.4 Detener el contenedor

```bash
docker stop demo-app
```


---

## 6. Provisionar infraestructura con Terraform (Kind)

La infraestructura se define en:

- [terraform/01-infra/main.tf](terraform/01-infra/main.tf)
- [terraform/01-infra/variables.tf](terraform/01-infra/variables.tf)
- [terraform/01-infra/outputs.tf](terraform/01-infra/outputs.tf)

### 6.1 Inicializar Terraform

```bash
cd terraform/01-infra
terraform init
```
![alt text](image-25.png)


### 6.2 Revisar el plan

```bash
terraform plan
```
![alt text](image-26.png)

### 6.3 Aplicar la infraestructura

```bash
terraform apply -auto-approve
```
![alt text](image-27.png)
### 6.4 Verificar el cluster

```bash
export KUBECONFIG=$(terraform output -raw kubeconfig_path)
kubectl cluster-info
kubectl get nodes
kubectl get pods -A
```
![alt text](image-28.png)

![alt text](image-29.png)
### 6.5 Salida esperada

Debe aparecer un cluster Kind con nodos `control-plane` y `worker`.

---

## 7. Desplegar la aplicación en Kubernetes

Los manifiestos están en:

- [k8s/00-namespace.yaml](k8s/00-namespace.yaml)
- [k8s/01-deployment.yaml](k8s/01-deployment.yaml)
- [k8s/02-service.yaml](k8s/02-service.yaml)
- [k8s/ingress.yaml](k8s/ingress.yaml)
- [k8s/hpa.yaml](k8s/hpa.yaml)

### 7.1 Crear el namespace

```bash
kubectl apply -f k8s/00-namespace.yaml
```
![alt text](image-12.png)

### 7.2 Aplicar Deployment

```bash
kubectl apply -f k8s/01-deployment.yaml
```
![alt text](image-13.png)

### 7.3 Aplicar Service

```bash
kubectl apply -f k8s/02-service.yaml
```
![alt text](image-14.png)

### 7.4 Aplicar Ingress

```bash
kubectl apply -f k8s/ingress.yaml
```
![alt text](image-15.png)

### 7.5 Aplicar HPA

```bash
kubectl apply -f k8s/hpa.yaml
```
![alt text](image-16.png)

### 7.6 Validar despliegue

```bash
kubectl get namespace
kubectl get deployment -n demo
kubectl get pods -n demo
kubectl get svc -n demo
kubectl get ingress -n demo
kubectl describe hpa demo-app-hpa -n demo
```
![alt text](image-30.png)

### 7.7 Verificar rollout

```bash
kubectl rollout status deployment/demo-app -n demo --timeout=180s
```
![alt text](image-32.png)

### 7.8 Port-forward para validar la app en local

```bash
kubectl port-forward -n demo svc/demo-app 3000:80
```
![alt text](image-33.png)

Luego probar:

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/health
```
![alt text](image-34.png)


---
## 8. GitHub Actions

Los workflows actuales están en:

- [.github/workflows/ci.yml](.github/workflows/ci.yml)
- [.github/workflows/cd.yml](.github/workflows/cd.yml)

### 8.1 Qué hace el pipeline CI

- checkout del repositorio
- setup de Node.js
- instalación de dependencias
- ejecución de tests
- build de la aplicación


### 8.2 Qué hace el pipeline CD

Su propósito es validar que:

- Terraform queda inicializado correctamente
- la infraestructura se puede validar con `terraform validate`
- el formato de Terraform es correcto
- los manifiestos de Kubernetes son válidos con `kubectl apply --dry-run=client`

### 8.3 Ejecutar manualmente el workflow

Desde GitHub:

1. ir a la pestaña Actions
2. seleccionar el workflow `CD` o `CI`
3. hacer click en `Run workflow`
4. confirmar la ejecución

Captura de CI

![alt text](image-2.png)

Captura de CD

![alt text](image-3.png)

---
