# abcToyz - Premium Ride-on Toys

**abcToyz** is a modern, mobile-first e-commerce application designed for selling premium ride-on toys for kids. Built with the latest web technologies, it offers an app-like experience with persistent state and offline capabilities.

## 🚀 Features

- **Mobile-First Experience**: Optimized for touch interactions with sticky navigation and checkout bars.
- **Progressive Web App (PWA)**: Installable on iOS and Android devices for a native app feel.
- **Persistent Cart**: Shopping cart state is saved automatically to local storage, persisting across sessions.
- **Instant Search**: Real-time product search with debouncing for a smooth user experience.
- **Dynamic Product Pages**: Rich details, image galleries, and ratings for every product.
- **Seamless Checkout**: A smooth flow from "Add to Cart" to "Order Confirmed" with celebration animations.
- **Premium Design**: Glassmorphism effects, smooth transitions, and a vibrant color palette.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with Persist middleware)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: Canvas Confetti, CSS Transitions

## 🏃‍♂️ Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    # Note: Use --webpack flag if you encounter PWA plugin conflicts
    npm run dev -- --webpack
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

3.  **Build for Production**
    ```bash
    npm run build
    ```

## 📱 PWA Instructions

To test the PWA features:
1.  Run the production build (`npm run build` then `npm start`).
2.  Open in Chrome.
3.  Look for the "Install" icon in the address bar.
4.  Navigate offline to verify caching (if configured).

## 📄 License

This project is licensed under the MIT License.
