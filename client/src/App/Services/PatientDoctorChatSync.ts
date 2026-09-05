export interface ChatActionItem {
	id: string;
	label: string;
	isCompleted: boolean;
	completedAt?: string;
}

export interface ChatMessage {
	id: string;
	sender: "doctor" | "patient";
	senderName: string;
	senderRole: string;
	timestamp: string;
	text: string;
	priority?: "normal" | "urgent";
	actions?: ChatActionItem[];
	status?: "sent" | "delivered" | "read";
}

const STORAGE_PREFIX = "genetiq.patient_doctor_chat_";
const CHAT_CHANNEL_NAME = "genetiq_patient_doctor_live_channel";
const CUSTOM_EVENT_NAME = "genetiq:live_chat_sync";

export const getStorageKey = (patientId: string = "pt-101"): string => {
	const cleanId = patientId || "pt-101";
	return `${STORAGE_PREFIX}${cleanId}`;
};

export const getDefaultSeedMessages = (patientName: string = "Marcus Vance", doctorName: string = "Dr. Sarah Jenkins, MD"): ChatMessage[] => [
	{
		id: "msg-init-1",
		sender: "patient",
		senderName: patientName,
		senderRole: "Patient (App Dispatch)",
		timestamp: "Today · 09:12 AM",
		text: "Dr. Jenkins, I just walked up the stairs and my heart started racing suddenly. My watch is showing 118 bpm, and I feel lightheaded and short of breath. Should I take an extra Metoprolol or sit down?",
		status: "read",
	},
	{
		id: "msg-init-2",
		sender: "doctor",
		senderName: doctorName,
		senderRole: "Attending Cardiologist",
		timestamp: "Today · 09:15 AM",
		priority: "urgent",
		text: `Hello ${patientName},\n\nI reviewed your recent report of Palpitations & Shortness of Breath. Please sit down and rest immediately, drink 500ml of water, and ensure you have taken your morning Metoprolol 25mg.\n\nAvoid caffeine and strenuous activity today. If your shortness of breath persists beyond 15 minutes or you experience chest pressure, please call our triage nurse or emergency immediately.\n\n— ${doctorName}`,
		actions: [
			{ id: "act-1", label: "Sit down and rest quietly immediately", isCompleted: true, completedAt: "09:18 AM" },
			{ id: "act-2", label: "Drink 500ml of fresh water", isCompleted: true, completedAt: "09:18 AM" },
			{ id: "act-3", label: "Confirm morning Metoprolol 25mg intake", isCompleted: true, completedAt: "09:19 AM" },
			{ id: "act-4", label: "Recheck Resting HR in 15 mins (Call triage if SOB persists)", isCompleted: true, completedAt: "09:34 AM" },
		],
		status: "read",
	},
	{
		id: "msg-init-3",
		sender: "patient",
		senderName: patientName,
		senderRole: "Patient (App Dispatch)",
		timestamp: "Today · 09:19 AM",
		text: "Understood Dr. Jenkins. I just sat down on the couch, drank 500ml of water, and confirmed my morning Metoprolol 25mg. Resting now.",
		status: "read",
	},
	{
		id: "msg-init-4",
		sender: "patient",
		senderName: patientName,
		senderRole: "Patient (App Dispatch)",
		timestamp: "Today · 09:34 AM",
		text: "Update: It's been 15 minutes. My resting heart rate has dropped down to 76 bpm. The palpitations have settled and my breathing is completely back to normal. Thank you for the swift guidance!",
		status: "read",
	},
];

/**
 * Reads the latest messages from localStorage or seeds defaults
 */
export const loadChatMessages = (patientId: string = "pt-101"): ChatMessage[] => {
	const key = getStorageKey(patientId);
	try {
		const raw = localStorage.getItem(key);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed;
			}
		}
	} catch (e) {
		console.error("Error loading chat messages:", e);
	}

	const seed = getDefaultSeedMessages();
	try {
		localStorage.setItem(key, JSON.stringify(seed));
	} catch (e) {
		console.error("Error seeding initial chat messages:", e);
	}
	return seed;
};

/**
 * Saves messages to storage and notifies all listening components across windows/tabs
 */
export const saveAndBroadcastChat = (patientId: string = "pt-101", messages: ChatMessage[]): void => {
	const key = getStorageKey(patientId);
	try {
		localStorage.setItem(key, JSON.stringify(messages));
	} catch (e) {
		console.error("Error saving chat messages:", e);
	}

	// 1. Same-window custom event dispatch
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent(CUSTOM_EVENT_NAME, {
				detail: { patientId, messages },
			}),
		);
		window.dispatchEvent(new Event("storage"));
	}

	// 2. Cross-tab BroadcastChannel
	try {
		if (typeof BroadcastChannel !== "undefined") {
			const channel = new BroadcastChannel(CHAT_CHANNEL_NAME);
			channel.postMessage({ patientId, messages });
			channel.close();
		}
	} catch (e) {
		// BroadcastChannel fallback
	}
};

/**
 * Helper to dispatch a new message into the live thread
 */
export const dispatchNewMessage = (
	patientId: string = "pt-101",
	message: Omit<ChatMessage, "id" | "timestamp"> & { timestamp?: string; id?: string },
): ChatMessage[] => {
	const current = loadChatMessages(patientId);
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";
	const formattedHours = hours % 12 || 12;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
	const timestamp = message.timestamp || `Today · ${formattedHours}:${formattedMinutes} ${ampm}`;

	const newMsg: ChatMessage = {
		id: message.id || `msg-${message.sender}-${Date.now()}`,
		timestamp,
		status: "read",
		...message,
	};

	const updated = [...current, newMsg];
	saveAndBroadcastChat(patientId, updated);
	return updated;
};

/**
 * Helper to toggle an action item within a message
 */
export const toggleMessageAction = (
	patientId: string = "pt-101",
	messageId: string,
	actionId: string,
): ChatMessage[] => {
	const current = loadChatMessages(patientId);
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";
	const formattedHours = hours % 12 || 12;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
	const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

	const updated = current.map((msg) => {
		if (msg.id !== messageId || !msg.actions) return msg;
		const newActions = msg.actions.map((act) => {
			if (act.id !== actionId) return act;
			const nextCompleted = !act.isCompleted;
			return {
				...act,
				isCompleted: nextCompleted,
				completedAt: nextCompleted ? timeStr : undefined,
			};
		});
		return { ...msg, actions: newActions };
	});

	saveAndBroadcastChat(patientId, updated);
	return updated;
};

/**
 * Real-time subscription hook helper
 */
export const subscribeToChatUpdates = (
	patientId: string = "pt-101",
	callback: (messages: ChatMessage[]) => void,
): (() => void) => {
	const handleStorage = (e: StorageEvent) => {
		const key = getStorageKey(patientId);
		if (e.key === key && e.newValue) {
			try {
				const parsed = JSON.parse(e.newValue);
				if (Array.isArray(parsed)) callback(parsed);
			} catch (err) {
				console.error(err);
			}
		}
	};

	const handleCustomEvent = (e: Event) => {
		const customEvent = e as CustomEvent;
		if (customEvent.detail && customEvent.detail.patientId === patientId) {
			callback(customEvent.detail.messages);
		} else {
			callback(loadChatMessages(patientId));
		}
	};

	let broadcastChannel: BroadcastChannel | null = null;
	try {
		if (typeof BroadcastChannel !== "undefined") {
			broadcastChannel = new BroadcastChannel(CHAT_CHANNEL_NAME);
			broadcastChannel.onmessage = (event) => {
				if (event.data && event.data.patientId === patientId && Array.isArray(event.data.messages)) {
					callback(event.data.messages);
				}
			};
		}
	} catch (err) {
		console.error(err);
	}

	if (typeof window !== "undefined") {
		window.addEventListener("storage", handleStorage);
		window.addEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
	}

	return () => {
		if (typeof window !== "undefined") {
			window.removeEventListener("storage", handleStorage);
			window.removeEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
		}
		if (broadcastChannel) {
			broadcastChannel.close();
		}
	};
};
