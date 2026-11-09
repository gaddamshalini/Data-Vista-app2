"""
Seed Mock Interview Questions for DATA VISTA.
Covers 9 Technical domains (10 Q each = 90) + 15 HR Behavioral questions = 105 total.
Domains: Python, Java, C, SQL, HTML and CSS, JavaScript, React,
         Machine Learning, Data Analytics
Run: python seed_interview_questions.py
"""

from database import engine, Base, SessionLocal
from models import MockInterviewQuestion

INTERVIEW_QUESTIONS = [

    # ── PYTHON ──────────────────────────────────────────────────────────────
    ("Technical", "Python", "What is the difference between a list and a tuple in Python?",
     "A list is mutable (can be changed after creation) using square brackets [], while a tuple is immutable (cannot be changed) using parentheses (). Lists are used for collections that may change; tuples are used for fixed data like coordinates or RGB values.",
     "Recruiters want to hear the keywords 'mutable' vs 'immutable'. Give a real example use-case for each.", "Beginner"),

    ("Technical", "Python", "What are Python decorators and how do you use them?",
     "Decorators are functions that wrap another function to extend its behaviour without modifying it. You apply them using the @decorator_name syntax above a function definition. Example: @staticmethod, @property, or custom logging decorators.",
     "Show you understand higher-order functions. Mention @staticmethod or @property as common built-in examples.", "Intermediate"),

    ("Technical", "Python", "Explain the difference between `deep copy` and `shallow copy` in Python.",
     "A shallow copy creates a new object but references the same nested objects. A deep copy creates a completely independent clone including all nested objects. Use copy.copy() for shallow and copy.deepcopy() for deep copies.",
     "Draw the memory diagram mentally. Mention the `copy` module.", "Intermediate"),

    ("Technical", "Python", "What is a Python generator and when would you use one?",
     "A generator is a function that uses `yield` instead of `return` to lazily produce values one at a time. It saves memory when dealing with large datasets because it does not load all values into memory at once.",
     "Emphasise memory efficiency. Give an example: reading a large file line by line.", "Intermediate"),

    ("Technical", "Python", "What is the Global Interpreter Lock (GIL) in Python?",
     "The GIL is a mutex in CPython that allows only one thread to execute Python bytecode at a time, even on multi-core systems. It prevents true multi-threaded CPU parallelism but does not affect multiprocessing or I/O-bound threading.",
     "Mention that multiprocessing bypasses the GIL. This is a common interview question for performance-focused roles.", "Advanced"),

    ("Technical", "Python", "How does Python manage memory? What is garbage collection?",
     "Python uses reference counting as its primary memory management mechanism. When an object's reference count drops to zero, memory is freed. Python also has a cyclic garbage collector (gc module) to handle reference cycles.",
     "Mention reference counting and the gc module. Do not confuse with Java's GC which is entirely different.", "Intermediate"),

    ("Technical", "Python", "What is the difference between `__str__` and `__repr__` in Python?",
     "__str__ is meant for a human-readable string representation and is called by print(). __repr__ is meant for an unambiguous developer-friendly representation and is called by the REPL or repr(). If __str__ is not defined, Python falls back to __repr__.",
     "A clean answer: __repr__ should ideally allow eval(repr(obj)) to recreate the object.", "Intermediate"),

    ("Technical", "Python", "What are *args and **kwargs used for in Python functions?",
     "*args allows a function to accept any number of positional arguments as a tuple. **kwargs allows any number of keyword arguments as a dictionary. They are used to write flexible, general-purpose functions.",
     "Show you can use both together. Mention that the names args and kwargs are conventions, not requirements.", "Beginner"),

    ("Technical", "Python", "Explain list comprehension with an example.",
     "List comprehension is a concise way to create lists: [expression for item in iterable if condition]. Example: squares = [x**2 for x in range(10) if x % 2 == 0] produces [0, 4, 16, 36, 64].",
     "Keep the example simple. Mention it is more Pythonic and often faster than an equivalent for loop.", "Beginner"),

    ("Technical", "Python", "What is the difference between `is` and `==` in Python?",
     "`==` checks value equality — whether two objects have the same value. `is` checks identity — whether two variables point to the exact same object in memory. Example: [1,2] == [1,2] is True but [1,2] is [1,2] is False.",
     "A common trick question. Mention the integer caching quirk where small integers (-5 to 256) share identity.", "Beginner"),

    # ── JAVA ────────────────────────────────────────────────────────────────
    ("Technical", "Java", "What is the difference between JDK, JRE and JVM?",
     "JVM (Java Virtual Machine) runs Java bytecode. JRE (Java Runtime Environment) = JVM + standard libraries needed to run Java programs. JDK (Java Development Kit) = JRE + compiler (javac) + development tools. You need JDK to develop; JRE to run.",
     "Draw the containment: JDK ⊃ JRE ⊃ JVM. This is asked in virtually every Java screening round.", "Beginner"),

    ("Technical", "Java", "What is the difference between `==` and `.equals()` in Java?",
     "`==` compares reference (memory address) for objects. `.equals()` compares the actual content/value. For String comparison always use .equals(). Example: new String('a') == new String('a') is false but .equals() returns true.",
     "Never use == to compare Strings. Mention String pool and why new String() bypasses it.", "Beginner"),

    ("Technical", "Java", "Explain the four pillars of OOP in Java.",
     "Encapsulation: hiding data using private fields and public getters/setters. Inheritance: a subclass extends a parent class. Polymorphism: same method name, different behaviour (overloading and overriding). Abstraction: hiding implementation details using abstract classes or interfaces.",
     "Give one real Java code example for each pillar. This is asked in 90% of Java interviews.", "Beginner"),

    ("Technical", "Java", "What is the difference between an abstract class and an interface in Java?",
     "An abstract class can have method implementations, constructors, and instance variables. An interface (pre-Java 8) could only have abstract methods. Post-Java 8, interfaces can have default and static methods. A class can implement multiple interfaces but extend only one class.",
     "Mention the 'multiple inheritance' problem that interfaces solve. Java 8 default methods are a common follow-up.", "Intermediate"),

    ("Technical", "Java", "What is method overloading vs method overriding in Java?",
     "Overloading: same method name with different parameters in the same class — resolved at compile time (static polymorphism). Overriding: a subclass provides a new implementation for a parent class method — resolved at runtime (dynamic polymorphism).",
     "Overloading = compile time, Overriding = runtime. Mention @Override annotation to avoid bugs.", "Beginner"),

    ("Technical", "Java", "What is the difference between ArrayList and LinkedList?",
     "ArrayList uses a dynamic array; O(1) random access, O(n) insert/delete in the middle. LinkedList uses a doubly linked list; O(1) insert/delete at ends, O(n) random access. Use ArrayList for frequent reads; LinkedList for frequent insertions/deletions.",
     "Always mention Big-O complexity. Interviewers appreciate it when you justify collection choice with use-case.", "Intermediate"),

    ("Technical", "Java", "What is a checked vs unchecked exception in Java?",
     "Checked exceptions are checked at compile time (e.g., IOException, SQLException) and must be caught or declared with throws. Unchecked exceptions (RuntimeException subclasses like NullPointerException, ArrayIndexOutOfBoundsException) are not enforced at compile time.",
     "Mention that catching Exception broadly is bad practice. Explain specific exception handling.", "Intermediate"),

    ("Technical", "Java", "What is the `final` keyword in Java?",
     "final on a variable: value cannot be reassigned (constant). final on a method: cannot be overridden by a subclass. final on a class: cannot be subclassed. String in Java is a final class.",
     "Mention String as a real-world example of a final class. Follow up: `finally` (exception cleanup) and `finalize()` (deprecated GC method) are different.", "Beginner"),

    ("Technical", "Java", "What is multithreading and how do you create a thread in Java?",
     "Multithreading allows concurrent execution of two or more threads. Create a thread by: 1) Extending the Thread class and overriding run(), or 2) Implementing the Runnable interface and passing it to a Thread constructor. Method 2 is preferred as Java supports single inheritance.",
     "Prefer Runnable over Thread extension because it allows your class to extend another class too.", "Intermediate"),

    ("Technical", "Java", "What is the Collections Framework in Java?",
     "The Java Collections Framework is a unified architecture for storing and manipulating groups of objects. Key interfaces: List (ArrayList, LinkedList), Set (HashSet, TreeSet), Map (HashMap, TreeMap), Queue (PriorityQueue). All are in java.util package.",
     "Know the difference between List, Set and Map. Interviewers often ask when to use HashMap vs TreeMap (sorted keys).", "Intermediate"),

    # ── C ────────────────────────────────────────────────────────────────────
    ("Technical", "C", "What is the difference between a pointer and an array in C?",
     "An array is a fixed-size block of memory with a constant base address. A pointer is a variable that stores a memory address and can be reassigned. Array names decay to a pointer to their first element in most contexts, but arrays cannot be reassigned.",
     "Mention sizeof difference: sizeof(arr) gives total bytes of array; sizeof(ptr) gives pointer size (4 or 8 bytes).", "Beginner"),

    ("Technical", "C", "What is a segmentation fault and what causes it?",
     "A segmentation fault occurs when a program attempts to access memory it is not allowed to access — such as dereferencing a NULL pointer, accessing an array out of bounds, writing to read-only memory, or using a freed pointer.",
     "Give a concrete code example: int *p = NULL; *p = 5; causes a segfault. Mention tools like valgrind for debugging.", "Beginner"),

    ("Technical", "C", "What is the difference between `malloc` and `calloc`?",
     "malloc(n) allocates n bytes of uninitialised memory. calloc(count, size) allocates count * size bytes and initialises all bytes to zero. calloc is safer when you need zero-initialised memory but is slightly slower.",
     "Both return void* and require free(). Mention realloc() for resizing dynamic memory.", "Beginner"),

    ("Technical", "C", "What is a function pointer in C?",
     "A function pointer stores the address of a function and can be used to call that function indirectly. Syntax: return_type (*ptr_name)(param_types). Used in callbacks, dispatch tables, and implementing polymorphism-like behaviour in C.",
     "Write out the syntax clearly. Mention qsort() from stdlib.h as a classic use of function pointers.", "Intermediate"),

    ("Technical", "C", "What is the difference between `struct` and `union` in C?",
     "In a struct, each member has its own memory location. Total size = sum of all members (plus padding). In a union, all members share the same memory location. Total size = size of the largest member. Only one member can hold a value at a time in a union.",
     "Draw the memory layout. Mention tagged unions as a design pattern.", "Intermediate"),

    ("Technical", "C", "What are storage classes in C?",
     "Storage classes define scope, lifetime, and visibility: auto (default local, stack), register (hint to compiler to use CPU register), static (persists across function calls, local scope), extern (global variable accessible across files).",
     "Focus on static vs auto: static local variables retain their value between function calls.", "Intermediate"),

    ("Technical", "C", "What is the purpose of `volatile` keyword in C?",
     "volatile tells the compiler not to optimise reads/writes of that variable because its value can change unexpectedly outside the program's control — for example, hardware registers, interrupt service routines, or shared memory in embedded systems.",
     "Common in embedded/systems programming. Example: volatile int *status_reg for hardware register access.", "Intermediate"),

    ("Technical", "C", "What is the difference between `pass by value` and `pass by reference` in C?",
     "Pass by value: a copy of the argument is passed; changes inside the function do not affect the original. Pass by reference: a pointer to the variable is passed; changes via dereferencing affect the original. C only supports pass by value natively; pass by reference is simulated using pointers.",
     "C does not have references like C++. Always clarify you simulate pass-by-reference with pointers.", "Beginner"),

    ("Technical", "C", "What is a dangling pointer?",
     "A dangling pointer is a pointer that holds the address of memory that has been freed or is no longer valid. Accessing it leads to undefined behaviour. Fix: set pointer to NULL after freeing — free(ptr); ptr = NULL;",
     "Distinguish from a null pointer (safely points to nothing) vs dangling pointer (points to freed/invalid memory).", "Intermediate"),

    ("Technical", "C", "What is the difference between `#include <file>` and `#include \"file\"`?",
     "<file> searches for the header in the compiler's standard include directories (system headers). \"file\" first searches in the current directory, then the standard include paths. Use <> for system headers (stdio.h), use \"\" for your own headers.",
     "Simple but frequently asked in screening. Relate to the preprocessor stage of C compilation.", "Beginner"),

    # ── SQL ──────────────────────────────────────────────────────────────────
    ("Technical", "SQL", "What is the difference between WHERE and HAVING clause?",
     "WHERE filters rows before grouping/aggregation and cannot use aggregate functions. HAVING filters groups after GROUP BY and can use aggregate functions like COUNT(), SUM(), AVG(). Example: HAVING COUNT(*) > 5 to keep groups with more than 5 rows.",
     "Use WHERE before GROUP BY, HAVING after. A common trick question with aggregate filtering.", "Beginner"),

    ("Technical", "SQL", "What are the different types of JOINs in SQL?",
     "INNER JOIN: only matching rows from both tables. LEFT JOIN: all rows from left + matching from right (NULLs for no match). RIGHT JOIN: all rows from right + matching from left. FULL OUTER JOIN: all rows from both tables. CROSS JOIN: Cartesian product of both tables.",
     "Draw a Venn diagram for each JOIN type. INNER JOIN is most common; know when to use LEFT JOIN for reporting.", "Beginner"),

    ("Technical", "SQL", "What is a primary key vs a foreign key?",
     "Primary key uniquely identifies each row in a table; it cannot be NULL and must be unique. Foreign key is a column in one table that references the primary key of another table, establishing a relationship and enforcing referential integrity.",
     "Mention referential integrity — foreign key prevents orphan records. Give a real example: orders.customer_id → customers.id.", "Beginner"),

    ("Technical", "SQL", "What is the difference between DELETE, TRUNCATE and DROP?",
     "DELETE removes specific rows (with WHERE clause), logs each row deletion, can be rolled back. TRUNCATE removes all rows quickly without logging individual rows, cannot be rolled back in most databases, resets identity counters. DROP removes the entire table structure and data permanently.",
     "Key point: TRUNCATE is faster than DELETE for clearing a table but loses rollback capability. DROP removes the schema itself.", "Beginner"),

    ("Technical", "SQL", "What is a subquery? Give an example.",
     "A subquery is a SELECT statement nested inside another SQL statement. Example: SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees); The inner query runs first, the outer query uses its result.",
     "Distinguish correlated subquery (runs once per outer row) vs non-correlated (runs once). Mention that JOINs are often more efficient.", "Intermediate"),

    ("Technical", "SQL", "What is indexing in SQL and why is it used?",
     "An index is a data structure (typically a B-Tree) that speeds up data retrieval on a column by avoiding full table scans. Indexes are automatically created on primary keys. You can create additional indexes with CREATE INDEX. Trade-off: faster reads but slower writes and more storage.",
     "Mention that over-indexing slows INSERTs/UPDATEs. Explain when NOT to index: small tables, frequently updated columns.", "Intermediate"),

    ("Technical", "SQL", "What is normalisation? Explain 1NF, 2NF and 3NF.",
     "Normalisation organises tables to reduce redundancy. 1NF: each column has atomic values, no repeating groups. 2NF: satisfies 1NF + no partial dependency (non-key columns depend on the full primary key, not part of it). 3NF: satisfies 2NF + no transitive dependency (non-key columns depend only on the primary key).",
     "Give a concrete example of moving from an unnormalised table through each normal form.", "Intermediate"),

    ("Technical", "SQL", "What is the difference between UNION and UNION ALL?",
     "UNION combines results from two SELECT statements and removes duplicate rows (performs a DISTINCT sort). UNION ALL combines results and keeps all duplicates. UNION ALL is faster because it skips the deduplication step.",
     "When order does not matter and you know there are no duplicates, always prefer UNION ALL for performance.", "Beginner"),

    ("Technical", "SQL", "What is a stored procedure?",
     "A stored procedure is a precompiled group of SQL statements saved in the database that can be called by name. Benefits: code reuse, reduced network traffic, improved performance (precompiled), centralised business logic, and enhanced security (grant execute permission only).",
     "Mention the difference from a function: stored procedures can have multiple outputs and perform DML (INSERT/UPDATE/DELETE); functions must return a single value.", "Intermediate"),

    ("Technical", "SQL", "What is a transaction and what are ACID properties?",
     "A transaction is a sequence of SQL operations executed as a single unit. ACID: Atomicity (all or nothing), Consistency (data stays valid), Isolation (transactions do not interfere with each other), Durability (committed changes are permanent even after crashes).",
     "Use BEGIN TRANSACTION, COMMIT and ROLLBACK. The interviewer may ask which property ROLLBACK enforces — Atomicity.", "Intermediate"),

    # ── HTML and CSS ─────────────────────────────────────────────────────────
    ("Technical", "HTML and CSS", "What is the difference between inline, block and inline-block elements in HTML?",
     "Block elements (div, p, h1) take up the full width and start on a new line. Inline elements (span, a, strong) only take up as much width as needed and stay on the same line. Inline-block elements behave like inline but allow setting width and height.",
     "Mention display: flex and display: grid as modern alternatives that give more control than inline-block.", "Beginner"),

    ("Technical", "HTML and CSS", "What is the CSS Box Model?",
     "Every HTML element is a rectangular box with four layers from outside in: Margin (space outside border), Border, Padding (space between border and content), Content. box-sizing: border-box includes padding and border in the declared width/height.",
     "Always add box-sizing: border-box to avoid unexpected layout overflows. Draw the four layers.", "Beginner"),

    ("Technical", "HTML and CSS", "What is the difference between `position: relative`, `absolute`, `fixed` and `sticky`?",
     "relative: positioned relative to its normal position without leaving the flow. absolute: positioned relative to its nearest positioned ancestor; removed from normal flow. fixed: positioned relative to the viewport; stays during scroll. sticky: switches between relative and fixed based on scroll threshold.",
     "Mention that absolute positioning removes the element from document flow, which can cause parent collapse.", "Intermediate"),

    ("Technical", "HTML and CSS", "What is Flexbox and what problems does it solve?",
     "Flexbox (Flexible Box Layout) is a CSS layout model that makes it easy to align and distribute items in a container, either horizontally or vertically. It solves centering vertically (historically difficult), distributing space evenly, and reordering items without changing HTML.",
     "Know the key properties: display:flex, flex-direction, justify-content, align-items, flex-wrap. Contrast with CSS Grid for 2D layouts.", "Beginner"),

    ("Technical", "HTML and CSS", "What is the difference between `em`, `rem`, `px`, and `%` units in CSS?",
     "px is absolute pixels. em is relative to the parent element's font-size (compounding). rem is relative to the root <html> element's font-size (non-compounding, more predictable). % is relative to the parent's dimension.",
     "Recommend rem for font-sizes (accessibility — respects browser font size settings) and % or viewport units for responsive layouts.", "Beginner"),

    ("Technical", "HTML and CSS", "What is CSS specificity and how is it calculated?",
     "Specificity determines which CSS rule wins when multiple rules target the same element. It is calculated as a score: Inline styles (1000) > ID selectors (100) > Class/pseudo-class/attribute selectors (10) > Element/pseudo-element selectors (1). Higher specificity wins.",
     "Mention !important overrides specificity but should be used sparingly. Use the 0-0-0-0 notation for specificity calculation.", "Intermediate"),

    ("Technical", "HTML and CSS", "What is semantic HTML and why does it matter?",
     "Semantic HTML uses meaningful tags that describe their purpose: <header>, <nav>, <main>, <article>, <section>, <footer> instead of generic <div>. It improves accessibility (screen readers), SEO (search engines understand structure), and code readability.",
     "Give non-semantic vs semantic examples: <div class='nav'> vs <nav>. Mention ARIA roles as an extension.", "Beginner"),

    ("Technical", "HTML and CSS", "What is a CSS media query?",
     "A media query applies CSS rules only when certain conditions are met — typically viewport width. Syntax: @media (max-width: 768px) { ... }. Used for responsive design to adapt layout for mobile, tablet, and desktop screens.",
     "Mention mobile-first design: start with base styles for mobile, then use min-width media queries to enhance for larger screens.", "Beginner"),

    ("Technical", "HTML and CSS", "What is the difference between `display: none` and `visibility: hidden`?",
     "display: none removes the element from the document flow entirely — it takes up no space and is not rendered. visibility: hidden makes the element invisible but it still occupies its space in the layout.",
     "Add: opacity: 0 is a third option — invisible but still takes space AND still receives click/hover events.", "Beginner"),

    ("Technical", "HTML and CSS", "What is CSS Grid and how is it different from Flexbox?",
     "CSS Grid is a 2D layout system (rows AND columns). Flexbox is 1D (either row OR column at a time). Use Grid for page-level layouts with complex 2D arrangements; use Flexbox for component-level alignment within a single axis.",
     "Common interview: 'Can you center a div in CSS Grid?' — Yes: display:grid; place-items:center on the container.", "Intermediate"),

    # ── JAVASCRIPT ──────────────────────────────────────────────────────────
    ("Technical", "JavaScript", "What is the difference between `var`, `let` and `const` in JavaScript?",
     "var is function-scoped, hoisted and initialised to undefined. let is block-scoped, hoisted but not initialised (Temporal Dead Zone). const is block-scoped, must be initialised at declaration, and the binding cannot be reassigned (though object properties can still mutate).",
     "In modern JS, never use var. Use const by default; use let only when you need to reassign.", "Beginner"),

    ("Technical", "JavaScript", "What is the event loop in JavaScript?",
     "JavaScript is single-threaded with an event loop that manages asynchronous operations. The call stack executes synchronous code. Async callbacks go to the task queue; Promises go to the microtask queue (higher priority). The event loop picks from microtask queue first, then task queue, whenever the call stack is empty.",
     "Draw the loop: Call Stack → Microtask Queue (Promises) → Macro Task Queue (setTimeout, setInterval).", "Advanced"),

    ("Technical", "JavaScript", "What is a closure in JavaScript? Give a real-world use case.",
     "A closure is a function that retains access to its outer function's variables even after the outer function has finished executing. Real-world uses: data privacy/encapsulation (counter with private state), memoisation, and currying.",
     "Classic counter example: function makeCounter() { let count = 0; return () => ++count; }. Mention that React useState is built on closure concepts.", "Intermediate"),

    ("Technical", "JavaScript", "What is the difference between `==` and `===`?",
     "`==` performs type coercion before comparison (loose equality). `===` compares value and type without coercion (strict equality). Example: 0 == false is true (coercion), but 0 === false is false (different types). Always use === in production code.",
     "Show a surprising coercion: '' == false is true. This is why most linters enforce ===.", "Beginner"),

    ("Technical", "JavaScript", "What are Promises and how do they differ from callbacks?",
     "A Promise represents the eventual result of an async operation — pending, fulfilled, or rejected. Promises avoid 'callback hell' with chaining (.then().catch()). async/await is syntactic sugar over Promises for even cleaner code.",
     "Show the evolution: callbacks → Promises → async/await. Mention Promise.all() for parallel execution.", "Intermediate"),

    ("Technical", "JavaScript", "What is `this` keyword in JavaScript?",
     "`this` refers to the execution context — the object that called the function. In a method: this = the object. In a regular function: this = global object (window) or undefined in strict mode. Arrow functions do not have their own this; they inherit from the enclosing scope.",
     "Arrow functions fixing `this` context is a very common interview topic, especially in React (event handlers).", "Intermediate"),

    ("Technical", "JavaScript", "What is the difference between `null` and `undefined`?",
     "undefined means a variable has been declared but not yet assigned a value. null is an intentional assignment representing 'no value'. typeof undefined === 'undefined'; typeof null === 'object' (a famous JS bug).",
     "Mention the typeof null bug as trivia. In practice: use undefined as default absence; use null for intentional emptiness.", "Beginner"),

    ("Technical", "JavaScript", "What is hoisting in JavaScript?",
     "Hoisting moves declarations to the top of their scope during the compilation phase. var declarations are hoisted and initialised to undefined. function declarations are fully hoisted (callable before the line they are defined). let and const are hoisted but not initialised (Temporal Dead Zone).",
     "Demonstrate: console.log(x); var x = 5; prints undefined, not an error. With let it would throw a ReferenceError.", "Intermediate"),

    ("Technical", "JavaScript", "What are arrow functions and how are they different from regular functions?",
     "Arrow functions have a shorter syntax: const add = (a, b) => a + b. Key differences: no own `this` binding (inherits from enclosing scope), cannot be used as constructors, no arguments object, and cannot be used as generator functions.",
     "The most important difference for interviews: no own `this`. This is why React event handlers often use arrow functions.", "Beginner"),

    ("Technical", "JavaScript", "What is the difference between `map()`, `filter()` and `reduce()`?",
     "map() transforms each element and returns a new array of the same length. filter() returns a new array with only elements that pass the test. reduce() accumulates all elements into a single value (sum, object, etc.).",
     "Show chaining: [1,2,3,4].filter(x => x%2===0).map(x => x*10).reduce((a,b) => a+b, 0) = 60.", "Beginner"),

    # ── REACT ────────────────────────────────────────────────────────────────
    ("Technical", "React", "What is the Virtual DOM and why does React use it?",
     "The Virtual DOM is an in-memory JavaScript representation of the real DOM. When state changes, React re-renders the Virtual DOM, diffs it with the previous snapshot (reconciliation), and applies only the minimal required changes to the real DOM. This is faster than direct DOM manipulation.",
     "Mention the diffing algorithm and keys. Keys help React identify which list items changed, improving reconciliation efficiency.", "Beginner"),

    ("Technical", "React", "What are React Hooks? Name the most common ones.",
     "Hooks are functions that let functional components use state and lifecycle features. Common hooks: useState (local state), useEffect (side effects/lifecycle), useContext (consume context), useRef (DOM references and mutable values), useMemo (memoised values), useCallback (memoised functions).",
     "Hooks were introduced in React 16.8 to replace class components. Always call hooks at the top level — not inside conditions or loops.", "Beginner"),

    ("Technical", "React", "What is the difference between `props` and `state` in React?",
     "Props are read-only inputs passed from a parent to a child component. State is internal mutable data managed within a component using useState. Props make components reusable and configurable; state makes them interactive and dynamic.",
     "Key rule: data flows down (props) and events bubble up (callback props). This is the one-way data flow principle.", "Beginner"),

    ("Technical", "React", "What is `useEffect` and how does it work?",
     "useEffect runs side effects after render. It takes a function and an optional dependency array. No dependency array: runs after every render. Empty array []: runs once after mount. With dependencies: runs when those values change. Return a cleanup function to prevent memory leaks.",
     "Common mistakes: missing dependencies causing stale closures; not cleaning up subscriptions. ESLint react-hooks/exhaustive-deps catches missing deps.", "Intermediate"),

    ("Technical", "React", "What is the key prop in React lists and why is it important?",
     "The key prop is a unique identifier given to list items. React uses keys to efficiently identify which items were added, removed, or changed during reconciliation. Without proper keys, React may re-render items unnecessarily or cause UI bugs when items are reordered.",
     "Never use array index as key when items can be reordered or deleted. Use stable unique IDs (e.g. database IDs).", "Beginner"),

    ("Technical", "React", "What is the difference between controlled and uncontrolled components?",
     "Controlled components: form element values are stored in React state and updated via onChange handlers. The React component controls the input. Uncontrolled components: form values are handled by the DOM itself, accessed via refs.",
     "Prefer controlled components for validation, conditional enabling, and submitting data. Use uncontrolled with file inputs or when integrating with non-React libraries.", "Intermediate"),

    ("Technical", "React", "What is React Context and when should you use it?",
     "React Context provides a way to share values (like theme, user auth, language) between components without passing props through every level (prop drilling). Use it for global data accessed by many components at different nesting levels.",
     "Context is not a replacement for state management like Redux — it re-renders all consumers on every value change. Use useMemo to optimise.", "Intermediate"),

    ("Technical", "React", "What is the difference between `useMemo` and `useCallback`?",
     "useMemo memoises the result of a computation — returns a cached value. useCallback memoises a function definition — returns a cached function. Both take dependency arrays and only recompute/re-create when dependencies change.",
     "Rule of thumb: useMemo for expensive calculations; useCallback for functions passed as props to child components to prevent unnecessary re-renders.", "Intermediate"),

    ("Technical", "React", "What is prop drilling and how do you avoid it?",
     "Prop drilling is passing data through multiple intermediate component layers that do not use the data, just to reach a deeply nested component. Solutions: React Context API, state management libraries (Redux, Zustand), or component composition.",
     "Mention that excessive context can cause performance issues. For large apps, consider Redux Toolkit or Zustand.", "Intermediate"),

    ("Technical", "React", "What happens when you call `setState` (or `useState` setter) in React?",
     "Calling a state setter schedules a re-render. React batches multiple state updates within an event handler and re-renders once. The component re-renders with the new state value. Calling setState does not immediately update the state variable — the new value is available in the next render.",
     "Mention state batching (React 18 auto-batches all updates). Explain the async nature: console.log after setState shows the old value.", "Intermediate"),

    # ── MACHINE LEARNING ─────────────────────────────────────────────────────
    ("Technical", "Machine Learning", "What is the difference between supervised and unsupervised learning?",
     "Supervised learning trains on labelled data (input-output pairs) to predict outputs. Examples: classification (spam detection), regression (house price prediction). Unsupervised learning finds patterns in unlabelled data. Examples: clustering (K-Means), dimensionality reduction (PCA).",
     "Mention semi-supervised and reinforcement learning as additional paradigms. Real examples make answers memorable.", "Beginner"),

    ("Technical", "Machine Learning", "What is overfitting and how do you prevent it?",
     "Overfitting is when a model learns the training data too well, including noise, and performs poorly on unseen test data. Prevention techniques: cross-validation, regularisation (L1/L2), dropout (neural nets), pruning (decision trees), reducing model complexity, and collecting more training data.",
     "The train-test-validation split is fundamental. Mention the bias-variance tradeoff: overfitting = high variance; underfitting = high bias.", "Beginner"),

    ("Technical", "Machine Learning", "What is the bias-variance tradeoff?",
     "Bias: error due to overly simplistic assumptions — model underfits. Variance: error due to excessive sensitivity to training data — model overfits. High bias → underfitting. High variance → overfitting. The goal is to find the sweet spot with low bias AND low variance via model selection and regularisation.",
     "Draw the U-shaped test error curve. The minimum of the curve is the optimal model complexity.", "Intermediate"),

    ("Technical", "Machine Learning", "What is cross-validation?",
     "Cross-validation evaluates model performance on unseen data by dividing the dataset into k folds. In k-fold cross-validation, the model is trained k times, each time using a different fold as the validation set. Performance is averaged across all folds. Prevents overfitting to a single train-test split.",
     "Mention Stratified K-Fold for imbalanced datasets. Leave-One-Out (LOO) is the extreme case where k = n.", "Intermediate"),

    ("Technical", "Machine Learning", "What is the difference between precision and recall?",
     "Precision = TP / (TP + FP): of all predicted positives, how many are truly positive (quality of positive predictions). Recall = TP / (TP + FN): of all actual positives, how many did the model catch (sensitivity/completeness). F1 score is the harmonic mean of both.",
     "Use a real example: medical diagnosis — high recall is critical (do not miss cancer). Spam detection — high precision is critical (do not block legitimate emails).", "Intermediate"),

    ("Technical", "Machine Learning", "What is feature engineering?",
     "Feature engineering is the process of using domain knowledge to transform raw data into informative features that improve model performance. Includes: creating new features, encoding categorical variables, normalising/standardising, handling missing values, and feature selection.",
     "Mention that good feature engineering often matters more than algorithm choice. Give an example: extracting day-of-week from a timestamp for sales prediction.", "Intermediate"),

    ("Technical", "Machine Learning", "What is the difference between classification and regression?",
     "Classification predicts a discrete category/class (spam or not spam, cat or dog). Regression predicts a continuous numeric value (house price, temperature). Algorithms: Logistic Regression and Decision Trees for classification; Linear Regression, SVR for regression. Both are supervised learning.",
     "Logistic Regression despite its name is a classification algorithm — mention this explicitly as it often confuses interviewers.", "Beginner"),

    ("Technical", "Machine Learning", "What is a confusion matrix?",
     "A confusion matrix is a table showing True Positives (TP), True Negatives (TN), False Positives (FP), False Negatives (FN) for a classification model. It allows computing metrics like accuracy, precision, recall and F1 score, and reveals which classes the model confuses.",
     "Draw the 2x2 matrix. Explain each quadrant. Accuracy = (TP+TN)/(Total) — misleading for imbalanced classes.", "Beginner"),

    ("Technical", "Machine Learning", "What is the difference between Random Forest and a single Decision Tree?",
     "A Decision Tree is a single model that splits data on features to make predictions — prone to overfitting. Random Forest is an ensemble of many decision trees trained on random subsets of data (bagging) and features. Predictions are averaged/voted. Random Forest has lower variance and higher accuracy.",
     "Mention bagging (Bootstrap Aggregating). Key insight: individual trees overfit but their average does not.", "Intermediate"),

    ("Technical", "Machine Learning", "What is gradient descent?",
     "Gradient descent is an optimisation algorithm that minimises a loss function by iteratively moving in the direction of the steepest descent (negative gradient). It updates model weights: w = w - learning_rate * gradient. Variants: Batch GD (full dataset), Stochastic GD (single sample), Mini-batch GD (small batches).",
     "Explain the learning rate tradeoff: too high = overshooting; too low = slow convergence. Mini-batch GD is used in practice (used in neural network training).", "Intermediate"),

    # ── DATA ANALYTICS ───────────────────────────────────────────────────────
    ("Technical", "Data Analytics", "What is the difference between descriptive, diagnostic, predictive and prescriptive analytics?",
     "Descriptive: What happened? (reports, dashboards). Diagnostic: Why did it happen? (root cause analysis). Predictive: What will happen? (ML forecasting models). Prescriptive: What should we do? (optimisation, recommendations). Each builds on the previous tier.",
     "Give a business example for each: Sales dropped (descriptive) → due to churn (diagnostic) → 20% more churn next month (predictive) → offer discount to at-risk customers (prescriptive).", "Beginner"),

    ("Technical", "Data Analytics", "What is the difference between mean, median and mode? When do you use each?",
     "Mean: arithmetic average — sensitive to outliers. Median: middle value — robust to outliers, better for skewed data (income). Mode: most frequent value — useful for categorical data (most popular product). Use median when data has outliers; use mean for normally distributed data.",
     "Salary/income is the classic example of median over mean. Always consider data distribution before choosing a measure of central tendency.", "Beginner"),

    ("Technical", "Data Analytics", "What is a KPI (Key Performance Indicator)?",
     "A KPI is a measurable value that demonstrates how effectively a company or individual is achieving a key business objective. Good KPIs are Specific, Measurable, Achievable, Relevant and Time-bound (SMART). Examples: Monthly Active Users, Customer Acquisition Cost, Net Promoter Score.",
     "Always link a KPI to a specific business goal. Mention leading indicators (predict future performance) vs lagging indicators (reflect past results).", "Beginner"),

    ("Technical", "Data Analytics", "What is data cleaning and why is it important?",
     "Data cleaning is the process of detecting and correcting (or removing) corrupt, inaccurate, or irrelevant records. Steps include: handling missing values, removing duplicates, correcting data types, fixing inconsistent formatting, and removing outliers. 'Garbage in, garbage out' — model quality depends on data quality.",
     "Mention that data scientists spend 60-80% of their time cleaning data. Pandas functions: dropna(), fillna(), drop_duplicates(), astype().", "Beginner"),

    ("Technical", "Data Analytics", "What is a pivot table? When do you use it?",
     "A pivot table aggregates and summarises large datasets by grouping data along specified rows and columns, with aggregate functions (sum, count, average). Used to quickly summarise sales by region and product, traffic by channel and month, etc. Available in Excel, pandas.pivot_table(), and SQL.",
     "Show you know pivot_table in pandas or PIVOT in SQL. Interviewers for analyst roles almost always ask this.", "Beginner"),

    ("Technical", "Data Analytics", "What is the difference between OLTP and OLAP?",
     "OLTP (Online Transaction Processing) handles day-to-day transactional operations — inserts/updates/deletes with low latency and high concurrency. Examples: banking, e-commerce. OLAP (Online Analytical Processing) handles complex analytical queries on historical data. Examples: data warehouses, BI tools like Power BI.",
     "OLTP is optimised for writes (normalised). OLAP is optimised for reads (denormalised star/snowflake schema).", "Intermediate"),

    ("Technical", "Data Analytics", "What is a data warehouse vs a data lake?",
     "A data warehouse stores structured, processed, schema-on-write data ready for business intelligence queries. Examples: Snowflake, BigQuery, Redshift. A data lake stores raw data in any format (structured, semi-structured, unstructured) with schema-on-read. More flexible but requires more processing before analysis.",
     "Mention the data lakehouse (Delta Lake, Databricks) as the modern hybrid approach combining both.", "Intermediate"),

    ("Technical", "Data Analytics", "What is data visualisation and why is it important?",
     "Data visualisation is the graphical representation of information and data. It helps identify trends, patterns, and outliers that are not obvious in tabular data. Good visualisations are clear, accurate, and purposeful. Tools: Matplotlib, Seaborn, Power BI, Tableau, Recharts.",
     "Mention choosing the right chart type: bar chart for comparisons, line chart for trends over time, scatter plot for correlations, pie chart for proportions (use sparingly).", "Beginner"),

    ("Technical", "Data Analytics", "What is A/B testing?",
     "A/B testing (split testing) is a controlled experiment that compares two versions (A and B) of a product/feature to determine which performs better on a target metric. One group sees version A, another sees version B. Statistical significance ensures the difference is not due to chance.",
     "Mention statistical significance (p-value < 0.05) and sample size requirements. Common in product analytics, marketing, and UX research.", "Intermediate"),

    ("Technical", "Data Analytics", "What is the difference between correlation and causation?",
     "Correlation: two variables change together (ice cream sales and drowning rates both rise in summer). Causation: one variable directly causes change in another. Correlation does not imply causation — a confounding variable (summer heat) explains both. Establishing causation requires controlled experiments.",
     "The ice cream / drowning example is a classic. Mention confounding variables. A/B tests establish causation; observational data only shows correlation.", "Intermediate"),

    # ── HR BEHAVIORAL ────────────────────────────────────────────────────────
    ("HR", "HR Behavioral", "Tell me about yourself.",
     "I am a [year] B.Tech student in [branch] with a CGPA of [X]. I have a strong foundation in [key skills] and have worked on [key projects] that demonstrate my ability to apply technical skills to real problems. I completed an internship at [company] where I [achievement]. I am passionate about [domain] and I am looking for opportunities to contribute to a team working on [area].",
     "Use the Present-Past-Future structure: who you are now, relevant past experience, and where you want to go. Keep it under 2 minutes. Tailor to the job description.", "Beginner"),

    ("HR", "HR Behavioral", "What is your greatest strength?",
     "My greatest strength is my ability to break down complex technical problems into smaller, manageable parts and solve them systematically. For example, during my project on [topic], I encountered [challenge] and resolved it by [approach], which improved [outcome].",
     "Use the STAR format (Situation, Task, Action, Result) to back up your strength with evidence. Avoid vague answers like 'I am a hard worker'.", "Beginner"),

    ("HR", "HR Behavioral", "What is your greatest weakness?",
     "I used to struggle with prioritising tasks when working on multiple projects simultaneously. I recognised this and started using task management tools and daily planning, which significantly improved my productivity and deadline adherence.",
     "Choose a real weakness but one you are actively improving. Never say 'I am a perfectionist' — it is a cliché. Show self-awareness and growth.", "Beginner"),

    ("HR", "HR Behavioral", "Where do you see yourself in 5 years?",
     "In 5 years I see myself as a proficient [target role], ideally having worked on challenging real-world problems in [domain]. I aim to develop strong technical expertise while also growing my leadership and communication skills. I hope to be in a role where I can mentor junior team members.",
     "Show ambition but be realistic. Align your answer with the company's growth trajectory if possible. Avoid 'I want your job'.", "Beginner"),

    ("HR", "HR Behavioral", "Describe a situation where you worked in a team and faced a conflict.",
     "During a group project, a teammate and I disagreed on the technical approach. Instead of escalating, I initiated a one-on-one discussion where we presented our respective approaches with pros and cons. We combined the best elements of both ideas, which the team agreed was stronger. The project was delivered on time.",
     "Use the STAR format. Focus on how you resolved it, not on who was wrong. Interviewers want to see communication and collaboration skills.", "Beginner"),

    ("HR", "HR Behavioral", "Why do you want to work for this company?",
     "I am drawn to [company] because of [specific reason — product, culture, mission, tech stack]. I have researched your work on [specific project or product], and I believe my skills in [relevant skill] align well with what your team is building. I am excited about the opportunity to contribute and grow here.",
     "Always research the company before the interview. Generic answers ('because it is a good company') show lack of preparation. Mention something specific.", "Beginner"),

    ("HR", "HR Behavioral", "Tell me about a time you failed and what you learned from it.",
     "In one of my early projects, I underestimated the complexity of a feature and missed an internal deadline. I learned the importance of breaking tasks into smaller milestones and communicating progress proactively. Since then, I always build buffer time into my planning and flag risks early.",
     "Everyone fails — interviewers want to see maturity and learning. Do not say you have never failed (dishonest) or blame others. Own the failure and focus on the lesson.", "Beginner"),

    ("HR", "HR Behavioral", "How do you handle working under pressure or tight deadlines?",
     "When under pressure, I prioritise tasks by urgency and impact, focus on completing the most critical items first, and communicate clearly with my team about the status. During my internship, I had to deliver a dashboard within 48 hours of an urgent client request. I broke it into components, worked methodically, and delivered on time.",
     "Avoid saying 'I work well under pressure' without an example. Give a specific situation. Mention tools or methods you use: to-do lists, Pomodoro technique, etc.", "Beginner"),

    ("HR", "HR Behavioral", "What are your salary expectations?",
     "Based on my research into industry standards for this role and location, and considering my skills and the value I can bring, I am looking for a CTC in the range of [X – Y LPA]. However, I am flexible and open to discussion based on the overall package and growth opportunities.",
     "Research the market range before the interview. Giving a range (not a fixed number) shows flexibility. Mention you are open to discussion.", "Beginner"),

    ("HR", "HR Behavioral", "Do you have any questions for us?",
     "Yes — I would like to understand what success looks like for someone in this role in the first 90 days. I am also curious about the team's tech stack and the kinds of challenges the engineering team is currently focusing on.",
     "Always have 2-3 questions prepared. Asking about growth, the team, or the product shows genuine interest. Avoid asking about salary/leaves in a first round.", "Beginner"),

    ("HR", "HR Behavioral", "How do you keep yourself updated with the latest technology trends?",
     "I follow tech blogs and newsletters like Towards Data Science, Dev.to, and The Morning Brew. I participate in online communities on LinkedIn and GitHub, complete courses on Coursera and YouTube, and work on personal projects to apply new skills hands-on.",
     "Name specific sources you actually follow. Interviewers appreciate specificity. Mention any GitHub contributions, hackathons, or certifications.", "Beginner"),

    ("HR", "HR Behavioral", "Describe your ideal work environment.",
     "I thrive in an environment that encourages continuous learning, open communication, and collaborative problem-solving. I appreciate a culture where team members are comfortable sharing ideas and giving constructive feedback. I am comfortable working both independently and in a team, and I am flexible about remote or hybrid work.",
     "Read the company's culture/values page and align your answer. Avoid being too specific in a way that clashes with the company's style.", "Beginner"),

    ("HR", "HR Behavioral", "What motivates you?",
     "I am motivated by solving challenging technical problems and seeing the tangible impact of my work. When I built a data pipeline that reduced report generation time by 60%, the immediate positive feedback from the team was incredibly rewarding. I am also motivated by learning — when I pick up a new skill and apply it successfully.",
     "Tie motivation to tangible outcomes and growth. Avoid 'money' as the primary motivator even if true.", "Beginner"),

    ("HR", "HR Behavioral", "Are you comfortable relocating or travelling for work?",
     "Yes, I am open to relocation if the opportunity is a strong fit for my career goals. I understand that some roles require travel for client meetings or team collaborations, and I am comfortable with that.",
     "If there are genuine constraints, mention them honestly but frame positively: 'I would prefer [location] but am open to discussing based on the role.'", "Beginner"),

    ("HR", "HR Behavioral", "What makes you the right candidate for this role?",
     "I believe I am a strong fit because I have the technical skills in [relevant skills] that this role requires, backed by hands-on experience from my projects and internship. I am a quick learner, collaborative, and genuinely passionate about [domain]. I am ready to contribute from day one and grow with the team.",
     "This is your closing pitch. Summarise your top 3 selling points: technical skill, relevant experience, and attitude. Practice this answer until it is smooth and confident.", "Beginner"),
]


def seed_interview_questions():
    print("Seeding mock interview questions...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(MockInterviewQuestion).count()
        if existing > 0:
            print(f"  Already have {existing} questions. Adding any missing ones...")

        added = 0
        for (itype, domain, question, sample_answer, tips, difficulty) in INTERVIEW_QUESTIONS:
            exists = db.query(MockInterviewQuestion).filter(
                MockInterviewQuestion.interview_type == itype,
                MockInterviewQuestion.domain_or_category == domain,
                MockInterviewQuestion.question == question
            ).first()
            if not exists:
                db.add(MockInterviewQuestion(
                    interview_type=itype,
                    domain_or_category=domain,
                    question=question,
                    sample_answer=sample_answer,
                    explanation_tips=tips,
                    difficulty=difficulty
                ))
                added += 1

        db.commit()
        total = db.query(MockInterviewQuestion).count()
        print(f"  Added {added} new questions. Total: {total}")

        # Print breakdown
        from sqlalchemy import func
        rows = db.query(MockInterviewQuestion.domain_or_category,
                        func.count(MockInterviewQuestion.id)).group_by(
            MockInterviewQuestion.domain_or_category).all()
        for domain, count in rows:
            print(f"    {domain:<25}: {count} questions")

    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_interview_questions()
