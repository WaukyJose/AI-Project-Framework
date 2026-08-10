# Part 1 Question Bank Audit — Cambridge B2 Speaking

**Audit Type:** Discovery & Analysis (Read-Only)  
**Audit Date:** 2026-08-05  
**Auditor:** Task 5.1.4 (Backend Authority Verification)  
**Documents Reviewed:**
- `SPRINT_5_1_BACKEND_IMPLEMENTATION_PLAN.md`
- `MOBILE_CONVERSATION_API_SPECIFICATION.md`
- `PART1_AUDIO_API_SPECIFICATION.md`
- `PART1_TRANSPORT_AUTHORITY.md`

---

## 1. Executive Summary

The OpenVoz Django backend already contains an authoritative Cambridge B2 Speaking Part 1 question bank. It is **embedded as a Python module-level dictionary** in `chat/views.py` at line 153. The bank contains **9 topics** with approximately **81 questions**. The same module also provides the retrieval function `get_random_question()` used by the web conversation flow.

**No extraction has been performed yet.** The question bank and retrieval logic are tightly coupled to the web `chat_view()` function, making them unusable by the mobile API without extraction.

**Verdict: The existing question bank SHOULD be extracted into a shared `Part1QuestionService` component.**

---

## 2. Location of All Question Sources

### 2.1 Primary: B2 Speaking Part 1

| Attribute | Value |
|---|---|
| **File** | `chat/views.py` |
| **Variable** | `questions["B2_Speaking_Part_1"]` |
| **Line** | 153 |
| **Type** | Module-level `dict` |
| **Topics** | 9 |
| **Total Questions** | ~81 |

**Topic Breakdown:**

| # | Topic | Sample Question |
|---|---|---|
| 1 | FAMILY and FRIENDS | "Tell me about your family." / "What does your father do?" |
| 2 | SCHOOL and WORK | "What is your favourite subject at school?" / "Would you prefer to work for a big or small company?" |
| 3 | TRAVELS and HOLIDAYS | "Where would you most like to go on holiday?" / "Do you prefer traveling by train or plane?" |
| 4 | DAILY LIFE | "Tell me about an activity you've really enjoyed recently." / "What kind of food do you prefer?" |
| 5 | THE PLACE YOU LIVE IN AND HOME COUNTRY | "Tell me about your neighbourhood." / "Describe to me your family home." |
| 6 | THE THINGS YOU DO FOR FUN OR ENTERTAINMENT | "Do you ever go to concerts?" / "Tell me about your favorite types of movies." |
| 7 | FREE TIME | "Do you like to spend your free time indoors or outdoors?" / "What are your hobbies?" |
| 8 | THE IMPORTANCE OF SPORTS IN YOUR LIFE | "Do you like to watch sports?" / "How important is sports to you?" |
| 9 | THE FUTURE | "How do you think technology will change our lives?" / "What are you going to do after completing your studies?" |

### 2.2 Retrieval Function: `get_random_question()`

| Attribute | Value |
|---|---|
| **File** | `chat/views.py` |
| **Line** | 260 |
| **Signature** | `get_random_question(category: str, state: dict) -> (str, dict)` |
| **Behavior** | Selects random topic from unseen topics, then random question from that topic; cycles when all exhausted |
| **State mutation** | Tracks `asked_topics` in the state dict |

### 2.3 All Other Question Sources in the Project

| Level | File | Variable | Line | Type | Parts Covered |
|---|---|---|---|---|---|
| **B2** | `chat/views.py` | `questions` | 153 | `dict` nested by category | Part 1 |
| **B2** | `chat/views.py` | `photos_part2` | 485 | `list[dict]` | Part 2 (photo metadata) |
| **B2** | `chat/views.py` | `photos_part3` | 716 | `list[dict]` | Part 3 (photo metadata) |
| **B2** | `chat/views.py` | `part4_questions` | 968 | `dict` image-keyed | Part 4 (discussion) |
| **B2** | `chat/views.py` | `part4_questions` | **1112** | `dict` image-keyed | **DUPLICATE of line 968** |
| **B1** | `chat/b1_views.py` | `b1_questions` | 32 | `dict` nested by category | Part 1 |
| **B1** | `chat/b1_views.py` | `part4_questions_b1` | 884 | `dict` image-keyed | Part 4 |
| **A2** | `chat/a2_views.py` | `a2_questions` | 40 | `dict` nested by category | Part 1 |
| **A2** | `chat/a2f_views.py` | `a2f_questions_part4` | 1705 | `dict` nested | Part 4 |
| **A1 Movers** | `chat/a1m_views.py` | `a1m_questions_part4` | 1088 | `dict` nested | Part 4 |
| **A1 Starters** | `chat/a1s_views.py` | *(embedded in view logic, not separate constant)* | — | inline | Part 1–4 |

### 2.4 Storage Format Summary

All question banks are **Python module-level constants** — either `dict` (topic → questions) or `list[dict]` (photo metadata). No JSON fixtures, YAML files, database models, or external file repositories exist.

---

## 3. Current Architecture

### 3.1 Retrieval Flow (Web Part 1)

```
Browser POST /chat/
  ↓
chat_view() [chat/views.py ~line 270]
  ↓
get_random_question(category="B2_Speaking_Part_1", state)
  ↓
questions["B2_Speaking_Part_1"]  ← module-level dict (line 153)
  ↓
random.choice(topic_questions)
```

### 3.2 Callers of `get_random_question`

| Caller | Lines in `chat/views.py` |
|---|---|
| `chat_view()` — greeting flow | 318 |
| `chat_view()` — follow-up consumed → next topic | 352 |
| `chat_view()` — clarification attempted → next topic | 371 |

### 3.3 Test Patches

| Test File | Number of Patches |
|---|---|
| `chat/tests_chat_pilot.py` | 3 (lines 53, 183, 223) |
| `chat/tests_part1_clarification_handler.py` | 1 (line 106) |
| `chat/tests_part1_session_controller.py` | 3 (lines 24, 66, 166, 185) |

All tests mock `chat.views.get_random_question` — meaning the function is import-pinned to `chat.views`, not a service module.

---

## 4. Authority Chain

```
questions["B2_Speaking_Part_1"]              ← Authority for Part 1 question content
  ↓
get_random_question(category, state)          ← Authority for topic cycling + selection
  ↓
chat_view() [chat/views.py]                   ← Web consumer (only consumer today)
  ↓
Browser                                      ← Client
```

The **single source of truth** for B2 Part 1 questions is the `questions` dict at `chat/views.py:153`. There is no duplication of Part 1 questions across files.

---

## 5. Reuse Assessment

### 5.1 What CAN Be Reused Directly

| Component | Reusable? | Reason |
|---|---|---|
| Question content (9 topics, ~81 questions) | ✅ Yes | Pure data, no dependencies |
| Topic cycling logic (`asked_topics` tracking) | ✅ Yes | Simple state manipulation |
| Random selection logic | ✅ Yes | `random.choice()` is standard Python |

### 5.2 What CANNOT Be Reused Directly

| Component | Reusable? | Reason |
|---|---|---|
| `get_random_question()` signature | ⚠️ Needs adaptation | Takes `state: dict` (web session format); mobile needs its own state model |
| Import path `chat.views` | ❌ No | Mobile views should not import from web views; creates circular dependency risk |
| Return format `(question_text, state_dict)` | ⚠️ Needs wrapping | Mobile needs `(question_text, topic_name)` or similar |

### 5.3 Gap Analysis

| Gap | Description |
|---|---|
| No `Part1QuestionService` exists | Questions are embedded in a views file |
| No `get_first_question()` exists | The greeting is assembled inline in `chat_view()` |
| No `get_next_topic()` exists | Topic transition is inline logic |
| No topic-name exposure | `get_random_question()` returns only the question text, not the topic |
| No structured output | Raw string; no metadata (topic, difficulty, etc.) |
| No mobile-friendly API | Web session dict is the only state format |

---

## 6. Dependencies

### 6.1 Inbound Dependencies (what depends on the question bank)

| File | Dependency |
|---|---|
| `chat/views.py:318,352,371` | Direct call to `get_random_question()` |
| `chat/tests_chat_pilot.py` | Patches `chat.views.get_random_question` |
| `chat/tests_part1_clarification_handler.py` | Patches `chat.views.get_random_question` |
| `chat/tests_part1_session_controller.py` | Patches `chat.views.get_random_question` |

### 6.2 Outbound Dependencies (what the question bank depends on)

| Dependency | Type |
|---|---|
| `random` (stdlib) | `random.choice()` for selection |
| None else | Pure data + stdlib |

---

## 7. Files Involved

### 7.1 Files That WOULD Be Created (by Task 5.1.4 extraction)

| File | Purpose |
|---|---|
| `chat/services/part1_question_service.py` | Extracted `Part1QuestionService` with `get_first_question()`, `get_next_topic()` |

### 7.2 Files That WOULD Be Modified (by Task 5.1.4 extraction)

| File | Change |
|---|---|
| `chat/views.py` | Replace inline `questions["B2_Speaking_Part_1"]` + `get_random_question()` with import from service |
| `chat/tests_chat_pilot.py` | Update 3 patches from `chat.views.get_random_question` → `chat.services.part1_question_service` |
| `chat/tests_part1_clarification_handler.py` | Update 1 patch |
| `chat/tests_part1_session_controller.py` | Update 3 patches |

### 7.3 Files That Remain Unchanged

| File | Status |
|---|---|
| `chat/b1_views.py` | Separate B1 question bank — not in scope |
| `chat/a2_views.py` | Separate A2 question bank — not in scope |
| `chat/a1m_views.py` | Separate A1M question bank — not in scope |
| `chat/a1s_views.py` | Separate A1S question bank — not in scope |
| `chat/a2f_views.py` | Separate A2F question bank — not in scope |

---

## 8. Potential Refactoring Required

### 8.1 Duplication Identified

**Part 4 questions are duplicated** in `chat/views.py`:

| Location | Lines | Content |
|---|---|---|
| `get_questions_part4()` | 968–1044 | `part4_questions` dict (10 image entries) |
| `get_part4_questions()` | 1112–1188 | **Identical `part4_questions` dict** (same 10 entries) |

These are two separate functions with the same data. Both are used:

- `get_questions_part4(request)` — URL endpoint: `GET /get-questions-part4/` (line 959)
- `get_part4_questions(image_name)` — helper for `b2_speaking_part4()` view (line 1108)

**Recommendation for Task 5.1.4:** Extract the single `part4_questions` dict to a shared constant and import in both functions. However, this is **out of scope for mobile Part 1** and should be a separate cleanup task.

### 8.2 Imports That Will Change

```
Before (web views.py):
  questions["B2_Speaking_Part_1"]  # inline dict
  def get_random_question(category, state): ...  # inline function

After (extracted):
  from chat.services.part1_question_service import (
      get_random_question,  # or get_next_topic
      get_first_question,
  )
```

### 8.3 Test Patch Updates Required

All existing tests patch `chat.views.get_random_question`. After extraction, patches must target `chat.services.part1_question_service.get_random_question` (or the equivalent function). **7 test patches** across 3 test files need updating.

---

## 9. Recommendation

### Recommendation B: Extract existing implementation into a shared `Part1QuestionService`

**Reasoning:**

1. **Questions are pure data** — no business logic, no I/O, no external dependencies. Extraction is low-risk.
2. **Web views currently own the bank** — `chat/views.py` is a 1,235-line file mixing 6 exam levels. Extraction reduces coupling.
3. **`get_random_question()` is called from 3 places in the same file** — a service boundary already exists conceptually; it just needs a module.
4. **Mobile API needs the same questions** — and the same topic-cycling logic — but through a different interface (`get_first_question()`, `get_next_topic()`).
5. **Part 4 duplication is a pre-existing problem** — extracting Part 1 questions now establishes the pattern for future Part 2–4 extraction.
6. **Zero changes to question content** — the service wraps the existing dict; no rewrites.
7. **Test patches are mechanical** — updating 7 `@patch` decorators is trivial and well-understood.

**Alternative A (reuse directly):** Not viable. Would require mobile views to import from `chat.views`, creating circular dependencies and violating separation of concerns.

**Alternative C (redesign):** Not justified. The existing question bank is well-structured, topic-organized, and complete. No redesign needed.

---

## 10. Final Verdict

### ✅ Existing question bank CAN be reused as the authoritative source.

However, it **must be extracted** from `chat/views.py` into a shared `chat/services/part1_question_service.py` module before mobile endpoints can consume it.

---

## 11. Task 5.1.5 Guidance

**Task 5.1.5 should extract the existing implementation**, not create a new one.

The extraction should:

1. Create `chat/services/part1_question_service.py`
2. Move `questions["B2_Speaking_Part_1"]` (the dict, not the full `questions` dict) as a module-level `PART1_QUESTIONS` constant
3. Move and adapt `get_random_question()` into the service
4. Add `get_first_question()` — returns the greeting question without needing `asked_topics` state
5. Add `get_next_topic()` — returns (question_text, topic_name) for mobile session state integration
6. Update `chat/views.py` to import from the service instead of using the inline dict
7. Update all 7 test patches to target the new module

**Effort:** 2 hours (per SPRINT_5_1_BACKEND_IMPLEMENTATION_PLAN.md § Task 5.1.4)

---

*Audit completed: 2026-08-05*
*Auditor: Task 5.1.4 (Backend Authority Verification)*
*Next Phase: Task 5.1.5 — Extract Part 1 Question Bank*
