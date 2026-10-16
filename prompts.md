# MoneyXhange - User Prompts History

This document collates all prompts received and executed for the project.

---

### Prompt 1: Initial Application Build
**Timestamp:** 2026-10-15T20:46:42-07:00

```text
1. build a singapore-based exchange rate tool that provides real time currency conversions for the SGD against global currencies
2. build just the front end for now. I will add the back end inegration using MAS API keys later. Use a clean UI with search.
```

---

### Prompt 2: Bug Fix (RangeError)
**Timestamp:** 2026-10-15T20:52:57-07:00

```text
Fix the errors in the app
[AIS_METADATA_SECTION_START]
fix_it_trigger: manual
error 0: RangeError: maximumFractionDigits value is out of range.
    at Number.toLocaleString (<anonymous>)
    at https://ais-dev-gld2sdiqa65d2pxgwgly6j-379933766788.asia-northeast1.run.app/src/components/RatesTable.tsx:542:31
    at Array.map (<anonymous>)
    at RatesTable (https://ais-dev-gld2sdiqa65d2pxgwgly6j-379933766788.asia-northeast1.run.app/src/components/RatesTable.tsx:430:36)
    at Object.react_stack_bottom_frame (https://ais-dev-gld2sdiqa65d2pxgwgly6j-379933766788.asia-northeast1.run.app/node_modules/.vite/deps/react-dom_client.js?v=dd0eb03b:14141:12)
    at renderWithHooks (https://ais-dev-gld2sdiqa65d2pxgwgly6j-379933766788.asia-northeast1.run.app/node_modules/.vite/deps/react-dom_client.js?v=dd0eb03b:4399:19)
    at updateFunctionComponent (https://ais-dev-gld2sdiqa65d2pxgwgly6j-379933766788.asia-northeast1.run.app/node_modules/.vite/deps/react-dom_client.js?v=dd0eb03b:5774:16)
    at beginWork (https://ais-dev-gld2sdiqa65d2pxgwgly6j-379933766788.asia-northeast1.run.app/node_modules/.vite/deps/react-dom_client.js?v=dd0eb03b:6390:20)
    at runWithFiberInDEV (https://ais-dev-gld2sdiqa65d2pxgwgly6j-379933766788.asia-northeast1.run.app/node_modules/.vite/deps/react-dom_client.js?v=dd0eb03b:943:66)
    at performUnitOfWork (https://ais-dev-gld2sdiqa65d2pxgwgly6j-379933766788.asia-northeast1.run.app/node_modules/.vite/deps/react-dom_client.js?v=dd0eb03b:9147:92)
[AIS_METADATA_SECTION_END]
```

---

### Prompt 3: Site Rebranding
**Timestamp:** 2026-10-15T20:55:45-07:00

```text
call this site MoneyXhange
```

---

### Prompt 4: Git Push to GitHub
**Timestamp:** 2026-10-15T20:57:13-07:00

```text
Git push <GITHUB_TOKEN>@https://github.com/fidodido2024/haze-watch.git
```

---

### Prompt 5: Serverless MAS Connection & Route Integration
**Timestamp:** 2026-10-15T20:59:22-07:00

```text
add a serverless connection that pulls live data from MAS using
the following endpoints:

1. GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14
# KeyId: <MAS_KEY_ID>

1. store this in /api folder in the project root level, NOT the src folder
2. include /health.ts and /exchangerates.ts within the same subfolder
3. do not hardcode any API key, I will include them later
4. collate all the prompts that you have ran so far and store it in a prompts.md
```
