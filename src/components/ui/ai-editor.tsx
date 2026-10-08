import {
	IconArrowRight,
	IconBold,
	IconCode,
	IconItalic,
	IconSparkles,
	IconStrikethrough,
	IconUnderline,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
	type MouseEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

import { cn } from "#/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const SELECTION_SETTLE_MS = 180;
const ANSWER_WORD_MS = 34;

const FORMAT_ACTIONS = [
	{ label: "Bold", command: "bold", icon: IconBold },
	{ label: "Italic", command: "italic", icon: IconItalic },
	{ label: "Underline", command: "underline", icon: IconUnderline },
	{
		label: "Strikethrough",
		command: "strikeThrough",
		icon: IconStrikethrough,
	},
	{ label: "Code", command: "code", icon: IconCode },
] as const;

type ToolbarPoint = {
	x: number;
	y: number;
};

function unwrapSelectionHighlight(mark: HTMLElement | null) {
	const parent = mark?.parentNode;
	if (!mark || !parent) return;

	while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
	mark.remove();
	parent.normalize();
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function AiEditor({
	children,
	answer,
	className,
	documentClassName,
}: {
	children: ReactNode;
	answer: string;
	className?: string;
	documentClassName?: string;
}) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const documentRef = useRef<HTMLDivElement>(null);
	const toolbarRef = useRef<HTMLDivElement>(null);
	const storedRangeRef = useRef<Range | null>(null);
	const selectionMarkRef = useRef<HTMLElement | null>(null);
	const draggingRef = useRef(false);
	const askingRef = useRef(false);
	const selectionTextRef = useRef("");
	const settleTimerRef = useRef(0);
	const [toolbarAt, setToolbarAt] = useState<ToolbarPoint | null>(null);
	const [askMode, setAskMode] = useState(false);
	const [selectionVersion, setSelectionVersion] = useState(0);

	const closeToolbar = useCallback(() => {
		window.clearTimeout(settleTimerRef.current);
		unwrapSelectionHighlight(selectionMarkRef.current);
		selectionMarkRef.current = null;
		askingRef.current = false;
		storedRangeRef.current = null;
		selectionTextRef.current = "";
		setAskMode(false);
		setToolbarAt(null);
	}, []);

	const positionToolbar = useCallback(() => {
		const selection = window.getSelection();
		const documentElement = documentRef.current;
		const wrapElement = wrapRef.current;

		if (
			!selection ||
			selection.isCollapsed ||
			selection.rangeCount === 0 ||
			!documentElement ||
			!wrapElement ||
			!documentElement.contains(selection.anchorNode) ||
			!documentElement.contains(selection.focusNode)
		) {
			if (!askingRef.current) setToolbarAt(null);
			return;
		}

		const range = selection.getRangeAt(0).cloneRange();
		const selectionBox = range.getBoundingClientRect();
		const wrapBox = wrapElement.getBoundingClientRect();
		const selectedText = selection.toString().trim();
		const safeInset = Math.min(178, wrapBox.width / 2);

		storedRangeRef.current = range;
		if (selectionTextRef.current !== selectedText) {
			selectionTextRef.current = selectedText;
			setSelectionVersion((version) => version + 1);
		}

		setToolbarAt({
			x: clamp(
				selectionBox.left + selectionBox.width / 2 - wrapBox.left,
				safeInset,
				wrapBox.width - safeInset,
			),
			y: selectionBox.top - wrapBox.top,
		});
	}, []);

	useEffect(() => {
		const handleSelectionChange = () => {
			if (askingRef.current) return;
			window.clearTimeout(settleTimerRef.current);
			if (!draggingRef.current) {
				settleTimerRef.current = window.setTimeout(
					positionToolbar,
					SELECTION_SETTLE_MS,
				);
			}
		};

		const handlePointerDown = (event: PointerEvent) => {
			if (toolbarRef.current?.contains(event.target as Node)) return;
			draggingRef.current = true;
			closeToolbar();
		};

		const handlePointerUp = () => {
			draggingRef.current = false;
			positionToolbar();
		};

		const handleResize = () => closeToolbar();

		document.addEventListener("selectionchange", handleSelectionChange);
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("pointerup", handlePointerUp);
		document.addEventListener("pointercancel", handlePointerUp);
		window.addEventListener("resize", handleResize);

		return () => {
			window.clearTimeout(settleTimerRef.current);
			unwrapSelectionHighlight(selectionMarkRef.current);
			document.removeEventListener("selectionchange", handleSelectionChange);
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("pointerup", handlePointerUp);
			document.removeEventListener("pointercancel", handlePointerUp);
			window.removeEventListener("resize", handleResize);
		};
	}, [closeToolbar, positionToolbar]);

	const enterAskMode = useCallback(() => {
		const range = storedRangeRef.current?.cloneRange();
		if (!range) return;

		const mark = document.createElement("mark");
		mark.dataset.agentSelection = "";
		try {
			range.surroundContents(mark);
		} catch {
			mark.append(range.extractContents());
			range.insertNode(mark);
		}
		selectionMarkRef.current = mark;

		askingRef.current = true;
		setAskMode(true);
	}, []);

	const applyFormat = useCallback(
		(command: (typeof FORMAT_ACTIONS)[number]["command"]) => {
			const range = storedRangeRef.current?.cloneRange();
			const selection = window.getSelection();
			if (!range || !selection) return;

			selection.removeAllRanges();
			selection.addRange(range);

			if (command === "code") {
				const code = document.createElement("code");
				try {
					range.surroundContents(code);
				} catch {
					code.append(range.extractContents());
					range.insertNode(code);
				}
				range.selectNodeContents(code);
				selection.removeAllRanges();
				selection.addRange(range);
			} else {
				document.execCommand(command);
			}

			storedRangeRef.current = selection.rangeCount
				? selection.getRangeAt(0).cloneRange()
				: null;
			positionToolbar();
		},
		[positionToolbar],
	);

	return (
		<div className={cn("selection-editor", className)} ref={wrapRef}>
			{/* biome-ignore lint/a11y/useSemanticElements: rich text formatting needs a content-editable surface. */}
			<div
				aria-label="Agent interface notes"
				aria-multiline="true"
				className={cn("selection-editor-document", documentClassName)}
				contentEditable
				ref={documentRef}
				role="textbox"
				spellCheck={false}
				suppressContentEditableWarning
				tabIndex={0}
			>
				{children}
			</div>

			<div
				aria-hidden={!toolbarAt}
				className={cn("selection-toolbar-anchor", toolbarAt && "is-open")}
				ref={toolbarRef}
				style={{
					left: toolbarAt?.x ?? 0,
					top: toolbarAt?.y ?? 0,
				}}
			>
				<SelectionToolbar
					answer={answer}
					askMode={askMode}
					key={selectionVersion}
					onAsk={enterAskMode}
					onFormat={applyFormat}
				/>
			</div>
		</div>
	);
}

function SelectionToolbar({
	askMode,
	answer,
	onAsk,
	onFormat,
}: {
	askMode: boolean;
	answer: string;
	onAsk: () => void;
	onFormat: (command: (typeof FORMAT_ACTIONS)[number]["command"]) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const reduceMotion = useReducedMotion() ?? false;
	const [query, setQuery] = useState<string | null>(null);
	const [stage, setStage] = useState<"understanding" | "gathering">(
		"understanding",
	);
	const [answering, setAnswering] = useState(false);
	const [shownWords, setShownWords] = useState(0);
	const words = answer.split(/\s+/);
	const stageLabel =
		stage === "understanding"
			? "Understanding the selection..."
			: "Shaping a useful response...";

	useEffect(() => {
		if (askMode) inputRef.current?.focus({ preventScroll: true });
	}, [askMode]);

	useEffect(() => {
		if (!query) return;
		const gatherTimer = window.setTimeout(() => setStage("gathering"), 900);
		const answerTimer = window.setTimeout(() => setAnswering(true), 1900);
		return () => {
			window.clearTimeout(gatherTimer);
			window.clearTimeout(answerTimer);
		};
	}, [query]);

	useEffect(() => {
		if (!answering || shownWords >= words.length) return;
		const wordTimer = window.setTimeout(
			() => setShownWords((count) => count + 1),
			reduceMotion ? 0 : ANSWER_WORD_MS,
		);
		return () => window.clearTimeout(wordTimer);
	}, [answering, reduceMotion, shownWords, words.length]);

	const submit = () => {
		const value = inputRef.current?.value.trim();
		if (!value || query) return;
		setQuery(value);
		inputRef.current?.blur();
	};

	const preserveSelection = (event: MouseEvent<HTMLDivElement>) => {
		if ((event.target as HTMLElement).tagName !== "INPUT") {
			event.preventDefault();
		}
	};

	return (
		<div
			aria-label="Text selection tools"
			className="selection-toolbar"
			onMouseDown={preserveSelection}
			role="toolbar"
		>
			<div className="selection-toolbar-controls">
				<AnimatePresence initial={false} mode="wait">
					{askMode ? (
						<motion.div
							animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
							className="selection-toolbar-query"
							exit={{ opacity: 0, x: -8, filter: "blur(2px)" }}
							initial={{ opacity: 0, x: 8, filter: "blur(2px)" }}
							key="query"
							transition={
								reduceMotion ? { duration: 0 } : { duration: 0.25, ease: EASE }
							}
						>
							<IconSparkles aria-hidden="true" />
							<input
								aria-label="Ask about the selected text"
								disabled={Boolean(query)}
								onKeyDown={(event) => event.key === "Enter" && submit()}
								placeholder="Ask anything..."
								ref={inputRef}
								type="text"
							/>
							<button aria-label="Send" onClick={submit} type="button">
								<IconArrowRight aria-hidden="true" />
							</button>
						</motion.div>
					) : (
						<motion.div
							animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
							className="selection-toolbar-formats"
							exit={{ opacity: 0, x: -8, filter: "blur(2px)" }}
							initial={{ opacity: 0, x: 8, filter: "blur(2px)" }}
							key="formats"
							transition={
								reduceMotion ? { duration: 0 } : { duration: 0.25, ease: EASE }
							}
						>
							<button
								className="selection-ask-button"
								onClick={onAsk}
								type="button"
							>
								<span aria-hidden="true" className="selection-ai-mark">
									<IconSparkles />
								</span>
								Ask AI
							</button>
							<span aria-hidden="true" className="selection-toolbar-divider" />
							{FORMAT_ACTIONS.map(({ label, command, icon: FormatIcon }) => (
								<button
									aria-label={label}
									key={label}
									onClick={() => onFormat(command)}
									title={label}
									type="button"
								>
									<FormatIcon aria-hidden="true" />
								</button>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<AnimatePresence initial={false} mode="wait">
				{query && !answering ? (
					<motion.div
						animate={{ height: "auto", opacity: 1 }}
						className="selection-toolbar-status"
						exit={{ height: 0, opacity: 0 }}
						initial={{ height: 0, opacity: 0 }}
						key={stage}
						transition={
							reduceMotion ? { duration: 0 } : { duration: 0.25, ease: EASE }
						}
					>
						<IconSparkles aria-hidden="true" />
						<span className="t-shimmer" data-text={stageLabel}>
							{stageLabel}
						</span>
					</motion.div>
				) : null}
				{answering ? (
					<motion.div
						animate={{ height: "auto", opacity: 1 }}
						className="selection-toolbar-answer"
						exit={{ height: 0, opacity: 0 }}
						initial={{ height: 0, opacity: 0 }}
						key="answer"
						transition={
							reduceMotion ? { duration: 0 } : { duration: 0.3, ease: EASE }
						}
					>
						<p>{words.slice(0, shownWords).join(" ")}</p>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
