# Service ADS - Endpoints pour l'Interface Utilisateur

## Aperçu
Ces endpoints permettent d'afficher les annonces publicitaires ciblées sur les pages d'accueil et de contenu court de Universearch.

**URL de base :** `http://localhost:3005`

---

## Affichage des Annonces

### GET /ads/carousel
Récupérer les annonces formatées pour l'affichage en carousel (page d'accueil).

**Méthode :** GET  
**Endpoint :** `/ads/carousel`

**Paramètres de requête :**
```
GET /ads/carousel?limit=10&userId=user123&interests=informatique,ingenierie
```

| Paramètre | Type | Optionnel | Description |
|-----------|------|-----------|-------------|
| `limit` | number | ✓ | Nombre d'annonces à récupérer (défaut : 10) |
| `userId` | string | ✓ | ID utilisateur pour les annonces personnalisées |
| `interests` | string | ✓ | Intérêts séparés par des virgules pour le ciblage (ex: `informatique,ingenierie,economie`) |

**Réponse (200 OK):**
```json
{
  "ads": [
    {
      "id": "uuid-1",
      "campaignId": "camp-uuid-1",
      "title": "Rejoignez notre école d'ingénierie",
      "description": "Formation de qualité avec certification internationale",
      "mediaUrl": "https://storage.example.com/media/ad-1.jpg",
      "clickUrl": "https://universearch.com/schools/engineering",
      "position": 0
    },
    {
      "id": "uuid-2",
      "campaignId": "camp-uuid-2",
      "title": "Master en Informatique",
      "description": "Spécializez-vous en développement web et IA",
      "mediaUrl": "https://storage.example.com/media/ad-2.jpg",
      "clickUrl": "https://universearch.com/schools/it",
      "position": 1
    }
  ],
  "total": 2
}
```

**Codes de statut :**
- `200` - Succès
- `400` - Paramètres invalides
- `500` - Erreur serveur

**Exemple d'utilisation (JavaScript):**
```javascript
// Sans ciblage
const response = await fetch('http://localhost:3005/ads/carousel?limit=5');
const data = await response.json();

// Avec ciblage utilisateur
const userId = 'user-12345';
const interests = 'informatique,ingenierie';
const response = await fetch(
  `http://localhost:3005/ads/carousel?limit=5&userId=${userId}&interests=${interests}`
);
const data = await response.json();
```

---

### GET /ads/shorts
Récupérer les annonces formatées pour l'affichage de vidéos courtes (format vertical).

**Méthode :** GET  
**Endpoint :** `/ads/shorts`

**Paramètres de requête :**
```
GET /ads/shorts?limit=10&userId=user123&category=formations
```

| Paramètre | Type | Optionnel | Description |
|-----------|------|-----------|-------------|
| `limit` | number | ✓ | Nombre d'annonces à récupérer (défaut : 10) |
| `userId` | string | ✓ | ID utilisateur pour les annonces personnalisées |
| `category` | string | ✓ | Filtre de catégorie pour les annonces (ex: `formations`, `bourses`, `stages`) |

**Réponse (200 OK):**
```json
{
  "ads": [
    {
      "id": "short-uuid-1",
      "campaignId": "camp-uuid-3",
      "title": "Découvrez nos programmes",
      "description": "Vidéo courte présentant nos formations",
      "videoUrl": "https://storage.example.com/media/ad-short-1.mp4",
      "duration": 15,
      "clickUrl": "https://universearch.com/programs",
      "thumbnail": "https://storage.example.com/media/ad-short-1-thumb.jpg"
    },
    {
      "id": "short-uuid-2",
      "campaignId": "camp-uuid-4",
      "title": "Suite de notre présentation",
      "description": "Continuez la visite virtuelle",
      "videoUrl": "https://storage.example.com/media/ad-short-2.mp4",
      "duration": 20,
      "clickUrl": "https://universearch.com/programs",
      "thumbnail": "https://storage.example.com/media/ad-short-2-thumb.jpg"
    }
  ],
  "total": 2
}
```

**Codes de statut :**
- `200` - Succès
- `400` - Paramètres invalides
- `500` - Erreur serveur

**Exemple d'utilisation (JavaScript):**
```javascript
// Avec ciblage par catégorie
const userId = 'user-12345';
const category = 'formations';
const response = await fetch(
  `http://localhost:3005/ads/shorts?limit=5&userId=${userId}&category=${category}`
);
const data = await response.json();

// Affichage dans une galerie
data.ads.forEach(ad => {
  console.log(`${ad.title} - Durée: ${ad.duration}s`);
});
```

---

## Suivi et Analytics

### POST /ads/impression
Enregistrer une impression quand une annonce est affichée à un utilisateur.

**Méthode :** POST  
**Endpoint :** `/ads/impression`

**Corps de la requête :**
```json
{
  "adId": "uuid-1",
  "campaignId": "camp-uuid-1",
  "userId": "user-12345",
  "timestamp": "2026-03-20T10:30:00.000Z"
}
```

**Réponse (201 Created):**
```json
{
  "success": true,
  "impressionId": "imp-uuid-1"
}
```

**Codes de statut :**
- `201` - Impression enregistrée
- `400` - Corps de requête invalide
- `500` - Erreur serveur

**Exemple d'utilisation (JavaScript):**
```javascript
async function trackImpression(adId, campaignId, userId) {
  const response = await fetch('http://localhost:3005/ads/impression', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adId,
      campaignId,
      userId,
      timestamp: new Date().toISOString()
    })
  });
  return await response.json();
}
```

---

### POST /ads/click
Enregistrer un clic quand un utilisateur clique sur une annonce.

**Méthode :** POST  
**Endpoint :** `/ads/click`

**Corps de la requête :**
```json
{
  "adId": "uuid-1",
  "campaignId": "camp-uuid-1",
  "userId": "user-12345",
  "timestamp": "2026-03-20T10:30:00.000Z"
}
```

**Réponse (201 Created):**
```json
{
  "success": true,
  "clickId": "click-uuid-1"
}
```

**Codes de statut :**
- `201` - Clic enregistré
- `400` - Corps de requête invalide
- `500` - Erreur serveur

**Exemple d'utilisation (JavaScript):**
```javascript
// Appeler avant de rediriger vers la cible du lien
async function trackClick(adId, campaignId, userId, redirectUrl) {
  await fetch('http://localhost:3005/ads/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adId,
      campaignId,
      userId,
      timestamp: new Date().toISOString()
    })
  });
  
  // Redirection après enregistrement
  window.location.href = redirectUrl;
}
```

---

### POST /ads/view
Enregistrer une vue complète quand un utilisateur termine de visualiser une annonce.

**Méthode :** POST  
**Endpoint :** `/ads/view`

**Corps de la requête :**
```json
{
  "adId": "short-uuid-1",
  "campaignId": "camp-uuid-3",
  "userId": "user-12345",
  "viewDuration": 15000,
  "timestamp": "2026-03-20T10:30:00.000Z"
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `adId` | string | ID de l'annonce |
| `campaignId` | string | ID de la campagne |
| `userId` | string | ID de l'utilisateur |
| `viewDuration` | number | Durée de visualisation en millisecondes |
| `timestamp` | string | ISO8601 timestamp |

**Réponse (201 Created):**
```json
{
  "success": true,
  "viewId": "view-uuid-1"
}
```

**Codes de statut :**
- `201` - Vue enregistrée
- `400` - Corps de requête invalide
- `500` - Erreur serveur

**Exemple d'utilisation (JavaScript):**
```javascript
let viewStartTime;

function onVideoStart() {
  viewStartTime = Date.now();
}

async function onVideoEnd(adId, campaignId, userId) {
  const viewDuration = Date.now() - viewStartTime;
  
  const response = await fetch('http://localhost:3005/ads/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adId,
      campaignId,
      userId,
      viewDuration,
      timestamp: new Date().toISOString()
    })
  });
  
  return await response.json();
}
```

---

## Intégration Complète - Exemple

Voici comment intégrer ces endpoints dans une page Universearch :

```javascript
class AdManager {
  constructor(userId) {
    this.userId = userId;
    this.apiBase = 'http://localhost:3005';
  }

  // Charger les annonces carousel
  async loadCarouselAds(interests, limit = 5) {
    const params = new URLSearchParams({
      limit,
      userId: this.userId,
      interests: interests.join(',')
    });
    
    const response = await fetch(`${this.apiBase}/ads/carousel?${params}`);
    return await response.json();
  }

  // Charger les annonces shorts
  async loadShortsAds(category, limit = 10) {
    const params = new URLSearchParams({
      limit,
      userId: this.userId,
      category
    });
    
    const response = await fetch(`${this.apiBase}/ads/shorts?${params}`);
    return await response.json();
  }

  // Tracker une impression
  async trackImpression(adId, campaignId) {
    await fetch(`${this.apiBase}/ads/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId,
        campaignId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      })
    });
  }

  // Tracker un clic
  async trackClick(adId, campaignId, redirectUrl) {
    await fetch(`${this.apiBase}/ads/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId,
        campaignId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      })
    });
    
    window.location.href = redirectUrl;
  }

  // Tracker une vue complète
  async trackView(adId, campaignId, durationMs) {
    await fetch(`${this.apiBase}/ads/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId,
        campaignId,
        userId: this.userId,
        viewDuration: durationMs,
        timestamp: new Date().toISOString()
      })
    });
  }
}

// Utilisation
const adManager = new AdManager('user-12345');

// Page d'accueil
adManager.loadCarouselAds(['informatique', 'ingenierie']).then(data => {
  data.ads.forEach(ad => {
    adManager.trackImpression(ad.id, ad.campaignId);
  });
});

// Page de contenu court
adManager.loadShortsAds('formations').then(data => {
  data.ads.forEach(ad => {
    // ... afficher la vidéo ...
  });
});
```

---

## Cas d'Utilisation Typiques

### Page d'Accueil (Carousel)
```javascript
// Récupérer les annonces pertinentes selon les intérêts de l'utilisateur
const ads = await fetch(
  'http://localhost:3005/ads/carousel?limit=3&userId=user-123&interests=bourses,formations'
);
```

### Page de Contenu Court (Shorts)
```javascript
// Récupérer les vidéos courtes par catégorie
const shorts = await fetch(
  'http://localhost:3005/ads/shorts?limit=10&userId=user-123&category=stages'
);
```

### Intégration Événements
```javascript
// Au chargement d'une annonce
-> POST /ads/impression

// Quand l'utilisateur clique
-> POST /ads/click + redirection

// Quand la vidéo est terminée
-> POST /ads/view
```

---

## Notes d'Implémentation

- **Ciblage :** Les paramètres `interests` et `category` permettent un ciblage fin des annonces
- **Personnalisation :** Le paramètre `userId` permet des recommandations personnalisées
- **Analytics :** Enregistrez toujours les impressions, clics et vues pour mesurer la performance
- **Performance :** Utilisez `limit` pour contrôler le nombre d'annonces à charger
- **Timestamps :** Utilisez `ISO8601` format pour les timestamps (`new Date().toISOString()`)

---

## Codes de Statut HTTP

| Code | Signification |
|------|---------------|
| `200` | OK - Requête réussie |
| `201` | Created - Ressource créée |
| `400` | Bad Request - Paramètres invalides |
| `500` | Server Error - Erreur serveur |
