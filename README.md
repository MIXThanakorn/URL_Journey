# URL Journey

URL Journey คือ interactive browser/network simulation ที่อธิบายว่าเกิดอะไรขึ้นหลังผู้ใช้กรอก URL และกด Enter ตั้งแต่ URL parsing, DNS, TCP, TLS, HTTP ไปจนถึง browser rendering pipeline

> ข้อมูลทั้งหมดเป็น **simulated values** และ **simplified educational representations** ไม่ใช่ packet sniffer และไม่มีการยิง request ไปยัง URL ที่ผู้ใช้กรอก

## Features

### Core simulation

- URL validation และแยก protocol, host, port, path, query, fragment
- State-machine-driven simulation แยกจาก rendering components
- DNS lookup, TCP handshake, simplified TLS, HTTP request/response และ rendering pipeline
- Play, pause, replay, reset และ stage inspection
- Animated SVG packets พร้อม reduced-motion support

### Phase 2

- Network profiles: Fast, 4G, Slow 4G, 3G, Offline และ Custom
- Failure scenarios: DNS failure, connection timeout, TLS error, 404, 500 และ slow server
- Explanation modes: Beginner, Developer และ Deep Dive
- Architecture view และ expanded DOM/CSSOM visualization
- Keyboard navigation และ responsive mobile layout

### Phase 3

- Detailed rendering pipeline ตั้งแต่ DOM/CSSOM ถึง paint
- Side-by-side HTTP request/response comparison
- Custom method, response status, content type และ latency
- Shareable scenario URLs ผ่าน query parameters
- Educational challenge mode พร้อม scoring และคำอธิบายคำตอบ
- WebMCP tool สำหรับเริ่ม simulation จาก agent-compatible browser context

## Tech stack

- Next.js / Vinext
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- Framer Motion
- Radix UI / shadcn primitives
- Lucide icons
- SVG network diagrams

## Getting started

ต้องใช้ Node.js 22.13 ขึ้นไป

```bash
npm install
npm run dev
```

เปิด `http://localhost:5173`

## Production build

```bash
npm run build
npm run start
```

ตรวจ TypeScript แยกได้ด้วย:

```bash
npx tsc --noEmit
```

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Pause / resume |
| `R` | Replay |
| `Esc` | Reset |
| `←` / `→` | Inspect previous / next stage |

Shortcuts จะไม่ทำงานขณะโฟกัสอยู่ใน input, textarea หรือ select

## Project structure

```text
app/
  page.tsx                 Main application workspace
components/
  simulation/              Canvas, timeline, inspector, settings and modes
  ui/                      Reusable UI primitives
data/
  challenges.ts            Challenge questions and answers
  explanations.ts          Beginner / Developer / Deep Dive copy
simulation/
  engine.ts                Pure simulation reducer/state machine
  network.ts               Network profiles and timing data
  scenarios.ts             Failure scenario definitions
  stages.ts                Stage metadata
lib/
  url-parser.ts            URL normalization and parsing
types/
  simulation.ts            Strict shared domain types
```

## Simulation model

The reducer in `simulation/engine.ts` owns run state, active stage, selected stage, progress and elapsed time. Presentation components dispatch typed actions and do not embed stage-transition logic.

Network profiles apply a timing multiplier. Failure scenarios map to a specific stage and stop the state machine there. HTTP errors are represented at the HTTP response stage. Custom scenarios change the representative exchange only; they do not contact external servers.

## Shareable scenarios

ปุ่ม **Share** จะเก็บค่าปัจจุบันลงใน query string และคัดลอก URL เช่น:

```text
?u=https%3A%2F%2Fexample.com&profile=slow-4g&error=404&mode=deep-dive&view=architecture
```

ค่าที่รองรับประกอบด้วย URL, network profile, failure, explanation mode, view, HTTP method, status, content type และ custom latency

## Accuracy notes

- Browser implementations can cache, reuse, overlap, parallelize, or skip stages.
- DNS does not always contact every visible server in the diagram.
- HTTP/3 uses QUIC rather than the TCP + TLS sequence visualized here.
- Server internals and response values are conceptual and simulated.
- “Page rendered” does not mean every resource or script has completed.

## Accessibility

- Semantic controls and visible focus states
- Keyboard-accessible timeline and settings
- `prefers-reduced-motion` support
- Responsive layouts for desktop and touch screens
- Status text is not communicated by color alone

## Deployment

The project includes `.openai/hosting.json` for deployment with OpenAI Sites. New deployments preserve the existing private audience unless explicitly changed.
