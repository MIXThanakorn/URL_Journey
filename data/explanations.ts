import type { ExplanationMode, StageId } from "@/types/simulation";

interface ExplanationSet {
  beginner: string;
  developer: string;
  "deep-dive": string;
}

const explanations: Record<StageId, ExplanationSet> = {
  "url-parse": {
    beginner: "The browser breaks the address into useful pieces, such as the website name and page path.",
    developer: "The URL parser identifies the scheme, authority, effective port, path, query, and client-side fragment.",
    "deep-dive": "Parsing follows URL syntax rules, normalizes the host, determines a default port from the scheme, percent-encodes where needed, and excludes the fragment from the network request.",
  },
  dns: {
    beginner: "DNS finds the IP address belonging to the website name.",
    developer: "A recursive resolver uses caching and authoritative DNS data to resolve the hostname.",
    "deep-dive": "Resolution may be satisfied by browser, OS, or resolver caches. Otherwise the recursive resolver follows referrals toward an authoritative answer, then caches it for the record's TTL.",
  },
  tcp: {
    beginner: "The browser and server open a reliable connection so messages can travel in order.",
    developer: "TCP establishes a byte stream with a SYN, SYN-ACK, and ACK handshake.",
    "deep-dive": "The handshake synchronizes sequence numbers and negotiates connection options. Modern requests may reuse existing connections, and HTTP/3 uses QUIC over UDP instead of TCP.",
  },
  tls: {
    beginner: "HTTPS creates a private, secure channel and checks the server's identity.",
    developer: "TLS negotiates cryptographic parameters, validates the certificate, and derives shared traffic keys.",
    "deep-dive": "A simplified TLS 1.3 exchange carries ClientHello key shares, ServerHello selection, the certificate chain, Finished authentication, and derived symmetric keys. Session resumption can shorten later connections.",
  },
  "http-request": {
    beginner: "The browser sends a message asking the server for the page.",
    developer: "The request carries a method, target, protocol semantics, and headers describing the client and acceptable response.",
    "deep-dive": "HTTP semantics are independent of wire version. HTTP/2 and HTTP/3 encode headers and multiplex streams differently even though the conceptual method, target, headers, and body remain.",
  },
  "http-response": {
    beginner: "The server answers with a result code and the page content.",
    developer: "The response contains a status, metadata headers, and an optional representation body.",
    "deep-dive": "Caching directives, validators, content negotiation, compression, and streaming affect how the response is transferred and reused. A status code describes the HTTP outcome, not necessarily application correctness.",
  },
  render: {
    beginner: "The browser turns page code into boxes, text, colors, and pixels.",
    developer: "DOM and CSSOM data form a render tree; layout calculates geometry and paint records visual output.",
    "deep-dive": "Style calculation feeds layout, paint, rasterization, and compositing. Browser engines can invalidate and repeat subsets of this pipeline as resources load or the document changes.",
  },
  complete: {
    beginner: "The page is visible, though some resources may still be loading.",
    developer: "The critical rendering path has produced visible output and the document can continue becoming interactive.",
    "deep-dive": "First paint is not the end of loading. Deferred scripts, fonts, images, hydration, and application data can continue changing responsiveness and visual stability.",
  },
};

export function getExplanation(stage: StageId, mode: ExplanationMode): string {
  return explanations[stage][mode];
}
