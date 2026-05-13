-- Migration pour ajouter les tables ads_likes et ads_comments
-- À exécuter dans Supabase SQL Editor

-- Table pour les likes des annonces
CREATE TABLE IF NOT EXISTS ads_likes (
  id UUID PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES ads_campaigns(id) ON DELETE CASCADE,
  user_id UUID NULL,
  date_liked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_ads_likes_ad_id ON ads_likes(ad_id);
CREATE INDEX IF NOT EXISTS idx_ads_likes_user_id ON ads_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_likes_ad_user ON ads_likes(ad_id, user_id);

-- Table pour les commentaires des annonces
CREATE TABLE IF NOT EXISTS ads_comments (
  id UUID PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES ads_campaigns(id) ON DELETE CASCADE,
  user_id UUID NULL,
  content TEXT NOT NULL,
  date_comment TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_ads_comments_ad_id ON ads_comments(ad_id);
CREATE INDEX IF NOT EXISTS idx_ads_comments_user_id ON ads_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_comments_date ON ads_comments(date_comment DESC);

-- Politiques RLS (Row Level Security)
ALTER TABLE ads_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_comments ENABLE ROW LEVEL SECURITY;

-- Politique pour ads_likes : tout le monde peut lire, seuls les utilisateurs authentifiés peuvent créer/supprimer
CREATE POLICY "Ads likes are viewable by everyone" ON ads_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON ads_likes FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own likes" ON ads_likes FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Politique pour ads_comments : tout le monde peut lire, seuls les utilisateurs authentifiés peuvent créer
CREATE POLICY "Ads comments are viewable by everyone" ON ads_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON ads_comments FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);