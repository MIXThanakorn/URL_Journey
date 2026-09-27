import type { Challenge } from "@/types/simulation";

export const challenges: readonly Challenge[] = [
  { stage: "url-parse", question: "Which URL part stays in the browser and is not sent in the HTTP request?", answers: ["Host", "Fragment", "Path", "Port"], correctIndex: 1, explanation: "The fragment identifies a client-side location and is not included in the request target." },
  { stage: "dns", question: "What is the main job of DNS in this journey?", answers: ["Encrypt traffic", "Render HTML", "Resolve a hostname", "Open a TCP stream"], correctIndex: 2, explanation: "DNS maps a hostname to address information, often using cached results." },
  { stage: "tcp", question: "Which sequence represents the simplified TCP handshake?", answers: ["ACK → GET → 200", "SYN → SYN-ACK → ACK", "Hello → Certificate → Paint", "Query → TTL → DOM"], correctIndex: 1, explanation: "The classic three-way handshake exchanges SYN, SYN-ACK, then ACK." },
  { stage: "tls", question: "What does TLS primarily add to an HTTPS connection?", answers: ["A domain name", "Encryption and identity checks", "A DOM tree", "A 200 status"], correctIndex: 1, explanation: "TLS provides confidentiality, integrity, and authentication of the server identity." },
  { stage: "http-request", question: "Which item tells the server what action the client wants?", answers: ["Method", "TTL", "Certificate", "CSSOM"], correctIndex: 0, explanation: "The HTTP method expresses the requested action, such as GET or HEAD." },
  { stage: "http-response", question: "What does a 404 response mean?", answers: ["DNS failed", "TLS expired", "The resource was not found", "Rendering completed"], correctIndex: 2, explanation: "404 means the server was reached but has no matching resource for the request." },
  { stage: "render", question: "Which two structures contribute to the render tree?", answers: ["DNS and TCP", "DOM and CSSOM", "TLS and HTTP", "SYN and ACK"], correctIndex: 1, explanation: "The DOM describes content and the CSSOM describes applicable style information." },
  { stage: "complete", question: "Does 'page rendered' mean every resource has definitely finished?", answers: ["Always", "No, more work may continue", "Only on HTTP", "Only after DNS expires"], correctIndex: 1, explanation: "Deferred scripts, images, fonts, and data can continue loading after visible output appears." },
] as const;
