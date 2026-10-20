/**
 * Study guides shown on each subject page (below the notes viewer) and in the page's static HTML.
 * Keyed by subject name, compared loosely like descriptions.ts.
 *
 * To add or edit one:
 *   focus  — 4–6 topics worth extra time (the ideas the rest of the course is built on)
 *   study  — how to actually learn it: what to practice, in what order
 *   exam   — how to prepare for and write the final paper
 * Keep it honest and general: advice that holds for any batch, not guesses about what "will come".
 */
export interface SubjectGuide {
  focus: string[];
  study: string;
  exam: string;
}

export const subjectGuides: Record<string, SubjectGuide> = {
  // ---------------- Semester I ----------------
  'Calculus I': {
    focus: [
      'Limits and continuity, including L’Hôpital’s rule for indeterminate forms',
      'Derivatives and their applications: maxima and minima, curve tracing, mean value theorems',
      'Integration techniques: substitution, by parts, partial fractions, reduction formulae',
      'Applications of definite integrals: area, arc length, volume and surface of revolution',
      'First-order ordinary differential equations: separable, linear, exact and Bernoulli forms',
    ],
    study:
      'Calculus is learnt by solving, not reading. Work through each chapter’s solved examples first, then try the exercise problems without looking at the solution. Keep a one-page sheet of standard derivatives, integrals and reduction formulae and revise it daily until it is automatic. When a problem goes wrong, find the exact step that failed rather than starting a new one.',
    exam:
      'Most marks come from complete, step-by-step working, so write every step and state the rule you use. Practice past papers under time pressure and learn to recognise which integration technique a question is asking for at a glance.',
  },
  'Digital Logic': {
    focus: [
      'Number systems and codes: binary, octal, hexadecimal, BCD, Gray code, signed numbers and complements',
      'Boolean algebra and simplification with Karnaugh maps (including don’t-care conditions)',
      'Combinational circuits: adders, subtractors, multiplexers, decoders, encoders and comparators',
      'Flip-flops (SR, JK, D, T), their characteristic and excitation tables',
      'Counters and registers, and designing synchronous sequential circuits from state diagrams',
    ],
    study:
      'Draw every circuit yourself. For each combinational block, write the truth table, simplify with a K-map and draw the gate diagram; for sequential circuits, go from state diagram to state table to excitation table to circuit. Once the method is clear, a simulator such as Logisim helps you check designs, and the lab work reinforces the same steps.',
    exam:
      'Design questions reward a clear, ordered method: truth or state table, K-map, simplified expression, then the final circuit. Label inputs and outputs, and double-check K-map groupings, since one wrong group changes the whole answer.',
  },
  'Programming in C': {
    focus: [
      'Control structures: if/else, switch, and for, while and do-while loops',
      'Arrays and strings, including common string functions and 2-D arrays (matrices)',
      'Functions, recursion, and passing by value versus by reference',
      'Pointers: pointer arithmetic, pointers with arrays and functions, dynamic memory',
      'Structures and unions, and file handling with fopen, fprintf, fscanf, fread and fwrite',
    ],
    study:
      'Write and run code every day, even short programs. Start with the classic exercises (patterns, primes, factorials, Fibonacci, matrix operations, string reversal) and type them yourself instead of copying. Pointers are where most students struggle: draw memory boxes and arrows until you can predict what each line does.',
    exam:
      'Practice writing programs on paper, since there is no compiler in the exam hall: indent clearly, declare every variable and include headers. For output-prediction questions, trace the code line by line in a table of variable values.',
  },
  'Basic Electrical Engineering': {
    focus: [
      'Ohm’s and Kirchhoff’s laws, mesh and nodal analysis',
      'Network theorems: Thevenin, Norton, superposition and maximum power transfer',
      'AC fundamentals: phasors, impedance, RLC circuits, power and power factor',
      'Three-phase systems: star and delta connections, line and phase quantities',
      'Magnetic circuits and the working principle of transformers',
    ],
    study:
      'This is a numerical subject. Learn each theorem through a worked example, then solve several variations: different sources, different loads, dependent sources. Phasor diagrams make AC circuits much easier to reason about, so draw one for every AC problem until it becomes a habit.',
    exam:
      'Draw a neat circuit diagram for every numerical answer, mark directions of current and polarity, and carry units through the working. Theory questions usually ask you to state, explain and prove a theorem, so learn the statements precisely.',
  },
  'Computer Workshop': {
    focus: [
      'Components inside a PC: motherboard, CPU, memory, storage, power supply and expansion cards',
      'Assembling and disassembling a computer safely',
      'Installing and configuring operating systems and common software',
      'Troubleshooting common hardware and software faults',
      'Basic networking: cabling, IP configuration and sharing resources',
    ],
    study:
      'Workshop is a practical course, so the best preparation is hands-on time: open a machine, identify each part and put it back together, and install an operating system from scratch at least once. Keep a short lab record of each task, what went wrong and how you fixed it.',
    exam:
      'Assessment is mostly practical and viva, so be ready to explain what each component does and why each step in a procedure matters, not just how to do it.',
  },
  'Communication Technique': {
    focus: [
      'The communication process, audience and purpose',
      'Technical writing: clarity, conciseness and structure',
      'Reports and proposals: formats, sections and documentation of sources',
      'Letters, memos, emails and job applications',
      'Presentations and oral communication',
    ],
    study:
      'Write regularly and get feedback. Take a topic you know, such as one of your lab experiments, and turn it into a short report using a proper format. Read a few real technical reports to see how headings, figures and references are used.',
    exam:
      'Questions often ask for a format: a report, a proposal outline or a formal letter. Learn the standard structures well enough to reproduce them, and use clear headings in your answers. Short, organised writing scores better than long paragraphs.',
  },
  'Electronic Devices & Circuits': {
    focus: [
      'Semiconductor physics and the PN junction diode',
      'Diode applications: rectifiers, filters, clippers, clampers and Zener regulators',
      'BJT configurations, biasing and stability',
      'Small-signal models and amplifier analysis',
      'FET and MOSFET operation, and operational amplifier basics',
    ],
    study:
      'Understand each device through its characteristic curves first, then move to circuits. For biasing and amplifier problems, follow the same order every time: DC analysis for the operating point, then the AC small-signal model. Building the circuits in the lab makes the theory far easier to remember.',
    exam:
      'Draw clear circuit diagrams and characteristic curves, and show the operating point on load lines. Numerical answers need units and a short comment on what the result means.',
  },

  // ---------------- Semester II ----------------
  'Algebra & Geometry': {
    focus: [
      'Matrices and determinants: rank, inverse and their properties',
      'Systems of linear equations: consistency and solution methods',
      'Vector spaces, linear independence, basis and dimension',
      'Eigenvalues and eigenvectors, and the Cayley–Hamilton theorem',
      'Analytic geometry: lines, planes, spheres and conic sections in three dimensions',
    ],
    study:
      'Linear algebra rewards understanding the definitions exactly, since most proofs follow directly from them. Practice row reduction until it is quick and accurate, because it underlies rank, inverses and solving systems. For geometry, sketch each surface or line before calculating.',
    exam:
      'Arithmetic slips are the usual cause of lost marks in matrix questions, so check your working (for example, multiply back to verify an inverse). Write proofs in clear steps, quoting the property you use at each step.',
  },
  'Applied Physics': {
    focus: [
      'Oscillations: simple harmonic, damped and forced motion, and resonance',
      'Wave motion, interference, diffraction and polarisation of light',
      'Electrostatics, magnetism and Maxwell’s equations',
      'Lasers and optical fibres',
      'Quantum mechanics basics and semiconductor physics',
    ],
    study:
      'Learn each derivation as a sequence of ideas, not lines to memorise: know where each equation comes from and what each symbol means. Then solve numericals on the same topic so the formulas have context. Lab experiments on interference, diffraction and resonance reinforce the theory.',
    exam:
      'Derivations carry significant marks, so practice writing them out fully with labelled diagrams. For numericals, list the given values with units, write the formula, substitute and box the final answer.',
  },
  'Applied Chemistry': {
    focus: [
      'Atomic structure, chemical bonding and coordination compounds',
      'Electrochemistry: cells, electrode potentials and batteries',
      'Corrosion and its prevention',
      'Water: hardness, its measurement and treatment',
      'Fuels, polymers and engineering materials',
    ],
    study:
      'Group topics by theme and make short comparison tables (for example, types of corrosion, or methods of water softening). Practice the numerical parts, such as hardness calculations and cell potentials, until the steps are routine.',
    exam:
      'Use reactions, labelled diagrams and tables wherever they fit, since they show understanding quickly. Learn definitions precisely, and show units in every calculation.',
  },
  'Basic Engineering Drawing': {
    focus: [
      'Lettering, line types and dimensioning standards',
      'Geometric constructions',
      'Orthographic projection: first- and third-angle methods',
      'Sectional views',
      'Isometric drawing, and an introduction to CAD',
    ],
    study:
      'Drawing is a skill built by repetition. Complete every sheet yourself, and practice visualising objects: look at a 3-D object and sketch its front, top and side views before drawing them properly. Keep your instruments in good condition and pencils sharp.',
    exam:
      'Neatness, correct line types and complete dimensioning all carry marks. Plan the layout of the sheet before you start so views are aligned and nothing runs off the page.',
  },
  'Object Oriented Programming in C++': {
    focus: [
      'Classes and objects, constructors and destructors',
      'Operator and function overloading',
      'Inheritance: types, access control and ambiguity',
      'Polymorphism: virtual functions and abstract classes',
      'Templates, exception handling and file I/O with streams',
    ],
    study:
      'Write small programs that each demonstrate one concept: a class with copy constructor, an overloaded operator, a base class with a virtual function. Then combine them into a slightly bigger program such as a bank account or student record system. Understand why each feature exists, not just its syntax.',
    exam:
      'Theory questions often ask you to explain a concept with an example program, so prepare a short, correct example for each major feature. Write code neatly with comments, and show sample output where asked.',
  },
  'Data Structure & Algorithm': {
    focus: [
      'Stacks and queues, and their applications (expression conversion and evaluation)',
      'Linked lists: singly, doubly and circular, with insertion and deletion',
      'Trees: binary trees, traversals, binary search trees and AVL trees',
      'Graphs: representation, BFS, DFS, shortest paths and spanning trees',
      'Sorting and searching algorithms, hashing, and time complexity',
    ],
    study:
      'Trace every algorithm by hand on a small example before coding it: draw the stack, the list nodes or the tree after each step. Then implement it in C or C++. Knowing the time complexity of each operation, and why, ties the whole course together.',
    exam:
      'Many questions ask you to show the step-by-step working of an algorithm on given data (a sort, a traversal, an insertion into a tree). Draw each intermediate state clearly. Pair written algorithms with their complexity.',
  },
  'Instrumentation': {
    focus: [
      'Measurement errors, accuracy, precision and calibration',
      'Analog and digital measuring instruments',
      'Transducers and sensors for temperature, pressure, displacement and strain',
      'Signal conditioning: amplifiers, bridges and filters',
      'Data conversion (ADC and DAC) and data acquisition systems',
    ],
    study:
      'Organise transducers in a table: what they measure, their principle of operation, advantages and limitations. For bridges and converters, work through the derivation once and then solve numericals. Relate each instrument to the lab equipment you have used.',
    exam:
      'Block diagrams and labelled sketches of instruments are expected in most answers. Comparison questions (for example, types of ADC) are easier with a prepared table.',
  },

  // ---------------- Semester III ----------------
  'Calculus II': {
    focus: [
      'Infinite series and tests of convergence',
      'Functions of several variables: partial derivatives, Jacobians and extreme values',
      'Multiple integrals: double and triple integrals and changing the order of integration',
      'Vector calculus: gradient, divergence and curl; line, surface and volume integrals',
      'Green’s, Stokes’ and Gauss’ theorems',
    ],
    study:
      'Sketch the region of integration for every multiple-integral problem; it makes setting the limits much easier. Learn the vector theorems through worked examples that verify them, which also builds the calculation skills the exam needs.',
    exam:
      'Show limits of integration and the region clearly, and state which convergence test or theorem you are using. Long calculations benefit from neat, step-by-step working where an examiner can follow and award partial marks.',
  },
  'Database Management System': {
    focus: [
      'ER modelling and converting ER diagrams to relational schemas',
      'Relational algebra and SQL: joins, grouping, nested queries and views',
      'Functional dependencies and normalisation (1NF to BCNF)',
      'Transactions, ACID properties, concurrency control and recovery',
      'Indexing and file organisation, including B+ trees',
    ],
    study:
      'Practice SQL on a real database such as MySQL or PostgreSQL: create tables, insert data and write queries until joins and GROUP BY feel natural. For normalisation, work through examples step by step, writing out the functional dependencies first. Design a small database (library, college, hospital) end to end, from ER diagram to tables.',
    exam:
      'Write SQL and relational algebra precisely; small syntax errors matter. Draw ER diagrams with correct notation for keys, cardinality and participation. In normalisation answers, show each normal form and why the relation satisfies it.',
  },
  'Operating Systems': {
    focus: [
      'Processes and threads, and CPU scheduling algorithms',
      'Process synchronisation: critical section, semaphores and classic problems',
      'Deadlocks: conditions, prevention, avoidance (Banker’s algorithm) and detection',
      'Memory management: paging, segmentation and page replacement algorithms',
      'File systems and disk scheduling',
    ],
    study:
      'Scheduling, page replacement and disk scheduling are numerical: solve each algorithm on several inputs and draw the Gantt chart or frame table every time. For synchronisation, understand why each solution works and what goes wrong without it. Using Linux commands for processes and files makes the concepts concrete.',
    exam:
      'Draw Gantt charts and tables neatly and calculate averages (waiting time, turnaround time, page faults) clearly. For theory, compare algorithms with their advantages and disadvantages in a table.',
  },
  'Microprocessor & Assembly Language Programming': {
    focus: [
      'The 8085 and 8086 architecture: registers, buses and pin diagrams',
      'Instruction sets and addressing modes',
      'Assembly language programs: arithmetic, loops, arrays and string operations',
      'Timing diagrams',
      'Interrupts and interfacing with peripherals and memory',
    ],
    study:
      'Write and run assembly programs on a simulator or trainer kit; reading programs alone does not build the skill. Keep an instruction reference sheet nearby and comment every line of your programs. Draw the internal architecture from memory until you can explain each block.',
    exam:
      'Programs should be commented and use correct mnemonics. Architecture and timing-diagram questions need clean, labelled diagrams; practice drawing them within a fixed time.',
  },
  'Computer Graphics': {
    focus: [
      'Line and circle drawing algorithms (DDA, Bresenham, midpoint)',
      '2-D transformations with homogeneous coordinates, and composite transformations',
      'Clipping algorithms (Cohen–Sutherland, Liang–Barsky, polygon clipping)',
      '3-D transformations and projections',
      'Visible surface detection, illumination and shading models',
    ],
    study:
      'Trace each algorithm on a small grid by hand, writing out every pixel or step, then implement it in C or C++ with a graphics library. For transformations, practice building the composite matrix in the right order and applying it to points.',
    exam:
      'Algorithm questions expect a full step table for the given input. Write matrices clearly, state the order of multiplication, and verify the final coordinates.',
  },
  'Data Communication': {
    focus: [
      'Signals: analog and digital, bandwidth and channel capacity',
      'Transmission media and transmission impairments',
      'Encoding and modulation techniques',
      'Multiplexing and switching',
      'Error detection and correction (parity, CRC, Hamming code)',
    ],
    study:
      'Draw waveforms for each encoding scheme from a sample bit stream; it is the fastest way to learn them. Practice the numerical topics, such as Nyquist and Shannon capacity and CRC calculation, until the steps are routine.',
    exam:
      'Waveform and block-diagram questions need neat, labelled drawings. Show the working for CRC and Hamming code questions bit by bit.',
  },

  // ---------------- Semester IV ----------------
  'Applied Mathematics': {
    focus: [
      'Laplace transforms and their use in solving differential equations',
      'Fourier series and Fourier transforms',
      'Z-transforms',
      'Complex variables: analytic functions and contour integration',
      'Partial differential equations and their solutions',
    ],
    study:
      'Keep a table of standard transform pairs and properties, and practice until you can apply them without looking. Work through solved examples of each type, then attempt mixed problems so you learn to choose the right method.',
    exam:
      'State the property or theorem you use at each step. Long problems earn partial marks for correct method, so never leave a question blank.',
  },
  'Numerical Methods': {
    focus: [
      'Errors, and solving non-linear equations (bisection, Newton–Raphson, secant)',
      'Interpolation: Newton’s and Lagrange’s methods',
      'Numerical differentiation and integration (trapezoidal and Simpson’s rules)',
      'Solving linear systems (Gauss elimination, Gauss–Seidel, LU decomposition)',
      'Numerical solutions of ordinary differential equations (Euler, Runge–Kutta)',
    ],
    study:
      'Solve each method by hand on a small problem, then write a short program for it; the lab and the theory support each other. Understand when each method converges or fails, not only the formula.',
    exam:
      'Present iterations in a table with enough decimal places, and state the stopping condition. Algorithm or flowchart questions are common, so prepare clean versions for the main methods.',
  },
  'Advanced Programming with Java': {
    focus: [
      'Object-oriented Java: classes, inheritance, interfaces and packages',
      'Exception handling and multithreading',
      'Collections framework and generics',
      'GUI programming and event handling',
      'JDBC database connectivity, networking and servlets/JSP basics',
    ],
    study:
      'Build small working programs for each topic, then combine them into one project, such as a desktop app that reads and writes a database. Read the error messages carefully; they are how Java teaches you. Use an IDE, but make sure you can also write the code without autocomplete.',
    exam:
      'Prepare a short, correct example program for each major topic (a thread, a JDBC query, an event handler). Explain the concept briefly before the code.',
  },
  'Theory of Computation': {
    focus: [
      'Finite automata: DFA, NFA and converting between them',
      'Regular expressions and the pumping lemma for regular languages',
      'Context-free grammars, derivations, parse trees and normal forms',
      'Pushdown automata',
      'Turing machines, decidability and undecidability',
    ],
    study:
      'Design machines yourself for many small languages ("strings ending in 01", "equal numbers of a and b"). Test each design with accepted and rejected strings. For proofs like the pumping lemma, learn the structure of the argument and practice it on different languages.',
    exam:
      'Draw state diagrams clearly with start and accepting states marked, and include a transition table where asked. Show conversions (NFA to DFA, grammar to normal form) step by step.',
  },
  'Computer Architecture': {
    focus: [
      'Instruction set architecture and addressing modes',
      'Computer arithmetic: fixed and floating point, multiplication and division algorithms',
      'Control unit design: hardwired and microprogrammed',
      'Pipelining and its hazards',
      'Memory hierarchy, cache mapping and virtual memory; I/O organisation',
    ],
    study:
      'Work through arithmetic algorithms (Booth’s multiplication, restoring division) on examples by hand. For caches, practice mapping addresses to sets and computing hit ratios. Relate pipelining hazards to real instruction sequences.',
    exam:
      'Step-by-step tables for arithmetic algorithms and clear block diagrams score well. In cache and pipeline numericals, state your assumptions and show the formula before substituting.',
  },
  'Research Fundamentals': {
    focus: [
      'The research process and types of research',
      'Formulating a research problem, objectives and hypotheses',
      'Literature review and citation',
      'Research design, sampling and data collection methods',
      'Data analysis basics, and writing the research report or proposal',
    ],
    study:
      'Apply each step to a topic you care about: write a problem statement, objectives and a short literature review for it. Read a few published papers in computing to see how they are structured.',
    exam:
      'Use clear headings and examples. Questions on research design or proposals are answered best by following the standard structure.',
  },

  // ---------------- Semester V ----------------
  'Probability & Statistics': {
    focus: [
      'Descriptive statistics, and probability with conditional probability and Bayes’ theorem',
      'Random variables and their distributions: binomial, Poisson and normal',
      'Sampling distributions and estimation',
      'Hypothesis testing: z, t, chi-square and F tests',
      'Correlation and regression',
    ],
    study:
      'Practice many problems and learn to recognise which distribution or test a question describes. Keep a summary sheet of formulas, conditions for using each test, and how to read the statistical tables.',
    exam:
      'For hypothesis tests, write the null and alternative hypotheses, the test statistic, the critical value and a conclusion in words. Present calculations neatly in tables.',
  },
  'Embedded System': {
    focus: [
      'Characteristics and design challenges of embedded systems',
      'Microcontroller architecture and programming',
      'Interfacing sensors, actuators and displays',
      'Real-time systems and RTOS concepts',
      'Communication protocols such as UART, SPI and I²C',
    ],
    study:
      'Build things. A small project on an Arduino or similar board (read a sensor, drive a motor, show data on a display) teaches more than reading. Understand timing, interrupts and how protocols move bits.',
    exam:
      'Use block diagrams for system design questions, and explain trade-offs (cost, power, speed). Short code examples help when explaining interfacing.',
  },
  'Engineering Management': {
    focus: [
      'Functions of management and theories of management',
      'Organisational structure and human resource management',
      'Motivation, leadership and communication',
      'Planning, decision-making and project management',
      'Quality management',
    ],
    study:
      'Connect theories to real organisations you know, including Nepali companies and the college itself. Make short notes per chapter with definitions, key points and one example each.',
    exam:
      'Structured answers with headings, points and examples score better than long paragraphs. Diagrams (organisation charts, motivation theories) help where they fit.',
  },
  'Artificial Intelligence': {
    focus: [
      'Intelligent agents and problem formulation',
      'Search: uninformed and informed (A*), and adversarial search (minimax, alpha–beta pruning)',
      'Knowledge representation and reasoning: propositional and first-order logic',
      'Reasoning under uncertainty and Bayesian networks',
      'Introduction to machine learning and neural networks',
    ],
    study:
      'Trace search algorithms by hand on small graphs and game trees, noting the order nodes are expanded. Practice converting English sentences into logic and applying resolution. Implementing a search algorithm in Python makes the ideas stick.',
    exam:
      'Show the search tree or table step by step. In logic questions, write each conversion step clearly; marks are awarded for the method.',
  },
  'Digital Signal Analysis & Processing': {
    focus: [
      'Discrete-time signals and systems, and their properties',
      'Convolution and correlation',
      'Z-transform and its application to system analysis',
      'Discrete Fourier transform and FFT',
      'Design of FIR and IIR filters',
    ],
    study:
      'Build intuition with plots: compute and plot signals and their transforms in Python or MATLAB. Practice convolution by hand on short sequences. Keep a table of Z-transform pairs and properties.',
    exam:
      'Show each step of convolution and transform calculations. Filter design questions need the specification, design steps and final transfer function.',
  },
  'Software Engineering': {
    focus: [
      'Software process models (waterfall, incremental, spiral, agile)',
      'Requirements engineering',
      'System modelling with UML diagrams',
      'Software design and architecture',
      'Testing, maintenance and project management',
    ],
    study:
      'Apply the course to a real project, ideally your semester project: write its requirements, draw its UML diagrams and plan its testing. Compare process models by when each one suits a project.',
    exam:
      'Draw UML diagrams with correct notation. Use comparison tables for process models and testing methods, and support theory with a small example.',
  },

  // ---------------- Semester VI ----------------
  'Image Processing & Pattern Recognition': {
    focus: [
      'Digital image fundamentals: sampling, quantisation and pixel relationships',
      'Image enhancement in the spatial and frequency domains',
      'Image restoration and compression',
      'Segmentation, edge detection and morphological operations',
      'Feature extraction and pattern recognition basics',
    ],
    study:
      'Experiment with real images using Python (OpenCV, scikit-image): apply filters, histograms and edge detectors and see what changes. Work small numerical examples by hand, such as histogram equalisation on a tiny image.',
    exam:
      'Show calculations on given pixel matrices step by step. Include before/after sketches or diagrams where they explain a technique.',
  },
  'Machine Learning': {
    focus: [
      'Supervised learning: regression and classification',
      'Decision trees, Naive Bayes, k-NN and support vector machines',
      'Model evaluation: bias and variance, cross-validation and metrics',
      'Unsupervised learning: clustering and dimensionality reduction',
      'Neural networks and the basics of deep learning',
    ],
    study:
      'Implement simple algorithms from scratch once (linear regression, k-NN) to understand them, then use scikit-learn on real datasets. Calculate small examples by hand, such as building a decision tree with information gain.',
    exam:
      'Numerical questions (information gain, Naive Bayes probabilities, distance calculations) need clear tables. Explain each algorithm with its advantages, limitations and a use case.',
  },
  'Computer Networks': {
    focus: [
      'The OSI and TCP/IP models',
      'Data link layer: framing, error control, flow control and MAC protocols',
      'Network layer: IP addressing, subnetting and routing algorithms',
      'Transport layer: TCP, UDP and congestion control',
      'Application layer protocols: DNS, HTTP, email and others',
    ],
    study:
      'Practice subnetting until it is quick, since it appears everywhere. Trace routing algorithms on small networks. Using Wireshark or Packet Tracer to see real packets makes the layers concrete.',
    exam:
      'Subnetting and routing questions need complete, tabulated working. Draw protocol diagrams and header formats neatly.',
  },
  'Simulation & Modeling': {
    focus: [
      'Systems, models and types of simulation',
      'Random number generation and testing for randomness',
      'Monte Carlo simulation',
      'Queueing systems and their simulation',
      'Discrete event simulation, and verification and validation of models',
    ],
    study:
      'Write small simulations in C or Python (random numbers, a single-server queue, a Monte Carlo estimate) as the lab does. Practice queueing formulas and randomness tests on numerical examples.',
    exam:
      'Simulation tables must be complete and neat. State the formulas used in queueing problems and interpret the result.',
  },
  'Compiler Design': {
    focus: [
      'Phases of a compiler',
      'Lexical analysis: regular expressions and finite automata',
      'Parsing: top-down (LL(1)) and bottom-up (SLR, LR, LALR)',
      'Syntax-directed translation and intermediate code generation',
      'Code optimisation and code generation',
    ],
    study:
      'Parsing is the heart of the course: compute FIRST and FOLLOW sets and build parsing tables for many grammars until the steps are automatic. Writing a small lexer and parser, as in the lab, connects the theory to real code.',
    exam:
      'Show FIRST/FOLLOW sets, item sets and parsing tables completely. For parsing a given string, present the stack, input and action at each step in a table.',
  },

  // ---------------- Semester VII and VIII ----------------
  'Project I': {
    focus: [
      'Choosing a problem that is useful and achievable in one semester',
      'Writing a clear proposal: problem, objectives, scope and methodology',
      'Planning work with milestones',
      'Documentation and the final report',
      'Presenting and defending your work',
    ],
    study:
      'Pick a topic early and keep its scope realistic. Use version control from day one, meet your supervisor regularly, and write the report alongside the work instead of at the end.',
    exam:
      'In the defence, be ready to explain every design decision and demo the working system. Know your limitations and future work.',
  },
  'Project II': {
    focus: [
      'A substantial problem with a clear user or real-world value',
      'Literature review and comparison with existing systems',
      'System design, implementation and testing',
      'Evaluation of results',
      'The final report and defence',
    ],
    study:
      'Treat it like a real product: plan sprints, track tasks and test continuously. Build on lessons from Project I, and finish a working core early before adding features.',
    exam:
      'Prepare a focused demo and be ready for questions on design choices, evaluation and what you would do differently.',
  },
  'Internship': {
    focus: [
      'Learning how a real software team works',
      'Applying course knowledge to real tasks',
      'Professional communication and workplace practices',
      'Keeping a log of work done',
      'Writing the internship report',
    ],
    study:
      'Keep a daily or weekly log of tasks, tools and what you learnt; it makes the report easy to write. Ask questions and take on tasks outside your comfort zone.',
    exam:
      'In the presentation, describe the organisation, your role, what you built and what you learnt, with specific examples.',
  },
  'Entrepreneurship & Professional Practice': {
    focus: [
      'Entrepreneurship and the startup process',
      'Business plans and feasibility study',
      'Professional ethics and codes of conduct',
      'Legal aspects: contracts, intellectual property and cyber law in Nepal',
      'Engineering profession and its regulation',
    ],
    study:
      'Relate each topic to real cases: Nepali startups, IT laws and ethical issues you have seen in the news. Draft a short business plan for an idea of your own.',
    exam:
      'Organised answers with headings and examples work best. Case-study questions reward clear reasoning about the ethical or legal issue.',
  },
  'Engineering Economics': {
    focus: [
      'Time value of money and interest formulas',
      'Comparing alternatives: present worth, annual worth and rate of return',
      'Benefit–cost analysis',
      'Depreciation and taxation',
      'Risk, sensitivity and break-even analysis',
    ],
    study:
      'This is a numerical subject. Learn the interest factors, draw a cash-flow diagram for every problem and solve many variations.',
    exam:
      'Always draw the cash-flow diagram, state the method and show each calculation. Conclude with a clear decision.',
  },
  'Network & Cyber Security': {
    focus: [
      'Security goals, threats and attacks',
      'Symmetric and asymmetric cryptography (DES, AES, RSA)',
      'Hash functions, digital signatures and certificates',
      'Network security protocols (SSL/TLS, IPsec) and firewalls',
      'Intrusion detection, malware and security policy',
    ],
    study:
      'Work through algorithms like RSA on small numbers by hand. Try safe, legal practice environments to see attacks and defences in action.',
    exam:
      'Show cryptographic calculations step by step and use diagrams for protocols. Comparison tables help for algorithms and attack types.',
  },
  'Cloud Computing & Virtualization': {
    focus: [
      'Cloud service and deployment models (IaaS, PaaS, SaaS)',
      'Virtualisation: hypervisors, virtual machines and containers',
      'Cloud architecture, storage and scalability',
      'Security and privacy in the cloud',
      'Case studies of major cloud platforms',
    ],
    study:
      'Use the free tier of a cloud provider to deploy something real, such as a small website or database. Set up a virtual machine and a container locally to see the difference.',
    exam:
      'Use diagrams for architectures and models, and compare options in tables with real-world examples.',
  },
  'Data Science & Analytics': {
    focus: [
      'The data science process',
      'Data collection, cleaning and preprocessing',
      'Exploratory data analysis and visualisation',
      'Statistical modelling and machine learning for analytics',
      'Communicating results',
    ],
    study:
      'Take a public dataset and go end to end in Python with pandas: clean it, explore it, model it and present findings. Practice explaining your charts in plain words.',
    exam:
      'Explain each step of the process with an example, and justify the choice of technique.',
  },

  // ---------------- Electives ----------------
  'Big Data Technologies': {
    focus: [
      'Characteristics of big data and its challenges',
      'Hadoop ecosystem: HDFS and MapReduce',
      'Spark and in-memory processing',
      'NoSQL databases',
      'Stream processing and big data analytics',
    ],
    study:
      'Write MapReduce or Spark jobs for classic problems like word count. Running a small local cluster or a notebook environment makes the concepts concrete.',
    exam:
      'Use architecture diagrams and walk through a MapReduce example step by step.',
  },
  'Natural Language Processing': {
    focus: [
      'Text preprocessing: tokenisation, stemming and lemmatisation',
      'Language models and n-grams',
      'Part-of-speech tagging and parsing',
      'Word embeddings and text classification',
      'Neural NLP and transformers',
    ],
    study:
      'Use Python libraries such as NLTK or spaCy on real text, then try a pretrained transformer model. Work n-gram probabilities by hand on small corpora.',
    exam:
      'Show probability calculations clearly and explain each pipeline stage with an example sentence.',
  },
  'Cybersecurity': {
    focus: [
      'Threat landscape and common attack techniques',
      'Web application security (the OWASP Top 10)',
      'Cryptography in practice',
      'Network defence and incident response',
      'Security governance, policy and law',
    ],
    study:
      'Practice on legal training platforms and deliberately vulnerable lab apps to understand how attacks work and how to defend against them.',
    exam:
      'Explain attacks with the steps involved and the countermeasures for each.',
  },
  '.NET Technologies': {
    focus: [
      'The .NET platform and C# language fundamentals',
      'Object-oriented programming in C#',
      'ASP.NET Core and web application development',
      'Data access with Entity Framework',
      'Building and deploying APIs',
    ],
    study:
      'Build a small web application with ASP.NET Core connected to a database. Practice C# features through short console programs first.',
    exam:
      'Support explanations with short, correct C# code examples.',
  },
  'Generative AI': {
    focus: [
      'Foundations of generative models',
      'Transformers and large language models',
      'Diffusion models and image generation',
      'Prompting, fine-tuning and retrieval-augmented generation',
      'Ethics, safety and limitations',
    ],
    study:
      'Experiment with model APIs and open-source models, and build a small application such as a document Q&A tool. Read the key papers alongside the course notes.',
    exam:
      'Explain architectures with diagrams, and discuss limitations and ethical issues with concrete examples.',
  },
  'Information System Audit': {
    focus: [
      'The audit process and standards',
      'IT governance and controls',
      'Auditing information systems and infrastructure',
      'Risk assessment',
      'Business continuity and disaster recovery',
    ],
    study:
      'Study real audit frameworks and case studies, and practice writing an audit checklist for a familiar system.',
    exam:
      'Structured answers with headings, steps and examples work best.',
  },
  'Mobile App Development': {
    focus: [
      'Mobile platforms and app architecture',
      'UI design and layouts',
      'Activities, navigation and app lifecycle',
      'Data storage and networking',
      'Publishing and testing apps',
    ],
    study:
      'Build a complete small app and run it on a real phone. Each week, add one feature: a list, a form, local storage, an API call.',
    exam:
      'Explain concepts with short code snippets and lifecycle diagrams.',
  },
};
