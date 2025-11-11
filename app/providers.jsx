"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

import { store, persistor } from "@/components/Redux/Store";

export default function Providers({ children, themeProps }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Toaster />
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </PersistGate>
    </Provider>
  );
}
