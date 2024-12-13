# REST API Terv - Projektkezelő

## 1. Adatbázis Terv

Az API célja, hogy felhasználók, csapatok és feladatok kezelésére szolgáljon. Az alábbi három kapcsolódó kollekciót fogjuk létrehozni:

### Kollekciók:

- **Users** (Felhasználók)
- **Teams** (Csapatok)
- **Tasks** (Feladatok)

#### Users Kollekció>

| Mező neve   | Típus        | Leírás                                      |
|-------------|--------------|---------------------------------------------|
| `id`        | String       | Egyedi azonosító (UUID)                    |
| `username`  | String       | Felhasználónév                              |
| `email`     | String       | Felhasználó email címe                      |
| `password`  | String       | Jelszó (hash-elt formában tárolva)          |
| `created_at`| DateTime     | A felhasználó létrehozásának időpontja      |
| `updated_at`| DateTime     | Az utolsó módosítás időpontja              |
| `team_id`   | [String]       | A csapatok, amelyhez a felhasználó tartozik (ha van ilyen) |

#### Csapatok (Teams) Kollekció

| Mező neve   | Típus        | Leírás                                      |
|-------------|--------------|---------------------------------------------|
| `id`        | String       | Egyedi azonosító (UUID)                    |
| `name`      | String       | A csapat neve                               |
| `created_at`| DateTime     | A csapat létrehozásának időpontja           |
| `updated_at`| DateTime     | Az utolsó módosítás időpontja              |
| `lead_id`   | [String]       | A csapat vezetőinek felhasználói ID-ja (a csapat adminisztrátorai) |
| `members`   | [String]     | A csapat tagjainak felhasználói ID-ja (idővel bővülhet) |

#### Feladatok (Tasks) Kollekció

| Mező neve   | Típus        | Leírás                                      |
|-------------|--------------|---------------------------------------------|
| `id`        | String       | Egyedi azonosító (UUID)                    |
| `title`     | String       | A feladat címe                              |
| `description`| String      | A feladat leírása                           |
| `status`    | String       | A feladat állapota (`pending`, `in_progress`, `completed`) |
| `assigned_to`| [String]      | A feladatot teljesítő felhasználók ID-ja     |
| `created_at`| DateTime     | A feladat létrehozásának időpontja          |
| `updated_at`| DateTime     | Az utolsó módosítás időpontja              |
| `team_id`   | String       | A csapat, amelyhez a feladat tartozik      |
| `creator_id`| String       | A feladatot létrehozó felhasználó ID-ja     |

#### Kapcsolatok:

- Egy **csapat** több **felhasználót** (team member) és egy vagy több **csapat vezetőt** tartalmaz.
- Egy **felhasználó** több csapatban is szerepelhet, és több feladatot is kapott lehet.
- Egy **feladat** egy **csapathoz** tartozik, és egy vagy több adott felhasználónak van hozzárendelve, akiknek el kell végeznie.
- A **csapat vezetője** (team lead) jogosult feladatokat létrehozni, és kiosztani azokat.

---

## 2. Végpontok Tervezése

Az alábbi végpontok biztosítják a felhasználók, csapatok és feladatok kezelését:

### Felhasználók (Users)

- **GET /users**
  - Leírás: Az összes felhasználó listázása.
  - Válasz: Lista a felhasználókról.
  - Jogosultság: Csak admin.

- **GET /users/{id}**
  - Leírás: Egy adott felhasználó részletes információi.
  - Válasz: A felhasználó adatai.
  - Jogosultság: Csak admin, vagy a felhasználó saját magát láthatja.

- **POST /users**
  - Leírás: Új felhasználó regisztrálása.
  - Kérelem: A felhasználó adatai (pl. `username`, `email`, `password`).
  - Válasz: Az új felhasználó adatainak visszaadása.
  - Jogosultság: Nyilvános.

- **PUT /users/{id}**
  - Leírás: Felhasználó adatainak frissítése.
  - Kérelem: A módosítani kívánt adatok.
  - Válasz: A frissített felhasználó adatainak visszaadása.
  - Jogosultság: Csak a felhasználó saját magát módosíthatja, admin jogosultsággal rendelkező felhasználók is módosíthatják mások adatait.

- **DELETE /users/{id}**
  - Leírás: Felhasználó törlése.
  - Válasz: Törölt felhasználó adatai.
  - Jogosultság: Csak a felhasználó saját magát törölheti, admin jogosultsággal rendelkező felhasználók is törölhetik mások adatait.

### Csapatok (Teams)

- **GET /teams?page?name**
  - Leírás: Az összes csapat listázása.
  - Válasz: Lista a csapatokról.
  - Jogosultság: Csak admin.

- **GET /teams/{id}**
  - Leírás: Egy adott csapat részletes információi.
  - Válasz: A csapat adatai, tagok listája.
  - Jogosultság: A csapat vezetője és a csapattagok férhetnek hozzá.

- **POST /teams**
  - Leírás: Új csapat létrehozása.
  - Kérelem: A csapat neve, és a vezető felhasználó ID-ja.
  - Válasz: Az új csapat adatainak visszaadása.
  - Jogosultság: Akármilyen felhasználó.

- **PUT /teams/{id}**
  - Leírás: Csapat adatainak frissítése.
  - Kérelem: A módosítani kívánt csapat adatai.
  - Válasz: A frissített csapat adatainak visszaadása.
  - Jogosultság: Csak a csapat vezetője módosíthatja a csapat adatait.

- **DELETE /teams/{id}**
  - Leírás: Csapat törlése.
  - Válasz: Törölt csapat adatainak visszaadása.
  - Jogosultság: Csak a csapat vezetője törölheti a csapat adatait.

### Feladatok (Tasks)

- **GET /tasks?title?status?teamId**
  - Leírás: Az összes feladat listázása.
  - Válasz: Lista a feladatok állapotáról, kiadott felhasználók szerint.
  - Jogosultság: Csak a csapat tagjai láthatják a saját feladataikat.

- **GET /tasks/{id}**
  - Leírás: Egy adott feladat részletes információi.
  - Válasz: A feladat adatai.
  - Jogosultság: A feladatot kapó felhasználó és a csapat vezetője férhet hozzá.

- **POST /tasks**
  - Leírás: Új feladat létrehozása (csak csapatvezetők számára).
  - Kérelem: A feladat adatai (pl. `title`, `description`, `assigned_to`).
  - Válasz: Az új feladat adatainak visszaadása.
  - Jogosultság: Csak a csapat vezetője hozhat létre feladatokat.

- **PUT /tasks/{id}**
  - Leírás: Feladat adatainak frissítése.
  - Kérelem: A módosítani kívánt feladat adatai.
  - Válasz: A frissített feladat adatainak visszaadása.
  - Jogosultság: Csak a feladatot kiadó személy (csapat vezetője) módosíthatja a feladatot.

- **DELETE /tasks/{id}**
  - Leírás: Feladat törlése.
  - Válasz: Törölt feladat adatainak visszaadása.
  - Jogosultság: Csak a csapat vezetője törölheti a feladatot.

---

## 3. Felhasználói Szerepek

A felhasználói szerepek különböző jogosultságokat adnak hozzá az API végpontokhoz. Az alábbi szerepeket fogjuk támogatni:

### Szerepek:

- **Admin**: Teljes hozzáférés az összes végponthoz, felhasználók, csapatok és feladatok kezelése.
- **Team Lead** (Csapat vezető): Feladatokat hozhat létre és kioszthat a csapatának, módosíthatja a csapata adatait.
- **User**: Feladatokat vehet át a csapata vezetőjétől, nem módosíthatja mások feladatait vagy csapatát.
