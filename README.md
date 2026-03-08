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

- SQL adatbázis: PostgreSQL adatbázis Renderen. Felhasználók, metaadatok tárolása.
- Objektumtároló: Azure Blob Storage a képek tárolására. Public read only módban. 
- Hely fehjlesztés: SQLite és MinIO (S3)

## Deployment

A projekt CI/CD folyamata a Render platformon keresztül automatizált:

### Backend
Python3 környezet Renderen.

- `build.sh` futtatása: függőségek telepítése -> Adatbázis migráció -> Statikus fájlok gyűjtése.
- Gunicorn indítása: `photo_album.wsgi:application`
  
### Frontend
Node.js környezet Renderen.

- Build: `npm install && npm run build`
- Futtatás: `npm run start`

Ezek a Render web dashboardon beállítva a szükséges Environment variables-el.
Blob storage és adatbázis egyszer kézzel deployolva.

Az alkalmazás elérhető: [https://photo-album-frontend-17wf.onrender.com](https://photo-album-frontend-17wf.onrender.com)