import styles from "./ChatMessageContent.module.scss";

type Block =
	| { type: "paragraph"; text: string }
	| { type: "heading"; text: string }
	| { type: "list"; items: string[] }
	| { type: "warning"; text: string };

/** Normalize bot text so bullets and sections render on separate lines. */
function normalizeMessageText(text: string): string {
	return text
		.replace(/\r\n/g, "\n")
		.replace(/\s•\s/g, "\n• ")
		.replace(/([.:!?])\s+(?=[A-Z⚠️])/g, "$1\n\n")
		.replace(/:\n\n•/g, ":\n•")
		.trim();
}

function parseBlocks(text: string): Block[] {
	const normalized = normalizeMessageText(text);
	const sections = normalized.split(/\n\n+/).filter(Boolean);
	const blocks: Block[] = [];

	for (const section of sections) {
		const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);
		let bulletBuffer: string[] = [];

		const flushBullets = () => {
			if (bulletBuffer.length === 0) return;
			blocks.push({ type: "list", items: [...bulletBuffer] });
			bulletBuffer = [];
		};

		for (const line of lines) {
			if (/^⚠️/.test(line)) {
				flushBullets();
				blocks.push({ type: "warning", text: line });
				continue;
			}

			if (/^[•\-*]\s/.test(line)) {
				bulletBuffer.push(line.replace(/^[•\-*]\s*/, ""));
				continue;
			}

			flushBullets();

			if (/^(immediate steps|try these|for now|please visit|see a doctor|go to hospital)/i.test(line)) {
				blocks.push({ type: "heading", text: line.replace(/:$/, "") });
				continue;
			}

			blocks.push({ type: "paragraph", text: line });
		}

		flushBullets();
	}

	return blocks.length > 0 ? blocks : [{ type: "paragraph", text }];
}

interface ChatMessageContentProps {
	text: string;
	className?: string;
}

export function ChatMessageContent({ text, className }: ChatMessageContentProps) {
	const blocks = parseBlocks(text);

	return (
		<div className={`${styles.content} ${className ?? ""}`}>
			{blocks.map((block, index) => {
				switch (block.type) {
					case "heading":
						return (
							<p key={index} className={styles.heading}>
								{block.text}
							</p>
						);
					case "list":
						return (
							<ul key={index} className={styles.list}>
								{block.items.map((item, i) => (
									<li key={i}>{item}</li>
								))}
							</ul>
						);
					case "warning":
						return (
							<div key={index} className={styles.warning}>
								{block.text}
							</div>
						);
					default:
						return (
							<p key={index} className={styles.paragraph}>
								{block.text}
							</p>
						);
				}
			})}
		</div>
	);
}
