-- Ads Campaigns Table
CREATE TABLE ads_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  destination text CHECK (destination IN ('carousel', 'shorts')),
  carousel_slot int,
  target_gender text,
  target_user_type text,
  target_users text[],
  min_age int,
  max_age int,
  target_age int,
  age_tolerance int,
  location text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp DEFAULT now(),
  CONSTRAINT ads_carousel_slot_unique UNIQUE (carousel_slot),
  CONSTRAINT ads_carousel_slot_valid CHECK ((destination <> 'carousel' AND carousel_slot IS NULL) OR (destination = 'carousel' AND carousel_slot >= 1))
);

-- Ads Statistics Table
CREATE TABLE ads_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads_campaigns(id) ON DELETE CASCADE,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  views integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Detailed ad views table
CREATE TABLE ads_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES ads_campaigns(id) ON DELETE CASCADE,
  user_id uuid,
  view_duration integer,
  date_view timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_ads_campaigns_status ON ads_campaigns(status);
CREATE INDEX idx_ads_campaigns_destination ON ads_campaigns(destination);
CREATE INDEX idx_ads_stats_ad_id ON ads_stats(ad_id);
CREATE INDEX idx_ads_views_ad_id ON ads_views(ad_id);
CREATE INDEX idx_ads_views_user_id ON ads_views(user_id);
CREATE INDEX idx_ads_views_date_view ON ads_views(date_view DESC);
