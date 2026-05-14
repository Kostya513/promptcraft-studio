import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UserProvider } from "./contexts/UserContext";

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ErrorBoundary
			onError={(error, errorInfo) => {
				console.error("🔴 Global Error:", error, errorInfo);
				// Здесь можно добавить отправку в Sentry/LogRocket
			}}
		>
			<UserProvider>
				<App />
			</UserProvider>
		</ErrorBoundary>
	</React.StrictMode>
);
