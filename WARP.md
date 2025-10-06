# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- **Start dev server**: `npm run dev` (starts Vite dev server with hot reload)
- **Build for production**: `npm run build` (TypeScript compilation + Vite build)
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`

### Asset Management
- **Upload assets to Cloudinary**: `npm run upload:cloudinary` (uploads all images from src/assets to Cloudinary and generates mapping file)

### Testing Individual Components
- **Test specific page**: Navigate to `http://localhost:5173/page-name` after running dev server
- **Test Firebase integration**: Visit `/firebase-test` route
- **Test admin features**: Visit `/admin/content-sync` route

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom brand colors
- **Routing**: React Router DOM v7
- **Content Management**: Firebase Firestore with local fallback
- **Asset Management**: Cloudinary integration
- **State Management**: React Context API

### Content Management System

This application implements a **hybrid content architecture**:

1. **Local Content** (`src/data/siteContent.ts` + `src/data/pageCopy.ts`): Static fallback content
2. **Firebase Content** (`content/site` document): Dynamic CMS content that overrides local content
3. **Cloudinary Assets**: Image URLs mapped from local assets to CDN URLs

The `ContentProvider` context manages this hierarchy:
- **Development**: Uses local content by default  
- **Production**: Attempts Firebase connection, falls back to local content if unavailable
- **Auto-seeding**: If `VITE_AUTO_SEED=true`, uploads local content to Firebase on first load

### Key Architectural Patterns

#### Content Hydration Flow
```
Local Content → Cloudinary URL Mapping → Firebase Sync → Context Provider → Components
```

#### Route Structure
- **Nested routing**: All pages wrapped in `Layout` component
- **Dynamic routes**: Products (`/products/:categorySlug/:productSlug`), Industries (`/industries/:slug`), etc.
- **Admin routes**: `/admin/content-sync` for content management

#### Data Flow
1. `ContentProvider` loads content hierarchy
2. Components consume via `useContent()` hook
3. Content structure defined in `src/lib/contentTypes.ts`
4. Page-specific copy managed in `src/data/pageCopy.ts`

### Component Architecture

#### Layout System
- **Layout.tsx**: Main wrapper with Navbar, HeaderTopBar, and Footer
- **Navbar.tsx**: Main navigation with mega menus
- **HeaderTopBar.tsx**: Contact info banner

#### Page Structure
- **Pages**: Route components in `src/pages/`
- **Components**: Reusable UI components in `src/components/`
- **Types**: TypeScript definitions in `src/types/`

#### Firebase Integration
- **Configuration**: `src/lib/firebase.ts` with fallback config
- **Content Management**: Real-time sync via Firestore `onSnapshot`
- **Error Handling**: Graceful fallback to local content on Firebase failures

### Asset Pipeline

#### Local Development
- Assets stored in `src/assets/`
- Direct imports for local development
- Fallback images when Cloudinary unavailable

#### Production Assets
- **Upload script**: `scripts/upload-cloudinary.mjs`
- **Mapping generation**: Creates `src/data/cloudinaryMap.json`
- **URL transformation**: `buildContentPayload.ts` maps local paths to CDN URLs

### Styling System

#### Tailwind Configuration
- **Brand colors**: Custom palette (`brand.lime`, `brand.primary`, etc.)
- **Typography**: Poppins/Inter font stack
- **Effects**: Custom shadows (`glow`) and background patterns (`noise-light`)

#### Component Styling
- **Utility-first**: Tailwind classes throughout components
- **Responsive**: Mobile-first responsive design
- **Animations**: CSS-based animations and transitions

## Development Workflow

### Content Updates
1. **Local changes**: Edit `src/data/siteContent.ts` or `src/data/pageCopy.ts`
2. **Asset updates**: Add images to `src/assets/`, run `npm run upload:cloudinary`
3. **Firebase sync**: Visit `/admin/content-sync` to push local changes to Firestore

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in local content data
4. Add page-specific copy to `pageCopy.ts`

### Environment Configuration
- **Firebase**: Set `VITE_FIREBASE_*` environment variables
- **Cloudinary**: Set `CLOUDINARY_*` environment variables for asset uploads
- **Auto-seeding**: Set `VITE_AUTO_SEED=true` for automatic Firebase content initialization

### TypeScript Patterns
- **Strict typing**: All content structures defined in `src/lib/contentTypes.ts`
- **Type safety**: Full TypeScript coverage with strict configuration
- **Module augmentation**: Custom type definitions in `src/types/`

## Firebase Configuration

### Required Environment Variables
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN  
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Firestore Structure
- **Document**: `content/site`
- **Schema**: Matches `SiteContent` interface
- **Real-time**: Uses `onSnapshot` for live updates

### Content Sync Process
1. Local content serves as source of truth
2. Cloudinary mapping transforms asset URLs
3. `buildContentPayload()` creates Firebase-ready structure
4. Admin interface pushes updates to Firestore

## Brand Guidelines

### Color Palette
- **Primary**: `#1D741B` (brand.primary)
- **Accent**: `#8FA01F` (brand.lime) 
- **Highlight**: `#8BCD50` (brand.chartreuse)
- **Warning**: `#DED93E` (brand.yellow)
- **Deep**: `#0E3110` (brand.deep)

### Typography
- **Primary**: Poppins
- **Fallback**: Inter, system fonts

This architecture enables scalable content management while maintaining developer productivity and deployment flexibility.