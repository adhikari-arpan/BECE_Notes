# NLP Exam Prep — Chapter 3: Traditional Text Representation (Detailed Answers)

---

## Q1. What is TF-IDF? Calculate TF-IDF scores for each unique term (raw TF, log base 10 IDF). (5+10 marks)

**Definition (5 marks):**
TF-IDF (Term Frequency–Inverse Document Frequency) is a statistical measure used to evaluate how important a word is to a document within a collection (corpus). It combines two components:

- **TF (Term Frequency):** how often a term appears in a specific document. Raw TF = count of the term in that document.
- **IDF (Inverse Document Frequency):** how rare/common a term is across the whole corpus. Terms that appear in *every* document (like "learning" here) carry little discriminative value, while terms confined to one document are more distinctive.

$$IDF(t) = \log_{10}\left(\frac{N}{df(t)}\right)$$

where N = total number of documents, df(t) = number of documents containing term *t*.

$$TF\text{-}IDF(t, d) = TF(t,d) \times IDF(t)$$

The intuition: a word gets a **high** TF-IDF score if it appears frequently in *this* document but rarely across *other* documents — meaning it's likely a distinguishing/topical word for that document. Common words (stop words, or words shared by all documents) get pulled toward zero.

**Calculation (10 marks):**

Documents:
- D1: "machine learning is a subset of artificial intelligence" (8 words)
- D2: "deep learning is a subset of machine learning" (8 words, "learning" appears twice)
- D3: "artificial neural networks enable deep learning" (6 words)

N = 3 documents.

**Step 1 — Raw Term Frequency (TF) per document:**

| Term | TF in D1 | TF in D2 | TF in D3 |
|---|---|---|---|
| machine | 1 | 1 | 0 |
| learning | 1 | 2 | 1 |
| is | 1 | 1 | 0 |
| a | 1 | 1 | 0 |
| subset | 1 | 1 | 0 |
| of | 1 | 1 | 0 |
| artificial | 1 | 0 | 1 |
| intelligence | 1 | 0 | 0 |
| deep | 0 | 1 | 1 |
| neural | 0 | 0 | 1 |
| networks | 0 | 0 | 1 |
| enable | 0 | 0 | 1 |

**Step 2 — Document Frequency (df) and IDF = log₁₀(N/df):**

| Term | df (docs containing it) | IDF = log₁₀(3/df) |
|---|---|---|
| machine | 2 (D1, D2) | log₁₀(1.5) = **0.1761** |
| learning | 3 (D1, D2, D3) | log₁₀(1) = **0** |
| is | 2 (D1, D2) | **0.1761** |
| a | 2 (D1, D2) | **0.1761** |
| subset | 2 (D1, D2) | **0.1761** |
| of | 2 (D1, D2) | **0.1761** |
| artificial | 2 (D1, D3) | **0.1761** |
| intelligence | 1 (D1) | log₁₀(3) = **0.4771** |
| deep | 2 (D2, D3) | **0.1761** |
| neural | 1 (D3) | **0.4771** |
| networks | 1 (D3) | **0.4771** |
| enable | 1 (D3) | **0.4771** |

**Step 3 — TF-IDF = TF × IDF, per document:**

**D1 ("machine learning is a subset of artificial intelligence"):**

| Term | TF | IDF | TF-IDF |
|---|---|---|---|
| machine | 1 | 0.1761 | **0.1761** |
| learning | 1 | 0 | **0** |
| is | 1 | 0.1761 | **0.1761** |
| a | 1 | 0.1761 | **0.1761** |
| subset | 1 | 0.1761 | **0.1761** |
| of | 1 | 0.1761 | **0.1761** |
| artificial | 1 | 0.1761 | **0.1761** |
| intelligence | 1 | 0.4771 | **0.4771** |

**D2 ("deep learning is a subset of machine learning"):**

| Term | TF | IDF | TF-IDF |
|---|---|---|---|
| deep | 1 | 0.1761 | **0.1761** |
| learning | 2 | 0 | **0** |
| is | 1 | 0.1761 | **0.1761** |
| a | 1 | 0.1761 | **0.1761** |
| subset | 1 | 0.1761 | **0.1761** |
| of | 1 | 0.1761 | **0.1761** |
| machine | 1 | 0.1761 | **0.1761** |

**D3 ("artificial neural networks enable deep learning"):**

| Term | TF | IDF | TF-IDF |
|---|---|---|---|
| artificial | 1 | 0.1761 | **0.1761** |
| neural | 1 | 0.4771 | **0.4771** |
| networks | 1 | 0.4771 | **0.4771** |
| enable | 1 | 0.4771 | **0.4771** |
| deep | 1 | 0.1761 | **0.1761** |
| learning | 1 | 0 | **0** |

**Key observation to state in the exam:** "learning" gets a TF-IDF of **0 in every document** because it appears in all 3 documents (df=3=N), making its IDF exactly zero — this is TF-IDF correctly recognizing that "learning" is not distinctive here, even though it's the most frequent word. Meanwhile "intelligence," "neural," "networks," and "enable" get the highest scores (0.4771) because they each appear in only one document — they're the most distinguishing/topical words for their respective documents.

---

## Q2. Explain the Bag of Words (BoW) model. Limitations? How does TF-IDF address these? (7 marks)

**Bag of Words (BoW):**
BoW represents a document as an unordered collection ("bag") of its words, disregarding grammar and word order but keeping track of word frequency/presence. Each document becomes a vector over the full vocabulary, where each dimension is the count of a specific word.

**Example:**
- Vocabulary: {machine, learning, is, fun}
- "machine learning is fun" → [1, 1, 1, 1]
- "learning is learning" → [0, 2, 1, 0]

**Limitations:**
1. **Ignores word order/context:** "dog bites man" and "man bites dog" produce the *same* BoW vector, even though they mean opposite things.
2. **High dimensionality and sparsity:** vocabulary can be huge (tens of thousands of words), so most document vectors are mostly zeros — wasteful and computationally expensive.
3. **Treats all words equally important:** common words like "the," "is," "a" get the same weighting as rare, meaningful words, even though they carry far less information.
4. **No semantic understanding:** synonyms ("happy" and "joyful") are treated as completely unrelated dimensions.

**How TF-IDF addresses some of these:**
- TF-IDF directly fixes limitation #3: it **down-weights** common words (high df → low IDF → low TF-IDF) and **up-weights** rare, document-specific words, so frequent-but-uninformative words like "the" contribute less to the vector.
- It does *not* fix word-order loss (#1) or semantic blindness (#4) — those require n-grams/sequence models or word embeddings respectively.
- It also doesn't fully solve dimensionality (#2) — the vector length is still the vocabulary size, just with better-weighted values.

---

## Q3. Explain the BM25 algorithm. How does it improve upon basic TF-IDF? (8 marks)

**BM25 (Best Matching 25):**
BM25 is a ranking function used in information retrieval (search engines) that improves on TF-IDF by adding **term frequency saturation** and **document length normalization**. It's the scoring function behind most classical search engines (e.g., early Elasticsearch/Lucene defaults).

**Formula (conceptual, for exam purposes):**

$$score(D, Q) = \sum_{t \in Q} IDF(t) \cdot \frac{TF(t,D) \cdot (k_1 + 1)}{TF(t,D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{avgdl}\right)}$$

Where:
- $k_1$ (typically 1.2–2.0) controls **term frequency saturation** — how much extra weight repeated occurrences of a term add.
- $b$ (typically 0.75) controls **document length normalization** strength.
- $|D|$ = length of document D, $avgdl$ = average document length in the corpus.

**Improvements over basic TF-IDF:**

1. **Term Frequency Saturation:** In plain TF-IDF, TF grows *linearly* — a word appearing 10 times counts as 10× as important as appearing once. This is unrealistic (the 10th occurrence of "machine" doesn't add nearly as much signal as the 2nd). BM25's formula causes the score to **saturate** — after a certain point, additional occurrences of a term add diminishing returns.

2. **Document Length Normalization:** TF-IDF does not adequately correct for the fact that longer documents naturally contain more instances of any given word simply due to length, not relevance. BM25 explicitly normalizes term frequency by document length relative to the corpus average, via the $b$ parameter — preventing long documents from being unfairly favored.

3. **Tunability:** the $k_1$ and $b$ parameters let BM25 be tuned to a specific corpus/task, whereas standard TF-IDF has no such flexibility.

**Conclusion:** BM25 is essentially a more "calibrated" and realistic version of TF-IDF, which is why it remains a strong baseline in modern search/retrieval systems even compared to some embedding-based methods.

---

## Q4. What is a Vector Space Model? Explain cosine similarity and calculate it for the given vectors. (2+5 marks)

**Vector Space Model (VSM) — 2 marks:**
The Vector Space Model represents text documents as vectors in a high-dimensional space, where each dimension corresponds to a term in the vocabulary (via BoW, TF-IDF, or embeddings). Documents that are "similar" in content end up as vectors that point in similar directions, which allows similarity to be computed mathematically (e.g., via cosine similarity), enabling tasks like document retrieval, clustering, and classification.

**Cosine Similarity — explanation:**
Cosine similarity measures the **angle** between two vectors rather than their magnitude/distance. It's defined as:

$$\cos(\theta) = \frac{A \cdot B}{\|A\| \times \|B\|}$$

Values range from -1 to 1 (or 0 to 1 for non-negative vectors like TF-IDF): 1 means the vectors point in the exact same direction (maximally similar), 0 means orthogonal (unrelated), -1 means opposite direction.

**Calculation (5 marks):**

Document A = [2, 1, 3, 0, 1]
Document B = [1, 2, 0, 1, 3]

**Step 1 — Dot product (A · B):**
$$A \cdot B = (2)(1) + (1)(2) + (3)(0) + (0)(1) + (1)(3) = 2 + 2 + 0 + 0 + 3 = 7$$

**Step 2 — Magnitude of A:**
$$\|A\| = \sqrt{2^2 + 1^2 + 3^2 + 0^2 + 1^2} = \sqrt{4+1+9+0+1} = \sqrt{15} \approx 3.873$$

**Step 3 — Magnitude of B:**
$$\|B\| = \sqrt{1^2 + 2^2 + 0^2 + 1^2 + 3^2} = \sqrt{1+4+0+1+9} = \sqrt{15} \approx 3.873$$

**Step 4 — Cosine similarity:**
$$\cos(\theta) = \frac{7}{3.873 \times 3.873} = \frac{7}{15} \approx \mathbf{0.467}$$

**Interpretation:** A cosine similarity of ~0.467 indicates the two document vectors are moderately similar — not highly aligned, not orthogonal/unrelated either.

---

## Q5. Compare label encoding and one-hot encoding for text representation. When to use each? (7 marks)

**Label Encoding:**
Assigns each unique category/word an integer ID.
- Example: {cat: 0, dog: 1, fish: 2}
- Compact (single number per word) but introduces a **false ordinal relationship** — the model may incorrectly infer that "fish" (2) is somehow "greater than" or "farther from" "cat" (0) than "dog" (1) is, when no such order exists among categorical labels.

**One-Hot Encoding:**
Represents each category as a binary vector with a single 1 in the position corresponding to that category.
- Example: cat = [1,0,0], dog = [0,1,0], fish = [0,0,1]
- Avoids the false-ordering problem of label encoding — all categories are equidistant from each other.
- But suffers from high dimensionality/sparsity for large vocabularies.

**Comparison table:**

| Aspect | Label Encoding | One-Hot Encoding |
|---|---|---|
| Representation | Single integer | Binary vector |
| Dimensionality | Low (1 value) | High (vocab size) |
| Implies false order? | Yes | No |
| Memory efficiency | High | Low (sparse, wasteful) |
| Suitable for | Ordinal categories (e.g., "low," "medium," "high") | Nominal/unordered categories (e.g., words, colors) |

**When to use each:**
- **Label encoding** is appropriate when categories have a natural order (ordinal data) — e.g., star ratings (1–5), sentiment intensity levels (low/medium/high) — or as an input specifically to tree-based models (Decision Trees, Random Forest), which can handle arbitrary integer splits without assuming linear order matters.
- **One-hot encoding** is appropriate for **nominal** data with no inherent order — like words in NLP, categorical labels (city names, colors) — especially when feeding into models like linear regression, logistic regression, or neural networks, where a false numeric order would actively mislead the model.

---

## Q6. Why is cosine similarity preferred over Euclidean distance in the vector space model? Explain with examples. (7 marks)

**The core issue: document length bias.**
Euclidean distance measures the straight-line distance between two points/vectors in space, and it is **sensitive to magnitude** (vector length). In text data, vector magnitude is heavily influenced by document length — a longer document naturally has larger word counts (larger TF values), inflating its vector's magnitude even if it discusses the exact same topic as a shorter document.

**Example:**
Suppose Document A = [2, 2] (a short document) and Document B = [8, 8] (a longer document repeating the same two words in the same proportion, e.g., 4× as long but same topic).

- **Euclidean distance:** $\sqrt{(8-2)^2 + (8-2)^2} = \sqrt{36+36} = \sqrt{72} \approx 8.49$ — this is a *large* distance, incorrectly suggesting A and B are very different.
- **Cosine similarity:** Both vectors point in the *exact same direction* (B is just a scaled version of A: B = 4×A), so $\cos(\theta) = 1$ — correctly identifying that A and B are about the same topic, just different lengths.

**Why cosine wins for text:**
- Cosine similarity normalizes for magnitude by dividing by the product of vector norms — so it captures **direction/orientation** (i.e., the *proportional* mix of words/topics) rather than raw magnitude.
- This makes it robust to document length differences, which is critical since real corpora contain documents of wildly varying lengths.
- Euclidean distance would unfairly penalize longer documents as "dissimilar" from shorter ones even when they're topically identical.

**Conclusion:** Because text documents naturally vary in length, and what matters for similarity is the *relative proportion* of terms (topic/content) rather than absolute counts, cosine similarity is the standard choice in the vector space model, while Euclidean distance is more suited to spaces where magnitude itself is meaningful (e.g., physical coordinates).

---

## Q7. What is Zipf's Law? How does it relate to term frequency? Explain with an example. (8 marks)

**Zipf's Law:**
Zipf's Law is an empirical observation about natural language stating that the frequency of any word is **inversely proportional to its rank** in the frequency table. In other words, if you rank all words in a corpus by how often they occur (rank 1 = most frequent), then:

$$f(r) \propto \frac{1}{r} \quad \text{or more precisely} \quad f(r) = \frac{C}{r^s}$$

where $f(r)$ = frequency of the word at rank $r$, $C$ is a constant, and $s \approx 1$ for natural language.

**What this means practically:**
- The **most frequent word** (rank 1) occurs roughly **twice as often** as the second most frequent word (rank 2), **three times as often** as the third (rank 3), and so on.
- A very small number of words (mostly stop words: "the," "of," "and," "to") account for a huge proportion of total word occurrences in any corpus, while the vast majority of unique words in the vocabulary occur only once or a few times (this is called the "long tail").

**Example:**
In a large English corpus, typical rank-frequency data looks like:

| Word | Rank | Frequency |
|---|---|---|
| the | 1 | ~70,000 |
| of | 2 | ~36,000 (~half of rank 1) |
| and | 3 | ~24,000 (~one-third of rank 1) |
| to | 4 | ~18,000 (~one-quarter of rank 1) |

Notice: $70000/2 \approx 35000 \approx$ frequency of "of"; $70000/3 \approx 23333 \approx$ frequency of "and" — this confirms the inverse-rank relationship.

**Relation to term frequency and NLP:**
- Zipf's Law is the **mathematical justification for stop word removal** — it explains *why* a tiny handful of words (rank 1–20 or so) dominate raw term frequency counts without carrying much topical meaning, which is exactly the motivation for TF-IDF's IDF term (down-weighting words that are common/high-frequency across documents).
- It also explains why vocabulary size grows slowly even as corpus size grows enormously (most "new" words in a bigger corpus are rare long-tail words) — relevant to designing vocabulary size limits in NLP models.
- It's a key reason plain word-count/BoW features are noisy without frequency-based weighting like TF-IDF.

---

## Q8. Compare TF-IDF and BM25 scoring methods. Create a comparison table. (8 marks)

**Conceptual comparison:**
Both TF-IDF and BM25 are term-weighting schemes used to score document relevance, and both use the same core intuition (frequent-in-document + rare-across-corpus = important). BM25 was designed specifically to fix TF-IDF's unrealistic assumptions about how term frequency and document length should influence scoring.

**Comparison table:**

| Aspect | TF-IDF | BM25 |
|---|---|---|
| TF scaling | Linear — score grows proportionally with raw term count, unbounded | Saturating — score grows with term frequency but plateaus after a point (controlled by $k_1$) |
| Document length handling | No explicit normalization (or only basic normalization in some variants) | Explicit normalization via parameter $b$, relative to average document length |
| Tunability | No tunable parameters (fixed formula) | Tunable via $k_1$ (saturation) and $b$ (length normalization strength) |
| Realism of scoring | Can overweight documents that repeat a term many times, or unfairly favor/penalize based on length | More calibrated — better reflects real-world relevance judgments |
| Complexity | Simple, easy to compute and understand | Slightly more complex formula, but still efficient |
| Common use | Baseline for text similarity, feature vectors for ML classifiers | Default/standard ranking function in modern search engines (e.g., Elasticsearch, Lucene) |
| Origin | Classical statistics-based IR measure | Developed specifically to improve probabilistic ranking in IR (Okapi BM25) |

**Summary line for the exam:** "BM25 can be thought of as a refined, saturating, length-normalized version of TF-IDF — it keeps the same core intuition but produces more realistic, better-calibrated relevance scores, which is why it remains the standard baseline in modern search systems even today."

---

*End of Chapter 3 answers. Q1 (TF-IDF) and Q4 (cosine similarity) are the ones to redo from scratch on paper — the arithmetic itself (log calculations, dot products, magnitudes) is what examiners actually check, not just the final answer.*
