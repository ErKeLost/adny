import { Icon } from "@iconify/react";
import flowConnectionIcon from "@iconify-icons/carbon/flow-connection";
import githubIcon from "@iconify-icons/simple-icons/github";
import {
	ArrowUpRight,
	Code2,
	GitFork,
	Layers3,
	Server,
	Star,
	Wrench,
} from "lucide-react";

import { Button } from "#/components/ui/button";
import { CurvedTimeline } from "#/components/ui/timeline";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import {
	currentProducts,
	type Product,
	pinnedProducts,
	siteConfig,
	skillGroups,
} from "#/data/portfolio";

import { ActivityCalendar } from "./activity-calendar";
import { ScrollHero } from "./scroll-hero";
import { ThemeToggle } from "./theme-toggle";

const skillIcons = {
	language: Code2,
	frontend: Layers3,
	backend: Server,
	ai: Code2,
	workflow: Wrench,
} satisfies Record<(typeof skillGroups)[number]["kind"], typeof Code2>;

const numberFormatter = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 1,
	notation: "compact",
});

function ProductTimelineRow({
	product,
	current = false,
}: {
	product: Product;
	current?: boolean;
}) {
	return (
		<a
			className={
				current
					? "timeline-product timeline-product-current"
					: "timeline-product"
			}
			href={product.url}
			rel="noreferrer"
			target="_blank"
		>
			<div className="timeline-product-heading">
				<img
					alt=""
					className="product-owner"
					height="28"
					src={product.ownerAvatar}
					width="28"
				/>
				<div>
					<h3>{product.name}</h3>
					<p>{product.nameWithOwner}</p>
				</div>
				<ArrowUpRight aria-hidden="true" className="timeline-product-arrow" />
			</div>
			<p className="timeline-product-description">{product.description}</p>
			<div className="timeline-product-stats">
				<span>
					<i
						aria-hidden="true"
						style={{ backgroundColor: product.languageColor }}
					/>
					{product.language}
				</span>
				<span>
					<Star aria-hidden="true" />
					{numberFormatter.format(product.stars)}
				</span>
				<span>
					<GitFork aria-hidden="true" />
					{numberFormatter.format(product.forks)}
				</span>
			</div>
		</a>
	);
}

function ResumeContent() {
	const timelineGroups = [
		{
			id: "now",
			label: "Now",
			active: true,
			products: currentProducts,
		},
		{
			id: "2023",
			label: "2023",
			products: pinnedProducts.filter((product) => product.name === "Rolldown"),
		},
		{
			id: "2022",
			label: "2022",
			products: pinnedProducts.filter((product) =>
				["Farm", "Fervid", "Unplugin Imagemin", "Create Vite App"].includes(
					product.name,
				),
			),
		},
		{
			id: "2020",
			label: "2020",
			products: pinnedProducts.filter((product) => product.name === "Varlet"),
		},
	];

	return (
		<main className="site-main">
			<div className="site-flow">
				<section aria-label="Profile" className="hero hero-load">
					<div className="hero-topline">
						<div className="identity-with-avatar">
							<img
								alt="ADNY"
								className="profile-avatar"
								height="48"
								src={siteConfig.avatarUrl}
								width="48"
							/>
							<div className="identity">
								<h2>{siteConfig.name}</h2>
								<p>{siteConfig.role}</p>
							</div>
						</div>

						<nav aria-label="Page controls" className="social-nav">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										asChild
										className="icon-control"
										size="icon-sm"
										variant="ghost"
									>
										<a
											aria-label="GitHub"
											href={siteConfig.githubUrl}
											rel="noreferrer"
											target="_blank"
										>
											<Icon aria-hidden="true" icon={githubIcon} />
										</a>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">GitHub</TooltipContent>
							</Tooltip>
							<ThemeToggle />
						</nav>
					</div>

					<div className="hero-copy">
						<p>
							<a
								className="inline-link"
								href="https://github.com/unplugin"
								rel="noreferrer"
								target="_blank"
							>
								Unplugin
							</a>{" "}
							team member. Core maintainer at{" "}
							<a
								className="inline-link"
								href="https://github.com/farm-fe/farm"
								rel="noreferrer"
								target="_blank"
							>
								Farm
							</a>
							.
						</p>
						<p>
							Five years across frontend and backend engineering, from product
							systems to open-source infrastructure. Now focused full-time on
							coding agent R&amp;D, AI product design, and agent design, with
							current research in data analysis agents and generative UI.
						</p>
					</div>
				</section>

				<section
					aria-labelledby="activity-title"
					className="section view-reveal"
				>
					<div className="section-heading">
						<h2 className="section-title" id="activity-title">
							GitHub Activity
						</h2>
					</div>
					<ActivityCalendar />
				</section>

				<section aria-labelledby="skills-title" className="section view-reveal">
					<div className="section-heading">
						<h2 className="section-title" id="skills-title">
							Technical Focus
						</h2>
					</div>
					<dl className="skills-list">
						{skillGroups.map((group) => {
							const SkillIcon = skillIcons[group.kind];

							return (
								<div className="skill-row" key={group.name}>
									<dt>
										{group.kind === "ai" ? (
											<Icon aria-hidden="true" icon={flowConnectionIcon} />
										) : (
											<SkillIcon aria-hidden="true" />
										)}
										{group.name}
									</dt>
									<dd>
										{group.items.map((item) => (
											<span className="skill-item" key={item}>
												{item}
											</span>
										))}
									</dd>
								</div>
							);
						})}
					</dl>
				</section>

				<section className="section view-reveal" id="projects">
					<div className="section-heading">
						<h2 className="section-title" id="products-title">
							Project Timeline
						</h2>
						<a
							className="section-link"
							href={siteConfig.githubUrl}
							rel="noreferrer"
							target="_blank"
						>
							All repositories
							<ArrowUpRight aria-hidden="true" />
						</a>
					</div>
					<CurvedTimeline
						entries={timelineGroups.map((group) => ({
							id: group.id,
							label: group.label,
							active: group.active,
							content: (
								<div className="timeline-product-list">
									{group.products.map((product) => (
										<ProductTimelineRow
											current={group.active}
											key={product.nameWithOwner}
											product={product}
										/>
									))}
								</div>
							),
						}))}
					/>
				</section>

				<footer className="footer view-reveal">
					<p>© 2026 {siteConfig.name}</p>
					<a href={siteConfig.githubUrl} rel="noreferrer" target="_blank">
						<Icon aria-hidden="true" icon={githubIcon} />
						ErKeLost on GitHub
					</a>
				</footer>
			</div>
		</main>
	);
}

export function PortfolioPage() {
	return (
		<div className="portfolio-shell">
			<ScrollHero />
			<ResumeContent />
		</div>
	);
}
