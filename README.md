# Photo album

Ez a dokumentáció a Photo Album alkalmazás technikai felépítését és infrastruktúráját mutatja be. Az alkalmazás egy monorepo struktúrában elhelyezkedő, modern full-stack megoldás. 

## Rendszerarchitektúra

Az alkalmazás 3 fő részre oszlik: kliensoldalra, a szerveroldali logikára és a felhőalapú perzisztens rétegekre.

### Frontend

- Technológia: NextJS + MaterialUI
- Kommunikáció: REST API hívások a backend felé

### Backend

- Technológia: Django, DRF
- Üzleti logika, hitelesítés (JWT)

### Adattárolás (Persistance) réteg

- SQL adatbázis: PostgreSQL adatbázis. Felhasználók, metaadatok tárolása.
- Objektumtároló: Azure Blob Storage a képek tárolására. Public read only módban. 
- Hely fehjlesztés: SQLite és MinIO (S3)

## Deployment

A projekt CI/CD folyamata a Render platformon keresztül automatizált:

### Backend
Deployment OKD Kubernetesen.

- A Dockerfile alapján készíti a OKD BuildConfig az image-et amit egy Deployment-el futtat.
- Gunicorn indítása: `photo_album.wsgi:application`
  
### Frontend
Deployment OKD Kubernetesen.

- Build: `npm install && npm run build` az OKD NextJS alapbelállításaival
- Futtatás: `npm run start`

Blob storage és adatbázis egyszer kézzel deployolva.

Az alkalmazás elérhető: [https://photoalbum-frontend-photoalbum-f041om.apps.okd.fured.cloud.bme.hu/](https://photoalbum-frontend-photoalbum-f041om.apps.okd.fured.cloud.bme.hu/)

Az alkalmazás skálázás leírása [itt](loadtest/README.md) található.

## Infrastucture as Code

Az infrastruktúra teljes egészében **Terraform** segítségével van megoldva (`infra/terraform/`). Minden Azure és OKD erőforrás kódban van leírva.

### Terraform állapot tárolása

A Terraform állapotfájl az Azure Blob Storage-ban van tárolva:

- Tárfiók: `photoalbumf041om`
- Konténer: `tfstate`
- Kulcs: `terraform.tfstate`

Ez biztosítja, hogy mind a helyi futtatás, mind a CI/CD pipeline ugyanazt az állapotot látja.

### Azure erőforrások (`azure.tf`)

| Erőforrás | Leírás |
|---|---|
| `azurerm_resource_group` | `PaaS-Labor-2026` erőforráscsoport |
| `azurerm_storage_account` | `photoalbumf041om` tárfiók CORS-szal |
| `azurerm_storage_container` | `photos` blob konténer a képekhez |

A tárfiók és a konténer `lifecycle { prevent_destroy = true }` védelemmel van ellátva, így `terraform destroy` sem törli őket.

### OKD / Kubernetes erőforrások

**PostgreSQL** (`okd_postgres.tf`):
- `PersistentVolumeClaim` — 1Gi tartós kötet az adatbázis adatainak (`prevent_destroy = true`)
- `Deployment` — `postgres:16` image, jelszót a backend secretből olvassa
- `Service` — ClusterIP, 5432-es porton

**Backend** (`okd_backend.tf`):
- `Secret` — `DATABASE_URL`, `POSTGRES_PASSWORD`, `AZURE_ACCOUNT_KEY`, `DJANGO_SECRET_KEY` tárolása
- `Deployment` — Django alkalmazás (`RENDER=1` production módban), env változók a secretből
- `Service` — ClusterIP, 8000-es porton
- `null_resource` — OpenShift Route létrehozása `kubectl apply` segítségével (HTTPS, edge termination)

**Frontend** (`okd_frontend.tf`):
- `Deployment` — Next.js alkalmazás `NEXT_PUBLIC_API_URL` env változóval
- `Service` — ClusterIP, 3000-es porton
- `null_resource` — OpenShift Route létrehozása (HTTPS, edge termination)

> **Megjegyzés az OpenShift Route-okhoz:** A `kubernetes_manifest` Terraform resource cluster-szintű `list customresourcedefinitions` jogot igényel, amellyel az egyetemi OKD fiók nem rendelkezik. Ezért a Route-okat `null_resource` + `local-exec` provisioner segítségével hozzuk létre, amely `kubectl apply`-t futtat.

### CI/CD integráció (`.github/workflows/deploy.yml`)

Minden `main` ágra történő pushnál két job fut le:

1. **`build-and-push`** — Docker image-ek buildelése és feltöltése a GitHub Container Registry-be (GHCR), git SHA alapú taggel
2. **`terraform`** — `kubectl` konfigurálása OKD-ra, majd `terraform apply` futtatása az új image referenciákkal

A szükséges GitHub Secrets:

| Secret | Leírás |
|---|---|
| `ARM_CLIENT_ID` / `ARM_CLIENT_SECRET` / `ARM_SUBSCRIPTION_ID` / `ARM_TENANT_ID` | Azure Service Principal az Azure és a Terraform backend eléréséhez |
| `OKD_HOST` / `OKD_TOKEN` | OKD API szerver és service account token |
| `DJANGO_SECRET_KEY` | Django titkos kulcs |
| `AZURE_ACCOUNT_KEY` | Azure tárfiók kulcs |
| `DB_PASSWORD` | PostgreSQL jelszó |

A szükséges GitHub Variables:

| Variable | Leírás |
|---|---|
| `BACKEND_API_URL` | A backend publikus URL-je (frontend build-time env változó) |
| `BACKEND_ALLOWED_HOSTS` | Django `ALLOWED_HOSTS` értéke |

### Helyi futtatás

Az `infra/terraform/terraform.tfvars` fájlban (gitignore-olva) kell megadni a helyi értékeket:

```hcl
subscription_id      = "<Azure subscription ID>"
okd_host             = "https://api.okd.fured.cloud.bme.hu:6443"
okd_token            = "<OKD token>"
django_secret_key    = "<Django secret key>"
azure_account_key    = "<Azure storage key>"
db_password          = "<PostgreSQL jelszó>"
django_allowed_hosts = "*.okd.fured.cloud.bme.hu"
backend_image        = "ghcr.io/<owner>/photoalbum-backend:latest"
frontend_image       = "ghcr.io/<owner>/photoalbum-frontend:latest"
```

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```