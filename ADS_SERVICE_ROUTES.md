# Service ADS - Documentation des Routes

## Aperçu
Le service ADS fournit des points d'accès pour gérer les campagnes publicitaires, les uploads de médias, la livraison des annonces et le suivi analytique. Le service est construit avec Fastify et utilise Supabase pour la persistance des données et Redis pour la mise en cache.

**URL de base :** `http://localhost:3005`

---

## Vérification de l'état

### GET /health
Vérifier l'état de santé du service ADS et de ses dépendances.

**Méthode :** GET  
**Endpoint :** `/health`

**Réponse :**
```json
{
  "service": "ads-service",
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "time": "2026-03-20T10:30:00.000Z"
}
```

**Codes de statut :**
- `200` - Service en fonctionnement

---

### POST /health
Même fonctionnalité que GET /health, supporte les requêtes POST.

**Méthode :** POST  
**Endpoint :** `/health`

**Réponse :** Identique à GET /health

**Codes de statut :**
- `200` - Service en fonctionnement

---

## Gestion des Campagnes

Toutes les routes de campagne sont préfixées par `/ads`.

### Créer une Campagne
**Méthode :** POST  
**Endpoint :** `/ads/campaign`  
**Description :** Créer une nouvelle campagne publicitaire.

**Corps de la requête :**
```json
{
  "name": "Campagne d'été",
  "description": "Description de la campagne",
  "startDate": "2026-04-01",
  "endDate": "2026-06-30",
  "budget": 10000,
  "targetAudience": "étudiants"
}
```

**Réponse :**
```json
{
  "id": "uuid",
  "name": "Campagne d'été",
  "createdAt": "2026-03-20T10:30:00.000Z"
}
```

**Codes de statut :**
- `201` - Campagne créée avec succès
- `400` - Corps de requête invalide
- `500` - Erreur serveur

---

### Récupérer Toutes les Campagnes
**Méthode :** GET  
**Endpoint :** `/ads/campaigns`  
**Description :** Récupérer toutes les campagnes publicitaires.

**Paramètres de requête :**
- `limit` (optionnel) : Nombre de campagnes à récupérer (défaut : 10)
- `offset` (optionnel) : Décalage de pagination (défaut : 0)

**Réponse :**
```json
[
  {
    "id": "uuid",
    "name": "Campagne d'été",
    "description": "Description de la campagne",
    "status": "active",
    "createdAt": "2026-03-20T10:30:00.000Z"
  }
]
```

**Codes de statut :**
- `200` - Succès
- `500` - Erreur serveur

---

### Récupérer une Campagne par ID
**Méthode :** GET  
**Endpoint :** `/ads/campaign/:id`  
**Description :** Récupérer une campagne spécifique par son ID.

**Paramètres de chemin :**
- `id` (requis) : ID de la campagne (UUID)

**Réponse :**
```json
{
  "id": "uuid",
  "name": "Campagne d'été",
  "description": "Description de la campagne",
  "startDate": "2026-04-01",
  "endDate": "2026-06-30",
  "budget": 10000,
  "status": "active",
  "createdAt": "2026-03-20T10:30:00.000Z"
}
```

**Codes de statut :**
- `200` - Succès
- `404` - Campagne non trouvée
- `500` - Erreur serveur

---

### Mettre à Jour une Campagne
**Méthode :** PATCH  
**Endpoint :** `/ads/campaign/:id`  
**Description :** Mettre à jour une campagne existante.

**Paramètres de chemin :**
- `id` (requis) : ID de la campagne (UUID)

**Corps de la requête :**
```json
{
  "name": "Nom de campagne mis à jour",
  "status": "paused"
}
```

**Réponse :**
```json
{
  "id": "uuid",
  "name": "Nom de campagne mis à jour",
  "status": "paused",
  "updatedAt": "2026-03-20T10:30:00.000Z"
}
```

**Codes de statut :**
- `200` - Campagne mise à jour avec succès
- `400` - Corps de requête invalide
- `404` - Campagne non trouvée
- `500` - Erreur serveur

---

### Supprimer une Campagne
**Méthode :** DELETE  
**Endpoint :** `/ads/campaign/:id`  
**Description :** Supprimer une campagne.

**Paramètres de chemin :**
- `id` (requis) : ID de la campagne (UUID)

**Réponse :**
```json
{
  "success": true,
  "message": "Campagne supprimée avec succès"
}
```

**Codes de statut :**
- `200` - Campagne supprimée avec succès
- `404` - Campagne non trouvée
- `500` - Erreur serveur

---

## Gestion des Médias

Toutes les routes de médias sont préfixées par `/ads/media`.

### Uploader un Média
**Méthode :** POST  
**Endpoint :** `/ads/media/upload`  
**Description :** Uploader un fichier image ou vidéo à utiliser dans les campagnes.

**Content-Type :** multipart/form-data

**Champs de formulaire :**
- `file` (requis) : Fichier à uploader (max 50 Mo)
- `campaignId` (optionnel) : ID de la campagne associée

**Réponse :**
```json
{
  "id": "uuid",
  "url": "https://storage.example.com/media/uuid",
  "type": "image",
  "size": 1024000,
  "createdAt": "2026-03-20T10:30:00.000Z"
}
```

**Codes de statut :**
- `201` - Média uploadé avec succès
- `400` - Fichier ou requête invalide
- `413` - Fichier trop volumineux (plus de 50 Mo)
- `500` - Erreur serveur

---

### Supprimer un Média
**Méthode :** DELETE  
**Endpoint :** `/ads/media/:id`  
**Description :** Supprimer un fichier média.

**Paramètres de chemin :**
- `id` (requis) : ID du média (UUID)

**Réponse :**
```json
{
  "success": true,
  "message": "Média supprimé avec succès"
}
```

**Codes de statut :**
- `200` - Média supprimé avec succès
- `404` - Média non trouvé
- `500` - Erreur serveur

---

## Livraison des Annonces

Toutes les routes de livraison sont préfixées par `/ads`.

### Récupérer les Annonces Carousel
**Méthode :** GET  
**Endpoint :** `/ads/carousel`  
**Description :** Récupérer les annonces formatées pour l'affichage en carousel.

**Paramètres de requête :**
- `limit` (optionnel) : Nombre d'annonces à récupérer (défaut : 10)
- `userId` (optionnel) : ID utilisateur pour les annonces personnalisées
- `interests` (optionnel) : Intérêts séparés par des virgules pour le ciblage

**Réponse :**
```json
{
  "ads": [
    {
      "id": "uuid",
      "campaignId": "uuid",
      "title": "Titre de l'annonce",
      "mediaUrl": "https://storage.example.com/media/uuid",
      "clickUrl": "https://example.com",
      "position": 0
    }
  ],
  "total": 1
}
```

**Codes de statut :**
- `200` - Succès
- `400` - Paramètres invalides
- `500` - Erreur serveur

---

### Récupérer les Annonces Shorts
**Méthode :** GET  
**Endpoint :** `/ads/shorts`  
**Description :** Récupérer les annonces formatées pour l'affichage de vidéos courtes (format vertical).

**Paramètres de requête :**
- `limit` (optionnel) : Nombre d'annonces à récupérer (défaut : 10)
- `userId` (optionnel) : ID utilisateur pour les annonces personnalisées
- `category` (optionnel) : Filtre de catégorie pour les annonces

**Réponse :**
```json
{
  "ads": [
    {
      "id": "uuid",
      "campaignId": "uuid",
      "title": "Annonce courte",
      "videoUrl": "https://storage.example.com/media/uuid.mp4",
      "duration": 15,
      "clickUrl": "https://example.com"
    }
  ],
  "total": 1
}
```

**Codes de statut :**
- `200` - Succès
- `400` - Paramètres invalides
- `500` - Erreur serveur

---

## Analytique et Suivi

Toutes les routes analytiques sont préfixées par `/ads`.

### Enregistrer une Impression
**Méthode :** POST  
**Endpoint :** `/ads/impression`  
**Description :** Suivre quand une annonce est affichée à un utilisateur.

**Corps de la requête :**
```json
{
  "adId": "uuid",
  "campaignId": "uuid",
  "userId": "user-id",
  "timestamp": "2026-03-20T10:30:00.000Z"
}
```

**Réponse :**
```json
{
  "success": true,
  "impressionId": "uuid"
}
```

**Codes de statut :**
- `201` - Impression enregistrée
- `400` - Corps de requête invalide
- `500` - Erreur serveur

---

### Enregistrer un Clic
**Méthode :** POST  
**Endpoint :** `/ads/click`  
**Description :** Suivre quand un utilisateur clique sur une annonce.

**Corps de la requête :**
```json
{
  "adId": "uuid",
  "campaignId": "uuid",
  "userId": "user-id",
  "timestamp": "2026-03-20T10:30:00.000Z"
}
```

**Réponse :**
```json
{
  "success": true,
  "clickId": "uuid"
}
```

**Codes de statut :**
- `201` - Clic enregistré
- `400` - Corps de requête invalide
- `500` - Erreur serveur

---

### Enregistrer une Vue
**Méthode :** POST  
**Endpoint :** `/ads/view`  
**Description :** Suivre quand un utilisateur termine de visualiser une annonce.

**Corps de la requête :**
```json
{
  "adId": "uuid",
  "campaignId": "uuid",
  "userId": "user-id",
  "viewDuration": 5000,
  "timestamp": "2026-03-20T10:30:00.000Z"
}
```

**Réponse :**
```json
{
  "success": true,
  "viewId": "uuid"
}
```

**Codes de statut :**
- `201` - Vue enregistrée
- `400` - Corps de requête invalide
- `500` - Erreur serveur

---

### Récupérer les Statistiques de Campagne
**Méthode :** GET  
**Endpoint :** `/ads/stats/:campaignId`  
**Description :** Récupérer l'analytique et les métriques de performance d'une campagne spécifique.

**Paramètres de chemin :**
- `campaignId` (requis) : ID de la campagne (UUID)

**Paramètres de requête :**
- `startDate` (optionnel) : Format de date ISO8601
- `endDate` (optionnel) : Format de date ISO8601

**Réponse :**
```json
{
  "campaignId": "uuid",
  "impressions": 5000,
  "clicks": 250,
  "views": 1200,
  "ctr": 0.05,
  "conversionRate": 0.10,
  "revenue": 2500,
  "period": {
    "startDate": "2026-03-01",
    "endDate": "2026-03-20"
  }
}
```

**Codes de statut :**
- `200` - Succès
- `404` - Campagne non trouvée
- `400` - Paramètres invalides
- `500` - Erreur serveur

---

## Gestion des Erreurs

Tous les endpoints suivent un format de réponse d'erreur cohérent :

```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

**Codes de statut HTTP courants :**
- `200` - OK
- `201` - Créé
- `400` - Mauvaise requête
- `404` - Non trouvé
- `429` - Trop de requêtes (limité en débit)
- `500` - Erreur serveur interne

---

## Limitation de Débit

Le service implémente une limitation de débit pour se protéger contre les abus :
- **Limite par défaut :** 100 requêtes par minute par adresse IP
- **Réponse d'erreur :** HTTP 429 Trop de requêtes

---

## Authentification

Actuellement, le service ADS ne nécessite pas d'authentification pour les vérifications de santé. D'autres endpoints peuvent nécessiter des en-têtes d'authentification en fonction de votre implémentation. Consultez votre passerelle API ou service d'authentification pour les exigences spécifiques.

---

## Mise en Cache

Redis est utilisé pour mettre en cache les données de campagne et d'analytique. Si Redis n'est pas disponible, le service continuera à fonctionner avec des requêtes de base de données mais sans les avantages de la mise en cache.

---

## Limites d'Upload de Fichier

- **Taille maximale du fichier :** 50 Mo
- **Formats supportés :** Images (JPG, PNG, GIF), Vidéos (MP4, WebM)

---

## Notes

- Tous les horodatages sont au format ISO8601 (UTC)
- Tous les IDs sont des UUIDs
- Le service enregistre toutes les requêtes avec leur méthode, URL, code de statut, durée et adresse IP
- Les temps de réponse sont inclus dans les journaux du serveur pour la surveillance des performances
