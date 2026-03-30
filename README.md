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