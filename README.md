# Ads Service

Microservice for managing advertisements in UniverSearch app. Handles carousel images and short videos with analytics and caching.

## Features

- **Campaign Management**: Create, update, delete ad campaigns
- **Media Upload**: Upload images and videos to Supabase storage
- **Ad Delivery**: Serve ads to mobile/web app with Redis caching
- **Analytics**: Track impressions, clicks, and video views

## API Endpoints

### Campaign
- `POST /ads/campaign` - Create campaign
- `GET /ads/campaigns` - List campaigns
- `PATCH /ads/campaign/:id` - Update campaign
- `DELETE /ads/campaign/:id` - Delete campaign

### Media
- `POST /ads/media/upload` - Upload media file
- `DELETE /ads/media/:id` - Delete media

### Delivery
- `GET /ads/carousel` - Get carousel ads
- `GET /ads/shorts` - Get short video ads

### Analytics
- `POST /ads/impression` - Record impression
- `POST /ads/click` - Record click
- `POST /ads/view` - Record video view
- `GET /ads/stats/:campaignId` - Get campaign stats

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase and Redis credentials
```

3. Run database migrations:
```bash
# Run the SQL in db/schema.sql in your Supabase dashboard
```

4. Start the service:
```bash
npm run dev
```

## Docker

```bash
docker-compose up --build
```

## Architecture

- **Framework**: Fastify + TypeScript
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (ads-media bucket)
- **Cache**: Redis
- **Modules**: Campaign, Media, Delivery, Analytics