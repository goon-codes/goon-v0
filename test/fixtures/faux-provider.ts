import { fauxAssistantMessage, fauxProvider, fauxText } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Test-only Pi extension: a scripted model so e2e runs need no API key or network.
// It reports whether the goon voice reached the system prompt.
export default function (pi: ExtensionAPI) {
	const faux = fauxProvider();
	faux.setResponses([
		(context) => {
			const sent = JSON.stringify(context);
			return fauxAssistantMessage([
				fauxText(`faux says hi${sent.includes("Persona: GoonCodes") ? " VOICE-LEAKED" : ""}`),
			]);
		},
	]);
	pi.registerProvider(faux.provider);
}
