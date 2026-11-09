"""
DATA VISTA - Beginner-Friendly Questions & Mock Interview Seeding Script
Populates:
1. Basic, beginner-friendly Skill Assessment Questions (10 skills x 15 questions = 150 questions)
   - Python, Java, C, SQL, HTML, CSS, JavaScript, React, Machine Learning, Data Analytics
2. Basic, easy Aptitude Assessment Questions (3 categories x 15 questions = 45 questions)
   - Quantitative Aptitude (simple percentages, basic ratios, simple arithmetic)
   - Logical Reasoning (simple series, basic patterns, directional/coding)
   - Verbal Ability (basic grammar, vocabulary, sentence completion)
3. Mock Interview Questions (Technical & HR)
   - 10 Technical domains (Python, Java, C, SQL, HTML & CSS, JavaScript, React, Machine Learning, Data Analytics)
   - 6 Essential HR Interview Questions
"""

from database import SessionLocal
from models import SkillQuestion, AptitudeQuestion, MockInterviewQuestion

SKILL_QUESTIONS = {
    "Python": [
        ("Which keyword is used to define a function in Python?", "func", "def", "function", "define", "B", "The 'def' keyword is used to define a function in Python.", "Easy"),
        ("What is the correct file extension for Python files?", ".pyt", ".pt", ".py", ".pyw", "C", "Standard Python script files end with the '.py' extension.", "Easy"),
        ("What is the output of print(2 + 3 * 2)?", "10", "8", "7", "12", "B", "Multiplication has higher precedence than addition: 3 * 2 = 6, then 2 + 6 = 8.", "Easy"),
        ("Which of the following is used to insert a single-line comment in Python?", "//", "/*", "#", "--", "C", "In Python, the hash symbol '#' is used for single-line comments.", "Easy"),
        ("Which built-in function returns the number of items in a list?", "count()", "size()", "length()", "len()", "D", "len() returns the number of elements in an iterable.", "Easy"),
        ("What is the output of bool(0) in Python?", "True", "False", "None", "Error", "B", "The integer 0 evaluates to False in a boolean context in Python.", "Easy"),
        ("Which data type is immutable in Python?", "List", "Dictionary", "Set", "Tuple", "D", "Tuples cannot be modified after creation, making them immutable.", "Easy"),
        ("How do you convert a string '123' to an integer in Python?", "int('123')", "str.to_int('123')", "parse('123')", "integer('123')", "A", "The int() built-in constructor converts valid numeric strings to integers.", "Easy"),
        ("What is the output of print('Hello'[0])?", "H", "e", "Hello", "Error", "A", "Python uses 0-based indexing, so index 0 accesses the first character 'H'.", "Easy"),
        ("Which keyword is used to create a loop that iterates over a sequence?", "while", "for", "loop", "iterate", "B", "The 'for' keyword iterates over items in sequences like lists, strings, or ranges.", "Easy"),
        ("What does the range(5) function generate?", "Numbers 1 to 5", "Numbers 0 to 4", "Numbers 0 to 5", "Numbers 1 to 4", "B", "range(5) starts at 0 and goes up to, but does not include, 5 (0, 1, 2, 3, 4).", "Easy"),
        ("Which method removes the last element from a Python list?", "delete()", "pop()", "remove()", "discard()", "B", "list.pop() removes and returns the last item from a list.", "Easy"),
        ("What is the output of print('Python' * 2)?", "PythonPython", "Python 2", "PythonPythonPython", "Error", "A", "The string repetition operator '*' duplicates strings.", "Easy"),
        ("Which operator is used to check if two values are equal in Python?", "=", "==", "===", "equals", "B", "'==' checks equality of values, while '=' is for variable assignment.", "Easy"),
        ("What keyword is used to import a library in Python?", "using", "include", "import", "require", "C", "The 'import' statement brings external or standard library modules into your script.", "Easy"),
    ],
    "Java": [
        ("Which keyword is used to declare a class in Java?", "class", "struct", "object", "define", "A", "The 'class' keyword is used to create classes in Java.", "Easy"),
        ("What is the entry point method for any standalone Java application?", "start()", "run()", "main()", "init()", "C", "public static void main(String[] args) is the required entry point in Java.", "Easy"),
        ("Which data type is used to store whole numbers in Java?", "float", "double", "int", "boolean", "C", "'int' is the standard primitive type for 32-bit signed integers in Java.", "Easy"),
        ("What is the default value of an uninitialized int variable in a class?", "0", "1", "null", "undefined", "A", "Numeric instance variables in Java default to 0.", "Easy"),
        ("Which keyword is used to inherit a class in Java?", "implements", "extends", "inherits", "super", "B", "The 'extends' keyword is used to subclass or inherit another class.", "Easy"),
        ("How do you print text to the console in Java?", "Console.Write()", "print()", "System.out.println()", "echo()", "C", "System.out.println() prints a line of text to standard output.", "Easy"),
        ("Which keyword prevents a variable's value from being modified?", "static", "final", "const", "abstract", "B", "The 'final' keyword creates constants whose values cannot be reassigned.", "Easy"),
        ("What is the index of the first element in a Java array?", "0", "1", "-1", "undefined", "A", "Java arrays are zero-indexed, starting at index 0.", "Easy"),
        ("Which of these is NOT a Java primitive data type?", "byte", "int", "String", "char", "C", "String is a class / reference type in Java, not a primitive.", "Easy"),
        ("What keyword is used to instantiate an object in Java?", "new", "create", "make", "instance", "A", "The 'new' operator allocates memory and invokes the constructor.", "Easy"),
        ("Which keyword is used to access members of the parent class?", "this", "parent", "super", "base", "C", "'super' refers directly to the immediate parent class.", "Easy"),
        ("What is the size of a boolean variable in Java?", "1 bit", "1 byte (JVM dependent)", "4 bytes", "8 bytes", "B", "The JVM specification specifies boolean as 1 byte in arrays and int-sized in registers.", "Easy"),
        ("Which statement is used to exit from a loop in Java?", "exit", "return", "break", "continue", "C", "'break' immediately terminates the innermost enclosing loop or switch statement.", "Easy"),
        ("What does JDK stand for?", "Java Development Kit", "Java Design Kernel", "Java Deployment Key", "Java Data Kit", "A", "JDK stands for Java Development Kit, containing compiler and runtime tools.", "Easy"),
        ("Which keyword is used to declare an interface in Java?", "interface", "abstract class", "implements", "contract", "A", "The 'interface' keyword is used to declare an interface.", "Easy"),
    ],
    "C": [
        ("Which header file is required for printf() and scanf() in C?", "<stdlib.h>", "<stdio.h>", "<conio.h>", "<math.h>", "B", "<stdio.h> provides standard input/output declarations.", "Easy"),
        ("What is the correct file extension for a C program source file?", ".cpp", ".c", ".cls", ".obj", "B", "Standard C source code files use the '.c' extension.", "Easy"),
        ("Which function is used to read formatted input from the console in C?", "read()", "input()", "scanf()", "cin", "C", "scanf() reads formatted input from standard input.", "Easy"),
        ("What is the format specifier used to print an integer in printf?", "%c", "%f", "%s", "%d", "D", "%d (or %i) is the format specifier for signed decimal integers.", "Easy"),
        ("What symbol is used to get the memory address of a variable in C?", "*", "&", "#", "@", "B", "The ampersand '&' is the address-of operator.", "Easy"),
        ("What value does a successful main() function traditionally return?", "1", "0", "-1", "100", "B", "Returning 0 from main() signals successful execution to the operating system.", "Easy"),
        ("Which symbol is used to end almost every statement in C?", ".", ":", ";", ",", "C", "Semicolons ';' terminate executable statements in C.", "Easy"),
        ("What is the size of an 'int' in standard 32-bit and 64-bit C compilers?", "1 byte", "2 bytes", "4 bytes", "8 bytes", "C", "An int is typically 4 bytes (32 bits) on modern desktop architectures.", "Easy"),
        ("Which escape sequence represents a new line in C?", "\\t", "\\n", "\\r", "\\0", "B", "\\n produces a newline character.", "Easy"),
        ("Which character is used to mark the end of a string in C?", "\\n", "\\t", "\\0", "EOF", "C", "The null character '\\0' terminates strings in C.", "Easy"),
        ("What is a pointer in C?", "A variable that stores a memory address", "A keyword for looping", "A type of array", "A compiler error", "A", "A pointer is a variable holding the address of another variable in memory.", "Easy"),
        ("Which keyword is used to prevent modification of a variable?", "static", "volatile", "const", "register", "C", "'const' declares a variable whose value cannot be altered after initialization.", "Easy"),
        ("What is the operator for logical AND in C?", "&", "&&", "AND", "|", "B", "'&&' is the short-circuiting logical AND operator in C.", "Easy"),
        ("Which function dynamically allocates memory in C?", "malloc()", "alloc()", "new()", "create()", "A", "malloc() allocates a specified number of bytes from the heap.", "Easy"),
        ("Which keyword is used to create user-defined composite data types in C?", "class", "struct", "object", "def", "B", "'struct' groups related variables of different types under one name.", "Easy"),
    ],
    "SQL": [
        ("What does SQL stand for?", "Structured Query Language", "Simple Question Language", "Standard Query Logic", "System Query Layout", "A", "SQL stands for Structured Query Language.", "Easy"),
        ("Which SQL clause is used to extract data from a database?", "GET", "SELECT", "PULL", "EXTRACT", "B", "The SELECT statement is used to query and fetch records from tables.", "Easy"),
        ("Which clause is used to filter records in a SQL query?", "ORDER BY", "FILTER", "WHERE", "GROUP BY", "C", "The WHERE clause specifies search conditions to filter rows.", "Easy"),
        ("Which SQL statement is used to insert new records into a table?", "ADD NEW", "INSERT INTO", "PUT RECORD", "CREATE ROW", "B", "INSERT INTO table_name VALUES (...) adds new rows to a table.", "Easy"),
        ("How do you select all columns from a table named 'Students'?", "SELECT * FROM Students;", "SELECT ALL FROM Students;", "SELECT Students.*;", "FETCH * FROM Students;", "A", "The asterisk '*' wildcard selects every column from the table.", "Easy"),
        ("Which SQL keyword is used to sort the result-set?", "SORT BY", "ORDER BY", "GROUP BY", "ARRANGE BY", "B", "ORDER BY sorts the returned records in ascending (ASC) or descending (DESC) order.", "Easy"),
        ("Which keyword sorts records in descending order?", "DESC", "DESCENDING", "DOWN", "REVERSE", "A", "DESC appended to ORDER BY sorts from highest to lowest or Z to A.", "Easy"),
        ("Which SQL aggregate function counts the number of rows?", "SUM()", "COUNT()", "TOTAL()", "ROWS()", "B", "COUNT(column) or COUNT(*) counts total matching records.", "Easy"),
        ("Which statement is used to update existing records in a database?", "UPDATE", "MODIFY", "ALTER", "CHANGE", "A", "UPDATE table_name SET col = val WHERE condition updates existing records.", "Easy"),
        ("Which command removes all rows and deletes a table structure completely?", "DELETE TABLE", "DROP TABLE", "REMOVE TABLE", "TRUNCATE", "B", "DROP TABLE completely removes the table schema and all its contents.", "Easy"),
        ("Which SQL keyword returns only unique (distinct) values?", "UNIQUE", "DISTINCT", "DIFFERENT", "ISOLATE", "B", "SELECT DISTINCT removes duplicate rows from the query output.", "Easy"),
        ("What does a PRIMARY KEY do in a SQL table?", "Allows duplicate values", "Uniquely identifies each record and cannot be NULL", "Encrypts column data", "Links two foreign databases", "B", "A PRIMARY KEY uniquely identifies rows and strictly disallows NULL values.", "Easy"),
        ("Which SQL clause is used with aggregate functions to group rows?", "ORDER BY", "GROUP BY", "CLUSTER BY", "JOIN BY", "B", "GROUP BY aggregates summary rows (e.g. COUNT, AVG, SUM).", "Easy"),
        ("Which operator is used to search for a specified pattern in a column?", "LIKE", "MATCH", "SEARCH", "CONTAINS", "A", "The LIKE operator is used in a WHERE clause for wildcard pattern matching.", "Easy"),
        ("What is the wild-card character in SQL representing zero or more characters?", "*", "%", "?", "_", "B", "The percent sign '%' represents zero, one, or multiple characters with LIKE.", "Easy"),
    ],
    "HTML": [
        ("What does HTML stand for?", "Hyper Text Markup Language", "High Tech Modern Language", "Hyperlinks and Text Marking Layout", "Home Tool Markup Language", "A", "HTML stands for Hyper Text Markup Language.", "Easy"),
        ("Which HTML tag is used to define an internal hyperlink?", "<link>", "<a>", "<href>", "<nav>", "B", "The <a> (anchor) tag creates hyperlinks via its href attribute.", "Easy"),
        ("Which is the largest heading tag in standard HTML?", "<heading>", "<h6>", "<h1>", "<head>", "C", "<h1> defines the most important and largest level heading.", "Easy"),
        ("Which HTML element is used to display an image?", "<picture>", "<img>", "<image>", "<src>", "B", "The <img> tag embeds images onto a web page.", "Easy"),
        ("Which attribute specifies an alternate text for an image if it cannot be displayed?", "title", "caption", "alt", "src", "C", "The 'alt' attribute provides fallback descriptive text for images.", "Easy"),
        ("Which tag is used to create an ordered (numbered) list?", "<ul>", "<ol>", "<li>", "<list>", "B", "<ol> creates numbered ordered lists, while <ul> creates bulleted lists.", "Easy"),
        ("Which tag defines a line break in HTML?", "<lb>", "<break>", "<br>", "<newline>", "C", "<br> is an empty self-closing element that inserts a single line break.", "Easy"),
        ("Where are metadata like <title> and stylesheet links placed in an HTML document?", "<body>", "<head>", "<meta>", "<footer>", "B", "The <head> section contains document metadata, page title, and external links.", "Easy"),
        ("Which HTML attribute is used to uniquely identify an element on a page?", "class", "id", "name", "key", "B", "The 'id' attribute must be unique across the entire HTML document.", "Easy"),
        ("Which tag is used to create a table row in an HTML table?", "<td>", "<th>", "<tr>", "<row>", "C", "<tr> stands for table row and contains <td> (data cells) or <th> (header cells).", "Easy"),
        ("Which input type defines a clickable button in an HTML form?", "<input type='clickable'>", "<input type='button'>", "<input type='press'>", "<input type='submit_btn'>", "B", "<input type='button'> or <button> creates a generic button element.", "Easy"),
        ("Which HTML5 element is used to play audio files?", "<sound>", "<audio>", "<mp3>", "<music>", "B", "The <audio> tag is standard in HTML5 for playing sound files.", "Easy"),
        ("How do you write a comment in HTML?", "// Comment", "/* Comment */", "<!-- Comment -->", "# Comment", "C", "HTML comments start with '<!--' and end with '-->'.", "Easy"),
        ("Which attribute is used to open a hyperlink in a new browser tab?", "target='_blank'", "target='_new'", "open='tab'", "window='new'", "A", "target='_blank' tells the browser to open the target URL in a new tab.", "Easy"),
        ("Which tag is used to define emphasized (italicized) text in HTML?", "<i>", "<em>", "<italic>", "Both A and B are common", "D", "Both <i> (visual italics) and <em> (semantic emphasis) italicize text in HTML.", "Easy"),
    ],
    "CSS": [
        ("What does CSS stand for?", "Cascading Style Sheets", "Creative Style System", "Computer Style Syntax", "Colorful Sheet Styles", "A", "CSS stands for Cascading Style Sheets.", "Easy"),
        ("Which CSS property is used to change the background color of an element?", "color", "bgcolor", "background-color", "surface-color", "C", "background-color sets the background color of an HTML element.", "Easy"),
        ("Which CSS property is used to change the text color?", "font-color", "text-color", "color", "foreground", "C", "'color' controls the color of text inside an element.", "Easy"),
        ("How do you select an element with id 'navbar' in CSS?", "#navbar", ".navbar", "*navbar", "&navbar", "A", "The hash symbol '#' selects elements by their id attribute.", "Easy"),
        ("How do you select all elements with the class 'card' in CSS?", "#card", ".card", "card", "*card", "B", "A period '.' selects elements belonging to a CSS class.", "Easy"),
        ("Which property controls the size of text?", "text-size", "font-size", "font-style", "size", "B", "'font-size' sets the scale and dimensions of font characters.", "Easy"),
        ("Which property is used to add space INSIDE an element's border?", "margin", "padding", "spacing", "border-spacing", "B", "padding adds internal spacing between content and border; margin adds outer space.", "Easy"),
        ("Which property adds space OUTSIDE an element's border?", "margin", "padding", "outline", "gap", "A", "margin creates space around elements outside any defined borders.", "Easy"),
        ("How do you make text bold in CSS?", "font-weight: bold;", "text-style: bold;", "font-bold: true;", "text-weight: 700px;", "A", "font-weight: bold (or numeric values like 700) makes fonts bold.", "Easy"),
        ("Which CSS display property turns a container into a flexible flexbox layout?", "display: box;", "display: flex;", "display: grid-flex;", "display: inline-block;", "B", "display: flex activates the CSS Flexible Box layout model.", "Easy"),
        ("What is the default value of the 'position' property in CSS?", "relative", "absolute", "static", "fixed", "C", "Elements are positioned 'static' by default, flowing with standard document layout.", "Easy"),
        ("Which CSS property centers text horizontally inside its block?", "align: center;", "text-align: center;", "horizontal-align: center;", "text-center: true;", "B", "text-align: center aligns text horizontally inside its container.", "Easy"),
        ("How do you write a comment in CSS?", "// comment", "/* comment */", "<!-- comment -->", "# comment", "B", "CSS comments are enclosed in /* and */.", "Easy"),
        ("Which property is used to round the corners of an element's border?", "corner-radius", "border-radius", "edge-round", "border-curve", "B", "border-radius softens and rounds corners of block elements.", "Easy"),
        ("Which unit is relative to the font-size of the root <html> element?", "em", "rem", "px", "%", "B", "'rem' (root em) is relative to the font-size of the root HTML element.", "Easy"),
    ],
    "JavaScript": [
        ("Which keyword declares a variable that can be reassigned in modern JavaScript?", "const", "let", "var", "Both let and var", "D", "Both 'let' and 'var' allow reassignment, with 'let' having block scope.", "Easy"),
        ("Which keyword declares a block-scoped constant variable in JavaScript?", "constant", "fixed", "const", "immutable", "C", "'const' declares variables whose binding cannot be reassigned.", "Easy"),
        ("What will `typeof 42` return in JavaScript?", "'number'", "'integer'", "'float'", "'int'", "A", "All numbers in standard JavaScript have the typeof 'number'.", "Easy"),
        ("What is the output of `console.log(2 + '2')` in JavaScript?", "4", "'22'", "NaN", "TypeError", "B", "The '+' operator converts the number to a string and concatenates: '22'.", "Easy"),
        ("Which method prints messages to the browser developer console?", "print()", "console.log()", "System.out.println()", "document.write()", "B", "console.log() is standard for logging data to the browser console.", "Easy"),
        ("Which operator tests both value and type equality (strict equality)?", "==", "===", "=", "equals", "B", "'===' checks both value equality and data type without type coercion.", "Easy"),
        ("How do you declare an arrow function in JavaScript?", "() => {}", "function => ()", "arrow() => {}", "def () -> {}", "A", "The '() => {}' syntax defines concise arrow functions in ES6.", "Easy"),
        ("Which method adds one or more elements to the end of an array?", "push()", "pop()", "shift()", "unshift()", "A", "array.push(item) adds elements to the end of an array.", "Easy"),
        ("What does NaN stand for in JavaScript?", "Not a Name", "Not a Null", "Not a Number", "New assigned Number", "C", "NaN stands for Not a Number, representing invalid mathematical operations.", "Easy"),
        ("Which built-in object provides mathematical constants and functions?", "Math", "Numbers", "Calc", "Geometry", "A", "The Math object provides methods like Math.round(), Math.max(), and Math.random().", "Easy"),
        ("Which array method creates a new array by applying a function to each element?", "forEach()", "map()", "filter()", "reduce()", "B", "Array.prototype.map() transforms each element into a new array.", "Easy"),
        ("What is the result of `Boolean('')` in JavaScript?", "true", "false", "null", "undefined", "B", "An empty string '' is a falsy value and evaluates to false.", "Easy"),
        ("Which method converts a JavaScript object into a JSON string?", "JSON.parse()", "JSON.stringify()", "JSON.toString()", "JSON.object()", "B", "JSON.stringify() serializes a JavaScript object into a JSON formatted string.", "Easy"),
        ("What is the DOM in web development?", "Data Object Model", "Document Object Model", "Dynamic Operational Matrix", "Document Order Module", "B", "DOM stands for Document Object Model, representing HTML elements as a tree.", "Easy"),
        ("Which event fires when a user clicks on an HTML element?", "onhover", "onchange", "onclick", "onpress", "C", "The 'click' event (or onclick attribute) triggers when an element is clicked.", "Easy"),
    ],
    "React": [
        ("What is React primarily used for building?", "Relational databases", "User interfaces (UI)", "Operating system kernels", "Server network drivers", "B", "React is an open-source JavaScript library for building interactive user interfaces.", "Easy"),
        ("What syntax extension allows writing HTML-like code inside JavaScript files?", "XML", "JSX", "TypeScript", "JSON", "B", "JSX (JavaScript XML) enables writing markup inside JavaScript components.", "Easy"),
        ("Which React Hook is used to manage local component state?", "useEffect", "useMemo", "useState", "useContext", "C", "useState declares a state variable and its updater function.", "Easy"),
        ("Which React Hook is used to handle side-effects like fetching data?", "useReducer", "useEffect", "useCallback", "useState", "B", "useEffect performs side effects (data fetching, DOM updates, subscriptions).", "Easy"),
        ("How are data values passed from a parent component to a child component?", "States", "Props", "Global pointers", "Cookies", "B", "Props (short for properties) pass read-only data from parent to child.", "Easy"),
        ("What must a functional React component return?", "A string only", "JSX / React elements (or null)", "A database query", "An HTTP response", "B", "React functional components return JSX elements describing what should appear on screen.", "Easy"),
        ("What is the virtual DOM in React?", "A real DOM cloned into a web worker", "A lightweight in-memory representation of the real DOM", "A browser extension", "A cloud server database", "B", "The Virtual DOM is a fast, in-memory tree that React diffs to minimize real DOM mutations.", "Easy"),
        ("Why is a unique 'key' prop required when rendering lists in React?", "To encrypt elements", "To help React identify which items have changed, been added, or removed", "To style items", "To count the array items", "B", "Unique keys allow React's reconciliation engine to efficiently update lists.", "Easy"),
        ("Can React props be modified directly by the child component that receives them?", "Yes, freely", "No, props are read-only (immutable)", "Only in class components", "Only if passed as numbers", "B", "Props are strictly read-only in React to ensure predictable one-way data flow.", "Easy"),
        ("Which command is commonly used to create a modern React app with Vite?", "npm create vite@latest", "make react", "npx install-react", "npm build react", "A", "npm create vite@latest is the standard tool to bootstrap fast modern React apps.", "Easy"),
        ("What is the root container element where a React application is typically mounted?", "div with id 'root'", "head tag", "table tag", "footer tag", "A", "React apps usually attach to a single DOM element like `<div id='root'></div>`.", "Easy"),
        ("How do you conditionally render an element in JSX using inline JavaScript?", "Logical AND (&&) or ternary operator (?)", "if-else statement directly in tags", "while loop", "goto label", "A", "In JSX, conditions are rendered using ternaries (condition ? a : b) or logical &&.", "Easy"),
        ("What hook provides access to context values without prop drilling?", "useRef", "useContext", "useId", "useLayoutEffect", "B", "useContext consumes values provided by a React Context Provider.", "Easy"),
        ("What happens when component state is updated using its setter function?", "The page reloads", "The component re-renders with new state", "The database is deleted", "The browser closes", "B", "Updating state triggers a scheduled re-render of the component and its children.", "Easy"),
        ("Which hook returns a mutable ref object whose .current property persists across renders?", "useMemo", "useRef", "useCallback", "useEffect", "B", "useRef creates persistent mutable references without triggering re-renders.", "Easy"),
    ],
    "Machine Learning": [
        ("What is the primary goal of Machine Learning?", "To write HTML web pages", "To enable systems to learn and improve from data without being explicitly programmed", "To install operating systems", "To design CPU hardware", "B", "ML allows algorithms to recognize patterns in data and make predictions automatically.", "Easy"),
        ("Which type of machine learning uses labeled training data with known answers?", "Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Heuristic Search", "B", "Supervised learning trains models on input-output pairs where target labels are provided.", "Easy"),
        ("Which of the following is a classic Supervised Learning task?", "Predicting house prices (Regression)", "Clustering customer groups without labels", "Playing chess via self-play rewards", "Dimensionality reduction", "A", "Predicting numerical targets (regression) with known past prices is supervised learning.", "Easy"),
        ("What is the task of predicting continuous numerical values called?", "Classification", "Regression", "Clustering", "Association", "B", "Regression models predict continuous quantities like prices, temperatures, or sales.", "Easy"),
        ("What is the task of predicting discrete categories or labels (e.g., Cat vs Dog) called?", "Regression", "Classification", "Quantization", "Interpolation", "B", "Classification assigns inputs into distinct classes or categories.", "Easy"),
        ("Which type of machine learning finds hidden patterns in unlabeled data?", "Supervised Learning", "Unsupervised Learning", "Semi-supervised only", "Instructional Learning", "B", "Unsupervised learning discovers groupings or representations in unlabeled data.", "Easy"),
        ("What is 'overfitting' in machine learning?", "Model performs well on training data but poorly on unseen test data", "Model cannot learn the training data at all", "Data file is too large for memory", "Model runs too quickly", "A", "Overfitting occurs when a model memorizes noise and fails to generalize to new data.", "Easy"),
        ("Which popular Python library is widely used for classical ML algorithms?", "scikit-learn", "Express.js", "Django", "Bootstrap", "A", "scikit-learn is the standard Python package for regression, classification, and clustering.", "Easy"),
        ("Why do we split data into Training and Testing sets?", "To save hard drive space", "To evaluate model performance on unseen data and prevent data leakage", "To speed up CPU clock speed", "To convert integers to floats", "B", "A test split measures how accurately the model generalizes to new real-world data.", "Easy"),
        ("What is a 'feature' in a dataset?", "A bug in the algorithm", "An individual measurable variable or column used as model input", "The final score", "The computer brand", "B", "Features are the input variables (columns) used to make predictions.", "Easy"),
        ("Which metric is commonly used to measure classification accuracy?", "Ratio of correct predictions to total predictions", "Sum of squared errors only", "Number of columns in database", "Size of image files", "A", "Accuracy is defined as (Total Correct Predictions / Total Predictions).", "Easy"),
        ("What is K-Means commonly used for in machine learning?", "Linear Regression", "Clustering unlabeled data into groups", "Text translation", "Image compression exclusively", "B", "K-Means is a classic unsupervised clustering algorithm.", "Easy"),
        ("What is an 'outlier' in a dataset?", "A data point that differs significantly from other observations", "The first row of a CSV", "A missing column header", "A target label", "A", "Outliers are atypical data points that deviate markedly from overall data distribution.", "Easy"),
        ("Which of the following is a simple linear algorithm used for binary classification?", "Linear Regression", "Logistic Regression", "K-Means", "Bubble Sort", "B", "Logistic regression models the probability of a binary outcome using a sigmoid curve.", "Easy"),
        ("What is data cleaning or preprocessing?", "Formatting and handling missing values, encoding and scaling data before training", "Wiping the hard drive clean", "Deleting all training records", "Rebooting the server", "A", "Preprocessing cleans raw inputs to make them suitable and effective for model training.", "Easy"),
    ],
    "Data Analytics": [
        ("What is the primary purpose of Data Analytics?", "To inspect, clean, transform, and model data to discover useful information and support decision-making", "To compile C code", "To design computer motherboards", "To create CSS animations", "A", "Data Analytics turns raw data into actionable insights for strategic decisions.", "Easy"),
        ("Which Python library is the foundation for data manipulation using DataFrames?", "Flask", "pandas", "Pygame", "Requests", "B", "pandas provides fast, flexible DataFrame and Series data structures.", "Easy"),
        ("Which library is widely used for creating static, interactive, and animated plots in Python?", "matplotlib / seaborn", "sqlalchemy", "bcrypt", "dotenv", "A", "matplotlib and seaborn are standard visualization libraries in Python.", "Easy"),
        ("What does CSV stand for?", "Comma-Separated Values", "Compiled System Variables", "Computer Structured View", "Central Schema Vector", "A", "CSV stands for Comma-Separated Values, a common tabular plain-text format.", "Easy"),
        ("What is the 'Mean' of a numerical dataset?", "The middle value when sorted", "The average (sum of all values divided by total count)", "The most frequent value", "The difference between max and min", "B", "The mean is the arithmetic average of a dataset.", "Easy"),
        ("What is the 'Median' of a dataset?", "The value that appears most often", "The middle value separating the higher half from the lower half", "The sum of all values", "The standard deviation", "B", "The median is the midpoint of an ordered sequence of numbers.", "Easy"),
        ("What is the 'Mode' of a dataset?", "The average value", "The value that appears most frequently", "The largest value minus smallest", "The square root of variance", "B", "The mode is the data value occurring with greatest frequency.", "Easy"),
        ("What chart type is best for showing trends over time?", "Pie Chart", "Line Chart", "Scatter plot without lines", "Word Cloud", "B", "Line charts clearly depict continuous changes and trends across time periods.", "Easy"),
        ("What chart type is best for comparing proportions of a whole?", "Line Chart", "Pie Chart / Donut Chart", "Histogram", "Box Plot", "B", "Pie and donut charts show categorical percentages totaling 100%.", "Easy"),
        ("What does a Histogram show?", "Geographical maps", "The frequency distribution of a continuous numerical variable", "Relationships between two strings", "Project timeline schedules", "B", "Histograms group data into bins to illustrate frequency distribution shapes.", "Easy"),
        ("What does KPI stand for in business analytics?", "Key Performance Indicator", "Known Program Instruction", "Kernel Processing Interface", "Knowledge Product Index", "A", "KPI stands for Key Performance Indicator, measuring critical business goals.", "Easy"),
        ("What is the first step in the data analysis process?", "Building a dashboard", "Understanding the problem and gathering / collecting relevant data", "Deleting all outliers", "Training an AI model", "B", "Defining objectives and collecting the necessary data begins every analysis workflow.", "Easy"),
        ("How do you view the first 5 rows of a pandas DataFrame named `df`?", "df.top(5)", "df.first(5)", "df.head()", "df.peek()", "C", "df.head() displays the first 5 records by default.", "Easy"),
        ("What is an anomaly or missing value commonly represented as in pandas?", "EMPTY", "NaN (Not a Number)", "ZERO", "VOID", "B", "Missing or null entries in pandas appear as NaN (or None).", "Easy"),
        ("Which tool or language is most universally used by business analysts for querying databases?", "SQL", "Assembly", "C++", "Fortran", "A", "SQL is the industry-standard language for extracting and aggregating tabular data.", "Easy"),
    ]
}

APTITUDE_QUESTIONS = {
    "Quantitative Aptitude": [
        ("What is 15% of 200?", "20", "25", "30", "35", "C", "15% of 200 = (15 / 100) * 200 = 30.", "Easy"),
        ("If the ratio of boys to girls in a class is 3:2 and there are 15 boys, how many girls are there?", "10", "12", "8", "6", "A", "Ratio is 3:2. 3 parts = 15 boys, so 1 part = 5. Girls = 2 parts = 2 * 5 = 10.", "Easy"),
        ("A pen is bought for Rs. 50 and sold for Rs. 60. What is the profit percentage?", "10%", "20%", "25%", "15%", "B", "Profit = 60 - 50 = Rs. 10. Profit % = (10 / 50) * 100 = 20%.", "Easy"),
        ("What is the average of 10, 20, 30, 40, and 50?", "25", "30", "35", "28", "B", "Sum = 150. Average = 150 / 5 = 30.", "Easy"),
        ("If a car travels 180 km in 3 hours, what is its speed in km/h?", "50 km/h", "60 km/h", "70 km/h", "90 km/h", "B", "Speed = Distance / Time = 180 / 3 = 60 km/h.", "Easy"),
        ("What is 25% of 80 plus 50% of 40?", "30", "40", "45", "50", "B", "25% of 80 = 20; 50% of 40 = 20. Total = 20 + 20 = 40.", "Easy"),
        ("If 5 workers can build a wall in 6 days, how many days will 10 workers take at the same pace?", "12 days", "3 days", "4 days", "2 days", "B", "Work = 5 * 6 = 30 man-days. Days for 10 workers = 30 / 10 = 3 days.", "Easy"),
        ("What is the square of 15?", "215", "225", "205", "235", "B", "15 * 15 = 225.", "Easy"),
        ("If the perimeter of a square is 36 cm, what is the length of one side?", "6 cm", "9 cm", "12 cm", "8 cm", "B", "Perimeter of square = 4 * side. Side = 36 / 4 = 9 cm.", "Easy"),
        ("Simplify: 120 / (4 * 3) + 5", "15", "10", "20", "25", "A", "Parentheses first: 4 * 3 = 12. Then 120 / 12 = 10. Then 10 + 5 = 15.", "Easy"),
        ("A shopkeeper offers a 10% discount on a book marked at Rs. 200. What is the selling price?", "Rs. 180", "Rs. 190", "Rs. 170", "Rs. 185", "A", "Discount = 10% of 200 = Rs. 20. Selling Price = 200 - 20 = Rs. 180.", "Easy"),
        ("What is the value of 2^4 (2 raised to the power 4)?", "8", "12", "16", "32", "C", "2 * 2 * 2 * 2 = 16.", "Easy"),
        ("What is the greatest common divisor (GCD) of 12 and 18?", "3", "6", "4", "2", "B", "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. Highest common factor = 6.", "Easy"),
        ("If a train 100 meters long passes an electric pole in 5 seconds, what is its speed in m/s?", "15 m/s", "20 m/s", "25 m/s", "30 m/s", "B", "Speed = Distance / Time = 100 / 5 = 20 m/s.", "Easy"),
        ("A student scored 45 marks out of 50. What is their percentage?", "85%", "90%", "92%", "88%", "B", "Percentage = (45 / 50) * 100 = 90%.", "Easy"),
    ],
    "Logical Reasoning": [
        ("Find the next number in the series: 2, 4, 6, 8, __?", "9", "10", "12", "14", "B", "Pattern adds 2 each time (+2): 8 + 2 = 10.", "Easy"),
        ("Find the next number in the series: 5, 10, 20, 40, __?", "60", "80", "70", "100", "B", "Each term is doubled (*2): 40 * 2 = 80.", "Easy"),
        ("Find the missing letter: A, C, E, G, __?", "H", "I", "J", "K", "B", "Pattern skips one letter each step (+2 letters): G -> skip H -> I.", "Easy"),
        ("If CAT is coded as 3-1-20, how is DOG coded in the alphabet sequence?", "4-15-7", "4-14-7", "3-15-7", "4-15-8", "A", "D=4, O=15, G=7 according to their alphabetical rank.", "Easy"),
        ("Which word does not belong with the others: Apple, Mango, Carrot, Banana?", "Apple", "Mango", "Carrot", "Banana", "C", "Carrot is a vegetable, whereas the other three are fruits.", "Easy"),
        ("Sun : Day :: Moon : __?", "Night", "Stars", "Dark", "Sky", "A", "The Sun is visible during the day; the Moon shines during the night.", "Easy"),
        ("A person walks 5 km North, then turns right and walks 3 km. Which direction are they facing?", "North", "East", "West", "South", "B", "Turning right from North points towards East.", "Easy"),
        ("Find the odd one out: 3, 5, 7, 9, 11", "3", "7", "9", "11", "C", "9 is a composite number (3 * 3), while 3, 5, 7, 11 are prime numbers.", "Easy"),
        ("Find the next number: 1, 4, 9, 16, 25, __?", "30", "36", "49", "32", "B", "Series of squares: 1^2, 2^2, 3^2, 4^2, 5^2, next is 6^2 = 36.", "Easy"),
        ("Pen : Write :: Knife : __?", "Sharp", "Cut", "Steel", "Spoon", "B", "A pen is an instrument to write; a knife is an instrument to cut.", "Easy"),
        ("If all Roses are Flowers, and all Flowers are Plants, then all Roses are Plants. Is this:", "True", "False", "Cannot be determined", "Partially True", "A", "By standard transitive syllogism: Roses -> Flowers -> Plants, so all Roses are Plants.", "Easy"),
        ("Look at the series: 50, 45, 40, 35, __? What comes next?", "25", "30", "32", "28", "B", "Pattern subtracts 5 in each step (-5): 35 - 5 = 30.", "Easy"),
        ("Which of the following is the opposite of ARRIVE?", "Stay", "Depart", "Wait", "Stop", "B", "Depart means to leave, which is the direct antonym of arrive.", "Easy"),
        ("Book : Reading :: Guitar : __?", "Singing", "Playing", "Writing", "Dancing", "B", "A book is used for reading; a guitar is used for playing music.", "Easy"),
        ("Complete the sequence: Z, Y, X, W, __?", "V", "U", "T", "S", "A", "Letters of the alphabet in reverse order: Z, Y, X, W, V.", "Easy"),
    ],
    "Verbal Ability": [
        ("Choose the correct spelling:", "Recieve", "Receive", "Receeve", "Receve", "B", "'Receive' is the correct English spelling ('i before e except after c').", "Easy"),
        ("What is the synonym of the word 'HAPPY'?", "Sad", "Joyful", "Angry", "Tired", "B", "'Joyful' means experiencing or expressing great happiness.", "Easy"),
        ("What is the antonym (opposite) of the word 'ANCIENT'?", "Old", "Historic", "Modern", "Past", "C", "'Modern' means relating to the present or recent times, opposite of ancient.", "Easy"),
        ("Choose the correct word: 'She ___ to the market every morning.'", "go", "goes", "going", "gone", "B", "Third-person singular 'She' in the simple present tense takes 'goes'.", "Easy"),
        ("Select the appropriate article: 'He is ___ honest student.'", "a", "an", "the", "no article", "B", "'Honest' begins with a vowel sound (silent 'h'), so 'an' is required.", "Easy"),
        ("What is the plural of 'Child'?", "Childs", "Children", "Childrens", "Childes", "B", "'Children' is the irregular plural form of child.", "Easy"),
        ("Choose the correct preposition: 'The book is ___ the table.'", "in", "on", "into", "through", "B", "'On' indicates that the book is supported by the surface of the table.", "Easy"),
        ("Identify the noun in this sentence: 'The blue car drove fast.'", "blue", "car", "drove", "fast", "B", "'Car' is the noun naming an object; 'blue' is an adjective, 'drove' is a verb.", "Easy"),
        ("What is the past tense of the verb 'EAT'?", "Eaten", "Ate", "Eating", "Eats", "B", "'Ate' is the simple past tense of eat.", "Easy"),
        ("Choose the word that means 'A person who writes software code':", "Author", "Programmer", "Doctor", "Pilot", "B", "A programmer writes instructions and software code for computers.", "Easy"),
        ("Complete the idiom: 'Actions speak louder than ___.'", "words", "sounds", "speeches", "thoughts", "A", "'Actions speak louder than words' is the standard proverb.", "Easy"),
        ("Which of the following sentences is grammatically correct?", "They is going home.", "They are going home.", "They was going home.", "They am going home.", "B", "Plural pronoun 'They' pairs with the auxiliary verb 'are' in present continuous.", "Easy"),
        ("What is the synonym of 'FAST'?", "Quick", "Slow", "Heavy", "Late", "A", "'Quick' and 'fast' both denote high speed.", "Easy"),
        ("Choose the opposite of 'GENEROUS':", "Kind", "Selfish", "Friendly", "Giving", "B", "'Selfish' is the opposite of generous.", "Easy"),
        ("Fill in the blank: 'Neither John nor his friends ___ present today.'", "is", "are", "was", "be", "B", "In 'neither... nor', the verb agrees with the closer subject ('friends' -> are).", "Easy"),
    ]
}

MOCK_INTERVIEW_QUESTIONS = [
    # Technical: Python
    {
        "interview_type": "Technical",
        "domain_or_category": "Python",
        "question": "What is the difference between a List and a Tuple in Python?",
        "sample_answer": "In Python, both lists and tuples store ordered collections of items. The key difference is that Lists are mutable (meaning you can add, remove, or modify elements after creation using brackets [ ]), while Tuples are immutable (they cannot be changed after creation and use parentheses ( )). Tuples are also slightly faster and can be used as dictionary keys.",
        "explanation_tips": "Interviewers check: 1) Mutability concept, 2) Syntax distinction ([ ] vs ( )), 3) Memory/performance trade-off, and 4) Use cases (tuples for fixed records, lists for dynamic collections).",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "Python",
        "question": "What are Python functions and how do you pass arguments to them?",
        "sample_answer": "A function in Python is a reusable block of code defined using the 'def' keyword. Functions take inputs called arguments, perform an operation, and optionally return an output using the 'return' statement. Python supports positional arguments, keyword arguments (e.g., func(name='Alice')), default parameters, and arbitrary arguments using *args and **kwargs.",
        "explanation_tips": "Interviewers look for: Understanding of code reusability, function signature syntax, the return statement, and parameter types.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "Python",
        "question": "How do dictionaries work in Python and how do you access keys and values?",
        "sample_answer": "A Python dictionary is an unordered (ordered by insertion since 3.7) key-value store defined with curly braces {}. Each key must be unique and immutable (like strings or numbers). You access values using bracket notation dict[key] or using the safer dict.get(key, default) method which avoids raising a KeyError if the key is missing.",
        "explanation_tips": "Interviewers look for: Key-value pair understanding, dict.get() vs dict[key] error handling, and knowledge that keys must be hashable.",
        "difficulty": "Beginner"
    },

    # Technical: Java
    {
        "interview_type": "Technical",
        "domain_or_category": "Java",
        "question": "What are the four fundamental pillars of Object-Oriented Programming (OOP) in Java?",
        "sample_answer": "The four main pillars of OOP in Java are:\n1. Encapsulation: Bundling data (variables) and methods inside a class and restricting direct access using private access modifiers.\n2. Inheritance: Allowing a subclass to acquire properties and methods of a parent class using the 'extends' keyword.\n3. Polymorphism: Performing a single action in different ways, either through method overloading (compile-time) or method overriding (run-time).\n4. Abstraction: Hiding internal implementation details and showing only essential features using abstract classes and interfaces.",
        "explanation_tips": "Interviewers look for clear, concise definitions of all 4 pillars and simple everyday code analogies.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "Java",
        "question": "What is the difference between JDK, JRE, and JVM?",
        "sample_answer": "JVM (Java Virtual Machine) executes compiled Java bytecode and manages memory via garbage collection. JRE (Java Runtime Environment) includes the JVM plus core class libraries needed to run Java applications. JDK (Java Development Kit) is the complete software package containing the JRE, compiler (javac), debugger, and development tools required to write and compile Java programs.",
        "explanation_tips": "Interviewers expect you to know the hierarchy: JDK contains JRE, and JRE contains JVM.",
        "difficulty": "Beginner"
    },

    # Technical: C
    {
        "interview_type": "Technical",
        "domain_or_category": "C",
        "question": "What is a pointer in C and why is it important?",
        "sample_answer": "A pointer is a variable in C that stores the memory address of another variable rather than holding a direct data value. Pointers are important because they enable dynamic memory allocation (using malloc/free), allow functions to modify caller variables via pass-by-reference, and provide efficient access to arrays and data structures like linked lists.",
        "explanation_tips": "Interviewers check: Definition of address storage, the '&' (address-of) and '*' (dereference) operators, and practical use cases.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "C",
        "question": "What is the difference between malloc() and calloc() in C?",
        "sample_answer": "Both malloc() and calloc() are memory allocation functions declared in <stdlib.h>. malloc(size) allocates a specified number of bytes from the heap and leaves the memory uninitialized (containing garbage values). calloc(n, size) allocates memory for an array of n elements and automatically initializes all allocated bytes to zero.",
        "explanation_tips": "Interviewers look for: Syntax parameter difference and initialization to zero vs garbage memory.",
        "difficulty": "Beginner"
    },

    # Technical: SQL
    {
        "interview_type": "Technical",
        "domain_or_category": "SQL",
        "question": "What is the difference between WHERE and HAVING clauses in SQL?",
        "sample_answer": "The WHERE clause is used to filter individual rows before any grouping or aggregation takes place. It cannot be used with aggregate functions like SUM() or COUNT(). In contrast, the HAVING clause is used to filter groups of rows after the GROUP BY clause has aggregated them, and it works directly with aggregate conditions.",
        "explanation_tips": "Interviewers verify if you understand row-level filtering (WHERE) vs aggregated group filtering (HAVING).",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "SQL",
        "question": "What are the common types of SQL JOINs?",
        "sample_answer": "SQL JOINs combine rows from two or more tables based on a related column:\n1. INNER JOIN: Returns records that have matching values in both tables.\n2. LEFT JOIN: Returns all records from the left table and matched records from the right table (NULL if no match).\n3. RIGHT JOIN: Returns all records from the right table and matched records from the left table.\n4. FULL OUTER JOIN: Returns all records when there is a match in either the left or right table.",
        "explanation_tips": "Interviewers appreciate clear Venn diagram analogies and understanding of NULL behavior.",
        "difficulty": "Beginner"
    },

    # Technical: HTML and CSS
    {
        "interview_type": "Technical",
        "domain_or_category": "HTML and CSS",
        "question": "What is the CSS Box Model and what are its components?",
        "sample_answer": "The CSS Box Model is a container that wraps around every HTML element. It consists of four distinct layers from inside out:\n1. Content: The actual text, image, or media element.\n2. Padding: Transparent area around the content, inside any border.\n3. Border: A border surrounding the padding and content.\n4. Margin: Transparent space outside the border separating the element from neighboring elements.",
        "explanation_tips": "Interviewers verify your order of layers (Content -> Padding -> Border -> Margin) and understanding of box-sizing: border-box.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "HTML and CSS",
        "question": "What is the difference between semantic and non-semantic HTML tags?",
        "sample_answer": "Semantic HTML tags clearly describe their meaning to both the browser and the developer (e.g., <header>, <nav>, <article>, <section>, <footer>). Non-semantic tags tell nothing about their content (e.g., <div> and <span>). Using semantic tags improves web accessibility for screen readers, enhances SEO rankings, and makes code easier to read and maintain.",
        "explanation_tips": "Interviewers look for: Accessibility (a11y), SEO advantages, and standard semantic examples.",
        "difficulty": "Beginner"
    },

    # Technical: JavaScript
    {
        "interview_type": "Technical",
        "domain_or_category": "JavaScript",
        "question": "What is the difference between '==' and '===' in JavaScript?",
        "sample_answer": "'==' is the loose equality operator which compares values after performing automatic type coercion (e.g., '5' == 5 evaluates to true). '===' is the strict equality operator which checks both value and data type without any type conversion (e.g., '5' === 5 evaluates to false). It is best practice in modern JavaScript to always use '===' to prevent unexpected type bugs.",
        "explanation_tips": "Interviewers check: Type coercion concept, comparison examples, and preference for strict equality in production.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "JavaScript",
        "question": "What are JavaScript Promises and why are they used?",
        "sample_answer": "A Promise in JavaScript is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value. It has three states: Pending, Fulfilled (resolved), or Rejected. Promises help developers avoid 'callback hell' and write clean asynchronous code using .then(), .catch(), and modern async/await syntax.",
        "explanation_tips": "Interviewers look for: 3 states (pending, fulfilled, rejected), async handling, and async/await relationship.",
        "difficulty": "Beginner"
    },

    # Technical: React
    {
        "interview_type": "Technical",
        "domain_or_category": "React",
        "question": "What is the difference between State and Props in React?",
        "sample_answer": "Props (properties) are passed into a component from its parent component and are read-only (immutable) within the receiving child component. State is an internal, local data store managed within the component itself using hooks like useState. When a component's state changes, React re-renders the component to display the new UI.",
        "explanation_tips": "Interviewers check: Ownership (parent vs internal), mutability (props immutable, state mutable via setter), and re-render triggers.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "React",
        "question": "What is the useEffect hook used for and when does it run?",
        "sample_answer": "The useEffect hook is used to perform side effects in functional components, such as fetching data from an API, setting up timers, or directly updating the DOM. It accepts a callback function and an optional dependency array. If no dependency array is passed, it runs after every render. With an empty array [], it runs once when the component mounts. With dependencies [count], it runs whenever those specific values change.",
        "explanation_tips": "Interviewers look for: Definition of side effects, dependency array behaviors ([] vs [deps] vs omitted), and optional cleanup functions.",
        "difficulty": "Beginner"
    },

    # Technical: Machine Learning
    {
        "interview_type": "Technical",
        "domain_or_category": "Machine Learning",
        "question": "What is the difference between Supervised and Unsupervised Learning?",
        "sample_answer": "Supervised Learning uses labeled datasets where both input features and the corresponding target output are provided. The model learns a mapping function to predict labels on new data (e.g., predicting house prices with regression or spam emails with classification). Unsupervised Learning works on unlabeled data without predefined answers; the algorithm identifies hidden structures or patterns naturally (e.g., customer segmentation with K-Means clustering).",
        "explanation_tips": "Interviewers check: Labeled vs unlabeled data, clear examples for each, and output goals.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "Machine Learning",
        "question": "What is overfitting and how can it be prevented?",
        "sample_answer": "Overfitting happens when a machine learning model learns the training data too closely, including random noise and outliers, resulting in very high training accuracy but poor performance on new test data. It can be prevented by using more training data, applying regularization techniques (L1/L2), using cross-validation, simplifying the model architecture, or pruning decision trees.",
        "explanation_tips": "Interviewers look for: Understanding of high variance vs low bias, training vs test performance disparity, and practical remediation methods.",
        "difficulty": "Beginner"
    },

    # Technical: Data Analytics
    {
        "interview_type": "Technical",
        "domain_or_category": "Data Analytics",
        "question": "What are the common steps in a typical Data Analytics project lifecycle?",
        "sample_answer": "A standard data analytics lifecycle includes: 1) Problem Understanding: Defining business questions and KPIs; 2) Data Collection: Gathering data from databases, APIs, or CSV files; 3) Data Cleaning & Preprocessing: Handling missing values, duplicates, and outliers; 4) Exploratory Data Analysis (EDA): Calculating summary statistics and creating visualizations; 5) Interpretation & Storytelling: Generating actionable business recommendations; 6) Dashboarding & Reporting: Sharing dashboards via tools like Power BI or Python web apps.",
        "explanation_tips": "Interviewers look for: Structured thinking, appreciation of data cleaning importance, and ability to communicate findings to non-technical stakeholders.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "Technical",
        "domain_or_category": "Data Analytics",
        "question": "How do you handle missing or null values in a dataset?",
        "sample_answer": "Handling missing data depends on its proportion and context. Common strategies include: 1) Dropping records or columns if the missing rate is extremely high and non-critical; 2) Imputing numerical values using the mean (if normally distributed) or median (if skewed by outliers); 3) Imputing categorical values using the mode or an 'Unknown' category; 4) Forward/backward filling for time-series data. It is crucial to evaluate whether the data is missing completely at random before deciding.",
        "explanation_tips": "Interviewers evaluate: Practical decision-making (mean vs median imputation), understanding of data loss consequences, and domain context.",
        "difficulty": "Beginner"
    },

    # HR Interview Questions
    {
        "interview_type": "HR",
        "domain_or_category": "HR Behavioral",
        "question": "Tell me about yourself.",
        "sample_answer": "Good morning/afternoon. I am an enthusiastic student pursuing my degree in Computer Science/Engineering with a strong passion for software development and data technologies. During my academic journey, I have built practical projects using Python, web technologies, and SQL, and I actively practice problem solving. Outside the classroom, I enjoy collaborating on team projects and learning new developer tools. I am eager to apply my technical foundation, curiosity, and work ethic in a professional internship role.",
        "explanation_tips": "Follow the Present-Past-Future framework: 1) Who you are currently (education & focus), 2) Key academic projects or skills built, 3) Why you are excited about this opportunity. Keep it under 90 seconds.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "HR",
        "domain_or_category": "HR Behavioral",
        "question": "What are your greatest strengths and weaknesses?",
        "sample_answer": "My greatest strength is my consistency and structured approach to problem-solving. When faced with a new challenge, I break it down, research documentation, and stay focused until it is resolved. As for my weakness, I sometimes spend extra time perfecting small details in my code before sharing it. To improve, I have adopted iterative checkpoints where I ask for early feedback from peers, which has made my workflow much more efficient.",
        "explanation_tips": "Strengths: Pick a genuine trait backed by evidence. Weakness: Pick a real professional area of growth and demonstrate active steps you take to overcome it.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "HR",
        "domain_or_category": "HR Behavioral",
        "question": "Why should we hire you for this role or internship?",
        "sample_answer": "You should consider me because I bring both a strong foundational skill set in core technologies and an exceptional willingness to learn and adapt. I have demonstrated my initiative through hands-on projects, consistent coding practice, and proactive problem solving. I am organized, communicate clearly, and am committed to adding real value to your team while continuously absorbing best industry practices.",
        "explanation_tips": "Connect your passion, your foundational preparation, and your positive attitude. Show eagerness to contribute rather than just expecting mentorship.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "HR",
        "domain_or_category": "HR Behavioral",
        "question": "Where do you see yourself in 3 years?",
        "sample_answer": "In 3 years, I see myself as a proficient, dependable software professional who has contributed to impactful real-world products. I aim to have deepened my mastery of backend engineering and system design, while also taking on responsibilities such as mentoring junior interns and collaborating across cross-functional teams to deliver high-quality solutions.",
        "explanation_tips": "Show ambition paired with realism: focus on skill growth, dependability, and contributing to organizational goals.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "HR",
        "domain_or_category": "HR Behavioral",
        "question": "Why do you want to join this company or internship?",
        "sample_answer": "I admire your organization's commitment to technology innovation, high engineering standards, and supportive culture for emerging talent. This internship aligns directly with my career goals, and I am excited about the opportunity to work on meaningful challenges alongside experienced mentors while contributing my dedication and problem-solving energy.",
        "explanation_tips": "Demonstrate that you have researched the company's domain, culture, or mission, and articulate why their environment matches your professional aspirations.",
        "difficulty": "Beginner"
    },
    {
        "interview_type": "HR",
        "domain_or_category": "HR Behavioral",
        "question": "Describe a challenge you faced in a project and how you overcame it.",
        "sample_answer": "During a recent team project, we encountered an unexpected bug right before our submission deadline where data was not saving properly to the database. Instead of panicking, I took the lead in debugging: I isolated the API endpoint, inspected server logs, and discovered a type mismatch in our JSON payload. I corrected the schema, tested edge cases, and documented the fix for my team. We delivered on time, and it taught me the value of systematic debugging under pressure.",
        "explanation_tips": "Use the STAR technique: Situation, Task, Action, and Result. Highlight your composure, initiative, and positive outcome.",
        "difficulty": "Beginner"
    }
]


def seed_all():
    db = SessionLocal()
    try:
        print("--- SEEDING BEGINNER-FRIENDLY SKILL ASSESSMENT QUESTIONS ---")
        # Replace existing skill questions with clean beginner-friendly ones
        db.query(SkillQuestion).delete()
        db.commit()

        skill_count = 0
        for skill_name, q_list in SKILL_QUESTIONS.items():
            for q_data in q_list:
                q = SkillQuestion(
                    skill=skill_name,
                    question=q_data[0],
                    option_a=q_data[1],
                    option_b=q_data[2],
                    option_c=q_data[3],
                    option_d=q_data[4],
                    correct_option=q_data[5],
                    explanation=q_data[6],
                    difficulty=q_data[7]
                )
                db.add(q)
                skill_count += 1
        db.commit()
        print(f"Successfully seeded {skill_count} beginner skill questions across 10 skills.")

        print("--- SEEDING BEGINNER-FRIENDLY APTITUDE QUESTIONS ---")
        db.query(AptitudeQuestion).delete()
        db.commit()

        apt_count = 0
        for category, q_list in APTITUDE_QUESTIONS.items():
            for q_data in q_list:
                q = AptitudeQuestion(
                    category=category,
                    topic=category,
                    question=q_data[0],
                    option_a=q_data[1],
                    option_b=q_data[2],
                    option_c=q_data[3],
                    option_d=q_data[4],
                    correct_option=q_data[5],
                    explanation=q_data[6],
                    difficulty=q_data[7]
                )
                db.add(q)
                apt_count += 1
        db.commit()
        print(f"Successfully seeded {apt_count} beginner aptitude questions across 3 categories.")

        print("--- SEEDING MOCK INTERVIEW QUESTIONS ---")
        db.query(MockInterviewQuestion).delete()
        db.commit()

        interview_count = 0
        for item in MOCK_INTERVIEW_QUESTIONS:
            q = MockInterviewQuestion(
                interview_type=item["interview_type"],
                domain_or_category=item["domain_or_category"],
                question=item["question"],
                sample_answer=item["sample_answer"],
                explanation_tips=item["explanation_tips"],
                difficulty=item.get("difficulty", "Beginner")
            )
            db.add(q)
            interview_count += 1
        db.commit()
        print(f"Successfully seeded {interview_count} mock interview questions (Technical + HR).")

        print("ALL SEEDING COMPLETED SUCCESSFULLY!")

    except Exception as e:
        db.rollback()
        print("Error during seeding:", str(e))
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
