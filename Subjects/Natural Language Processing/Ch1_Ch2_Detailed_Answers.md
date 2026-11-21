# NLP Exam Prep — Chapter 1 & Chapter 2 (Detailed Answers)

---

# CHAPTER 1: INTRODUCTION TO NLP

## Q1. Define NLP. Explain NLU vs NLG with examples. (8 marks)

**Definition:**
Natural Language Processing (NLP) is a subfield of Artificial Intelligence that enables computers to understand, interpret, generate, and manipulate human (natural) language — whether written or spoken. It combines computational linguistics with machine learning and deep learning to bridge the gap between human communication and computer understanding.

**NLU (Natural Language Understanding):**
- The subfield of NLP concerned with **reading comprehension** — taking human language as input and extracting meaning, intent, and structure from it.
- Involves: syntactic parsing, semantic analysis, intent detection, entity recognition, resolving ambiguity.
- Goal: convert unstructured text into a structured representation a machine can reason over.
- **Example:** A chatbot receives "Book me a flight to Kathmandu tomorrow morning." NLU extracts: intent = book_flight, destination = Kathmandu, date = tomorrow, time = morning.

**NLG (Natural Language Generation):**
- The subfield concerned with **producing** human-readable language from structured data or internal representations.
- Involves: content planning, sentence structuring, choosing words (lexicalization), grammatical realization.
- Goal: convert machine-level data into fluent, natural text.
- **Example:** A weather API returns `{temp: 22, condition: "clear", city: "Kathmandu"}`. NLG converts this into: "It's a clear day in Kathmandu with a temperature of 22°C."

**Key distinction:**

| Aspect | NLU | NLG |
|---|---|---|
| Direction | Language → Meaning | Meaning → Language |
| Task | Comprehension | Production |
| Example systems | Sentiment analysis, spam detection, voice assistants (interpreting commands) | Text summarizers, chatbot responses, report generators |
| Difficulty focus | Disambiguation | Fluency and coherence |

Most real-world systems (chatbots, translators, voice assistants) use **both**: NLU to understand the user's input, and NLG to produce the response.

---

## Q2. What is the Turing Test? Explain its relevance to NLP and its relation to human language and intelligence. (8 marks)

**The Turing Test:**
Proposed by Alan Turing in his 1950 paper "Computing Machinery and Intelligence," it's a test of a machine's ability to exhibit intelligent behavior indistinguishable from a human's.

**Setup (the "Imitation Game"):**
- A human judge has text-based conversations with two hidden participants: one human, one machine.
- The judge doesn't know which is which and asks both free-form questions.
- If the judge cannot reliably distinguish the machine from the human, the machine is said to have "passed" the test.

**Relevance to NLP:**
- The test is fundamentally a **language task** — the machine must understand questions (NLU) and produce convincing, contextually appropriate answers (NLG).
- It set the philosophical goal for NLP: not just processing symbols, but genuinely mimicking human-level language use, including handling ambiguity, humor, context, and common-sense reasoning.
- Modern large language models (chatbots) are often informally benchmarked against Turing-Test-like criteria — can a person tell they're talking to a machine?
- It shifted the definition of "intelligence" from internal reasoning to **observable linguistic behavior** — which is exactly what NLP systems are evaluated on.

**Relation to human language and intelligence:**
- Language is considered one of the clearest markers of human intelligence because it requires: knowledge representation, reasoning, memory, context-tracking, and social/pragmatic understanding — all at once.
- Passing the Turing Test would imply a machine can replicate this entire bundle of cognitive abilities, not just one narrow skill.
- Criticism: passing the test shows convincing *behavior*, not necessarily genuine *understanding* — this is the basis of Searle's "Chinese Room" argument, worth mentioning as a counterpoint for extra marks.

---

## Q3. Discuss the major challenges in NLP: ambiguity, context dependence, language diversity. (7 marks)

**1. Ambiguity**
Natural language is inherently ambiguous — the same string of words can have multiple valid interpretations.
- *Lexical ambiguity:* "bank" (riverbank vs. financial institution)
- *Syntactic ambiguity:* "I saw the man with a telescope" (who has the telescope?)
- *Semantic ambiguity:* "The chicken is ready to eat" (is the chicken eating, or being eaten?)

**2. Context Dependence**
Meaning often depends on surrounding context — sentence-level, discourse-level, or real-world/cultural context.
- Example: "It's cold in here" can be a statement of fact or an indirect request to close a window/turn on heating, depending on context.
- Pronoun resolution also depends on context: "The trophy didn't fit in the suitcase because **it** was too big" — does "it" refer to the trophy or the suitcase? (This depends on world knowledge, not just grammar.)

**3. Language Diversity**
There are thousands of languages with vastly different:
- **Morphology** — e.g., Nepali/Hindi are morphologically rich (heavy use of suffixes for tense, gender, case) compared to English.
- **Word order** — English is SVO (Subject-Verb-Object), Nepali is SOV (Subject-Object-Verb).
- **Script and resource availability** — many languages (including many South Asian languages) are "low-resource," lacking large labeled datasets, making it hard to build robust NLP models for them.

Together, these three challenges mean NLP systems must be trained on large amounts of context-rich data and often still fail on edge cases, sarcasm, idioms, and under-represented languages.

---

## Q4. Explain different types of ambiguity in NLP with examples. (7 marks)

**1. Lexical Ambiguity**
Occurs when a single word has multiple meanings (polysemy/homonymy), and the correct one depends on context.
- Example: "He went to the **bank**." (riverbank or financial institution?)
- Example: "**Bat**" — a flying mammal or sports equipment.

**2. Syntactic (Structural) Ambiguity**
Occurs when a sentence can be parsed into more than one valid grammatical structure, leading to different meanings.
- Example: "I saw the man with a telescope." — Did I use the telescope to see him, or does the man have the telescope?
- Example: "Flying planes can be dangerous." — Is it dangerous to fly planes, or are planes that are flying dangerous?

**3. Semantic Ambiguity**
Occurs when a sentence has multiple possible meanings even after its grammar is resolved — the ambiguity lies in interpretation, not structure.
- Example: "The chicken is ready to eat." — Is the chicken about to eat something, or is it prepared as food?
- Example: "Visiting relatives can be annoying." — Is it annoying to visit relatives, or are relatives who visit annoying?

**(Bonus, if you have space) Pragmatic Ambiguity:**
When the intended meaning depends on context/speaker intent beyond literal meaning.
- Example: "Can you pass the salt?" — literally a yes/no question about ability, but pragmatically a request.

Each type requires a different resolution strategy: lexical ambiguity needs word-sense disambiguation, syntactic ambiguity needs parsing with probabilistic grammars, semantic ambiguity needs deeper world knowledge/context modeling.

---

## Q5. What is language diversity and why is it a challenge for NLP? Discuss morphological complexity, word order, resource scarcity. (7 marks)

**Definition:**
Language diversity refers to the vast structural, grammatical, and lexical differences across the world's ~7,000 languages. NLP systems built for one language often don't transfer well to another because of these structural differences.

**1. Morphological Complexity**
- Morphology = how words are formed from roots, prefixes, and suffixes.
- **Analytic languages** like English have relatively simple morphology (few inflections: "walk," "walked," "walking").
- **Agglutinative/inflectional languages** like Nepali, Turkish, or Finnish attach many suffixes to a root to encode tense, case, number, gender, and honorific level in a single word.
- Challenge: tokenization and stemming/lemmatization rules built for English fail badly on morphologically rich languages — a single Nepali word may correspond to an entire English phrase.

**2. Word Order**
- Languages differ in basic sentence structure:
  - English: SVO ("I eat rice")
  - Nepali/Hindi/Japanese: SOV ("I rice eat")
  - Some languages (Arabic, Irish) use VSO.
- Challenge: syntactic parsers and grammar rules are language-specific; a parser trained on English's SVO structure cannot be directly applied to an SOV language.

**3. Resource Scarcity**
- High-resource languages (English, Chinese, Spanish) have huge labeled corpora, pretrained models, and annotated treebanks.
- Low-resource languages (many South Asian, African, and indigenous languages) lack large digitized datasets, making it hard to train deep learning models, which are data-hungry.
- Challenge: this creates inequity in NLP tool quality — a task like sentiment analysis might reach 90%+ accuracy in English but far lower for Nepali due to limited training data.

**Conclusion:** Because of these three factors, a single "universal" NLP pipeline rarely works well across languages — systems typically need language-specific tokenizers, morphological analyzers, and (ideally) large native-language datasets.

---

## Q6. Compare and contrast NLU and NLG. Provide examples of systems that use each. (8 marks)

| Aspect | NLU (Understanding) | NLG (Generation) |
|---|---|---|
| Direction of processing | Text/speech → structured meaning | Structured data/meaning → Text |
| Core tasks | Tokenization, parsing, entity recognition, intent classification, sentiment analysis | Content planning, sentence realization, text structuring |
| Difficulty | Handling ambiguity, resolving context, extracting correct meaning | Producing fluent, grammatically correct, coherent, non-repetitive text |
| Output | Structured representation (intents, entities, parse trees, labels) | Natural language text/speech |
| Example systems | - Spam filters (classify email as spam/not) <br> - Sentiment analysis tools (classify review as positive/negative) <br> - Siri/Alexa's command interpretation | - Auto-generated weather/sports reports <br> - Chatbot response generation <br> - Text summarization systems <br> - Machine translation output stage |

**Combined example:** A customer support chatbot uses NLU to understand "My order hasn't arrived yet" (intent = complaint, topic = delivery delay), then uses NLG to generate a natural reply: "I'm sorry to hear that — let me check the status of your order."

**Key contrast in one line:** NLU is about *interpretation* (reading a text and extracting what it means), while NLG is about *composition* (taking meaning and expressing it in natural language). They are complementary and often used together in a single pipeline (e.g., translation = NLU on source language + NLG in target language).

---

## Q7. What are the key components of an NLP system? Explain the NLP steps with an example. (7 marks)

A typical NLP pipeline consists of the following stages, applied in sequence:

**1. Text Acquisition / Input**
Raw text or speech is collected (e.g., from a document, user query, or audio transcribed to text).

**2. Text Preprocessing**
Cleaning and normalizing the raw text — lowercasing, removing punctuation/noise, tokenization, stop word removal, stemming/lemmatization.

**3. Morphological Analysis**
Analyzing word structure (roots, prefixes/suffixes) to understand grammatical form.

**4. Syntactic Analysis (Parsing)**
Determining the grammatical structure of a sentence — building a parse tree, identifying subject/verb/object, part-of-speech tagging.

**5. Semantic Analysis**
Extracting the meaning of words and sentences — word sense disambiguation, named entity recognition.

**6. Discourse Integration**
Understanding how a sentence relates to preceding/following sentences (e.g., resolving pronouns like "it" or "he" across sentences).

**7. Pragmatic Analysis**
Interpreting the intended meaning based on real-world context, beyond literal meaning (e.g., recognizing "Can you close the window?" as a request, not a literal question about capability).

**Example — applying this to the sentence "The bank raised its interest rates yesterday":**
- *Preprocessing:* Tokenize → ["The", "bank", "raised", "its", "interest", "rates", "yesterday"]
- *Syntactic analysis:* Identify "bank" as subject noun, "raised" as main verb, "rates" as object.
- *Semantic analysis:* Disambiguate "bank" → financial institution (not riverbank), based on co-occurrence with "interest rates."
- *Discourse/Pragmatic:* If part of a larger paragraph, "its" is resolved to refer back to "the bank."

This pipeline is the backbone of most NLP applications, from search engines to chatbots to machine translation.

---

## Q8. What is parsing? Create a syntactic tree for: "I have selected NLP as an elective subject for this semester." (7 marks)

**Parsing:**
Parsing is the process of analyzing a sentence according to the rules of a formal grammar to determine its grammatical structure — typically represented as a **parse tree (syntax tree)**. It shows how words group into phrases (noun phrases, verb phrases, prepositional phrases) and how those phrases relate hierarchically to form the full sentence. Parsing is essential for downstream tasks like machine translation, question answering, and grammar checking, since it reveals *who did what to whom*.

There are two broad parsing approaches:
- **Constituency parsing** — breaks a sentence into nested sub-phrases (NP, VP, PP, etc.), based on phrase-structure grammar.
- **Dependency parsing** — represents grammatical relations as directed links between a "head" word and its dependents (e.g., subject depends on verb).

**Constituency (phrase-structure) tree for the sentence:**

```
                        S
                        │
        ┌───────────────┼──────────────────────┐
        NP              VP
        │               │
       "I"    ┌──────────┼──────────────────────────┐
              Aux        VP
              │           │
            "have"    ┌───┴──────────────────────────┐
                       V              NP
                       │              │
                  "selected"   ┌──────┴──────────────────────┐
                                NP                    PP
                                │                      │
                              "NLP"     ┌──────────────┴─────────────┐
                                        P                 NP
                                        │                  │
                                       "as"    ┌────────────┴─────────────┐
                                                Det   Adj        N        PP
                                                │      │         │         │
                                               "an" "elective" "subject"  ┌─┴──────────┐
                                                                          P          NP
                                                                          │           │
                                                                        "for"  ┌──────┴──────┐
                                                                               Det        N
                                                                               │           │
                                                                             "this"    "semester"
```

**Simplified bracket (constituency) notation** — easier to reproduce quickly in an exam:

```
[S [NP I] [VP [Aux have] [VP [V selected] [NP NLP] 
   [PP [P as] [NP [Det an] [Adj elective] [N subject] 
        [PP [P for] [NP [Det this] [N semester]]]]]]]]
```

**Explanation of structure:**
- **S (Sentence)** = NP + VP
- **NP** = "I" (subject)
- **VP** = "have selected NLP as an elective subject for this semester"
  - Auxiliary verb "have" + main VP headed by "selected"
- Main verb "selected" takes object NP "NLP", followed by a **PP** ("as an elective subject...") which itself contains a nested NP and another PP ("for this semester")

If asked for **dependency** structure instead: "selected" is the root; "I" is the *nsubj* (subject) of "selected"; "have" is an *aux*; "NLP" is the *dobj* (direct object); "subject" is linked via *prep(as)* → *pobj*; "semester" is linked via *prep(for)* → *pobj* under "subject."

---

---

# CHAPTER 2: TEXT PREPROCESSING AND FEATURE ENGINEERING

## Q1. Describe the text preprocessing pipeline. Apply each step to the given texts. (8 marks)

**The standard text preprocessing pipeline (in order):**

1. **Text cleaning / noise removal** — remove HTML tags, special characters, extra whitespace, URLs, etc.
2. **Lowercasing** — normalize case so "Cat" and "cat" are treated the same.
3. **Tokenization** — split text into individual words/tokens.
4. **Stop word removal** — remove common low-information words ("the," "is," "a").
5. **Stemming / Lemmatization** — reduce words to their root/base form.
6. **(Optional) Handling contractions, spelling correction, POS tagging**

**Applying this to the given texts:**

**Text 1:** *"The running cats were quickly running towards the better hiding places!"*

| Step | Result |
|---|---|
| Lowercasing | "the running cats were quickly running towards the better hiding places!" |
| Cleaning (remove punctuation) | "the running cats were quickly running towards the better hiding places" |
| Tokenization | [the, running, cats, were, quickly, running, towards, the, better, hiding, places] |
| Stop word removal | [running, cats, quickly, running, towards, better, hiding, places] |
| Stemming | [run, cat, quickli, run, toward, better, hide, place] |
| Lemmatization | [run, cat, quickly, run, towards, good, hide, place] |

(Note: stemming crudely chops "quickly"→"quickli" and doesn't fix "better"→"good"; lemmatization is smarter and maps "better" to its base form "good" using a dictionary, and keeps valid words.)

**Text 2:** *"Dr. Smith's research paper on A.I. is fascinating! It explores N.L.P. applications."*

| Step | Result |
|---|---|
| Cleaning | Careful handling needed — abbreviations like "Dr.", "A.I.", "N.L.P." contain periods that are *not* sentence boundaries. A naive tokenizer might wrongly split sentences here. |
| Lowercasing | "dr. smith's research paper on a.i. is fascinating! it explores n.l.p. applications." |
| Tokenization | [Dr., Smith's, research, paper, on, A.I., is, fascinating, It, explores, N.L.P., applications] (handling possessive "Smith's" and abbreviations correctly requires a rule-aware tokenizer, not simple whitespace splitting) |
| Stop word removal | [Dr., Smith's, research, paper, A.I., fascinating, explores, N.L.P., applications] |
| Stemming/Lemmatization | [Dr., Smith, research, paper, AI, fascinat(e), explore, NLP, application] |

**Text 3:** *"Can you believe it?"*

| Step | Result |
|---|---|
| Lowercasing | "can you believe it?" |
| Cleaning | "can you believe it" |
| Tokenization | [can, you, believe, it] |
| Stop word removal | [believe] — ("can," "you," "it" are typically stop words) |
| Stemming/Lemmatization | [believ / believe] |

**Key exam point to mention:** These three examples deliberately illustrate real preprocessing challenges — Text 1 shows stemming vs. lemmatization differences; Text 2 shows why naive tokenization/sentence-splitting breaks on abbreviations and possessives; Text 3 shows how aggressive stop word removal on a short sentence can strip away almost all the words, sometimes losing meaning (this is a good point to note as a limitation).

---

## Q2. What is tokenization? Explain one-hot encoding with example and its major drawback. (8 marks)

**Tokenization:**
Tokenization is the process of splitting raw text into smaller units called **tokens** — typically words, but can also be subwords, characters, or sentences, depending on the granularity needed.
- Example: "NLP is fun" → tokens: ["NLP", "is", "fun"]
- Types: **Word tokenization**, **sentence tokenization**, **subword tokenization** (e.g., Byte Pair Encoding, used in modern models like BERT/GPT to handle rare/unknown words by breaking them into known subword units).
- Challenges: handling punctuation, contractions ("don't" → "do" + "n't"), abbreviations, and languages without clear word boundaries (like Chinese).

**One-Hot Encoding:**
A method to represent categorical data (like words) as binary vectors, where each word in the vocabulary is assigned a unique index, and its vector has a `1` at that index and `0` everywhere else.

**Example:**
Vocabulary = {cat, dog, fish} (vocabulary size = 3)

| Word | One-hot vector |
|---|---|
| cat | [1, 0, 0] |
| dog | [0, 1, 0] |
| fish | [0, 0, 1] |

A sentence like "cat dog" would be represented as two separate vectors: [1,0,0] and [0,1,0] (or summed into a single vector [1,1,0] if using a set-based/BoW-style representation).

**Major drawback:**
- **Curse of dimensionality / sparsity:** for a vocabulary of, say, 50,000 words, each word is represented by a 50,000-dimensional vector with only a single `1` — extremely memory-inefficient and computationally wasteful.
- **No semantic meaning captured:** every pair of words is equally "distant" from every other — e.g., cosine similarity between "cat" and "dog" is 0, exactly the same as between "cat" and "car," even though cat/dog are semantically closer. One-hot encoding cannot capture synonymy, relatedness, or context — this is the core motivation for word embeddings (Word2Vec, GloVe), which represent words in dense, lower-dimensional spaces that do capture semantic similarity.

---

## Q3. Explain stemming and lemmatization. Compare their differences with examples and discuss when to use each. (8 marks)

**Stemming:**
A crude, rule-based process that chops off word suffixes/prefixes to reduce a word to its root form (called the "stem"), which may not be an actual valid word. Common algorithm: **Porter Stemmer**.
- Example: "running" → "run", "studies" → "studi", "argued" → "argu"
- It works by applying a fixed set of heuristic rules (e.g., strip "-ing," "-ed," "-es") without understanding grammar or context.

**Lemmatization:**
A more sophisticated process that reduces a word to its dictionary base form (called the "lemma") using vocabulary and morphological/grammatical analysis (usually with POS tagging), ensuring the result is always a valid word.
- Example: "running" → "run", "studies" → "study", "better" → "good", "went" → "go"

**Comparison:**

| Aspect | Stemming | Lemmatization |
|---|---|---|
| Method | Rule-based suffix stripping | Dictionary + morphological analysis |
| Output | May not be a real word (e.g., "studi") | Always a valid dictionary word |
| Speed | Fast, computationally cheap | Slower, requires linguistic resources (POS tags, lexicon) |
| Accuracy | Lower — can over-stem or under-stem | Higher — context-aware |
| Example | "better" → "better" (unchanged, since it's rule-based on suffixes) | "better" → "good" |
| Example | "studies" → "studi" | "studies" → "study" |

**When to use each:**
- **Use stemming** when speed matters more than precision — e.g., large-scale information retrieval/search engines, where slight inaccuracy is acceptable in exchange for fast processing of millions of documents.
- **Use lemmatization** when accuracy and linguistic correctness matter — e.g., chatbots, sentiment analysis, question-answering systems, or any downstream task where the meaning of the exact word form matters and errors would propagate into worse results.

---

## Q4. What is data cleaning in NLP? Explain lowercasing, punctuation removal, and whitespace handling with examples. (8 marks)

**Data cleaning:**
Data cleaning is the process of removing noise, inconsistencies, and irrelevant elements from raw text before it's fed into an NLP model, ensuring the text is in a consistent, standardized format. Raw text from the web, social media, or scanned documents is often messy — full of HTML tags, typos, emojis, extra spaces, inconsistent casing, and special characters — all of which can hurt model performance if not cleaned.

**1. Lowercasing**
Converts all characters to lowercase so that the model treats words like "NLP," "nlp," and "Nlp" as identical, reducing vocabulary size and avoiding duplicate representations of the same word.
- Example: "The Cat sat on the MAT" → "the cat sat on the mat"
- Caution: lowercasing can sometimes lose useful information — e.g., "US" (United States) vs. "us" (pronoun) become indistinguishable — so it's applied carefully depending on the task.

**2. Punctuation Removal**
Strips punctuation marks (commas, periods, exclamation marks, quotes, etc.) that typically don't carry semantic meaning for many NLP tasks (like classification), reducing noise in tokenization.
- Example: "Hello, World! How are you?" → "Hello World How are you"
- Caution: for some tasks (sentiment analysis with "!!!," or parsing, where periods indicate sentence boundaries), punctuation *does* carry meaning and shouldn't be blindly stripped.

**3. Whitespace Handling**
Removes redundant/extra spaces, tabs, and newline characters, and trims leading/trailing whitespace, so tokenization doesn't produce empty or malformed tokens.
- Example: "This   is    a   test.\n\n" → "This is a test."

**Why this matters:** Without cleaning, the same underlying word or sentence can be represented in dozens of superficially different ways ("NLP!", " nlp ", "N.L.P"), inflating the vocabulary and diluting the signal a model can learn from. Clean, standardized text leads to smaller vocabularies, faster training, and better generalization.

---

## Q5. What are stop words? Why are they removed? List common stop words and discuss when removal might be harmful. (7 marks)

**Definition:**
Stop words are extremely common words in a language (like "the," "is," "a," "and," "of," "in") that occur frequently across nearly all documents but carry little discriminative or topical meaning on their own.

**Why they are removed:**
- They add noise and dimensionality to text representations (like Bag of Words / TF-IDF) without adding much useful information for distinguishing between documents.
- Removing them reduces vocabulary size, speeds up processing, and helps models focus on the more meaningful, content-bearing words.
- Example: For document classification, "the stock market crashed today" and "the market for used cars" both contain "the" and "market" — but the more meaningful, distinguishing words are "stock," "crashed," "used," "cars."

**Common stop words (English):**
a, an, the, is, are, was, were, be, been, in, on, at, of, to, for, and, or, but, if, this, that, it, he, she, they, with, as, by, from

**When stop word removal can be harmful:**
1. **Sentiment analysis:** words like "not," "no," "never" are often classified as stop words but are critical — removing "not" from "not good" flips the meaning entirely (turns a negative sentence into a positive-looking one).
2. **Phrase/idiom meaning:** "to be or not to be" — removing stop words destroys the phrase entirely.
3. **Question answering / search:** queries like "what is the capital **of** France" — removing "of" is fine, but in some queries, prepositions carry relational meaning needed to answer correctly (e.g., "flights **from** Kathmandu **to** Delhi" — removing "from"/"to" loses direction).
4. **Machine translation and text generation:** stop words are grammatically essential for producing fluent, correct output — removing them upstream would break generation tasks entirely (stop word removal is generally *not* used before NLG or MT).

**Rule of thumb:** stop word removal helps for tasks focused on *topic/content* (search indexing, topic modeling, basic text classification) but should be avoided or applied carefully for tasks sensitive to *exact meaning, negation, or grammar* (sentiment analysis, MT, generation, QA).

---

*End of Chapter 1 & 2 detailed answers. For the syntax tree question, practice drawing it from scratch once by hand — examiners often want to see the tree structure, not just the bracket notation.*
