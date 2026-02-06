-- Social post metrics: time-series per post for TikTok, Instagram, Facebook, YouTube
-- n8n: webhook or file ingest → insert rows; future: API sync workflows read register and push here

CREATE TABLE IF NOT EXISTS public.social_post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL DEFAULT 'slctrips',  -- building/realm (slctrips, rocksalt, etc.)
  platform VARCHAR(20) NOT NULL,                   -- tiktok, instagram, facebook, youtube
  post_url TEXT,
  campaign_id VARCHAR(100),                        -- e.g. slctrips-valentines
  posted_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  views NUMERIC(15, 0) DEFAULT 0,
  likes NUMERIC(15, 0) DEFAULT 0,
  comments NUMERIC(15, 0) DEFAULT 0,
  saves NUMERIC(15, 0),
  shares NUMERIC(15, 0),
  reactions NUMERIC(15, 0),                        -- Facebook reactions
  accounts_reached NUMERIC(15, 0),                 -- IG/FB
  extra JSONB,                                     -- platform-specific (watch_time, demographics, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_post_metrics_source_platform ON public.social_post_metrics(source, platform);
CREATE INDEX IF NOT EXISTS idx_social_post_metrics_campaign ON public.social_post_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_post_metrics_captured ON public.social_post_metrics(captured_at);
CREATE INDEX IF NOT EXISTS idx_social_post_metrics_post_url ON public.social_post_metrics(post_url);

COMMENT ON TABLE public.social_post_metrics IS 'Time-series metrics per social post; filled by n8n webhook (Chrome Extension/SMM) or future API sync';

ALTER TABLE public.social_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access social_post_metrics"
  ON public.social_post_metrics FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated read social_post_metrics"
  ON public.social_post_metrics FOR SELECT
  USING (auth.role() = 'authenticated');
