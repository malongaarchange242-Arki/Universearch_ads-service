-- Ads Campaigns Table
CREATE TABLE ads_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  destination text CHECK (destination IN ('carousel', 'shorts')),
  target_gender text,
  target_user_type text,
  target_users text[],
  min_age int,
  location text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp DEFAULT now()
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

-- Indexes for performance
CREATE INDEX idx_ads_campaigns_status ON ads_campaigns(status);
CREATE INDEX idx_ads_campaigns_destination ON ads_campaigns(destination);
CREATE INDEX idx_ads_stats_ad_id ON ads_stats(ad_id);