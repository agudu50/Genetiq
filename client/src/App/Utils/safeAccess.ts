export function safeGet(obj: Record<string, unknown>, key: string): unknown {
	if (["__proto__", "constructor", "prototype"].includes(key)) {
		return undefined;
	}
	return obj ? Reflect.get(obj, key) : undefined;
}
