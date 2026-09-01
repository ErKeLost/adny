import { createFileRoute } from "@tanstack/react-router";

import { PortfolioPage } from "#/components/portfolio/portfolio-page";

export const Route = createFileRoute("/")({ component: PortfolioPage });
