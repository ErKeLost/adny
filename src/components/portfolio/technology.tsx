import { Icon } from "@iconify/react";
import application from "@iconify-icons/carbon/application";
import chart from "@iconify-icons/carbon/chart-line";
import chat from "@iconify-icons/carbon/chat-bot";
import check from "@iconify-icons/carbon/checkmark-outline";
import cloud from "@iconify-icons/carbon/cloud";
import deployment from "@iconify-icons/carbon/continuous-deployment";
import database from "@iconify-icons/carbon/data-base";
import context from "@iconify-icons/carbon/data-reference";
import document from "@iconify-icons/carbon/document";
import flow from "@iconify-icons/carbon/flow-connection";
import security from "@iconify-icons/carbon/security";
import terminal from "@iconify-icons/carbon/terminal";
import tools from "@iconify-icons/carbon/tools";
import users from "@iconify-icons/carbon/user-multiple";
import workspace from "@iconify-icons/carbon/workspace";
import docker from "@iconify-icons/simple-icons/docker";
import electron from "@iconify-icons/simple-icons/electron";
import go from "@iconify-icons/simple-icons/go";
import langchain from "@iconify-icons/simple-icons/langchain";
import langgraph from "@iconify-icons/simple-icons/langgraph";
import node from "@iconify-icons/simple-icons/nodedotjs";
import postgres from "@iconify-icons/simple-icons/postgresql";
import react from "@iconify-icons/simple-icons/react";
import rust from "@iconify-icons/simple-icons/rust";
import sqlite from "@iconify-icons/simple-icons/sqlite";
import typescript from "@iconify-icons/simple-icons/typescript";
import vue from "@iconify-icons/simple-icons/vuedotjs";
import type { CSSProperties } from "react";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { pinnedProducts } from "#/data/portfolio";

const technologies = {
	TypeScript: {
		icon: typescript,
		color: "#2563a6",
		dark: "#69a9f5",
		url: "https://www.typescriptlang.org/",
	},
	React: {
		icon: react,
		color: "#087e96",
		dark: "#61dafb",
		url: "https://react.dev/",
	},
	Vue: {
		icon: vue,
		color: "#237e58",
		dark: "#56c995",
		url: "https://vuejs.org/",
	},
	"Node.js": {
		icon: node,
		color: "#47772e",
		dark: "#8cc66d",
		url: "https://nodejs.org/",
	},
	Rust: {
		icon: rust,
		color: "#5c4c44",
		dark: "#e7c4ae",
		url: "https://www.rust-lang.org/",
	},
	Go: { icon: go, color: "#087e96", dark: "#61c8de", url: "https://go.dev/" },
	Mastra: {
		image: "/mastra-logo.png",
		color: "#404047",
		dark: "#ececee",
		url: "https://mastra.ai/",
	},
	LangGraph: {
		icon: langgraph,
		color: "#176252",
		dark: "#8cd8b6",
		url: "https://www.langchain.com/langgraph",
	},
	LangChain: {
		icon: langchain,
		color: "#176252",
		dark: "#a6d7c7",
		url: "https://www.langchain.com/",
	},
	Electron: {
		icon: electron,
		color: "#34768a",
		dark: "#a3d9e9",
		url: "https://www.electronjs.org/",
	},
	SQLite: {
		icon: sqlite,
		color: "#216e9b",
		dark: "#79b7dc",
		url: "https://sqlite.org/",
	},
	PostgreSQL: {
		icon: postgres,
		color: "#336791",
		dark: "#8cbbde",
		url: "https://www.postgresql.org/",
	},
	Docker: {
		icon: docker,
		color: "#166fc0",
		dark: "#69b8ff",
		url: "https://www.docker.com/",
	},
};

const capabilityIcons = {
	"Agent Harnesses": flow,
	"Tool Use": tools,
	"Context Engineering": context,
	"Agent Runtime": terminal,
	"Agent UX": chat,
	"Human-AI Interaction": users,
	Evaluation: check,
	"Generative UI": application,
	"Governed Tools": security,
	Evidence: document,
	"Analysis Views": chart,
	"Local-first Systems": workspace,
	Databases: database,
	Cloud: cloud,
	DevOps: deployment,
};

const ecosystemProjects = {
	Farm: {
		image: pinnedProducts.find((product) => product.name === "Farm")
			?.ownerAvatar,
		url: "https://github.com/farm-fe/farm",
	},
	Rolldown: {
		image: pinnedProducts.find((product) => product.name === "Rolldown")
			?.ownerAvatar,
		url: "https://github.com/rolldown/rolldown",
	},
	Unplugin: {
		image: pinnedProducts.find(
			(product) => product.name === "Unplugin Imagemin",
		)?.ownerAvatar,
		url: "https://github.com/unplugin",
	},
	Varlet: {
		image: pinnedProducts.find((product) => product.name === "Varlet")
			?.ownerAvatar,
		url: "https://github.com/varletjs/varlet",
	},
	OpenTiny: {
		image: "https://avatars.githubusercontent.com/u/108050589?s=64&v=4",
		url: "https://github.com/opentiny",
	},
};

export type TechnologyName = keyof typeof technologies;

export function Technology({
	name,
	iconOnly = false,
}: {
	name: TechnologyName;
	iconOnly?: boolean;
}) {
	const technology = technologies[name];
	const link = (
		<a
			aria-label={iconOnly ? name : undefined}
			className={iconOnly ? "technology-logo" : "technology-chip"}
			href={technology.url}
			rel="noreferrer"
			style={
				{
					"--tech-light": technology.color,
					"--tech-dark": technology.dark,
				} as CSSProperties
			}
			target="_blank"
		>
			{"icon" in technology ? (
				<Icon aria-hidden="true" icon={technology.icon} />
			) : (
				<img alt="" src={technology.image} />
			)}
			{iconOnly ? null : name}
		</a>
	);
	return iconOnly ? (
		<Tooltip>
			<TooltipTrigger asChild>{link}</TooltipTrigger>
			<TooltipContent>{name}</TooltipContent>
		</Tooltip>
	) : (
		link
	);
}

export function TechnologyStack() {
	return (
		<ul aria-label="Technology stack" className="technology-stack">
			{(Object.keys(technologies) as TechnologyName[]).map((name) => (
				<li key={name}>
					<Technology iconOnly name={name} />
				</li>
			))}
		</ul>
	);
}

export function SkillTechnology({ name }: { name: string }) {
	if (Object.hasOwn(technologies, name))
		return <Technology name={name as TechnologyName} />;
	if (Object.hasOwn(ecosystemProjects, name)) {
		const project = ecosystemProjects[name as keyof typeof ecosystemProjects];
		return (
			<a
				className="skill-item skill-with-icon skill-project"
				href={project.url}
				rel="noreferrer"
				target="_blank"
			>
				<img alt="" width={16} height={16} src={project.image} />
				{name}
			</a>
		);
	}
	const icon = Object.hasOwn(capabilityIcons, name)
		? capabilityIcons[name as keyof typeof capabilityIcons]
		: undefined;
	return (
		<span className="skill-item skill-with-icon">
			{icon ? <Icon aria-hidden="true" icon={icon} /> : null}
			{name}
		</span>
	);
}
