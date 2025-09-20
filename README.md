# Linkyard

**An infinite whiteboard for your links**

Linkyard transforms how you organize and interact with web content by providing a spatial, visual approach to bookmark management. Simply paste any URL and watch it become a draggable, zoomable card with live previews on your personal infinite canvas.


## ✨ Features

### 🎯 Core Functionality

- **Paste to Add**: Hit `⌘/Ctrl + V` to instantly drop a bookmark card anywhere on your board
- **Live Previews**: Automatic screenshot generation and metadata extraction for every link
- **Spatial Organization**: Drag, zoom, and pan across an infinite 2D canvas
- **Real-time Updates**: Position changes and metadata enrichment happen instantly
- **Smart Scraping**: Intelligent extraction of titles, descriptions, and images from web pages

### 🔐 User Experience

- **Authentication**: Secure sign-in/sign-up powered by Clerk
- **Private by Default**: Your boards are personal unless explicitly shared
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Intuitive Controls**: Mouse wheel to zoom, drag to pan, intuitive card interactions

### 🛠️ Advanced Features

- **Share Boards**: Generate secure share tokens for collaborative viewing
- **Bulk Operations**: Clear all bookmarks with confirmation dialogs
- **Error Handling**: Graceful fallbacks for failed previews and broken links
- **Performance Optimized**: Efficient rendering with React 19 and Next.js 15

## 🚀 Tech Stack

### Frontend

- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications
- **Radix UI** - Accessible component primitives

### Backend & Database

- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM 0.44.5** - Type-safe database operations
- **PostgreSQL** - Robust relational database (via Neon)
- **Neon Database** - Serverless PostgreSQL hosting
- **JSDOM** - Server-side HTML parsing for metadata extraction

### Authentication & Security

- **Clerk** - Complete authentication solution
- **Middleware Protection** - Route-level security
- **Environment Variables** - Secure configuration management

### Development Tools

- **ESLint 9** - Code linting and formatting
- **Drizzle Kit** - Database migrations and introspection
- **Turbopack** - Fast development builds
- **PostCSS** - CSS processing

## 📁 Project Structure

```
linkyard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/             # Sign-in page
│   │   └── sign-up/             # Sign-up page
│   ├── api/                      # API routes
│   │   ├── bookmarks/           # Bookmark CRUD operations
│   │   ├── board/               # Board sharing functionality
│   │   └── scrape/              # Web scraping for metadata
│   ├── board/                    # Board pages
│   │   ├── [shareToken]/        # Public board sharing
│   │   └── page.tsx             # Main board interface
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with Clerk provider
│   └── page.tsx                 # Landing page
├── components/                   # Reusable UI components
│   ├── board/                   # Board-specific components
│   │   ├── board2d.tsx         # Main 2D board implementation
│   │   ├── public-board2d.tsx  # Public board view
│   │   └── public-board2d-client.tsx
│   ├── ui/                     # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── confirmation-dialog.tsx
│   │   ├── loading-spinner.tsx
│   │   └── share-button.tsx
│   └── header.tsx              # Navigation header
├── db/                         # Database configuration
│   ├── client.ts              # Drizzle database client
│   └── schema.ts              # Database schema definitions
├── lib/                        # Utility libraries
│   ├── bookmarks.ts           # Bookmark business logic
│   ├── checkuser.ts           # User validation utilities
│   ├── share.ts               # Sharing functionality
│   ├── toast.ts               # Toast notification helpers
│   └── utils.ts               # General utilities
├── drizzle/                   # Database migrations
├── public/                    # Static assets
└── middleware.ts              # Clerk authentication middleware
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Clerk account for authentication

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/linkyard.git
cd linkyard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/linkyard"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Optional: Custom domain for Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/board"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/board"
```

### 4. Database Setup

```bash
# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 5. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```
## 🔧 API Endpoints

### Bookmarks

- `GET /api/bookmarks` - Fetch user's bookmarks
- `POST /api/bookmarks` - Create new bookmark
- `PATCH /api/bookmarks/[id]` - Update bookmark position/metadata
- `DELETE /api/bookmarks/[id]` - Delete specific bookmark
- `DELETE /api/bookmarks/clear` - Clear all user bookmarks

### Board Sharing

- `POST /api/board/share` - Generate share token
- `GET /api/board/[shareToken]` - Access shared board

### Web Scraping

- `GET /api/scrape?url=<encoded_url>` - Extract metadata from URL

## 🎨 Customization

### Styling

The application uses Tailwind CSS for styling. Key design tokens:

- Primary color: Indigo (`#6366f1`)
- Background: White with subtle gradients
- Cards: Rounded corners with subtle shadows
- Typography: Geist font family

### Components

All UI components are built with Radix UI primitives and can be customized in the `components/ui/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Clerk](https://clerk.com/) for seamless authentication
- [Drizzle](https://orm.drizzle.team/) for type-safe database operations
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ using Next.js, Clerk, Drizzle & Neon**
