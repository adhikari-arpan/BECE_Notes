/**
 * Short descriptions of each subject, shown on the semester and subject pages and used as the
 * page description in search results. Keyed by subject name (compared loosely, so
 * "Electronic Devices & Circuits" matches "electronic devices and circuits").
 *
 * To add or edit one: write 1–3 plain sentences about what the course covers. Keep the subject's
 * name and main topics in the text — that is what people search for.
 */
export const subjectDescriptions: Record<string, string> = {
  // ---------------- Semester I ----------------
  'Calculus I':
    'Differential and integral calculus for engineering: limits, continuity, derivatives and their applications, integration techniques, applications of definite integrals, and first-order ordinary differential equations.',
  'Digital Logic':
    'Number systems, Boolean algebra and logic gates, simplification with K-maps, combinational circuits (adders, multiplexers, decoders), flip-flops, registers, counters, and synchronous and asynchronous sequential circuit design.',
  'Programming in C':
    'Problem solving with the C language: algorithms and flowcharts, data types, operators, control structures, arrays and strings, functions, pointers, structures and unions, and file handling.',
  'Basic Electrical Engineering':
    'Fundamentals of electrical circuits: circuit elements and network theorems, DC and AC circuit analysis, single-phase and three-phase systems, magnetic circuits, and an introduction to transformers and electrical machines.',
  'Computer Workshop':
    'Hands-on computer hardware, software and networking: PC components and assembly, installing operating systems and applications, troubleshooting common hardware and software faults, and basic network setup.',
  'Communication Technique':
    'Technical communication for engineers: writing for an audience and purpose, research and documentation, reports, proposals and technical documents, visual communication, and effective presentations.',
  'Electronic Devices & Circuits':
    'Semiconductor devices and the circuits built from them: diodes and their applications, bipolar and field-effect transistors, biasing and amplifiers, operational amplifiers, and power supply circuits.',

  // ---------------- Semester II ----------------
  'Algebra & Geometry':
    'Linear algebra and analytic geometry for engineers: matrices and determinants, systems of linear equations, vector spaces, eigenvalues and eigenvectors, vectors, and the geometry of lines, planes and conic sections.',
  'Applied Physics':
    'Physics for engineering: oscillations and waves, optics, electrostatics and magnetism, electromagnetic theory, and the basics of quantum and semiconductor physics used in modern devices.',
  'Applied Chemistry':
    'Chemistry for engineering: atomic structure and chemical bonding, electrochemistry, corrosion, water treatment, fuels, polymers and engineering materials.',
  'Basic Engineering Drawing':
    'Technical drawing fundamentals: drawing instruments and lettering, geometric construction, orthographic and isometric projection, sectional views, dimensioning, and an introduction to CAD.',
  'Object Oriented Programming in C++':
    'Object-oriented programming with C++: classes and objects, constructors and destructors, operator overloading, inheritance, polymorphism and virtual functions, templates, exception handling, and file I/O.',
  'Data Structure & Algorithm':
    'Core data structures and algorithms: stacks, queues, linked lists, recursion, trees and binary search trees, graphs, sorting and searching, hashing, and algorithm complexity analysis.',
  'Instrumentation':
    'Electrical and electronic measurement: measuring instruments and errors, transducers and sensors, signal conditioning, data conversion (ADC/DAC), oscilloscopes, and recording and display devices.',

  // ---------------- Semester III ----------------
  'Calculus II':
    'Advanced calculus for engineers: infinite series, functions of several variables and partial derivatives, multiple integrals, vector calculus, and higher-order differential equations.',
  'Database Management System':
    'Design and use of databases: the relational model, ER modelling, SQL, relational algebra, normalization, indexing, query processing, transactions, concurrency control and recovery.',
  'Operating Systems':
    'How operating systems work: processes and threads, CPU scheduling, synchronization and deadlocks, memory management and virtual memory, file systems, I/O, and security.',
  'Microprocessor & Assembly Language Programming':
    'Microprocessor architecture and programming: the 8085 and 8086, instruction sets and addressing modes, assembly language programming, memory and I/O interfacing, and interrupts.',
  'Computer Graphics':
    'Fundamentals of computer graphics: display devices, line and circle drawing algorithms, 2D and 3D transformations, viewing and clipping, projections, hidden surface removal, shading, and OpenGL.',
  'Data Communication':
    'How data moves across networks: signals and transmission media, analog and digital transmission, modulation, multiplexing, error detection and correction, data link protocols, and switching.',

  // ---------------- Semester IV ----------------
  'Applied Mathematics':
    'Advanced mathematics for engineering applications: complex analysis, the Z-transform, Fourier series and Fourier transform, and partial differential equations.',
  'Numerical Methods':
    'Solving engineering problems with computers: roots of equations, interpolation, numerical differentiation and integration, systems of linear equations, and numerical solution of differential equations.',
  'Advanced Programming with Java':
    'Advanced Java: object-oriented design, GUI development, networking, database connectivity with JDBC, web development with servlets and JSP, ORM and Hibernate, and concurrency.',
  'Theory of Computation':
    'Theory of automata, formal languages and computation: finite automata, regular expressions, context-free grammars, pushdown automata, Turing machines, decidability and computational complexity.',
  'Computer Architecture':
    'How computers are designed: the evolution of computer architecture, processing unit and control unit design, instruction sets, pipelining, memory hierarchy and cache, I/O organization, and parallel processing.',
  'Research Fundamentals':
    'Carrying out a research or project work: what research is, choosing a problem, literature review, research methods and design, research ethics, and writing a project proposal and report.',

  // ---------------- Semester V ----------------
  'Probability & Statistics':
    'Probability and statistics for engineers: probability rules, random variables and distributions, sampling, estimation, hypothesis testing, correlation and regression.',
  'Embedded System':
    'Design of dedicated computer systems: microcontrollers, embedded programming, interfacing sensors and actuators, real-time systems and scheduling, and embedded system design methods.',
  'Engineering Management':
    'Management for engineers: planning, organizing, staffing, leading and motivation, controlling, and recent trends in management with technology and contemporary issues.',
  'Artificial Intelligence':
    'An introduction to AI: intelligent agents, problem solving by search, knowledge representation and reasoning, logic, planning, an introduction to machine learning, and the ethics of AI.',
  'Digital Signal Analysis & Processing':
    'Discrete-time signals and systems: the Z-transform, frequency-domain analysis, the DFT and FFT, discrete filter structures, and IIR and FIR filter design.',
  'Software Engineering':
    'Principles and practice of building software: software process models, requirements engineering, system design and modelling (UML), testing, project management, and quality assurance.',

  // ---------------- Semester VI ----------------
  'Image Processing & Pattern Recognition':
    'Image processing and pattern recognition techniques: image enhancement, filtering, segmentation, feature extraction, and classification, with applications in areas such as medical imaging and computer vision.',
  'Machine Learning':
    'Algorithms that learn from data: supervised learning (regression and classification), unsupervised learning and clustering, model evaluation, neural networks, and practical machine learning workflows.',
  'Computer Networks':
    'How computer networks work: layered network models, addressing and subnetting, routing algorithms and protocols, transport protocols, network management and security, and server configuration.',
  'Simulation & Modeling':
    'Modelling and simulating systems: continuous and discrete system simulation, queuing systems, probability concepts, random number generation and testing, and analysis of simulation output.',
  'Compiler Design':
    'How compilers are built: phases of a compiler, lexical analysis, parsing, syntax-directed translation, type checking, symbol tables, intermediate code, code optimization and code generation.',
  'Elective I': 'Notes for the Semester VI elective. See the Electives section for notes on individual elective subjects.',
  'Project I': 'Resources for the Semester VI minor project: proposal writing, documentation, reports and presentation.',

  // ---------------- Semester VII ----------------
  'Entrepreneurship & Professional Practice':
    'Starting and running a business, and professional engineering practice: entrepreneurship, business plans, engineering ethics, professional responsibility and relevant laws.',
  'Engineering Economics':
    'Economic decision-making for engineering projects: time value of money, cash flow analysis, comparing alternatives, depreciation, break-even analysis, and project evaluation.',
  'Network & Cyber Security':
    'Securing networks and systems: cryptography, authentication, network security protocols, firewalls and intrusion detection, common attacks, and security policies.',
  'Cloud Computing & Virtualization':
    'Cloud and virtualization technologies: virtualization and hypervisors, cloud service and deployment models, cloud architecture, storage, and security in the cloud.',
  'Data Science & Analytics':
    'Working with data: collection and cleaning, exploratory data analysis, visualization, statistical modelling, and using analytics to make data-driven decisions.',
  'Elective II': 'Notes for the Semester VII elective. See the Electives section for notes on individual elective subjects.',

  // ---------------- Semester VIII ----------------
  'Elective III': 'Notes for the Semester VIII elective. See the Electives section for notes on individual elective subjects.',
  'Internship': 'Resources for the internship: internship reports, logbooks and presentation guidelines.',
  'Project II': 'Resources for the final-year major project: proposals, reports, documentation and defence presentations.',

  // ---------------- Electives ----------------
  'Big Data Technologies':
    'Storing and processing large-scale data: big data concepts, Hadoop and HDFS, MapReduce, Spark, NoSQL databases, and data processing pipelines.',
  'Natural Language Processing':
    'Teaching computers to work with human language: text preprocessing, text representation, language models, text classification, word embeddings, and transformer models.',
  'Cybersecurity':
    'Protecting systems and data: security principles, threats and vulnerabilities, cryptography, network and web security, and security management.',
  '.NET Development':
    'Building applications on the .NET platform: C#, object-oriented programming, ASP.NET web applications, data access, and application development.',
  'Generative AI':
    'Modern generative AI: neural networks and deep learning foundations, large language models, prompting, and building applications with generative models.',
  'Information System Audit':
    'Auditing information systems: IT governance and controls, audit processes and standards, risk assessment, and information security auditing.',
  'Mobile App Development':
    'Building mobile applications: app architecture, user interface design, platform development, data storage, and publishing apps.',
};
