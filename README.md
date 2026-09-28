# URL Journey

URL Journey คือ interactive browser/network observatory สำหรับเรียนรู้ว่าเกิดอะไรขึ้นตั้งแต่ผู้ใช้กรอก URL จนกระทั่งหน้าเว็บปรากฏบนหน้าจอ ตัวแอปจำลอง URL parsing, DNS, transport, TLS, HTTP, server response และ browser rendering pipeline ผ่านภาพเคลื่อนไหว timeline และคำอธิบายหลายระดับ

URL Journey ไม่ใช่ packet sniffer และไม่ส่ง request ไปยัง URL ที่ผู้ใช้กรอก ค่าการตอบสนอง IP address เวลา network และ server architecture ทั้งหมดเป็นข้อมูลจำลองเพื่อการศึกษา

## Table of contents

- [Product goals](#product-goals)
- [Feature guide](#feature-guide)
- [Simulation model](#simulation-model)
- [Network and protocol behavior](#network-and-protocol-behavior)
- [Failure and recovery scenarios](#failure-and-recovery-scenarios)
- [Learning tools](#learning-tools)
- [HAR import and exports](#har-import-and-exports)
- [Shareable scenarios](#shareable-scenarios)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Installation](#installation)
- [Project architecture](#project-architecture)
- [Type system](#type-system)
- [Accessibility and responsive behavior](#accessibility-and-responsive-behavior)
- [Security and privacy](#security-and-privacy)
- [Accuracy and limitations](#accuracy-and-limitations)
- [Testing checklist](#testing-checklist)

## Product goals

URL Journey ต้องทำให้ผู้ใช้รู้สึกว่า “พิมพ์ URL แล้วมองเห็นสิ่งที่เกิดขึ้นได้จริง” โดยมีหลักการสำคัญดังนี้:

1. Technical accuracy — แยกสิ่งที่เป็นแนวคิดจำลองออกจากพฤติกรรมจริงอย่างชัดเจน
2. Progressive learning — เริ่มจากภาษาง่ายและเพิ่มรายละเอียดได้โดยไม่เปลี่ยนหน้าจอ
3. Observable state — ทุก stage มีสถานะ progress timing และ inspector ที่ตรวจสอบได้
4. Safe experimentation — ทดลอง failure, protocol และ cache behavior โดยไม่ติดต่อเว็บไซต์ภายนอก
5. Developer-tool aesthetics — ใช้ visual language แบบ network observatory มากกว่าเว็บไซต์บทเรียนทั่วไป

## Feature guide

### URL parsing

URL input รองรับ HTTP และ HTTPS รวมถึง:

- hostnames และ internationalized domains ที่ `URL` API แปลงเป็นรูปแบบมาตรฐาน
- explicit/default ports
- paths และ percent-encoded paths
- query strings
- fragments
- localhost
- IPv4 และ bracketed IPv6 URLs

หากไม่มี scheme ระบบจะเติม `https://` ให้ก่อน parse ส่วน fragment จะแสดงใน URL inspector แต่ไม่ถูกนำไปใส่ใน HTTP request target

### Stage simulation

ลำดับหลักประกอบด้วย:

1. URL parsing
2. DNS lookup
3. TCP หรือ QUIC transport setup
4. TLS handshake
5. HTTP request
6. HTTP response
7. DOM/CSSOM/rendering pipeline
8. Page rendered

แต่ละ stage มี progress ของตัวเอง ผู้ใช้สามารถ pause, resume, replay, previous, next, scrub progress และปรับความเร็ว 0.5×–2× ได้

### Views

#### Simulation

แสดง packet/handshake และ browser pipeline ตาม stage ปัจจุบัน พร้อมสถานะ live, paused, completed หรือ failed

#### Architecture

แสดงภาพรวม Browser → DNS → Network → CDN/Edge → Load Balancer → Application Server → Response → Renderer รวมถึงแนวคิด service worker, proxy, cache และ connection reuse

#### Challenge

แบบทดสอบประจำแต่ละ stage มี Guided และ Expert mode คะแนนจะถูกเก็บไว้ใน local storage และกลับมาใช้งานต่อได้เมื่อเปิดหน้าเดิมใน browser เดิม

### Inspector

Inspector แบ่งเป็นสามแท็บ:

- Overview — คำอธิบายตามระดับความรู้ ลำดับ step-by-step และ key concepts
- Technical — รายละเอียดที่แม่นยำขึ้น รวมถึง request/response comparison
- Raw — representative HTTP request และ response

Explanation mode มีสามระดับ:

- Beginner — ใช้ภาษาง่าย หลีกเลี่ยง jargon ที่ไม่จำเป็น
- Developer — ใช้คำศัพท์มาตรฐานและอธิบาย flow ที่นักพัฒนาพบทั่วไป
- Deep Dive — เพิ่ม caching, negotiation, connection reuse, HTTP semantics และ rendering invalidation

### Network profiles

| Profile | Use case | Relative behavior |
| --- | --- | --- |
| Fast | Wired/low-latency connection | เร็วกว่าค่าฐาน |
| 4G | Typical mobile connection | ค่าฐานของ simulation |
| Slow 4G | Congested mobile network | DNS/TCP/TLS/server ช้าลง |
| 3G | High latency mobile network | latency สูงตลอด journey |
| Offline | No connectivity | หยุดที่ DNS stage |
| Custom | User-defined multiplier | ปรับ latency 0.5×–4× |

ตัวเลขทั้งหมดมีป้ายกำกับว่า simulated และมีไว้เพื่อเปรียบเทียบ ไม่ใช่ benchmark ของเครือข่ายจริง

### First visit vs repeat visit

First visit จำลองการทำงานครบทุก stage ส่วน Repeat/Cached visit ลดเวลาของ DNS, connection setup และ resource transfer เพื่อสื่อถึง:

- DNS cache
- connection reuse
- TLS session resumption
- HTTP cache
- previously downloaded static assets

การใช้ cache จริงยังขึ้นกับ response headers, validation, browser state และ service worker

### HTTP versions

- HTTP/1.1 — แสดง request/response แบบข้อความและใช้ TCP + TLS teaching path
- HTTP/2 — ใช้ semantics เดิม แต่สื่อถึง multiplexing และการ reuse connection
- HTTP/3 — แสดง QUIC + TLS 1.3 แทนการตีความว่าเป็น TCP handshake ปกติ

UI ยังคง stage TCP/TLS ไว้เพื่อให้ timeline เปรียบเทียบได้ แต่ label และ timing จะเปลี่ยนเป็น QUIC concepts เมื่อเลือก HTTP/3

## Simulation model

State machine อยู่ใน `simulation/engine.ts` และไม่ผูกกับ React components โดยตรง

```text
READY
  │ RUN
  ▼
RUNNING ── PAUSE ──► PAUSED
  │                     │
  │◄────── RESUME ──────┘
  │
  ├── stage complete ──► next stage
  ├── configured failure ──► ERROR
  └── final stage ──► COMPLETED
```

Reducer actions:

- `START` — เริ่ม journey พร้อม snapshot ของ settings
- `TICK` — เพิ่ม elapsed/progress และตัดสิน stage transition
- `TOGGLE_PAUSE` — pause หรือ resume
- `SELECT_STAGE` — เปลี่ยนเนื้อหา Inspector โดยไม่เปลี่ยน simulation
- `JUMP_STAGE` — เลื่อน simulation ไป stage ก่อนหน้าหรือถัดไป
- `SET_PROGRESS` — scrub progress ภายใน stage
- `REPLAY` — เริ่มใหม่โดยคง scenario ปัจจุบัน
- `RESET` — กลับสู่ default URL และ ready state

Settings ถูก snapshot ตอนกด Run เพื่อไม่ให้การเปลี่ยน setting ระหว่างทางทำให้ state machine มีค่าผสมกัน

## Network and protocol behavior

### DNS

แสดง resolver และ simulated IP/TTL ใน first visit ส่วน repeat visit แสดง cache reuse ระบบไม่ได้อ้างว่าทุก request ต้องผ่าน root, TLD และ authoritative server ทุกครั้ง

### TCP and QUIC

TCP mode แสดง SYN → SYN-ACK → ACK ส่วน HTTP/3 เปลี่ยน label เป็น QUIC Initial/Handshake และลดเวลาของ TCP/TLS teaching stages

### TLS

HTTPS แสดง ClientHello, ServerHello, certificate และ key establishment แบบย่อ HTTP URL จะข้าม TLS พร้อมคำอธิบายชัดเจน

### HTTP

ผู้ใช้เปลี่ยน method, response status และ content type ได้ Request/response ที่แสดงเป็น representative HTTP semantics ไม่ได้ถอดข้อมูลจากเว็บไซต์จริง

### Rendering

Rendering view อธิบาย:

```text
HTML → DOM
CSS  → CSSOM
DOM + CSSOM → Render Tree
Render Tree → Layout → Paint → Composite
```

DOM/CSSOM trees และ browser preview เป็น conceptual data ไม่ใช่ DOM ของ URL ภายนอก

## Failure and recovery scenarios

| Scenario | Stops at | Meaning |
| --- | --- | --- |
| DNS failure | DNS | Hostname could not be resolved |
| Connection timeout | TCP | Connection setup did not complete |
| TLS error | TLS | Certificate or secure key establishment failed |
| 404 Not Found | HTTP response | Server is reachable but resource does not exist |
| 500 Server Error | HTTP response | Server encountered an unexpected condition |
| Slow server | No hard stop | HTTP response duration is increased |
| CORS blocked | HTTP response | Browser refuses to expose the cross-origin response to script |
| HTTP → HTTPS redirect | No hard stop | Response is represented as a redirect chain |
| Offline | DNS | No network connectivity is available |

เมื่อ simulation ล้มเหลว UI จะแสดง stage ที่ล้มเหลว พร้อม Retry และ Clear failure การ clear failure จะเริ่ม journey ใหม่ด้วย URL/settings เดิมแต่ไม่มี failure

## Learning tools

### Resource waterfall

Waterfall แสดง document, stylesheet, JavaScript, font, image และ data requests ที่เริ่มซ้อนกัน โดยแถบสีเขียวหมายถึง cache reuse ผู้ใช้สามารถนำเข้า HAR เพื่อใช้รายการและเวลาในไฟล์แทนข้อมูลตัวอย่าง

### Completion summary

Summary แสดง total simulated time, DNS, transport, server และ rendering พร้อมระบุ QUIC เมื่อเลือก HTTP/3

### Scenario comparison

Compare view เปรียบเทียบ first visit และ repeat visit เพื่อแสดงผลของ caching และ connection reuse

### Presets

- Normal HTTPS
- First visit on 3G
- Cached repeat visit
- DNS failure
- Redirect to HTTPS
- HTTP/3 over QUIC

Preset เปลี่ยน settings ให้พร้อมทดลอง แต่ไม่เริ่ม simulation โดยอัตโนมัติ ผู้ใช้ยังสามารถตรวจ URL และกด Run เองได้

### Glossary

รวบรวมคำสำคัญ เช่น resolver, authoritative DNS, TTL, TLS, DOM, CSSOM, QUIC และ CORS

### Guided onboarding

ผู้ใช้ใหม่จะเห็น onboarding สามขั้นตอน เมื่อจบหรือข้าม ระบบบันทึก `url-journey-onboarded=1` ใน local storage และไม่แสดงซ้ำบน browser เดิม

### Presentation mode

ซ่อน header, URL form, settings, Inspector และ advanced tools เพื่อให้ simulation/architecture/challenge ใช้พื้นที่เต็มหน้าจอ เหมาะสำหรับห้องเรียนหรือการนำเสนอ

### Languages

ปุ่ม EN/TH เปลี่ยนข้อความหลักของ workspace ระหว่างภาษาอังกฤษและภาษาไทย เนื้อหา technical ดั้งเดิมยังคงภาษาอังกฤษเพื่อรักษาคำศัพท์มาตรฐานของระบบเว็บ

## HAR import and exports

### HAR import

รองรับไฟล์ `.har` หรือ JSON ที่มี `log.entries` ตามรูปแบบ HAR ระบบจะ:

1. อ่านไฟล์ใน browser ด้วย `File.text()`
2. parse เป็น `unknown`
3. ตรวจรูปแบบก่อนใช้ข้อมูล
4. จำกัด 20 entries แรกเพื่อควบคุม UI/performance
5. ใช้ URL และ duration เพื่อสร้าง waterfall ภายในเครื่อง

ไฟล์จะไม่ถูก upload หรือบันทึกลง server

### Export JSON

บันทึก URL, network profile, visit mode, HTTP version, elapsed time และ waterfall resources เป็น `url-journey.json`

### Export SVG

สร้างภาพสรุปแบบ standalone SVG ที่มี URL และ waterfall bars ดาวน์โหลดเป็น `url-journey.svg` โดยไม่ใช้ screenshot API

## Shareable scenarios

ปุ่ม Share เขียน settings ลง query string และคัดลอก URL เช่น:

```text
?u=https%3A%2F%2Fexample.com
&profile=slow-4g
&error=redirect
&mode=deep-dive
&view=architecture
&method=GET
&status=301
&type=text%2Fhtml
&http=http-3
&visit=repeat
```

หาก Clipboard API ใช้ไม่ได้ ระบบจะแสดง dialog ที่ให้คัดลอก URL เอง

Supported parameters:

| Parameter | Values |
| --- | --- |
| `u` | HTTP/HTTPS URL |
| `profile` | `fast`, `4g`, `slow-4g`, `3g`, `offline`, `custom` |
| `error` | scenario IDs listed above |
| `mode` | `beginner`, `developer`, `deep-dive` |
| `view` | `simulation`, `architecture`, `challenge` |
| `method` | `GET`, `HEAD`, `POST` |
| `status` | 100–599 |
| `type` | representative MIME type |
| `http` | `http-1.1`, `http-2`, `http-3` |
| `visit` | `first`, `repeat` |
| `latency` | 0.5–4 for custom profile |

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Pause / resume |
| `R` | Replay current journey |
| `Esc` | Reset URL and simulation |
| `←` / `→` | Inspect previous / next stage |

Shortcuts ถูกระงับเมื่อ focus อยู่ใน input, textarea หรือ combobox เพื่อไม่รบกวนการพิมพ์

## Installation

### Requirements

- Node.js 22.13 หรือใหม่กว่า
- npm 10 หรือใหม่กว่า

### Development

```bash
npm install
npm run dev
```

Development server ใช้ `http://localhost:3000` ตามค่าเริ่มต้นของ Next.js

### Type checking

```bash
npx tsc --noEmit
```

โปรเจ็กต์เปิด `strict: true` และ source ของ URL Journey ไม่ใช้ `any`

### Production build

```bash
npm run build
npm run start
```

Next.js จะสร้าง optimized production output ไว้ใน `.next/` ซึ่ง Vercel ใช้ผ่าน Next.js integration โดยอัตโนมัติ

## Project architecture

```text
app/
  page.tsx                    Workspace orchestration and URL state
  globals.css                 Theme tokens, grid background, motion policy
  layout.tsx                  Metadata and document shell

components/simulation/
  advanced-tools.tsx          Waterfall, summary, compare, presets, HAR, export
  architecture-view.tsx       Browser/network/server architecture map
  challenge-panel.tsx         Persistent guided/expert quizzes
  inspector.tsx               Overview, technical and raw stage details
  journey-controls.tsx        Step, scrubber and speed controls
  onboarding.tsx              First-run guided tour
  settings-panel.tsx          Network, protocol, visit and custom scenario setup
  simulation-canvas.tsx       Stage-specific animated SVG/HTML visualization
  stage-timeline.tsx          Grouped stage status and navigation
  url-segments.tsx            Interactive parsed URL tokens

data/
  challenges.ts               Questions, answers and explanations
  explanations.ts             Three explanation-depth datasets
  glossary.ts                 Technical term definitions
  presets.ts                  Ready-to-use journey configurations

simulation/
  engine.ts                   Pure reducer/state machine
  network.ts                  Profiles, timing values and lookup helpers
  scenarios.ts                Failure definitions and failure-stage mapping
  stages.ts                   Ordered stage metadata and base durations

lib/
  url-parser.ts               URL normalization and strict parsing
  utils.ts                    Shared UI utility

types/
  simulation.ts               Domain types and reducer actions
  webmcp.d.ts                 Browser WebMCP declarations
```

### Component boundaries

- `app/page.tsx` เชื่อม state machine กับ UI และ browser capabilities
- `simulation/*` ไม่มี dependency กับ React
- `data/*` เก็บ educational content แยกจาก transition logic
- visualization components รับ typed props และไม่กำหนดลำดับ stage เอง
- UI primitives ใน `components/ui/*` ไม่ถูกแก้ไขเพื่อรองรับ feature เฉพาะ

## Type system

Domain types แยกชัดเจนสำหรับ:

- URL information
- simulation stages and actions
- network profiles
- error scenarios
- HTTP methods and versions
- visit/cache modes
- waterfall resources
- challenge records
- shareable presets

Data จาก HAR ถูก parse เป็น `unknown` และผ่าน runtime checks ก่อนเปลี่ยนเป็น `WaterfallResource[]`

## Accessibility and responsive behavior

- Semantic buttons, labels และ navigation landmarks
- Visible focus rings
- ARIA labels สำหรับ icon-only controls และ sliders
- Status แสดงด้วยข้อความ ไม่พึ่งสีเพียงอย่างเดียว
- `prefers-reduced-motion` ลด animation duration และ packet motion
- Main labels ใช้ 14px ขึ้นไป และ metadata ใช้ขั้นต่ำ 12px
- Timeline เลื่อนแนวนอนได้บนจอเล็ก
- Control dock เป็น sticky บน mobile เพื่อให้ Pause/Previous/Next อยู่ใกล้นิ้ว
- Layout เปลี่ยนจาก multi-panel เป็น stacked layout บน viewport แคบ
- Touch targets ของ primary controls มีขนาดประมาณ 40–48px

## Security and privacy

- URL input ไม่ถูก fetch
- ไม่มี arbitrary server-side request
- HAR อ่านใน browser และไม่ upload
- Share URLs มีเฉพาะค่าที่ผู้ใช้ตั้ง ไม่รวมไฟล์ HAR
- ไม่มี credentials, cookies หรือ tokens ใน exported JSON/SVG
- Challenge และ onboarding state ใช้ local storage เท่านั้น
- Clipboard failure มี manual-copy fallback

## Accuracy and limitations

URL Journey เป็น educational abstraction ดังนั้น:

- Browser อาจใช้ DNS cache หรือ secure DNS และไม่เรียกทุก DNS layer
- Connection เดิมอาจถูก reuse ทำให้ไม่มี TCP/TLS handshake ใหม่
- HTTP/2 และ HTTP/3 มี wire format ที่ไม่เหมือน textual HTTP/1.1
- HTTP/3 ใช้ QUIC และรวม transport security ต่างจาก TCP + TLS visualization
- Server อาจใช้ CDN, proxy, edge compute, queue, microservices หรือ architecture แบบอื่น
- DOM, CSSOM และ render tree จริงซับซ้อนกว่าตัวอย่าง
- Browser สามารถ overlap parsing, preload, fetch, style, layout และ paint
- Page rendered ไม่ได้หมายความว่าทุก script, image, font หรือ data request เสร็จแล้ว
- Simulated timings ไม่ใช่ Web Vitals หรือผล benchmark

## Testing checklist

### URL

- HTTPS URL with path/query/fragment
- HTTP URL skips TLS
- localhost and explicit port
- bracketed IPv6 URL
- invalid/non-HTTP scheme

### Simulation

- Run, pause, resume and replay
- Previous/next stage and scrubber
- 0.5×, 1×, 1.5× and 2× speed
- Completed and failed states
- Retry and clear failure

### Scenarios

- Every network profile
- First and repeat visits
- HTTP/1.1, HTTP/2 and HTTP/3
- Every failure/redirect scenario
- Custom response and content type

### Learning tools

- Explanation modes
- Challenge score persistence
- Preset application
- Valid and invalid HAR import
- JSON/SVG exports
- Share URL hydration and clipboard fallback
- EN/TH UI toggle
- Presentation mode

### Quality gates

```bash
npx tsc --noEmit
npm run build
```

ตรวจ route หลักและ representative query URL หลัง build ทุกครั้ง
