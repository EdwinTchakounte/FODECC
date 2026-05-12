import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Tout sauf : routes API internes Next, fichiers statiques Next, fichiers publics.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
