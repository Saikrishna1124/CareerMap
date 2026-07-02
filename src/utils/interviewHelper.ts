/**
 * Helper to dynamically generate a highly tailored, technically precise suggested answer
 * for interview simulator questions when no specific suggested answer is returned
 * or when the user encounters cached/generic fallbacks.
 */
export function getDynamicSuggestedAnswer(qText: string, currentSuggested?: string): string {
    const normalized = (currentSuggested || "").trim();
    const qLower = (qText || "").toLowerCase();

    // If we already have a robust, non-generic suggested answer, keep it
    const isGeneric =
        !normalized ||
        normalized.length < 15 ||
        normalized.includes("An ideal response should detail specific experiences") ||
        normalized.includes("Provide a structured explanation. Start with the core definition") ||
        normalized.includes("For a great simple response, clearly state your main approach") ||
        normalized.toLowerCase() === "code solution" ||
        normalized.toLowerCase() === "industry standard solution:";

    if (!isGeneric) {
        return normalized;
    }

    // --- Dynamic Category-Specific Intelligence ---

    // 1. React / Frontend / UI / DOM / Rendering
    if (
        qLower.includes("react") ||
        qLower.includes("component") ||
        qLower.includes("hook") ||
        qLower.includes("state management") ||
        qLower.includes("props") ||
        qLower.includes("virtual dom") ||
        qLower.includes("useeffect") ||
        qLower.includes("context api") ||
        qLower.includes("redux") ||
        qLower.includes("frontend") ||
        qLower.includes("next.js")
    ) {
        return "An ideal response should explain:\n" +
            "1. Virtual DOM Optimization: React runs lightweight memory reconciles to batch state changes before updating the browser's heavy real DOM nodes.\n" +
            "2. State & Side Effects Isolation: React uses standard hooks. Declare reactive values with `useState`, decouple external operations in `useEffect` with rigid dependency limits, and memoize computational branches via `useMemo`.\n" +
            "3. Decoupled Context Architecture: Avoid messy multi-level 'prop-drilling'. Share session state cleanly using a dedicated Context Provider, or leverage highly responsive store engines (such as Zustand, Jotai, or Redux Toolkit).";
    }

    // 2. Git / Version Control / Workflows
    if (
        qLower.includes("git") ||
        qLower.includes("version control") ||
        qLower.includes("commit") ||
        qLower.includes("branch") ||
        qLower.includes("merge") ||
        qLower.includes("rebase") ||
        qLower.includes("repo") ||
        qLower.includes("pull request") ||
        qLower.includes("conflict")
    ) {
        return "An ideal response should cover:\n" +
            "1. Iterative Commit Trackers: Git catalogs atomic, logical modifications. Developers should author descriptive commit messages following trunk conventions (e.g. 'feat(api): authorize JWT validation').\n" +
            "2. History Linearization: Merging preserves chronological branch paths but creates complex junction trees. Rebasing rewrites the feature commits on top of main, creating a clean linear timeline.\n" +
            "3. Workflow Gatekeepers: Use trunk-based guidelines or git-flow. Protect the master trunk using strict policies requiring automated CI pipeline testing and peer approvals on Pull Requests (PRs).";
    }

    // 3. Databases / SQL / NoSQL / Performance / Querying
    if (
        qLower.includes("database") ||
        qLower.includes("sql") ||
        qLower.includes("nosql") ||
        qLower.includes("query") ||
        qLower.includes("schema") ||
        qLower.includes("index") ||
        qLower.includes("join") ||
        qLower.includes("postgres") ||
        qLower.includes("mongodb") ||
        qLower.includes("orm")
    ) {
        return "An ideal response should detail:\n" +
            "1. Schema Paradigm Tradeoffs: Relational engines (like PostgreSQL) employ strict schemas securing normalization and ACID transactional guarantees. NoSQL (like MongoDB) scales horizontally with nested document flexibility.\n" +
            "2. Targeted Indexing: Speed up searches by defining B-Tree indexes on commonly filtered columns (e.g., active foreign keys). Avoid over-indexing, which slows down write/update actions.\n" +
            "3. Bottleneck Diagnostics: Run `EXPLAIN ANALYZE` commands on slow queries to locate seq-scans. Eliminate nested loops by converting them into efficient hash joins and optimizing ORM query hydration.";
    }

    // 4. Code Standards / Quality / SOLID / Maintainability / Testing
    if (
        qLower.includes("maintain") ||
        qLower.includes("clean code") ||
        qLower.includes("solid") ||
        qLower.includes("dry") ||
        qLower.includes("refactor") ||
        qLower.includes("pattern") ||
        qLower.includes("standards") ||
        qLower.includes("quality") ||
        qLower.includes("test") ||
        qLower.includes("jest") ||
        qLower.includes("junit")
    ) {
        return "An ideal response should detail:\n" +
            "1. Architectural Cleanliness: Code quality is guided by SOLID object-oriented principles, modular separation of concerns, and keeping functions atomic and single-purpose.\n" +
            "2. Automated Testing Suite: Write isolation unit tests using frameworks like Jest, Mocha, or JUnit. Aim for 80%+ coverage, mimicking boundary thresholds and mocking heavy dependencies to avoid network/DB queries.\n" +
            "3. Continuous Refactoring: Counter technical debt by running static code linters, employing typescript strict models, and refactoring nested conditional structures into readable, early-return loops.";
    }

    // 5. REST APIs / GraphQL / HTTP Protocol / Network communication
    if (
        qLower.includes("api") ||
        qLower.includes("rest") ||
        qLower.includes("graphql") ||
        qLower.includes("endpoint") ||
        qLower.includes("http") ||
        qLower.includes("fetch") ||
        qLower.includes("request") ||
        qLower.includes("controller") ||
        qLower.includes("status code")
    ) {
        return "An ideal response should clarify:\n" +
            "1. Semantic HTTP Verbs: RESTful architecture models assets as URLs and performs stateless operations using standard verbs: GET (fetch), POST (create), PUT (override), PATCH (modify), and DELETE (remove).\n" +
            "2. Explicit Status Indicators: Always issue standardized API responses, mapping errors accurately: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized for failed auth, 403 Forbidden, 404 Not Found, and 500 Server Error.\n" +
            "3. Payload Integrity: Align data formats leveraging strict JSON parsing, or introduce GraphQL to eliminate over-fetching by letting public clients define the exact output schemas requested.";
    }

    // 6. Synchronous vs Asynchronous / Event Loops / Threads
    if (
        qLower.includes("sync") ||
        qLower.includes("async") ||
        qLower.includes("concurrency") ||
        qLower.includes("thread") ||
        qLower.includes("promise") ||
        qLower.includes("event loop") ||
        qLower.includes("blocking")
    ) {
        return "An ideal response should explain:\n" +
            "1. Thread Blockers: Synchronous requests hold CPU threads active until completion. Asynchronous routines delegate time-intensive storage or network tasks, freeing threads to process other incoming data.\n" +
            "2. Non-Blocking Event Loop: Single-threaded JS handles asynchronous callbacks using an event loop. Microtasks (like Promises) execute directly after the current call stack clears, followed by standard macrotasks.\n" +
            "3. Thread Safety: In concurrent multi-threaded environments (like Java/Go), synchronize shared resources using critical-section locks, atomic bounds, or stateless channel messaging to prevent data race conditions.";
    }

    // 7. Data Structures & Algorithms / Big O Complexity
    if (
        qLower.includes("stack") ||
        qLower.includes("queue") ||
        qLower.includes("array") ||
        qLower.includes("list") ||
        qLower.includes("tree") ||
        qLower.includes("binary") ||
        qLower.includes("graph") ||
        qLower.includes("algorithm") ||
        qLower.includes("complexity") ||
        qLower.includes("big o")
    ) {
        return "An ideal response should explain:\n" +
            "1. Stack vs Queue: A Stack processes nodes via LIFO (Last-In, First-Out) operations using push/pop, whereas a Queue processes elements via FIFO (First-In, First-Out) mechanics.\n" +
            "2. Array vs List: Arrays support instant O(1) indexed lookups but require complex O(N) memory allocation shifts on insertions. Linked Lists offer O(1) insertion steps but require an O(N) sequential search pointer crawl.\n" +
            "3. Big-O Complexity Boundaries: Analyze algorithm performance using asymptotic notation. Strive for O(1) or O(log N) operations with HashMaps or binary trees, avoiding nested loops that result in O(N²) time complexity.";
    }

    // 8. System Design / Scaling / Microservices / DevOps
    if (
        qLower.includes("system design") ||
        qLower.includes("scale") ||
        qLower.includes("caching") ||
        qLower.includes("load balancer") ||
        qLower.includes("microservice") ||
        qLower.includes("docker") ||
        qLower.includes("cloud") ||
        qLower.includes("monolith")
    ) {
        return "An ideal response should detail:\n" +
            "1. Horizontal Scalability: Scale systems outwards by deploying multiple stateless node instances behind a Load Balancer (round-robin/least-connections) rather than relying on vertical hardware resource upgrades.\n" +
            "2. Multi-tier Caching: Integrate intermediate key-value caching (such as Redis) for database-heavy read payloads. Ensure caching strategies handle expiration, eviction (LRU), and validation.\n" +
            "3. Microservices & Loose Coupling: Divide massive monolith architectures into modular, independently deployable services packaged in Docker containers and coordinated through non-blocking Message Queues.";
    }

    // 9. Behavioral: Background / Profile / Pitch
    if (
        qLower.includes("background") ||
        qLower.includes("yourself") ||
        qLower.includes("profile") ||
        qLower.includes("introduce") ||
        qLower.includes("who are you") ||
        qLower.includes("bio")
    ) {
        return "An ideal elevator pitch should present a structured professional summary (30-60 seconds):\n" +
            "1. Present: State your current technological focus, core stack competencies, and primary engineering values.\n" +
            "2. Past: Highlight 1 or 2 specific career achievements or projects where you successfully delivered measurable business value.\n" +
            "3. Future: Articulate your immediate professional milestones, aligning them directly with the mission and growth of this specific role.";
    }

    // 10. Behavioral: Conflict / Disagreement / Team alignment
    if (
        qLower.includes("disagreement") ||
        qLower.includes("conflict") ||
        qLower.includes("disagree") ||
        qLower.includes("friction") ||
        qLower.includes("clash") ||
        qLower.includes("advocate") ||
        qLower.includes("unpopular")
    ) {
        return "An ideal answer should utilize the STAR format to illustrate resolution and empathy:\n" +
            "1. Situation: Describe a professional, task-oriented technical disagreement about architecture choices or deadlines without complaining.\n" +
            "2. Task: Identify the technical friction and the common objectives (e.g. system stability, performance, launch deadlines).\n" +
            "3. Action: Detail how you advocated using factual alignment, evaluating pros and cons objectively, and trying out rapid sandbox pilots.\n" +
            "4. Result: Share how the team safely reached a compromise or decision, protecting mutual respect and project momentum.";
    }

    // 11. Behavioral: Challenges / Failure / Mistakes
    if (
        qLower.includes("challenge") ||
        qLower.includes("fail") ||
        qLower.includes("mistake") ||
        qLower.includes("broke") ||
        qLower.includes("error") ||
        qLower.includes("difficult") ||
        qLower.includes("inherited")
    ) {
        return "An ideal answer should highlight accountability and systemic learning:\n" +
            "1. Accountability first: Openly describe the specific technical mistake or production outage without blaming other developers.\n" +
            "2. Dynamic Recovery: Detail the immediate, organized steps you executed to diagnose the root cause, inform team leads, and deploy a hotfix.\n" +
            "3. Systemic Prevention: Conclude with the post-mortem improvements you established (e.g. adding CI gate checks or automated regression tests) to prevent the bug from recurring.";
    }

    // 12. Behavioral: Shifting requirements / Ambiguity / Deadlines
    if (
        qLower.includes("ambiguous") ||
        qLower.includes("shifting") ||
        qLower.includes("change") ||
        qLower.includes("scope") ||
        qLower.includes("timeline") ||
        qLower.includes("pressure") ||
        qLower.includes("schedule") ||
        qLower.includes("demanding")
    ) {
        return "An ideal answer should illustrate technical agility and smart project management:\n" +
            "1. Situation: Describe how project timeline constraints or core feature scope shifted mid-flight.\n" +
            "2. Action: Show how you actively engaged with stakeholders, identified the MVP baseline, decoupled dependencies, and established clear scope constraints.\n" +
            "3. Result: Explain how you successfully delivered the core system on time while maintaining high code quality standards.";
    }

    // 13. Behavioral: Motivations / Why this role / Why this company
    if (
        qLower.includes("interest in") ||
        qLower.includes("why do you want") ||
        qLower.includes("why this role") ||
        qLower.includes("join us") ||
        qLower.includes("5 years") ||
        qLower.includes("goals") ||
        qLower.includes("ambition")
    ) {
        return "An ideal answer should link your engineering growth to the team's mission:\n" +
            "1. Concrete alignment: Identify a specific aspect of the company's engineering culture, product achievements, or scale challenges that genuinely excites you.\n" +
            "2. Technical fit: Explain how the team's tech stack matches your current skills and offers a healthy space for growth.\n" +
            "3. Long-term progress: Frame your career path as progressing toward taking ownership of complex systems, mentoring peers, and driving solid engineering solutions.";
    }

    // 14. Fallback Behavioral / General Structure
    return "An ideal answer should utilize the STAR (Situation, Task, Action, Result) methodology:\n" +
        "1. Situation & Task: Set the context of the technical challenge and goal in 2-3 brief sentences.\n" +
        "2. Action: Clearly state your personal technical decisions, reasoning, and standard tool selections.\n" +
        "3. Result: Conclude by highlighting the positive impact, using real engineering or business metrics (e.g. optimized query load, increased velocity) to prove success.";
}
