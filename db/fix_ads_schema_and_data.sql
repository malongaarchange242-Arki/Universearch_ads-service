-- ========================================================================
-- FIX POUR ADS-SERVICE: AJOUTER COLONNES MANQUANTES ET DONNÉES TEST
-- ========================================================================

-- ========================================================================
-- STEP 1: AJOUTER LES COLONNES MANQUANTES
-- ========================================================================

-- Ajouter click_url (colonne manquante)
ALTER TABLE ads_campaigns
ADD COLUMN IF NOT EXISTS click_url text;

-- Vérifier que la colonne existe maintenant
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'ads_campaigns' 
ORDER BY column_name;

-- ========================================================================
-- STEP 2: INSÉRER DES DONNÉES DE TEST (CAROUSEL)
-- ========================================================================

-- Exemple 1: Carousel - Orientation Quiz
INSERT INTO ads_campaigns (
  title,
  description,
  media_url,
  click_url,
  media_type,
  destination,
  status
) VALUES (
  'Découvrez votre filière idéale',
  'Utilisez notre quiz d''orientation pour explorer les filieres qui vous conviennent',
  'https://via.placeholder.com/400x220/007AFF/FFFFFF?text=Orientation+Quiz',
  'https://universearch.app/orientation',
  'image',
  'carousel',
  'active'
)
ON CONFLICT DO NOTHING;

-- Exemple 2: Carousel - Universités
INSERT INTO ads_campaigns (
  title,
  description,
  media_url,
  click_url,
  media_type,
  destination,
  status
) VALUES (
  'Explorez les universités',
  'Trouvez les meilleures universités pour votre parcours académique',
  'https://via.placeholder.com/400x220/34C759/FFFFFF?text=Universites',
  'https://universearch.app/universites',
  'image',
  'carousel',
  'active'
)
ON CONFLICT DO NOTHING;

-- Exemple 3: Carousel - Centres de formation
INSERT INTO ads_campaigns (
  title,
  description,
  media_url,
  click_url,
  media_type,
  destination,
  status
) VALUES (
  'Formations professionnelles',
  'Accédez à des formations reconnues par l''industrie',
  'https://via.placeholder.com/400x220/FF9500/FFFFFF?text=Centres+Formation',
  'https://universearch.app/centres',
  'image',
  'carousel',
  'active'
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- STEP 3: INSÉRER DES DONNÉES DE TEST (SHORTS)
-- ========================================================================

-- Exemple 1: Shorts - Témoignage étudiant
INSERT INTO ads_campaigns (
  title,
  description,
  media_url,
  click_url,
  media_type,
  destination,
  status
) VALUES (
  'Témoignage: Ma histoire d''orientation',
  'Regardez comment Universearch a aidé Sarah à trouver sa filière',
  'https://via.placeholder.com/300x500/FF3B30/FFFFFF?text=Shorts+1',
  'https://universearch.app/temoignages',
  'video',
  'shorts',
  'active'
)
ON CONFLICT DO NOTHING;

-- Exemple 2: Shorts - Conseils
INSERT INTO ads_campaigns (
  title,
  description,
  media_url,
  click_url,
  media_type,
  destination,
  status
) VALUES (
  'Conseil: Choisir la bonne filière',
  '5 conseils essentiels pour choisir ta filière avec confiance',
  'https://via.placeholder.com/300x500/5AC8FA/FFFFFF?text=Shorts+2',
  'https://universearch.app/conseils',
  'video',
  'shorts',
  'active'
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- STEP 4: VÉRIFIER LES RÉSULTATS
-- ========================================================================

-- Vérifier les annonces créées
SELECT 
  id,
  title,
  destination,
  status,
  click_url
FROM ads_campaigns
ORDER BY created_at DESC;

-- Vérifier le count par destination
SELECT 
  destination,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM ads_campaigns
GROUP BY destination;

-- ========================================================================
-- NOTES IMPORTANTES
-- ========================================================================
-- 
-- 1) Une fois ces changements faits, le endpoint GET /ads/carousel 
--    doit retourner les 3 annonces avec destination='carousel'
--
-- 2) Le Flutter app reçoit:
--    {
--      "ads": [
--        {
--          "id": "uuid",
--          "campaignId": "uuid",
--          "title": "...",
--          "description": "...",
--          "mediaUrl": "...",
--          "clickUrl": "...",
--          "position": 0
--        }
--      ],
--      "targetingFiltered": false
--    }
--
-- 3) Le carousel devrait maintenant afficher ces 3 annonces!
--
