-- ========================================================================
-- ADS-SERVICE: AJOUTER LES CHAMPS contacts ET lien À ads_campaigns
-- ========================================================================

ALTER TABLE ads_campaigns
ADD COLUMN IF NOT EXISTS contacts text;

ALTER TABLE ads_campaigns
ADD COLUMN IF NOT EXISTS lien text;

SELECT column_name
FROM information_schema.columns
WHERE table_name = 'ads_campaigns'
  AND column_name IN ('contacts', 'lien')
ORDER BY column_name;
