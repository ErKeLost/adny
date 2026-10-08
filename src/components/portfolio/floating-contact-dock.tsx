import { Icon } from "@iconify/react";
import githubIcon from "@iconify-icons/simple-icons/github";
import { IconCopy, IconMail } from "@tabler/icons-react";
import { useState } from "react";
import { ThemeToggle } from "#/components/portfolio/theme-toggle";
import {
	FloatingDock,
	type FloatingDockItem,
} from "#/components/ui/floating-dock";
import { siteConfig } from "#/data/portfolio";

const EMAIL = "erkelost@gamil.com";

export function FloatingContactDock() {
	const [copied, setCopied] = useState(false);

	const copyEmail = async () => {
		try {
			await navigator.clipboard.writeText(EMAIL);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1400);
		} catch {
			setCopied(false);
		}
	};

	const items: FloatingDockItem[] = [
		{
			title: copied ? "Copied" : "Email me",
			hoverTitle: copied ? "Copied" : EMAIL,
			icon: <IconMail aria-hidden="true" />,
			hoverIcon: <IconCopy aria-hidden="true" />,
			onClick: copyEmail,
			showTitle: true,
			dividerAfter: true,
		},
		{
			title: "GitHub",
			href: siteConfig.githubUrl,
			icon: <Icon aria-hidden="true" icon={githubIcon} />,
		},
		{
			title: "Theme",
			custom: (
				<ThemeToggle
					className="floating-dock-theme-toggle"
					suppressPointerFocus
				/>
			),
		},
	];

	return (
		<FloatingDock
			desktopClassName="site-floating-dock"
			items={items}
			variant="pill"
		/>
	);
}
