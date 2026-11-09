"""
Seed script for DATA VISTA:
1. Technical Skill Assessment Question Bank (10 skills, 16 questions each = 160 questions)
   - Python, Java, C, SQL, HTML, CSS, JavaScript, React, Machine Learning, Data Analytics
2. Aptitude Assessment Question Bank (3 categories, 20 questions each = 60 questions)
   - Quantitative Aptitude, Logical Reasoning, Verbal Ability
3. Default Admin & Student Accounts
"""

import hashlib
from database import SessionLocal
from models import SkillQuestion, AptitudeQuestion, UserAccount, Student

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

SKILL_QUESTIONS_DATA = {
    "Python": [
        ("What is the output of print(type([]) is list)?", "True", "False", "Error", "None", "A", "In Python, [] is an instance of the built-in list class.", "Easy"),
        ("Which keyword is used to create a generator function in Python?", "return", "yield", "generator", "produce", "B", "The yield keyword pauses function execution and yields a value, turning the function into a generator.", "Easy"),
        ("What is the time complexity of looking up a key in a standard Python dictionary on average?", "O(n)", "O(log n)", "O(1)", "O(n^2)", "C", "Python dictionaries are implemented as hash tables, providing average O(1) time complexity.", "Medium"),
        ("How do you create a shallow copy of a list named `lst` in Python?", "lst.copy()", "lst[:]", "list(lst)", "All of the above", "D", "All three methods (lst.copy(), lst[:], and list(lst)) create a shallow copy of a list.", "Easy"),
        ("Which built-in module is used for serializing and deserializing Python objects?", "json", "pickle", "marshal", "shelve", "B", "pickle is the standard Python module for object serialization.", "Medium"),
        ("What does the `@property` decorator do in Python classes?", "Defines a static method", "Turns a method into a getter attribute", "Caches return values", "Prevents method overriding", "B", "@property allows accessing a class method like a readable attribute.", "Medium"),
        ("What is the output of `bool('False')` in Python?", "False", "True", "Error", "None", "B", "Any non-empty string in Python evaluates to True in boolean context.", "Easy"),
        ("Which of the following creates an immutable sequence of elements?", "list", "set", "tuple", "dict", "C", "Tuples are immutable sequences in Python.", "Easy"),
        ("What does `*args` and `**kwargs` represent in a function signature?", "Pointers and double pointers", "Positional variable arguments and keyword variable arguments", "Matrix multiplications", "Global variables", "B", "*args unpacks positional arguments as a tuple, **kwargs unpacks keyword arguments as a dictionary.", "Medium"),
        ("What does the Global Interpreter Lock (GIL) do in CPython?", "Compiles bytecode to native assembly", "Restricts execution of Python bytecode to one native thread at a time", "Allocates memory dynamically", "Optimizes recursive functions", "B", "GIL prevents multiple native threads from executing Python bytecodes simultaneously in CPython.", "Hard"),
        ("Which method is called when an object is garbage collected in Python?", "__init__", "__del__", "__exit__", "__clean__", "B", "__del__ is the destructor method invoked before garbage collection.", "Hard"),
        ("What is the result of `2 ** 3 ** 2` in Python?", "64", "512", "128", "256", "B", "Exponentiation operator ** associates from right to left: 3 ** 2 = 9, 2 ** 9 = 512.", "Medium"),
        ("Which statement correctly handles multiple exceptions in Python 3?", "except (ValueError, TypeError):", "except ValueError, TypeError:", "except [ValueError, TypeError]:", "catch (ValueError, TypeError)", "A", "Multiple exceptions must be grouped in a tuple: except (ValueError, TypeError):.", "Easy"),
        ("What does the `enumerate()` function return?", "A list of keys", "An enumerate object that yields index and value pairs", "The total count of items", "A sorted copy", "B", "enumerate(iterable) yields (index, item) pairs sequentially.", "Easy"),
        ("What is the difference between `is` and `==` in Python?", "`is` checks value equality, `==` checks identity", "`is` checks identity (memory location), `==` checks value equality", "They are identical in Python 3", "`is` works only for integers", "B", "`is` compares object identity (id), whereas `==` checks equality of values.", "Medium"),
        ("Which comprehension expression creates a generator?", "[x for x in range(10)]", "{x for x in range(10)}", "(x for x in range(10))", "{x: x for x in range(10)}", "C", "Parentheses with a comprehension syntax create a generator expression.", "Medium"),
    ],
    "Java": [
        ("Which data structure is synchronized by default in Java?", "ArrayList", "Vector", "LinkedList", "HashSet", "B", "Vector is thread-safe and synchronized by default in java.util.", "Easy"),
        ("What is the default value of an uninitialized boolean variable in a Java class?", "true", "false", "null", "0", "B", "Instance boolean variables in Java default to false.", "Easy"),
        ("Which keyword prevents a class from being subclassed in Java?", "static", "abstract", "final", "immutable", "C", "The final keyword applied to a class prevents inheritance.", "Easy"),
        ("What is the size of a `float` in Java?", "16 bits", "32 bits", "64 bits", "128 bits", "B", "In Java, float is a single-precision 32-bit IEEE 754 floating point.", "Easy"),
        ("Which Java collection preserves insertion order and allows null elements?", "TreeSet", "LinkedHashSet", "HashSet", "PriorityQueue", "B", "LinkedHashSet maintains a doubly-linked list across its elements, preserving insertion order.", "Medium"),
        ("What happens when an exception is thrown in a `try` block that has a `finally` block?", "Finally executes only if exception is caught", "Finally executes regardless of whether exception is caught", "Finally is skipped if uncaught", "Program terminates immediately", "B", "The finally block always executes whether an exception is handled or not.", "Medium"),
        ("What is the contract between `equals()` and `hashCode()` in Java?", "If equals() is true, hashCode() must return the same value", "If hashCode() is equal, equals() must be true", "No relation", "Both must return unique integers", "A", "If two objects are equal according to equals(), their hashCodes must be identical.", "Hard"),
        ("Which garbage collector was introduced as default in Java 9?", "Serial GC", "Parallel GC", "G1 (Garbage-First) GC", "ZGC", "C", "G1 GC replaced the Parallel collector as the default in JDK 9.", "Hard"),
        ("Can an abstract class in Java have constructors?", "No, abstract classes cannot have constructors", "Yes, invoked when a subclass is instantiated", "Only private constructors", "Only static constructors", "B", "Abstract classes can define constructors, which are called via super() during subclass instantiation.", "Medium"),
        ("What does `volatile` keyword guarantee in Java multi-threading?", "Atomicity of compound operations", "Visibility of changes across threads", "Mutual exclusion like synchronized", "Thread priority boost", "B", "volatile ensures writes to a variable are immediately visible to all threads.", "Hard"),
        ("What is a functional interface in Java 8?", "An interface with no methods", "An interface with exactly one abstract method", "An interface with only default methods", "Any interface inside java.util", "B", "A functional interface has exactly one abstract method (SAM), annotated with @FunctionalInterface.", "Medium"),
        ("Which package contains the Stream API in Java?", "java.io", "java.util.stream", "java.lang.stream", "java.nio", "B", "Stream API resides in java.util.stream.", "Easy"),
        ("What is the result of `String s = \"hello\"; s.concat(\" world\"); System.out.println(s);`?", "hello world", "hello", "world", "NullPointerException", "B", "Strings are immutable; s.concat(...) returns a new string without modifying s.", "Easy"),
        ("What does JVM bytecode get executed by?", "Operating system kernel directly", "Java Virtual Machine Execution Engine (Interpreter + JIT)", "Web browser", "Database engine", "B", "JVM Execution Engine interprets bytecode and compiles hot spots via JIT compiler.", "Medium"),
        ("Which access modifier is the most restrictive in Java?", "default (package-private)", "protected", "private", "public", "C", "private restricts visibility strictly to the enclosing class.", "Easy"),
        ("What does the `transient` keyword signify in Java?", "The variable cannot be modified", "The variable will not be serialized", "The variable is stored in flash memory", "The variable is accessible by native code", "B", "transient fields are skipped during Java object serialization.", "Medium"),
    ],
    "C": [
        ("What is the format specifier for a pointer address in printf?", "%d", "%s", "%p", "%x", "C", "%p is the standard C format specifier for printing pointer addresses.", "Easy"),
        ("What is the return type of `malloc()` in C?", "int*", "char*", "void*", "size_t", "C", "malloc returns void* which represents a generic pointer to uninitialized memory.", "Easy"),
        ("What is the output of `sizeof('a')` in standard C?", "1", "4", "2", "8", "B", "In C, character literals like 'a' have type int, which is typically 4 bytes.", "Medium"),
        ("Which header file is required to use `strlen()` in C?", "<stdio.h>", "<stdlib.h>", "<string.h>", "<strings.h>", "C", "<string.h> defines string manipulation functions including strlen.", "Easy"),
        ("What is a segmentation fault?", "CPU clock timeout", "Attempting to access unauthorized or unallocated memory", "Infinite while loop", "Division by zero", "B", "A segmentation fault occurs when hardware/OS detects access to restricted memory pages.", "Medium"),
        ("What is the value of an uninitialized local variable with `static` storage class in C?", "Garbage value", "0", "NULL", "-1", "B", "Static local variables are automatically initialized to zero (or NULL for pointers).", "Easy"),
        ("What does the `volatile` qualifier tell the C compiler?", "Store variable in GPU registers", "Do not optimize away reads/writes because value can change externally", "Make variable read-only", "Make variable thread-safe automatically", "B", "volatile prevents compiler optimizations that assume memory doesn't change unexpectedly.", "Hard"),
        ("What is the difference between a structure and a union in C?", "Structures use pointers, unions do not", "Union members share the same memory location, structure members each have their own memory", "Unions can only hold ints", "Structures cannot be nested", "B", "Union members overlap in the same memory location, sized to the largest member.", "Medium"),
        ("What happens if you free a pointer twice (double free)?", "Memory is cleaned better", "Undefined behavior, often leading to heap corruption or security vulnerabilities", "Compiler warning only", "Ignored safely", "B", "Double-freeing corrupts heap management data structures causing crashes or vulnerabilities.", "Medium"),
        ("Which operator has the highest precedence in C?", "++ (postfix)", "* (dereference)", "+ (addition)", "&& (logical AND)", "A", "Postfix operators like ++ and -- have higher precedence than unary dereference and binary operators.", "Medium"),
        ("What does `int *const ptr;` mean?", "A pointer to a constant integer", "A constant pointer to an integer (address cannot change)", "A constant pointer to a constant integer", "Invalid syntax", "B", "The const applies to ptr, making the pointer itself immutable while the integer it points to is mutable.", "Hard"),
        ("What is the output of `printf(\"%d\", 5 >> 1);`?", "10", "2", "2.5", "5", "B", "5 >> 1 shifts bits to the right by 1: 101 >> 1 = 010 (binary) = 2 in decimal.", "Easy"),
        ("Which function is used to dynamically deallocate memory?", "free()", "delete()", "clear()", "drop()", "A", "free() deallocates memory previously allocated by malloc/calloc/realloc.", "Easy"),
        ("What is a dangling pointer in C?", "A pointer pointing to NULL", "A pointer pointing to memory that has already been deallocated", "A pointer that has not been initialized", "A void pointer", "B", "A dangling pointer holds the address of memory that has been freed.", "Medium"),
        ("What does `#pragma once` do in C/C++ headers?", "Compiles file once per second", "Ensures the header file is included only once per compilation unit", "Disables all warnings", "Inlines all functions", "B", "#pragma once is a preprocessor directive preventing multiple inclusions of a header.", "Easy"),
        ("What does `calloc(n, size)` do differently than `malloc(n * size)`?", "calloc uses faster RAM", "calloc initializes allocated memory bytes to zero", "calloc cannot fail", "calloc works only for arrays of floats", "B", "calloc zeroes out allocated memory, while malloc leaves memory uninitialized.", "Medium"),
    ],
    "SQL": [
        ("Which SQL clause is used to filter records after aggregation with GROUP BY?", "WHERE", "HAVING", "FILTER", "ORDER BY", "B", "HAVING filters grouped records after aggregation; WHERE filters individual rows before grouping.", "Easy"),
        ("What is the difference between UNION and UNION ALL?", "UNION keeps duplicates, UNION ALL removes duplicates", "UNION removes duplicates, UNION ALL retains all duplicates", "UNION works only on numbers", "There is no difference", "B", "UNION performs a distinct sort removing duplicates; UNION ALL concatenates directly.", "Easy"),
        ("Which type of JOIN returns all records from both tables, filling missing matches with NULL?", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "D", "FULL OUTER JOIN returns matched rows and unmatched rows from both tables with NULLs.", "Easy"),
        ("What does the ACID property 'I' stand for in database transactions?", "Integrity", "Isolation", "Immutability", "Indexing", "B", "ACID stands for Atomicity, Consistency, Isolation, Durability.", "Easy"),
        ("Which SQL window function assigns sequential rank numbers without skipping gaps upon ties?", "RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()", "B", "DENSE_RANK() assigns consecutive rank numbers (e.g., 1, 2, 2, 3) without skipping ranks.", "Medium"),
        ("What is the purpose of an INDEX on a database column?", "Encrypt column values", "Speed up data retrieval operations at the cost of slower writes and additional storage", "Prevent null values", "Enforce foreign keys", "B", "Indexes build B-Tree or Hash search trees to accelerate SELECT queries.", "Medium"),
        ("Which constraint ensures all values in a column are distinct and not null?", "UNIQUE", "NOT NULL", "PRIMARY KEY", "FOREIGN KEY", "C", "A PRIMARY KEY uniquely identifies each record and implies both UNIQUE and NOT NULL.", "Easy"),
        ("What does the `COALESCE()` function do in SQL?", "Converts text to uppercase", "Returns the first non-null expression among its arguments", "Computes moving average", "Merges two tables", "B", "COALESCE(val1, val2, ...) evaluates arguments in order and returns the first non-null.", "Medium"),
        ("What is the result of `NULL = NULL` in SQL standard evaluation?", "TRUE", "FALSE", "UNKNOWN (NULL)", "Error", "C", "In SQL three-valued logic, comparing NULL to NULL with = yields UNKNOWN.", "Medium"),
        ("Which isolation level prevents Dirty Reads, Non-repeatable Reads, and Phantom Reads?", "Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable", "D", "Serializable is the highest isolation level providing full transaction isolation.", "Hard"),
        ("What is a Common Table Expression (CTE) defined with?", "CREATE VIEW", "WITH", "DECLARE", "TEMP TABLE", "B", "CTEs are temporary named result sets defined using the WITH clause.", "Medium"),
        ("What is database normalization mainly used for?", "Compressing data tables", "Eliminating redundant data and improving data integrity", "Speeding up backups", "Generating PDF reports", "B", "Normalization organizes tables to reduce redundancy and avoid insertion/update/deletion anomalies.", "Easy"),
        ("Which statement correctly removes all rows from a table quickly and resets identity counters in most RDBMS?", "DELETE FROM table;", "DROP TABLE table;", "TRUNCATE TABLE table;", "REMOVE ALL FROM table;", "C", "TRUNCATE TABLE is a DDL operation that deallocates data pages quickly.", "Medium"),
        ("What is the difference between clustered and non-clustered index?", "Clustered index physically sorts table data; non-clustered creates a separate lookup pointer structure", "Non-clustered is faster for inserts", "A table can have multiple clustered indexes", "Clustered index stores data in RAM", "A", "A table can have only one clustered index because rows can only be physically sorted one way.", "Hard"),
        ("Which SQL aggregate function computes the standard deviation in ANSI SQL?", "STDDEV() or STDEV()", "VAR()", "AVG_DEV()", "SQRT()", "A", "STDDEV() / STDEV() calculates the standard deviation of numerical values.", "Medium"),
        ("What does `EXPLAIN` or `EXPLAIN ANALYZE` do in SQL databases?", "Runs unit tests on SQL query", "Displays the query execution plan generated by the query optimizer", "Validates table foreign keys", "Formats SQL code", "B", "EXPLAIN shows indexes used, join algorithms, estimated costs, and execution steps.", "Hard"),
    ],
    "HTML": [
        ("What is the purpose of the `<!DOCTYPE html>` declaration?", "Defines the stylesheet", "Informs the web browser that the document is an HTML5 document", "Imports JavaScript libraries", "Declares document charset", "B", "<!DOCTYPE html> instructs modern browsers to render in HTML5 standards mode.", "Easy"),
        ("Which HTML5 element is semantically used for main site navigation links?", "<menu>", "<nav>", "<links>", "<header>", "B", "The <nav> tag represents a section of a page intended for navigation links.", "Easy"),
        ("Which attribute is used to provide an accessible alternative text for images?", "title", "caption", "alt", "src-desc", "C", "The alt attribute provides alternative text for screen readers and failed image loads.", "Easy"),
        ("What is the difference between `<section>` and `<article>` tags in HTML5?", "<article> is self-contained and independently distributable content; <section> represents a generic thematic grouping", "<section> must always contain an <article>", "<article> is deprecated in HTML5", "They are identical in browser rendering", "A", "<article> is intended for reusable/syndicatable standalone content like a blog post.", "Medium"),
        ("Which HTML element is used to link an external CSS stylesheet?", "<style>", "<link>", "<css>", "<script>", "B", "<link rel=\"stylesheet\" href=\"styles.css\"> embeds external stylesheets.", "Easy"),
        ("What does the `defer` attribute do in a `<script>` tag?", "Executes script synchronously before DOM parses", "Downloads script asynchronously and executes it after DOM parsing is complete", "Prevents script from executing", "Delays execution by 5 seconds", "B", "defer downloads script in background and executes in document order once DOM tree is constructed.", "Medium"),
        ("What is the purpose of the HTML5 `<canvas>` element?", "Play MP4 video files", "Render 2D shapes and bitmap graphics dynamically via JavaScript", "Create SVG vector animations", "Render rich text tables", "B", "<canvas> provides a scriptable bitmap drawing surface manipulated by JavaScript.", "Easy"),
        ("Which input type provides built-in browser validation for email addresses?", "type=\"text\"", "type=\"mail\"", "type=\"email\"", "type=\"address\"", "C", "<input type=\"email\"> validates standard email formatting before submission.", "Easy"),
        ("What is the purpose of `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">`?", "Specifies page language", "Ensures responsive layout scaling properly on mobile devices", "Enables cookie storage", "Sets browser window title", "B", "The viewport meta tag configures dimensions and initial zoom for responsive mobile rendering.", "Medium"),
        ("Which HTML attribute is used to open a hyperlink in a new browser tab?", "target=\"_self\"", "target=\"_blank\"", "target=\"_newtab\"", "window=\"new\"", "B", "target=\"_blank\" instructs the browser to open the target document in a new window or tab.", "Easy"),
        ("What does semantic HTML improve?", "Accessibility (screen readers), SEO, and code maintainability", "Download speeds only", "CSS selector specificity exclusively", "Database queries", "A", "Semantic elements clearly describe their meaning to both browser and developer.", "Medium"),
        ("Which tag is used to embed audio files natively in HTML5?", "<sound>", "<audio>", "<media>", "<music>", "B", "HTML5 provides the <audio> tag with native playback controls.", "Easy"),
        ("What is the function of the `<template>` element in HTML5?", "Immediately renders on screen", "Holds client-side content hidden from render until instantiated by JavaScript", "Styles shadow DOM", "Defines backend templates", "B", "Content inside <template> is inert and invisible until cloned and added to the DOM.", "Hard"),
        ("Which attribute is used to make an HTML element directly editable by the user?", "editable=\"true\"", "contenteditable=\"true\"", "user-modify=\"read-write\"", "allow-edit", "B", "contenteditable enables in-place editing of text directly inside the browser.", "Medium"),
        ("What does the `aria-live` attribute do in accessibility?", "Streams video", "Notifies assistive technologies when dynamic content updates occur", "Enables microphone access", "Forces high contrast", "B", "aria-live (polite/assertive) informs screen readers to announce dynamic DOM changes.", "Hard"),
        ("What is the correct structure of a basic HTML table?", "<table><tr><th></th></tr><tr><td></td></tr></table>", "<table><row><col></col></row></table>", "<grid><header><cell></cell></header></grid>", "<table><td><tr></tr></td></table>", "A", "HTML tables use <table>, <tr> for table row, <th> for header cell, and <td> for data cell.", "Easy"),
    ],
    "CSS": [
        ("What is the default value of the `position` property in CSS?", "relative", "absolute", "static", "fixed", "C", "Default position is static; elements follow normal document flow.", "Easy"),
        ("In the CSS Box Model, what is the order from outermost to innermost?", "Margin -> Border -> Padding -> Content", "Border -> Margin -> Padding -> Content", "Padding -> Border -> Margin -> Content", "Content -> Padding -> Border -> Margin", "A", "The CSS Box Model comprises Margin, Border, Padding, and Content at the center.", "Easy"),
        ("What is the effect of setting `box-sizing: border-box;`?", "Padding and border are added outside the specified width", "Padding and border are included within the specified width and height", "Removes all margins", "Disables borders", "B", "border-box ensures width and height include padding and borders, avoiding layout breakage.", "Medium"),
        ("Which CSS Flexbox property aligns items along the cross axis?", "justify-content", "align-items", "flex-direction", "align-content", "B", "align-items aligns flex items along the cross axis (vertically in a row container).", "Easy"),
        ("What is the difference between `display: none;` and `visibility: hidden;`?", "display: none removes element from document flow; visibility: hidden hides it while preserving its space", "visibility: hidden removes element from flow", "display: none hides only child text", "They are identical in rendering", "A", "display: none collapses layout; visibility: hidden makes element invisible without changing layout.", "Easy"),
        ("Which selector has the highest specificity in CSS?", "Class selector (.card)", "ID selector (#header)", "Element selector (div)", "Universal selector (*)", "B", "ID selectors (100) have higher specificity than classes (10) or elements (1).", "Medium"),
        ("What does `rem` unit represent in CSS?", "Relative to the font-size of the immediate parent element", "Relative to the font-size of the root (<html>) element", "Relative to viewport width", "Pixels divided by 10", "B", "rem stands for 'root em' and scales relative to the root <html> element's font-size.", "Easy"),
        ("Which CSS Grid property defines columns with flexible sizing?", "grid-template-columns: repeat(3, 1fr);", "grid-columns: 3;", "grid-layout: 3-column;", "columns: 3fr;", "A", "grid-template-columns with fr units (fraction of free space) creates responsive columns.", "Medium"),
        ("What is a CSS Preprocessor?", "A browser engine that renders CSS", "A tool (like SASS/SCSS or LESS) that compiles enhanced syntax into standard CSS", "A JavaScript bundler", "A CSS validator", "B", "SASS, LESS, and Stylus are CSS preprocessors adding variables, nesting, and mixins.", "Easy"),
        ("What does the `z-index` property do in CSS?", "Scales element size", "Controls vertical scrolling", "Sets the stack order of positioned elements along the Z-axis", "Sets opacity", "C", "z-index controls 3D stacking order for elements with position other than static.", "Easy"),
        ("How do you write a media query for screens with a maximum width of 768px?", "@media (max-width: 768px) { ... }", "@screen (width <= 768px) { ... }", "@query max-width 768px { ... }", "@responsive (768px) { ... }", "A", "@media (max-width: 768px) targets viewports at or below 768 pixels.", "Easy"),
        ("What does `transform: translate3d(0, 0, 0);` often trigger in modern browsers?", "Print stylesheet", "Hardware GPU acceleration layer", "Font smoothing", "3D glasses mode", "B", "translate3d prompts the browser to composite the element using GPU hardware acceleration.", "Hard"),
        ("What is the CSS pseudo-element used to insert cosmetic content before an element's content?", "::before", ":first-child", "::ahead", ":prepend", "A", "::before inserts generated content defined in the content property before element content.", "Easy"),
        ("What does `overflow: auto;` do when content exceeds container boundaries?", "Always displays scrollbars", "Hides all excess content", "Adds scrollbars only when content actually overflows", "Expands viewport automatically", "C", "auto displays scrollbars conditionally only when content exceeds dimensions.", "Easy"),
        ("What does `calc(100% - 20px)` do in CSS?", "Subtracts 20 pixels from full container width dynamically", "Generates syntax error", "Rounds down to nearest integer", "Applies margin", "A", "calc() performs dynamic mathematical operations mixing different units in CSS.", "Medium"),
        ("What is CSS BEM methodology?", "A CSS framework like Bootstrap", "Block Element Modifier naming convention for scalable, modular CSS classes", "Browser engine renderer", "CSS minifier algorithm", "B", "BEM (Block, Element, Modifier) is a popular class naming convention (e.g. card__title--active).", "Medium"),
    ],
    "JavaScript": [
        ("What is the output of `typeof null` in JavaScript?", "\"null\"", "\"undefined\"", "\"object\"", "\"boolean\"", "C", "Due to a legacy bug in JavaScript's initial implementation, typeof null evaluates to 'object'.", "Easy"),
        ("What is the difference between `let` and `var` in JavaScript?", "let is function-scoped; var is block-scoped", "let is block-scoped; var is function-scoped", "var cannot be reassigned", "let is hoisted and initialized to undefined", "B", "let and const provide block scoping and temporal dead zone; var is function-scoped.", "Easy"),
        ("What is a Closure in JavaScript?", "A method to close browser tabs", "A function combined with references to its surrounding lexical environment", "A syntax error in arrow functions", "A sealed object", "B", "A closure gives an inner function access to its outer enclosing function's scope.", "Medium"),
        ("What will `console.log(0.1 + 0.2 === 0.3)` print in JavaScript?", "true", "false", "undefined", "TypeError", "B", "Due to IEEE 754 floating-point precision, 0.1 + 0.2 equals 0.30000000000000004, so it is false.", "Medium"),
        ("Which array method creates a new array with all elements that pass a test?", "map()", "filter()", "reduce()", "forEach()", "B", "filter() creates a shallow copy containing elements that return truthy for the predicate.", "Easy"),
        ("What is the Event Loop in JavaScript?", "A loop that animates canvas elements", "A mechanism that coordinates execution of call stack, microtasks (Promises), and macrotasks (timers, I/O)", "A while loop for event listeners", "A browser thread optimizer", "B", "The Event Loop monitors the call stack and event queues to achieve non-blocking single-threaded execution.", "Hard"),
        ("What does `Promise.all()` do if one of the promises rejects?", "Waits for others and ignores failure", "Immediately rejects with the error of the first rejected promise", "Returns an array with errors", "Retries three times", "B", "Promise.all fails fast and rejects immediately upon the first rejected promise.", "Medium"),
        ("What is the difference between `==` and `===` in JavaScript?", "`==` performs type coercion before comparison; `===` compares both value and type strictly", "`===` performs type coercion", "They are identical in ES6+", "`==` works only for numbers", "A", "Strict equality === checks type and value without performing implicit type casting.", "Easy"),
        ("What is the return value of `Array.prototype.map()`?", "undefined", "A new array containing the results of calling a provided function on every element", "The length of the array", "The modified original array in place", "B", "map() returns a new transformed array without mutating the source array.", "Easy"),
        ("What is the Temporal Dead Zone (TDZ)?", "Time between page unload and garbage collection", "The period between entering scope and variable declaration with let/const where accessing throws ReferenceError", "A timer delay in setTimeout", "A web worker sleep state", "B", "TDZ prevents accessing let/const variables prior to their declaration line in source code.", "Hard"),
        ("Which statement correctly exports a function in ES6 modules?", "export function foo() {}", "module.exports = foo;", "exports.foo = foo;", "export: function foo() {}", "A", "ES6 modules use named `export function foo() {}` or `export default` syntax.", "Easy"),
        ("What does `Object.freeze()` do?", "Prevents adding, removing, or modifying properties of an object shallowly", "Deeply freezes all nested objects", "Converts object to string", "Encrypts object keys", "A", "Object.freeze() makes an object's direct properties read-only and prevents property addition/deletion.", "Medium"),
        ("What is the purpose of `Array.prototype.reduce()`?", "Filters out invalid numbers", "Reduces an array to a single accumulator value by running a callback over each item", "Shrinks memory allocation", "Sorts items in ascending order", "B", "reduce() executes a reducer function on each element resulting in a single output value.", "Medium"),
        ("What does `bind()` do on a function in JavaScript?", "Calls the function immediately", "Returns a new function with its `this` keyword permanently bound to a specified object", "Converts function to arrow function", "Attaches DOM event listener", "B", "bind() creates a bound function with a specified context without executing it right away.", "Medium"),
        ("What does optional chaining (`?.`) accomplish in JavaScript?", "Executes a ternary conditional", "Safely accesses nested object properties without throwing error if a reference is null or undefined", "Chains asynchronous promises", "Checks type at runtime", "B", "Optional chaining (?.) short-circuits and evaluates to undefined if intermediate values are null/undefined.", "Easy"),
        ("What is the difference between `null` and `undefined`?", "`undefined` means a variable has been declared but not assigned a value; `null` is an intentional assignment of no value", "There is no difference", "`null` is a type, `undefined` is a number", "`undefined` is an object", "A", "undefined represents unintentional absence of value; null represents intentional absence.", "Easy"),
    ],
    "React": [
        ("What is the primary purpose of the Virtual DOM in React?", "Directly replaces the browser DOM entirely", "Maintains an in-memory representation of UI to compute minimal DOM mutations via reconciliation (diffing)", "Runs React code in WebAssembly", "Renders UI on GPU", "B", "The Virtual DOM allows React to diff state changes in memory and update only modified real DOM nodes.", "Easy"),
        ("Which React Hook is used to perform side effects (data fetching, subscriptions, DOM manipulation)?", "useState", "useReducer", "useEffect", "useMemo", "C", "useEffect manages side effects in functional components following rendering cycles.", "Easy"),
        ("Why should you avoid using array indices as `key` props in React lists when items can be reordered or deleted?", "It throws a syntax error", "It can cause UI state bugs and suboptimal reconciliation rendering", "Keys must always be strings", "Index is not accessible in JSX", "B", "Using indices as keys can corrupt component state and animations when order or items mutate.", "Medium"),
        ("What is the purpose of `useCallback` in React?", "Memoizes an expensive computed calculation value", "Memoizes a callback function definition between component re-renders", "Calls an API asynchronously", "Binds this keyword to functional components", "B", "useCallback caches function instances between renders to prevent unnecessary child re-renders.", "Medium"),
        ("What does the dependency array `[]` (empty array) passed to `useEffect` mean?", "The effect runs on every render", "The effect runs only once after the initial component mount", "The effect runs whenever props change", "The effect never runs", "B", "An empty dependency array [] tells React to execute the effect once after mounting.", "Easy"),
        ("What is the difference between controlled and uncontrolled components in React?", "Controlled components have form data handled by React state; uncontrolled use DOM refs directly", "Controlled components use Redux only", "Uncontrolled components are deprecated", "Controlled components cannot use inputs", "A", "Controlled components manage input values via React state; uncontrolled rely on the DOM itself.", "Medium"),
        ("What does `React.memo()` do?", "Memoizes a hook return value", "Higher-Order Component that skips re-rendering if component props have not changed", "Stores component in localStorage", "Provides state management like Redux", "B", "React.memo is a wrapper that memoizes functional components against redundant prop re-renders.", "Medium"),
        ("Which Hook is best suited for complex state logic with multiple sub-values or state transitions?", "useState", "useRef", "useReducer", "useContext", "C", "useReducer follows Redux-like action/reducer patterns and simplifies complex state transitions.", "Medium"),
        ("What is the purpose of `useRef` in React?", "Triggers component re-render on mutation", "Persists mutable values across renders without causing a re-render, or accesses real DOM nodes", "Creates global context", "Defines lazy loaded routes", "B", "useRef returns a mutable ref object whose .current value changes without triggering re-render.", "Easy"),
        ("What is React Fiber?", "React's CSS-in-JS library", "The complete rewrite of React's core reconciliation engine that enables interruptible rendering and priority scheduling", "A React build tool replacing Vite", "A state management library", "B", "React Fiber is the reconciliation algorithm that powers concurrent rendering and interruptible work units.", "Hard"),
        ("What is the purpose of the React Context API?", "To replace database storage", "To share state globally across the component tree without prop drilling", "To handle HTTP requests", "To compile JSX into JavaScript", "B", "Context allows passing data through the component tree without manually threading props at every level.", "Easy"),
        ("What must a custom React Hook always start with by convention?", "hook...", "get...", "use...", "react...", "C", "Custom hook names must start with 'use' so linting rules can enforce Hooks rules.", "Easy"),
        ("What is the purpose of `<Suspense>` in React?", "Catches runtime JavaScript errors like try/catch", "Displays a fallback UI (like a spinner) while child components are lazy loading or streaming data", "Freezes animations", "Terminates render loops", "B", "Suspense lets components wait for code splitting or data fetching while showing a fallback.", "Medium"),
        ("What is an Error Boundary in React?", "A try/catch block inside JSX", "A class component implementing componentDidCatch or getDerivedStateFromError to catch UI errors in children", "A server middleware", "A TypeScript type guard", "B", "Error boundaries catch JavaScript errors in their child component tree, log them, and display fallback UI.", "Hard"),
        ("How does React handle synthetic events?", "Attaches individual listeners to every single DOM node", "Uses event delegation to listen at the root container and wraps native events for cross-browser consistency", "Runs events in Web Workers", "Prevents all default behaviors", "B", "React delegates synthetic events at the root node for cross-browser uniformity and performance.", "Hard"),
        ("What is the purpose of `useMemo` in React?", "Caches expensive calculation results so they recalculate only when specified dependencies change", "Caches function references", "Runs asynchronous side effects", "Creates mutable variables", "A", "useMemo returns a memoized value, recalculating only when dependencies change.", "Easy"),
    ],
    "Machine Learning": [
        ("What is the difference between Supervised and Unsupervised Learning?", "Supervised uses labeled training data; Unsupervised discovers patterns in unlabeled data", "Supervised uses neural networks only", "Unsupervised does not use algorithms", "Supervised requires GPU hardware", "A", "Supervised learning maps inputs to known target labels; unsupervised discovers intrinsic structures without labels.", "Easy"),
        ("What is Overfitting in machine learning?", "Model performs well on training data but generalizes poorly to unseen test data", "Model performs poorly on both training and test data", "Model takes too long to train", "Model has too few parameters", "A", "Overfitting occurs when a model learns noise and specific details of the training set instead of underlying patterns.", "Easy"),
        ("Which metric is most appropriate for evaluating a classification model on an imbalanced dataset?", "Accuracy", "F1-Score / PR-AUC", "Mean Squared Error (MSE)", "R-squared", "B", "F1-score (harmonic mean of Precision and Recall) balances false positives and false negatives on imbalanced data.", "Medium"),
        ("What does Gradient Descent optimize?", "Model parameters (weights and biases) by minimizing the loss function", "The number of CPU cores", "Dataset feature names", "Accuracy percentage directly", "A", "Gradient descent iteratively adjusts parameters in the direction of the steepest descent of the loss function.", "Easy"),
        ("What is the purpose of Cross-Validation (e.g., K-Fold)?", "Increases dataset size", "Assesses model generalizability and prevents evaluation bias across different data splits", "Speeds up inference speed", "Normalizes image pixels", "B", "K-Fold splits data into K subsets to evaluate model stability and avoid overfitting to a single split.", "Easy"),
        ("Which algorithm builds an ensemble of decision trees using bagging and random feature selection?", "K-Means", "Support Vector Machine", "Random Forest", "Logistic Regression", "C", "Random Forest fits multiple decision tree classifiers on sub-samples with random feature subsets.", "Easy"),
        ("What is the Vanishing Gradient problem in Deep Neural Networks?", "Loss function becomes negative", "Gradients become extremely small in early layers during backpropagation, halting learning", "Weights grow to infinity", "Dataset features disappear", "B", "In deep networks with activations like sigmoid, multiplying small derivative values decays gradients to near zero.", "Hard"),
        ("What does the ROC-AUC curve evaluate?", "Trade-off between True Positive Rate and False Positive Rate across all classification thresholds", "Regression error vs epochs", "Cluster compactness", "Feature importance ranks", "A", "ROC curves plot Sensitivity (TPR) vs 1-Specificity (FPR) across various decision thresholds.", "Medium"),
        ("What is the role of Regularization (L1 Lasso, L2 Ridge) in machine learning?", "Speeds up database queries", "Penalizes large weights to reduce model complexity and prevent overfitting", "Forces all weights to 1", "Converts classification to regression", "B", "Regularization adds a penalty term (L1: absolute weights, L2: squared weights) to the loss function.", "Medium"),
        ("What is the fundamental difference between L1 (Lasso) and L2 (Ridge) regularization?", "L1 can drive weights to exactly zero (feature selection); L2 shrinks weights toward zero without setting them to zero", "L2 performs feature selection", "L1 is for neural networks only", "Ridge uses absolute values", "A", "Lasso's diamond-shaped constraint produces sparse models by zeroing out uninformative features.", "Hard"),
        ("Which clustering algorithm groups data based on centroid distances and requires specifying 'k' in advance?", "DBSCAN", "K-Means", "Agglomerative Hierarchical", "PCA", "B", "K-Means iteratively assigns points to the nearest of K predefined cluster centroids.", "Easy"),
        ("What is the purpose of Principal Component Analysis (PCA)?", "Classification of time series", "Unsupervised dimensionality reduction by projecting data onto orthogonal axes of maximum variance", "Hyperparameter tuning", "Generating text descriptions", "B", "PCA identifies principal eigenvectors to reduce feature dimensions while preserving maximum variance.", "Medium"),
        ("What does Precision measure in classification?", "True Positives divided by (True Positives + False Positives)", "True Positives divided by (True Positives + False Negatives)", "Total correct divided by total samples", "False Positives divided by False Negatives", "A", "Precision answers: 'Of all instances predicted as positive, how many were actually positive?'", "Easy"),
        ("What does Recall (Sensitivity) measure in classification?", "True Positives divided by (True Positives + False Negatives)", "True Positives divided by (True Positives + False Positives)", "Accuracy on negative class", "Area under regression line", "A", "Recall answers: 'Of all actual positive instances, how many did the model correctly identify?'", "Easy"),
        ("What activation function is typically used in the output layer of a multi-class classification neural network?", "Sigmoid", "ReLU", "Softmax", "Tanh", "C", "Softmax exponentiates and normalizes outputs into a probability distribution summing to 1.", "Medium"),
        ("What is Data Leakage in machine learning?", "When confidential customer data is stolen", "When information from outside the training dataset (such as target or test data) is inadvertently used to train the model", "When a hard drive fails during training", "When features have missing values", "B", "Data leakage occurs when test information bleeds into preprocessing/training, yielding unrealistically optimistic metrics.", "Hard"),
    ],
    "Data Analytics": [
        ("What is the main difference between Descriptive and Predictive Analytics?", "Descriptive summarizes what happened historically; Predictive forecasts what is likely to happen", "Descriptive uses AI; Predictive uses SQL only", "There is no difference", "Predictive looks at past receipts only", "A", "Descriptive analyzes past events; predictive leverages statistical models and ML to forecast future outcomes.", "Easy"),
        ("Which statistical measure is most resistant to extreme outliers?", "Mean", "Median", "Standard Deviation", "Range", "B", "Median represents the 50th percentile and is robust against skewed outlier values.", "Easy"),
        ("In Python data analysis, which library is the industry standard for dataframe manipulation and tabular data?", "PyTorch", "Pandas", "Flask", "BeautifulSoup", "B", "Pandas provides DataFrame and Series data structures optimized for tabular data wrangling.", "Easy"),
        ("What does a Box Plot (Box-and-Whisker) visualize?", "Geographic map data", "Median, quartiles (IQR), whiskers, and potential outliers of a distribution", "Network latency", "Color palette frequencies", "B", "Box plots display distribution spread: Q1, Median (Q2), Q3, whiskers, and outlier points beyond 1.5*IQR.", "Easy"),
        ("What does a Pearson correlation coefficient of -0.85 indicate?", "No linear relationship", "A strong negative linear relationship between two variables", "An 85% probability of error", "A positive trend", "B", "Pearson r ranges from -1 to +1; -0.85 indicates a strong inverse linear relationship.", "Easy"),
        ("What is the Interquartile Range (IQR)?", "The difference between maximum and minimum values", "The difference between the 75th percentile (Q3) and 25th percentile (Q1)", "The average of the middle 50% numbers", "The standard deviation squared", "B", "IQR = Q3 - Q1, capturing the middle 50% spread of a data distribution.", "Medium"),
        ("What is Simpson's Paradox in statistical analysis?", "When sample size is too small to calculate mean", "A trend that appears in several different groups of data disappears or reverses when the groups are combined", "When variance is zero", "When correlation equals 1.0", "B", "Simpson's Paradox occurs when confounding lurking variables reverse aggregated conclusions.", "Hard"),
        ("What does an ETL pipeline stand for in data engineering and analytics?", "Evaluate, Transform, Learn", "Extract, Transform, Load", "Execute, Transfer, Log", "Export, Test, Link", "B", "ETL stands for Extracting data from sources, Transforming it into clean schemas, and Loading into data warehouses.", "Easy"),
        ("Which visual chart is most effective for comparing the proportional composition of categories over time?", "100% Stacked Bar / Area Chart", "Scatter Plot", "Histogram", "Radar Chart", "A", "Stacked area or 100% stacked bar charts show how individual sub-shares fluctuate across intervals.", "Medium"),
        ("What is the purpose of Data Normalization (Min-Max scaling)?", "Converts categorical strings to numbers", "Rescales numerical features to a common range (typically 0 to 1)", "Eliminates duplicate rows", "Calculates z-scores", "B", "Min-Max scaling transforms features to [0, 1] via (X - X_min) / (X_max - X_min).", "Medium"),
        ("What is a Pivot Table used for?", "To rotate database server racks", "To summarize, aggregate, and reorient tabular data for multi-dimensional analysis", "To create primary key indexes", "To delete null rows", "B", "Pivot tables allow reorganizing and calculating sums/averages across dimensions interactively.", "Easy"),
        ("What is the Central Limit Theorem (CLT)?", "All real-world populations are normally distributed", "The sampling distribution of the sample mean approaches a normal distribution as sample size increases, regardless of population shape", "Medians always equal means", "Sample size must be 1000", "B", "CLT states that sample means of sufficiently large random samples will be approximately normally distributed.", "Hard"),
        ("Which type of data distribution has a tail extending to the right with Mean > Median?", "Symmetric / Normal", "Right-skewed (Positively skewed)", "Left-skewed (Negatively skewed)", "Uniform", "B", "In right-skewed distributions, large outlier values pull the mean to the right of the median.", "Medium"),
        ("What is Cohort Analysis in product analytics?", "Surveying random website visitors", "Analyzing the behavior of a defined group sharing a common characteristic over successive time periods", "A/B testing two button colors", "Forecasting stock prices", "B", "Cohort analysis tracks metrics like retention across user groups segmented by signup month or acquisition channel.", "Hard"),
        ("What does the Pandas method `df.dropna(subset=['email'])` do?", "Deletes the email column entirely", "Removes rows where the 'email' column contains NaN/missing values", "Replaces nulls with empty string", "Fills null emails with default value", "B", "dropna with subset drops records missing values specifically in the specified columns.", "Easy"),
        ("What is the key difference between OLAP and OLTP databases?", "OLTP is optimized for transactional read/write operations; OLAP is optimized for complex analytical aggregations", "OLAP is for mobile apps only", "OLTP has no schemas", "OLAP uses SQLite", "A", "OLTP handles real-time transactional integrity; OLAP facilitates multidimensional queries over massive historical datasets.", "Hard"),
    ]
}

APTITUDE_QUESTIONS_DATA = {
    "Quantitative Aptitude": [
        ("A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?", "65 sec", "89 sec", "100 sec", "85 sec", "B", "Speed of train = 240 / 24 = 10 m/s. Total distance to pass platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.", "Medium", "Speed, Time & Distance"),
        ("If 12 men or 18 women can do a piece of work in 14 days, then in how many days can 8 men and 16 women finish the same work?", "9 days", "10 days", "12 days", "8 days", "A", "12 men = 18 women => 1 man = 1.5 women. 8 men = 12 women. Total = 12 + 16 = 28 women. Days = (18 * 14) / 28 = 9 days.", "Medium", "Time & Work"),
        ("The ratio of ages of two persons is 4:7 and one of them is 30 years older than the other. Find the sum of their ages.", "110 years", "120 years", "100 years", "90 years", "A", "Difference = 7x - 4x = 3x = 30 => x = 10. Sum = 4x + 7x = 11x = 110 years.", "Easy", "Ratio & Proportion"),
        ("A sum of money doubles itself at compound interest in 15 years. In how many years will it become 8 times itself?", "30 years", "45 years", "60 years", "40 years", "B", "P becomes 2P in 15 years. It becomes 2^3 = 8P in 15 * 3 = 45 years.", "Easy", "Compound Interest"),
        ("A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?", "3", "4", "5", "6", "C", "Cost price of 1 toffee = Rs. 1/6. Selling price of 1 toffee = (1/6) * 1.20 = Rs. 1/5. Hence, 5 toffees for a rupee.", "Medium", "Profit & Loss"),
        ("Find the average of all prime numbers between 30 and 50.", "39.8", "41.0", "38.5", "42.2", "A", "Primes between 30 and 50 are 31, 37, 41, 43, 47. Sum = 199. Count = 5. Average = 199 / 5 = 39.8.", "Medium", "Averages"),
        ("Two numbers are in the ratio 3 : 5. If their LCM is 75, what is the sum of the numbers?", "40", "30", "50", "35", "A", "Let numbers be 3x and 5x. LCM = 15x = 75 => x = 5. Numbers are 15 and 25. Sum = 40.", "Easy", "HCF & LCM"),
        ("A can complete a journey in 10 hours. He travels the first half of the journey at 21 km/hr and the second half at 24 km/hr. Find total distance.", "224 km", "230 km", "210 km", "250 km", "A", "Average speed for two equal halves = 2 * 21 * 24 / (21 + 24) = 1008 / 45 = 22.4 km/hr. Total distance = 22.4 * 10 = 224 km.", "Medium", "Speed, Time & Distance"),
        ("What is the probability of getting a sum of 9 when two fair six-sided dice are rolled?", "1/9", "1/6", "1/12", "1/8", "A", "Possible pairs for sum 9: (3,6), (4,5), (5,4), (6,3). Total 4 outcomes out of 36. Probability = 4/36 = 1/9.", "Easy", "Probability"),
        ("In how many different ways can the letters of the word 'LEADING' be arranged so that vowels always come together?", "360", "720", "480", "540", "B", "Vowels in LEADING: E, A, I (3 vowels). Treat (EAI) as 1 unit with L, D, N, G (4 consonants). Total 5 units arranged in 5! = 120 ways. 3 vowels arranged in 3! = 6 ways. Total = 120 * 6 = 720.", "Hard", "Permutations & Combinations"),
        ("If a pipe A fills a tank in 20 minutes and pipe B empties it in 30 minutes, how long will both together take to fill the tank?", "40 min", "50 min", "60 min", "35 min", "C", "Net rate per minute = 1/20 - 1/30 = (3 - 2)/60 = 1/60. Hence, 60 minutes.", "Easy", "Pipes & Cisterns"),
        ("A man bought a cycle for Rs. 1400 and sold it at a loss of 15%. What was the selling price?", "Rs. 1202", "Rs. 1190", "Rs. 1160", "Rs. 1000", "B", "Selling Price = 1400 * (1 - 0.15) = 1400 * 0.85 = Rs. 1190.", "Easy", "Profit & Loss"),
        ("A boat goes 24 km upstream in 6 hours and 28 km downstream in 4 hours. What is the speed of the current?", "1.5 km/hr", "2 km/hr", "3 km/hr", "1 km/hr", "A", "Upstream speed u = 24/6 = 4 km/hr. Downstream speed d = 28/4 = 7 km/hr. Current speed = (d - u)/2 = (7 - 4)/2 = 1.5 km/hr.", "Medium", "Boats & Streams"),
        ("The simple interest on a certain sum of money for 3 years at 8% per annum is half the compound interest on Rs. 4000 for 2 years at 10% per annum. What is the sum placed on simple interest?", "Rs. 1750", "Rs. 1800", "Rs. 2000", "Rs. 1500", "A", "CI on 4000 = 4000 * (1.1^2 - 1) = 4000 * 0.21 = Rs. 840. Half of CI = 420. SI = P * 3 * 8 / 100 = 420 => P = 42000 / 24 = Rs. 1750.", "Hard", "Simple & Compound Interest"),
        ("The diagonal of a rectangle is 17 cm long and its perimeter is 46 cm. Find the area of the rectangle.", "120 cm²", "130 cm²", "140 cm²", "110 cm²", "A", "2(l + b) = 46 => l + b = 23. l² + b² = 17² = 289. (l + b)² = l² + b² + 2lb => 529 = 289 + 2lb => 2lb = 240 => Area lb = 120 cm².", "Medium", "Mensuration"),
        ("A metallic sphere of radius 10.5 cm is melted and recast into small cones, each of radius 3.5 cm and height 3 cm. How many cones are formed?", "126", "132", "140", "112", "A", "Volume of sphere = (4/3) * pi * (10.5)³. Volume of one cone = (1/3) * pi * (3.5)² * 3. Ratio = [4 * 10.5³] / [3.5² * 3] = 4 * 1157.625 / 36.75 = 126 cones.", "Hard", "Mensuration"),
        ("If 20% of a = b, then b% of 20 is equal to what?", "4% of a", "5% of a", "20% of a", "None of these", "A", "b = 0.2a. b% of 20 = (b / 100) * 20 = (0.2a / 100) * 20 = 4a / 100 = 4% of a.", "Medium", "Percentages"),
        ("What is the units digit of 7^105?", "1", "3", "7", "9", "C", "Cyclicity of powers of 7 is 4: 7¹=7, 7²=9, 7³=3, 7⁴=1. 105 mod 4 = 1. Hence, units digit is 7.", "Medium", "Number Systems"),
        ("A bag contains 6 black and 8 white balls. One ball is drawn at random. What is the probability that the ball drawn is white?", "3/7", "4/7", "1/8", "3/4", "B", "Total balls = 6 + 8 = 14. White balls = 8. Probability = 8/14 = 4/7.", "Easy", "Probability"),
        ("A car covers four successive 3 km stretches at speeds of 10, 20, 30 and 60 km/hr respectively. Its average speed is:", "20 km/hr", "25 km/hr", "30 km/hr", "15 km/hr", "A", "Total distance = 12 km. Total time = 3/10 + 3/20 + 3/30 + 3/60 = (18 + 9 + 6 + 3)/60 = 36/60 = 0.6 hr. Avg speed = 12 / 0.6 = 20 km/hr.", "Medium", "Speed, Time & Distance")
    ],
    "Logical Reasoning": [
        ("Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?", "Brother", "Uncle", "Father", "Cousin", "C", "Only son of Suresh's mother is Suresh himself. So the boy is Suresh's son, making Suresh his Father.", "Easy", "Blood Relations"),
        ("Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", "1/3", "1/8", "2/8", "1/16", "B", "Each term is halved to get the next term. (1/4) * (1/2) = 1/8.", "Easy", "Number Series"),
        ("In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that code?", "MFEDJJOE", "MFEJDJOE", "EOJDEJFM", "EOJDJEFM", "D", "Reverse letters and increment: Last letter R becomes first letter R, middle letters shift forward +1. MEDICINE becomes EOJDJEFM.", "Medium", "Coding & Decoding"),
        ("Statements: All mangoes are golden in colour. No golden-coloured things are cheap. Conclusions: I. All mangoes are cheap. II. Golden-coloured mangoes are not cheap.", "Only I follows", "Only II follows", "Either I or II follows", "Neither follows", "B", "Since all mangoes are golden and no golden things are cheap, mangoes cannot be cheap. Hence II follows.", "Easy", "Syllogism"),
        ("A man walks 5 km East, then turns right and walks 4 km, then turns left and walks 5 km. In which direction is he now facing?", "East", "West", "North", "South", "A", "Facing East -> turns right (facing South) -> turns left (facing East). He is facing East.", "Easy", "Direction Sense"),
        ("Find the odd one out: 3, 5, 11, 14, 17, 21", "21", "14", "17", "11", "B", "14 is the only even number among all the numbers.", "Easy", "Classification"),
        ("If '+' means 'x', '-' means '/', 'x' means '-', and '/' means '+', then evaluate: 16 / 4 + 8 - 4 x 2 = ?", "22", "18", "24", "16", "A", "Substitute: 16 + 4 * 8 / 4 - 2 = 16 + (32 / 4) - 2 = 16 + 8 - 2 = 22.", "Medium", "Mathematical Operations"),
        ("Find the missing number in the sequence: 4, 9, 25, 49, 121, ?", "169", "144", "196", "225", "A", "The sequence represents squares of prime numbers: 2², 3², 5², 7², 11², so the next prime is 13² = 169.", "Medium", "Number Series"),
        ("A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", "Grandmother", "Granddaughter", "Daughter", "Grandfather", "B", "A is sister of B, both children of C. D is father of C. Therefore, A is the granddaughter of D.", "Medium", "Blood Relations"),
        ("Five friends A, B, C, D and E are sitting in a row facing North. C is sitting between A and E. B is sitting just to the right of E. D is at the extreme left. Who is sitting in the middle?", "A", "C", "E", "B", "B", "Order from left to right: D, A, C, E, B. C is exactly in the middle.", "Medium", "Seating Arrangement"),
        ("Statement: Should higher education in universities be made completely free for all citizens? Argument I: Yes, it will improve national literacy and equity. Argument II: No, it will strain national treasury and reduce infrastructure quality.", "Only argument I is strong", "Only argument II is strong", "Both arguments are strong", "Neither argument is strong", "C", "Both arguments present valid socioeconomic impacts regarding equity versus fiscal constraints.", "Hard", "Critical Reasoning"),
        ("Look at this pattern: FAG, GAF, HAI, IAH, ... What comes next?", "JAK", "HAL", "HAK", "JAI", "A", "First letters: F, G, H, I, J. Second letter is constant 'A'. Third letters: G, F, I, H, K. Result: JAK.", "Medium", "Letter Series"),
        ("If south-east becomes North, north-east becomes West and so on, what will West become?", "North-East", "South-East", "South-West", "North-West", "B", "Each direction is rotated by 135 degrees clockwise. West rotated 135 degrees clockwise becomes South-East.", "Hard", "Direction Sense"),
        ("Which diagram best represents the relationship between: Animals, Dogs, Pets?", "Three disjoint circles", "Two concentric circles and an intersecting circle", "A circle containing a circle with an overlapping circle (some dogs are pets, all dogs are animals)", "Three concentric circles", "C", "All dogs are animals. Some dogs are pets, and some pets are other animals or non-animals.", "Medium", "Venn Diagrams"),
        ("In a class of 45 students, rank of Rahul is 15th from the top. What is his rank from the bottom?", "30", "31", "32", "29", "B", "Rank from bottom = Total - Rank from top + 1 = 45 - 15 + 1 = 31st.", "Easy", "Order & Ranking"),
        ("If 'WATER' is coded as '12345' and 'STEAM' is coded as '63427', how is 'MASTER' coded?", "726345", "724356", "723456", "726341", "A", "Matching letters: M=7, A=2, S=6, T=3, E=4, R=5 => 726345.", "Medium", "Coding & Decoding"),
        ("If today is Monday, what day of the week will it be after 61 days?", "Tuesday", "Wednesday", "Saturday", "Sunday", "C", "61 mod 7 = 5 odd days. Monday + 5 days = Saturday.", "Easy", "Calendar"),
        ("At what angle are the hands of a clock inclined at 15 minutes past 5?", "67.5°", "64°", "52.5°", "72.5°", "A", "Angle = |30 * H - (11/2) * M| = |30 * 5 - (11/2) * 15| = |150 - 82.5| = 67.5 degrees.", "Medium", "Clocks"),
        ("Statements: All cars are cats. All cats are bats. Conclusion: All cars are bats.", "Definitely True", "Definitely False", "Probably False", "Cannot be determined", "A", "All A are B, and all B are C => All A are C is a valid categorical syllogism.", "Easy", "Syllogism"),
        ("Choose the word which is least like the other words in the group:", "Zinc", "Iron", "Aluminum", "Mercury", "D", "Mercury is the only metal among the options that is in liquid state at standard room temperature.", "Easy", "Odd One Out")
    ],
    "Verbal Ability": [
        ("Choose the antonym of the word: EPHEMERAL", "Transient", "Permanent", "Fleeting", "Fragile", "B", "Ephemeral means short-lived or transitory; its antonym is Permanent.", "Easy", "Antonyms"),
        ("Choose the synonym of the word: CANDID", "Deceitful", "Frank", "Secretive", "Shy", "B", "Candid means straightforward, open and truthful; synonym is Frank.", "Easy", "Synonyms"),
        ("Identify the correct spelling:", "Accomodate", "Accommodate", "Acommodate", "Accommadate", "B", "The correct spelling is 'Accommodate' with double 'c' and double 'm'.", "Easy", "Spelling"),
        ("Complete the sentence: The committee has _____ to postpone the decision until next month.", "agreed", "refused", "denied", "disregarded", "A", "In this context with the infinitive 'to postpone', 'agreed' completes the sentence grammatically and semantically.", "Easy", "Sentence Completion"),
        ("Choose the idiom meaning: 'To bite the bullet'", "To accept something difficult or unpleasant bravely", "To shoot a firearm", "To run away from danger", "To lose one's temper", "A", "'Bite the bullet' means to face a grim or painful situation with fortitude.", "Medium", "Idioms & Phrases"),
        ("Select the word that best substitutes: 'A person who collects or studies postage stamps'", "Numismatist", "Philatelist", "Somnambulist", "Cartographer", "B", "A philatelist collects and studies stamps. (Numismatist collects coins).", "Medium", "One Word Substitution"),
        ("Find the error in the sentence: 'Neither of the boys were present at the assembly.'", "'Neither of'", "'the boys'", "'were present'", "'at the assembly'", "C", "'Neither' is singular and takes the singular verb 'was present' rather than 'were present'.", "Medium", "Spotting Errors"),
        ("Choose the correct passive voice: 'The chef prepared a sumptuous meal.'", "A sumptuous meal was prepared by the chef.", "A sumptuous meal is prepared by the chef.", "A sumptuous meal had been prepared by the chef.", "The chef was preparing a sumptuous meal.", "A", "Simple past active becomes 'was/were + V3' in passive: 'A sumptuous meal was prepared by the chef.'", "Easy", "Active & Passive Voice"),
        ("Select the correct indirect speech: He said, 'I have completed my assignment.'", "He said that he has completed his assignment.", "He said that he had completed his assignment.", "He told he had completed his assignment.", "He says that he had completed his assignment.", "B", "Present perfect shifts to past perfect in indirect speech when reporting verb is in the past: 'had completed'.", "Medium", "Direct & Indirect Speech"),
        ("Choose the synonym of the word: PRAGMATIC", "Theoretical", "Practical", "Careless", "Imaginative", "B", "Pragmatic means dealing with things sensibly and realistically; synonym is Practical.", "Easy", "Synonyms"),
        ("Choose the antonym of the word: OBSOLETE", "Antiquated", "Modern", "Outdated", "Rusty", "B", "Obsolete means no longer in use or outdated; antonym is Modern.", "Easy", "Antonyms"),
        ("Identify the grammatical error: 'Each of the students have submitted their assignment.'", "'Each of'", "'have submitted'", "'their assignment'", "No error", "B", "'Each' is an indefinite singular pronoun requiring singular verb 'has submitted'.", "Medium", "Spotting Errors"),
        ("What is the meaning of the idiom: 'Burn the midnight oil'?", "To waste fuel", "To study or work late into the night", "To set things on fire", "To cause an argument", "B", "'Burn the midnight oil' means to work or study late into the night.", "Easy", "Idioms & Phrases"),
        ("One word substitution: 'Fear of confined or enclosed places'", "Acrophobia", "Claustrophobia", "Agoraphobia", "Hydrophobia", "B", "Claustrophobia is an extreme fear of enclosed or tight spaces.", "Easy", "One Word Substitution"),
        ("Choose the correct sentence:", "He is more taller than his brother.", "He is taller than his brother.", "He is most tall than his brother.", "He is more tall than his brother.", "B", "Comparative form of 'tall' is 'taller'; double comparatives like 'more taller' are incorrect.", "Easy", "Grammar Usage"),
        ("Complete the analogy: BIRD : AVIARY :: BEE : ?", "Aquarium", "Hive", "Burrow", "Stable", "B", "Birds live in an aviary; bees live in an apiary or hive.", "Easy", "Analogies"),
        ("Choose the antonym of the word: METICULOUS", "Thorough", "Careless", "Scrupulous", "Painstaking", "B", "Meticulous means showing great care and precision; antonym is Careless.", "Medium", "Antonyms"),
        ("Identify the correct preposition: She is proficient _____ French and Spanish.", "at", "in", "with", "on", "B", "The standard preposition after 'proficient' is 'in' (proficient in languages/skills).", "Medium", "Prepositions"),
        ("One word substitution: 'A remedy for all diseases or difficulties'", "Panacea", "Antibiotic", "Placebo", "Tonic", "A", "A panacea is a universal remedy or cure-all.", "Medium", "One Word Substitution"),
        ("Choose the synonym of the word: RESILIENT", "Brittle", "Flexible / Adaptable", "Fragile", "Rigid", "B", "Resilient means able to withstand or recover quickly from difficult conditions.", "Easy", "Synonyms")
    ]
}

def seed_question_banks_and_users():
    db = SessionLocal()
    try:
        # 1. Seed Technical Skill Questions
        print("Seeding Skill Questions...")
        for skill_name, questions in SKILL_QUESTIONS_DATA.items():
            for q_data in questions:
                q_text = q_data[0]
                existing = db.query(SkillQuestion).filter(
                    SkillQuestion.skill == skill_name,
                    SkillQuestion.question == q_text
                ).first()
                if not existing:
                    sq = SkillQuestion(
                        skill=skill_name,
                        question=q_text,
                        option_a=q_data[1],
                        option_b=q_data[2],
                        option_c=q_data[3],
                        option_d=q_data[4],
                        correct_option=q_data[5],
                        explanation=q_data[6],
                        difficulty=q_data[7]
                    )
                    db.add(sq)
        db.commit()

        # 2. Seed Aptitude Questions
        print("Seeding Aptitude Questions...")
        for category, questions in APTITUDE_QUESTIONS_DATA.items():
            for q_data in questions:
                q_text = q_data[0]
                existing = db.query(AptitudeQuestion).filter(
                    AptitudeQuestion.category == category,
                    AptitudeQuestion.question == q_text
                ).first()
                if not existing:
                    aq = AptitudeQuestion(
                        category=category,
                        question=q_text,
                        option_a=q_data[1],
                        option_b=q_data[2],
                        option_c=q_data[3],
                        option_d=q_data[4],
                        correct_option=q_data[5],
                        explanation=q_data[6],
                        difficulty=q_data[7],
                        topic=q_data[8] if len(q_data) > 8 else category
                    )
                    db.add(aq)
        db.commit()

        # 3. Seed Default Admin User
        print("Seeding Admin User...")
        admin = db.query(UserAccount).filter(UserAccount.username == "admin").first()
        if not admin:
            admin = UserAccount(
                username="admin",
                email="admin@datavista.edu",
                password_hash=hash_pw("admin123"),
                role="admin",
                full_name="DATA VISTA Administrator"
            )
            db.add(admin)
            db.commit()
            print(" -> Created Admin user: admin / admin123")
        else:
            print(" -> Admin user already exists.")

        # 4. Check Students and ensure accounts exist
        students = db.query(Student).all()
        for s in students:
            u = db.query(UserAccount).filter(UserAccount.username == s.student_id).first()
            if not u:
                u = UserAccount(
                    username=s.student_id,
                    email=s.email or f"{s.student_id.lower()}@college.edu",
                    password_hash=hash_pw("password123"),
                    role="student",
                    student_ref=s.student_id,
                    full_name=s.name
                )
                db.add(u)
        db.commit()

        total_sq = db.query(SkillQuestion).count()
        total_aq = db.query(AptitudeQuestion).count()
        total_users = db.query(UserAccount).count()
        print(f"Done! Total Skill Questions: {total_sq}")
        print(f"Total Aptitude Questions: {total_aq}")
        print(f"Total User Accounts: {total_users}")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_question_banks_and_users()
