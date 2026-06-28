
# OctoLearn — UI Flow Diagram

```mermaid
flowchart TD
    A([Visitor]) --> B[Landing Page\n/]
    B --> C{Authenticated?}
    C -- No --> D[Sign Up / Sign In\n/sign-up  /sign-in]
    C -- Yes --> E
    D --> E[Dashboard\n/dashboard]

    E --> F[Stats Row\nTotal quizzes · Avg score · Streak]
    E --> G[Subject Areas Grid\nOne card per area]
    E --> H[Recent Activity\nLast 5 sessions]
    E --> I[New Quiz button]
    E --> NAV[Bottom Nav / Sidebar]

    I --> J[Quiz Setup\n/quiz/new]
    J --> J1[Type subject area]
    J1 --> J2[AI suggests topics]
    J2 --> J3[Pick / adjust topics\n+ question count]
    J3 --> J4[Start Quiz]

    J4 --> K[Active Quiz Session\n/quiz/id]
    K --> L{Question type}

    L -- Multiple Choice --> M[Show 4 options]
    M --> N{Correct?}
    N -- Yes --> R
    N -- No, attempt 1 --> O1[AI hint shown]
    O1 --> M
    N -- No, attempt 2 --> O2[Second AI hint]
    O2 --> M
    N -- No, attempt 3 --> O3[Full explanation\n+ streaming deep-dive]
    O3 --> R

    L -- Descriptive --> P[Open text answer]
    P --> Q{AI evaluation\nscore ≥ 0.5?}
    Q -- Correct → R
    Q -- Wrong, attempt < 3 --> P2[AI feedback]
    P2 --> P
    Q -- Wrong, attempt 3 --> P3[Full explanation]
    P3 --> R

    R{More questions?}
    R -- Yes --> K
    R -- No → S[Finish Quiz]

    S --> T[Report Page\n/quiz/id/report]
    T --> T1[Score Hero\n% · correct · duration]
    T --> T2[Areas to Review\nstruggled questions]
    T --> T3[Learning Resume\nAI-written summary]
    T --> T4[References\nfree · freemium · paid]
    T --> T5[Question Breakdown\nall Q&A]
    T --> T6[Export Bar]

    T6 --> EX1[Download PDF]
    T6 --> EX2[Save to Notion]
    EX2 -- Not connected --> SET[Settings\n/settings]
    SET --> SET1[Connect Notion OAuth]
    SET1 --> EX2

    NAV --> RPT[Reports\n/reports]
    RPT --> RPT1[All past reports\nfilter by area]
    RPT1 --> T

    NAV --> SET
```
