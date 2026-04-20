-- ========================================================================
-- ADS-SERVICE: AJOUTER LE CIBLAGE D'AGE AVANCE
-- ========================================================================

ALTER TABLE ads_campaigns
ADD COLUMN IF NOT EXISTS max_age integer;

ALTER TABLE ads_campaigns
ADD COLUMN IF NOT EXISTS target_age integer;

ALTER TABLE ads_campaigns
ADD COLUMN IF NOT EXISTS age_tolerance integer;

SELECT column_name
FROM information_schema.columns
WHERE table_name = 'ads_campaigns'
  AND column_name IN ('min_age', 'max_age', 'target_age', 'age_tolerance')
ORDER BY column_name;
