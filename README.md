# MyApp: Smart Wardrobe Organizer

MyApp is a mobile application built with Expo (React Native) and TypeScript, designed to help users digitally organize their wardrobe, create outfits, and manage their clothing items efficiently.

## Streamline your style with MyApp, the intuitive mobile wardrobe organizer. Easily catalog your clothes, create stunning outfits, and rediscover your personal fashion collection

## Key Features
 
*   **Digital Wardrobe Catalog:**
    *   Add clothing items by pasting images directly into the app.
    *   Categorize items (e.g., tops, bottoms, shoes) and add custom names and subcategories.
    *   View all wardrobe items in an organized list.
*   **Outfit Creation & Management:**
    *   Visually create new outfits by selecting items from the digital wardrobe.
    *   Save created outfits for future reference.
    *   Get outfit suggestions with a "Suggest Random Outfit" feature.
*   **Item Management:**
    *   Edit details (name, subcategory) of existing wardrobe items.
    *   Delete items from the wardrobe.
    *   Global edit mode for efficient management of multiple items.
*   **Intuitive User Interface:**
    *   Tab-based navigation for easy access to Wardrobe, Saved Outfits, Explore, and Calendar sections.
    *   Dedicated "My Archives" screen for primary wardrobe interaction.
    *   Modals for focused tasks like editing item details.
    *   Visual feedback with loading indicators and smooth transitions.
    *   Theming support for light and dark modes.
*   **Image Handling:**
    *   Seamless image pasting from the clipboard.
    *   Image display and potentially manipulation capabilities.

## Tech Stack & Architecture

*   **Framework:** [Expo (React Native)](https://expo.dev/) - For cross-platform mobile app development (iOS & Android).
*   **Language:** [TypeScript](https://www.typescriptlang.org/) - For robust, type-safe JavaScript development.
*   **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) - File-system based routing for intuitive navigation structure.
*   **State Management:**
    *   React Context API (`WardrobeContext`).
    *   Custom hook (`useWardrobeManager`) encapsulating business logic for wardrobe management, promoting separation of concerns.
*   **UI & Styling:**
    *   React Native core components.
    *   Custom, reusable UI components (e.g., `ThemedText`, `ThemedView`, `EditItemModal`, `WardrobeList`).
    *   `@expo/vector-icons` (FontAwesome, FontAwesome5) for iconography.
    *   `react-native-safe-area-context` for proper handling of screen notches and insets.
    *   React Native `StyleSheet` with a dynamic theming system (`useColorScheme`).
*   **Navigation:**
    *   `@react-navigation/native`
    *   `@react-navigation/bottom-tabs`
*   **Async Storage:**
    *   `@react-native-async-storage/async-storage` for local data persistence of wardrobe items and outfits.
*   **Image Processing & Handling:**
    *   `expo-clipboard`: For pasting images.
    *   `expo-image`: For optimized image display.
    *   `expo-image-manipulator`: (Potentially used for resizing/cropping pasted images).
    *   `expo-image-picker`: For selecting images from the device's gallery.
*   **Expo SDK Modules:**
    *   `expo-constants`, `expo-device`, `expo-font`, `expo-haptics`, `expo-linking`, `expo-location`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-system-ui`.
*   **Linting & Code Quality:**
    *   ESLint with `eslint-config-expo`.
*   **Build & Development:**
    *   Expo CLI for development, building, and pre-building.

## Project Structure

The project follows a standard Expo and React Native structure:

*   `app/`: Contains screen components and routing logic managed by `expo-router`.
    *   `_layout.tsx`: Root layout configuration.
    *   `(tabs)/`: Defines the tab-based navigation structure and individual tab screens.
        *   `index.tsx`: Main "Wardrobe" screen ("My Archives").
        *   `saved-outfits.tsx`: Screen for displaying saved outfits.
        *   `explore.tsx`: (Likely for future features like discovering new styles or items).
        *   `calendar.tsx`: (Potentially for planning outfits on a calendar).
*   `src/`: Houses core application logic, including:
    *   `components/`: Reusable UI components shared across the app.
    *   `context/`: React Context for global state management (e.g., `WardrobeContext.tsx`).
    *   `hooks/`: Custom React hooks (e.g., `useWardrobeManager.tsx`, `useColorScheme.tsx`).
    *   `constants/`: Application-wide constants (e.g., theme colors, wardrobe categories).
    *   `types/`: TypeScript interfaces and type definitions (e.g., `wardrobe.ts`).
*   `assets/`: Static assets like images, fonts.
*   `components/`: (This might be a duplicate or an older structure, often `src/components/` is preferred).

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Start the development server:**
    ```bash
    npx expo start
    ```

    This will open Expo DevTools in your browser, where you can:
    *   Run on an Android emulator or connected device.
    *   Run on an iOS simulator or connected device.
    *   Run in Expo Go (a limited sandbox app for quick testing).
    *   Run in a web browser (experimental/limited for React Native features).

## Learn More (Original Expo README content)

To learn more about developing your project with Expo, look at the following resources:

-   [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
-   [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the Community (Original Expo README content)

Join our community of developers creating universal apps.

-   [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
-   [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---
*This README has been updated to reflect the current state and features of the MyApp wardrobe organizer project.*

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
#
