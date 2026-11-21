# NLP Elective Assessment — Solutions
**NCIT | Natural Language Processing | Spring 2026**

---

## Q1 a) What is NLP? Steps involved (7 marks)

**NLP** is a branch of AI concerned with enabling computers to understand, interpret, and generate human language.

**Steps in NLP:**
1. **Tokenization** — splitting text into words/sentences. E.g. "I love NLP" → [I, love, NLP]
2. **Morphological analysis (Stemming/Lemmatization)** — reducing words to root form. E.g. "running" → "run"
3. **Stop-word removal** — removing common low-information words (is, the, a).
4. **Syntactic analysis (Parsing)** — determining grammatical structure (POS tagging, parse trees).
5. **Semantic analysis** — extracting meaning of words/sentences (word sense disambiguation).
6. **Discourse integration** — meaning of a sentence depends on the sentence before/after it (coreference).
7. **Pragmatic analysis** — interpreting meaning in context, considering real-world knowledge/intent.

---

## Q1 b) Turing Test & Ambiguity in NLP (8 marks)

**Turing Test:** Proposed by Alan Turing (1950) as a test of a machine's ability to exhibit intelligent behavior indistinguishable from a human. A human evaluator converses (via text) with a human and a machine without knowing which is which; if the evaluator cannot reliably tell them apart, the machine is said to have passed.

**Types of ambiguity in NLP:**
- **Lexical ambiguity** — a word has multiple meanings. E.g. "bank" (riverbank / financial bank)
- **Syntactic ambiguity** — a sentence can be parsed in more than one grammatical way. E.g. "I saw the man with a telescope" (who has the telescope?)
- **Semantic ambiguity** — sentence has multiple meaning interpretations even after fixing grammar. E.g. "The chicken is ready to eat" (ready to be eaten / ready to eat something)
- **Anaphoric/Referential ambiguity** — unclear what a pronoun refers to. E.g. "John told Peter he passed" (who passed?)
- **Pragmatic ambiguity** — meaning depends on context/intent. E.g. "Can you pass the salt?" (question or request)

---

## Q2 a) Tokenization, One-Hot Encoding Drawbacks, Alternative (7 marks)

**Tokenization** is the process of breaking text into smaller units (tokens) — words, subwords, or sentences — that can be processed by an NLP model.

**Drawbacks of one-hot encoding:**
- **High dimensionality** — vector size equals vocabulary size (can be 100,000+).
- **Sparsity** — nearly all entries are 0, wasting memory/compute.
- **No semantic relationship** — all word vectors are orthogonal (equidistant), so "king" and "queen" appear as unrelated as "king" and "banana."
- **No notion of similarity/context** — cannot capture synonyms or analogies.

**Alternate method:** **Word embeddings** (Word2Vec, GloVe, FastText) — represent words as dense, low-dimensional (e.g. 100–300-d) real-valued vectors learned from context, where semantically similar words are placed close together in vector space.

---

## Q2 b) Stemming vs Lemmatization (8 marks)

**Stemming:** A crude, rule-based process that chops off word suffixes/prefixes to get a root form (stem), which may not be a valid dictionary word.
- Algorithm example: Porter Stemmer
- E.g. "studies" → "studi", "caring" → "car"

**Lemmatization:** Uses vocabulary and morphological analysis (often with POS tagging) to return the base dictionary form (lemma) of a word — always a valid word.
- E.g. "studies" → "study", "better" → "good", "caring" → "care"

| Aspect | Stemming | Lemmatization |
|---|---|---|
| Output | May be invalid word | Always valid dictionary word |
| Speed | Fast, rule-based | Slower, needs vocabulary/context |
| Accuracy | Lower | Higher |
| Needs POS? | No | Often yes |

**When to use which:**
- Use **stemming** when speed matters and slight imprecision is acceptable — e.g. search engines, information retrieval indexing.
- Use **lemmatization** when meaning/accuracy matters — e.g. chatbots, sentiment analysis, question answering.

---

## Q3 a) TF-IDF Calculation (7 marks)

Documents:
- D1: "neural networks learn features"
- D2: "transformers learn attention"
- D3: "neural networks use attention"

N = 3 documents. Using **raw TF** (count of term in doc) and **IDF = log₁₀(N / df)**.

**Document frequency (df) per term:**

| Term | df | IDF = log₁₀(3/df) |
|---|---|---|
| neural | 2 | log₁₀(1.5) = 0.176 |
| networks | 2 | log₁₀(1.5) = 0.176 |
| learn | 2 | log₁₀(1.5) = 0.176 |
| features | 1 | log₁₀(3) = 0.477 |
| transformers | 1 | log₁₀(3) = 0.477 |
| attention | 2 | log₁₀(1.5) = 0.176 |
| use | 1 | log₁₀(3) = 0.477 |

Since every term appears exactly once per document (TF = 1), **TF-IDF = IDF** in each case:

**D1:** neural = 0.176, networks = 0.176, learn = 0.176, features = 0.477
**D2:** transformers = 0.477, learn = 0.176, attention = 0.176
**D3:** neural = 0.176, networks = 0.176, use = 0.477, attention = 0.176

*(Rarer terms — features, transformers, use — get higher scores; common terms across documents get lower scores.)*

---

## Q3 b) Cosine Similarity vs Euclidean Distance (8 marks)

Cosine similarity is preferred in the vector space model because:
- It measures the **angle** between two vectors, not their magnitude — so it captures **direction/orientation** (topic proportion), ignoring document length.
- Euclidean distance is sensitive to vector **magnitude**: a long document repeating the same words as a short document will appear "far away" from it in Euclidean terms even though they're about the same topic.
- Text vectors are high-dimensional and sparse; cosine similarity handles this well since it normalizes by vector length.

**Example:** D1 = "cat cat cat" → [3,0], D2 = "cat" → [1,0]. Euclidean distance = 2 (seems dissimilar), but cosine similarity = 1 (identical direction → same topic, just different length). Cosine correctly identifies they're about the same thing.

---

## Q4 a) Word Embeddings & Semantic Relationships (7 marks)

Word embeddings place words in a continuous vector space such that dimensions implicitly encode latent semantic/syntactic features (gender, tense, plurality, topic, etc.), learned purely from co-occurrence patterns in large text corpora.

Because these directions are consistent across the vector space, **vector arithmetic** captures relationships:

**king − man + woman ≈ queen**

Here, the vector "man → king" represents a "royalty" offset. Subtracting "man" and adding "woman" removes the male gender component and adds female gender, while preserving the "royal" direction — landing near "queen." This shows embeddings encode analogical/relational meaning, not just similarity.

---

## Q4 b) Word2Vec & TF-IDF vs Word2Vec (8 marks)

**Word2Vec** is a shallow neural network model that learns dense word embeddings using either:
- **CBOW (Continuous Bag of Words)** — predicts the target word from surrounding context words.
- **Skip-gram** — predicts surrounding context words from the target word.

Training adjusts word vectors so that words appearing in similar contexts end up with similar vector representations (via a sliding window and negative sampling/softmax).

**TF-IDF vs Word2Vec:**

| Aspect | TF-IDF | Word2Vec |
|---|---|---|
| Representation | Sparse, high-dimensional | Dense, low-dimensional |
| Basis | Term frequency statistics | Predictive neural network on context |
| Semantics | No semantic meaning captured | Captures semantic/syntactic relationships |
| Similarity | Based on shared vocabulary | Based on contextual meaning |
| Use case | Search/IR, simple weighting | Deep learning NLP tasks |

---

## Q5 a) Language Models: Unigram, Bigram, Trigram (7 marks)

A **language model** assigns a probability to a sequence of words, estimating how likely that sequence is to occur in natural language: P(w₁, w₂, ..., wₙ).

- **Unigram model:** Assumes each word is independent of others.
  P(w₁,...,wₙ) = ∏ P(wᵢ)
  E.g. P("I love NLP") = P(I)·P(love)·P(NLP)

- **Bigram model:** Assumes each word depends only on the previous word (Markov assumption, order 1).
  P(wᵢ | wᵢ₋₁) = Count(wᵢ₋₁, wᵢ) / Count(wᵢ₋₁)
  E.g. P("love" | "I") — probability of "love" given "I" precedes it.

- **Trigram model:** Each word depends on the previous two words (Markov order 2).
  P(wᵢ | wᵢ₋₂, wᵢ₋₁) = Count(wᵢ₋₂, wᵢ₋₁, wᵢ) / Count(wᵢ₋₂, wᵢ₋₁)

Higher-order n-grams capture more context but suffer more from data sparsity, which is why smoothing (e.g. Laplace) is used.

---

## Q5 b) Naive Bayes with Laplace Smoothing — Worked Solution (8 marks)

**Training data (character-level Naive Bayes):**
- Class A: "aab", "abba", "baa"
- Class B: "bba", "bab", "abb"

**Step 1 — Priors:**
P(A) = 3/6 = 0.5, P(B) = 3/6 = 0.5

**Step 2 — Character counts per class** (vocabulary = {a, b}, so |V| = 2):

Class A: "aab"(2a,1b) + "abba"(2a,2b) + "baa"(2a,1b) → **a = 6, b = 4**, total = 10
Class B: "bba"(1a,2b) + "bab"(1a,2b) + "abb"(1a,2b) → **a = 3, b = 6**, total = 9

**Step 3 — Likelihoods with Laplace (add-1) smoothing:**

P(a|A) = (6+1)/(10+2) = 7/12 = 0.5833
P(b|A) = (4+1)/(10+2) = 5/12 = 0.4167

P(a|B) = (3+1)/(9+2) = 4/11 = 0.3636
P(b|B) = (6+1)/(9+2) = 7/11 = 0.6364

**Step 4 — Test document "baab"** = characters {b, a, a, b} → 2 a's, 2 b's

P(baab | A) ∝ P(a|A)² × P(b|A)² = (0.5833)² × (0.4167)² = 0.3403 × 0.1736 = **0.0591**
P(A | baab) ∝ P(A) × P(baab|A) = 0.5 × 0.0591 = **0.02954**

P(baab | B) ∝ P(a|B)² × P(b|B)² = (0.3636)² × (0.6364)² = 0.1322 × 0.4050 = **0.0536**
P(B | baab) ∝ P(B) × P(baab|B) = 0.5 × 0.0536 = **0.02678**

**Comparison:** 0.02954 > 0.02678

### ✅ Predicted class: **Class A**

*(Note: this treats each document as a bag of characters, since the vocabulary here is just {a,b}. If your instructor intends a bag-of-*documents* / whole-token model instead — i.e. treating "aab", "abba" etc. as atomic tokens rather than character sequences — mention that assumption in your answer, since the question's short strings strongly suggest a character-level model is intended.)*

---

## Q6 a) Attention Mechanism & Transformer Architecture (7 + 8 marks)

**What is attention?**
Attention allows a model to dynamically focus on the most relevant parts of the input sequence when producing each output, rather than compressing the whole input into one fixed-size context vector (the bottleneck problem in vanilla seq2seq RNNs).

**Why useful in LLMs:**
- Captures **long-range dependencies** regardless of distance between words.
- Allows **parallelization** (unlike RNNs, which process sequentially) — much faster training.
- Produces **context-aware representations** — the same word gets a different representation depending on surrounding words.

**Scaled Dot-Product Attention:**

Attention(Q, K, V) = softmax(QKᵀ / √dₖ) · V

- Q (Query), K (Key), V (Value) are learned projections of the input.
- QKᵀ computes similarity scores between queries and keys.
- Dividing by √dₖ prevents large dot products from pushing softmax into tiny-gradient regions.
- Softmax converts scores into attention weights; multiplying by V gives a weighted sum of values.

**Multi-head attention:** Runs several attention operations in parallel (different learned projections), letting the model attend to different types of relationships simultaneously, then concatenates and projects the results.

**Transformer architecture (Vaswani et al., "Attention is All You Need"):**

```
        INPUT EMBEDDING + POSITIONAL ENCODING
                     │
        ┌────────────▼────────────┐
        │   ENCODER (×N layers)   │
        │  ┌────────────────────┐ │
        │  │ Multi-Head          │ │
        │  │ Self-Attention      │ │
        │  ├────────────────────┤ │
        │  │ Add & Layer Norm    │ │
        │  ├────────────────────┤ │
        │  │ Feed-Forward Network│ │
        │  ├────────────────────┤ │
        │  │ Add & Layer Norm    │ │
        │  └────────────────────┘ │
        └────────────┬────────────┘
                      │  (encoder output → K, V)
        ┌─────────────▼────────────┐
        │   DECODER (×N layers)    │
        │ ┌───────────────────────┐│
        │ │ Masked Multi-Head      ││
        │ │ Self-Attention         ││
        │ ├───────────────────────┤│
        │ │ Add & Layer Norm       ││
        │ ├───────────────────────┤│
        │ │ Encoder-Decoder        ││
        │ │ Attention (Q from      ││
        │ │ decoder, K,V from      ││
        │ │ encoder)               ││
        │ ├───────────────────────┤│
        │ │ Add & Layer Norm       ││
        │ ├───────────────────────┤│
        │ │ Feed-Forward Network   ││
        │ ├───────────────────────┤│
        │ │ Add & Layer Norm       ││
        │ └───────────────────────┘│
        └─────────────┬─────────────┘
                       │
              Linear + Softmax
                       │
                 Output Probabilities
```

**Key components:**
- **Positional encoding** — since transformers have no recurrence, sinusoidal (or learned) position vectors are added to embeddings so the model knows word order.
- **Residual connections + Layer Norm** — stabilize and speed up training of deep stacks.
- **Feed-forward network** — position-wise fully connected layers applied identically to each token.
- **Masked self-attention (decoder)** — prevents a position from attending to future tokens (needed for autoregressive generation).

*(Want me to render this as an actual diagram image instead of ASCII? I can generate one.)*

---

## Q6 b) BERT & Bidirectional Context

**BERT (Bidirectional Encoder Representations from Transformers)** is a pretrained transformer **encoder-only** model that learns deep, bidirectional representations of text by jointly conditioning on both left and right context in all layers.

**Pretraining objectives:**
1. **Masked Language Modeling (MLM)** — randomly masks ~15% of tokens and trains the model to predict them using context from both directions.
2. **Next Sentence Prediction (NSP)** — trains the model to predict whether sentence B actually follows sentence A.

**Bidirectional context:** Unlike a left-to-right language model (e.g. GPT), which predicts each word using only the words before it, BERT's self-attention lets every token attend to every other token in the sequence — both before and after it — simultaneously.

**Why this is useful compared to left-to-right models:**
- Produces richer contextual representations for tasks that need full-sentence understanding: question answering, named entity recognition, sentiment classification, natural language inference.
- Left-to-right models are naturally suited to generation (predicting the next word), but they're "blind" to future context, which limits representation quality for understanding tasks — BERT fixes this by seeing the whole sentence at once during pretraining.

---

## Q7. Short Notes (any two — all three given below)

**a) Next Sentence Prediction (NSP)**
A binary classification pretraining task used in BERT: given sentence pair (A, B), the model predicts whether B is the actual sentence that follows A in the original text, or a random sentence. 50% of training pairs are true consecutive pairs, 50% are random. This helps BERT learn sentence-level relationships useful for tasks like question answering and natural language inference. (Note: later models like RoBERTa found NSP contributes little and removed it in favor of just MLM.)

**b) GloVe (Global Vectors for Word Representation)**
A word embedding method that combines the strengths of global matrix factorization (like LSA) with local context window methods (like Word2Vec). It constructs a global word–word co-occurrence matrix from the entire corpus, then learns vectors such that the dot product of two word vectors approximates the log of their co-occurrence probability. This lets it capture both global corpus statistics and local context patterns, often better on word-analogy tasks with less training data than Word2Vec.

**c) POS Tagging (Part-of-Speech Tagging)**
The process of assigning a grammatical category (noun, verb, adjective, adverb, etc.) to each word in a sentence based on its definition and context. E.g. "Book (VERB) me a flight, then read the book (NOUN)." Approaches include rule-based taggers, statistical models (HMM, using the Viterbi algorithm), CRFs, and neural sequence taggers (BiLSTM, transformer-based). POS tagging is a foundational step for parsing, NER, and information extraction.

---

*Tip for viva/exam: for Q5(b), be ready to explain the character-level assumption out loud since the professor may probe it — and for Q6(a), practice sketching the encoder-decoder diagram from memory, since "clean diagram" carries real marks.*
