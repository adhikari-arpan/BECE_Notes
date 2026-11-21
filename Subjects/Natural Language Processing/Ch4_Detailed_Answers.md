# NLP Exam Prep — Chapter 4: Word Embeddings (Detailed Answers)

---

## Q1. Explain the Word2Vec model. Describe and compare CBOW and Skip-gram architectures with diagrams. (8 marks)

**Word2Vec:**
Word2Vec is a neural network-based technique (Mikolov et al., 2013) for learning **dense, low-dimensional word embeddings** from large text corpora. Instead of representing words as sparse one-hot vectors, Word2Vec learns a compact vector (typically 100–300 dimensions) for each word such that words appearing in similar contexts end up with similar vectors — capturing semantic relationships (synonymy, analogy) that one-hot encoding and BoW cannot.

It's trained using a shallow (single hidden layer) neural network on a **self-supervised prediction task** — no manual labeling needed, the surrounding words in the corpus act as the "labels." There are two architectures:

**1. CBOW (Continuous Bag of Words)**
- **Task:** predict the **target (center) word** given its surrounding **context words**.
- Input: context words (e.g., a window of size 2 on each side) → Output: the center word.

```
Context words:  [the]  [quick]     ?     [fox]  [jumps]
                          ↓         ↓        ↓
                    ┌─────────────────────────┐
                    │   Average/Sum embeddings │
                    │      (hidden layer)      │
                    └─────────────┬─────────────┘
                                  ↓
                          Softmax over vocab
                                  ↓
                          Predicted: "brown"
```

**2. Skip-gram**
- **Task:** the reverse — predict the **surrounding context words** given the **center word**.
- Input: center word → Output: probability distribution over each context word position.

```
                        Input: "brown"
                              ↓
                    ┌─────────────────────┐
                    │   Embedding lookup   │
                    │    (hidden layer)    │
                    └─────────┬─────────────┘
                    ↓         ↓         ↓        ↓
                 [the]    [quick]    [fox]   [jumps]
                 (predicted context words)
```

**Comparison:**

| Aspect | CBOW | Skip-gram |
|---|---|---|
| Predicts | Center word from context | Context words from center word |
| Training speed | Faster (averages context in one pass) | Slower (multiple predictions per center word) |
| Performance on rare words | Weaker — rare words get "smoothed out" when averaged with context | Stronger — treats each center word individually, better for rare words |
| Dataset size preference | Works well with **larger** datasets | Works well even with **smaller** datasets |
| Typical use case | When speed/efficiency matters more | When embedding quality for rare/infrequent words matters |

**Underlying idea (Distributional Hypothesis):** both architectures rely on the linguistic principle that "a word is characterized by the company it keeps" (J.R. Firth) — words used in similar contexts tend to have similar meanings, and Word2Vec operationalizes this into a trainable objective.

---

## Q2. What is GloVe? How does it differ from Word2Vec in training methodology and capturing word relationships? (7 marks)

**GloVe (Global Vectors for Word Representation):**
GloVe (Pennington et al., 2014, Stanford) is another word embedding technique, but unlike Word2Vec, it is trained on **global co-occurrence statistics** of words across the entire corpus rather than local context windows.

**How it works:**
- First, build a **global word-word co-occurrence matrix** $X$, where $X_{ij}$ = the number of times word $j$ appears in the context of word $i$, counted across the *entire* corpus.
- Then, train word vectors such that their **dot product approximates the log of their co-occurrence probability**:
$$w_i \cdot w_j + b_i + b_j \approx \log(X_{ij})$$
- This directly ties the embedding geometry to corpus-wide statistics, rather than learning purely from local prediction tasks.

**Difference from Word2Vec:**

| Aspect | Word2Vec | GloVe |
|---|---|---|
| Training approach | **Predictive** — learns via a local context-window prediction task (CBOW/Skip-gram), trained with gradient descent on a neural net | **Count-based** — factorizes a global word co-occurrence matrix built from the whole corpus |
| Context used | Local (sliding window) | Global (aggregated co-occurrence counts across entire corpus) |
| Captures | Local syntactic/semantic patterns well | Both local and global statistical patterns (since it's built on corpus-wide counts) |
| Training efficiency | Trains incrementally, streaming through text | Requires building and factorizing the full co-occurrence matrix upfront (memory-heavy for large vocab) |
| Word relationships | Learned implicitly through prediction task | Learned explicitly to match log co-occurrence ratios — GloVe was specifically designed so vector differences capture ratios of co-occurrence probabilities well (making analogy tasks like king–man+woman=queen work cleanly) |

**Summary line:** Word2Vec is a "predict-based" (local, online) method, while GloVe is a "count-based" (global, batch) method — but both ultimately produce dense vectors with similar semantic properties, and empirically perform comparably on many downstream tasks.

---

## Q3. Explain FastText and how it handles subword information. Advantages over Word2Vec for OOV words? (8 marks)

**FastText:**
FastText (Facebook AI, Bojanowski et al., 2017) is an extension of Word2Vec that represents each word not as a single atomic vector, but as a **sum of vector representations of its character n-grams (subwords)**.

**How subword handling works:**
- Each word is broken into character n-grams, typically of length 3–6, plus the whole word itself (marked with boundary symbols `<` and `>`).
- Example: for the word "where" with n=3, the subwords are:
`<wh, whe, her, ere, re>` (plus the special whole-word token `<where>`)
- The final embedding for "where" = **sum (or average) of the embeddings of all these subword n-grams**.
- During training, it's these subword vectors that are learned (not one vector per whole word), using the same Skip-gram/CBOW-style objective as Word2Vec.

**Advantages over Word2Vec for Out-Of-Vocabulary (OOV) words:**

1. **Handling unseen words:** Word2Vec assigns a fixed vector per whole word — if a word wasn't seen during training, Word2Vec has **no vector for it at all** (a true OOV problem). FastText can still generate a reasonable embedding for an unseen word by summing the vectors of its character n-grams (which likely *were* seen as parts of other words during training).
   - Example: even if "unhappiness" never appeared in training, FastText can compose an embedding from subwords like "un-", "happi-", "-ness" which were seen in other words.

2. **Better handling of morphologically rich languages:** languages like Nepali, Finnish, or Turkish have many inflected word forms (e.g., a single root word with dozens of suffix variants). FastText captures the shared subword structure between these variants, producing better embeddings for rare inflected forms than Word2Vec, which treats each inflected form as a completely separate, unrelated token.

3. **Robustness to typos/spelling variants:** since it relies on character-level structure, minor misspellings still share most of their n-grams with the correct spelling, giving more robust embeddings than word-level Word2Vec, which would treat a typo as a totally different/unknown word.

**Trade-off:** FastText embeddings take more memory and compute to train (many more subword vectors than whole-word vectors), but the OOV robustness is usually worth it for real-world, noisy, or morphologically complex text — directly relevant if you're working with Nepali-English bilingual text, since Nepali's inflectional morphology benefits significantly from subword-aware embeddings.

---

## Q4. How do word embeddings capture semantic relationships? Explain with 'king - man + woman = queen'. (7 marks)

**How semantic relationships are captured:**
Word embeddings place words in a continuous, dense vector space such that the **geometric relationships between vectors** (direction and distance) reflect **semantic relationships** between the words themselves. This happens because embeddings are trained so that words appearing in similar contexts get similar vectors (distributional hypothesis) — and as a side effect, consistent semantic relationships (like gender, tense, or plurality) end up encoded as **consistent vector offsets/directions** across many word pairs.

**The analogy example: king − man + woman = queen**

- The vector difference `king − man` captures roughly the concept/direction of **"royalty"** (isolated from the concept of "male").
- Adding `woman` back should shift toward the **female royalty** concept.
- So: `king − man + woman ≈ queen`

This works because the model has learned a consistent **"gender direction"** in the vector space — the same offset vector that separates "man" from "woman" also (approximately) separates "king" from "queen," "actor" from "actress," "uncle" from "aunt," etc. This offset represents "gender" as a linear direction in the embedding space, independent of the specific word pair.

**Why this is significant:**
- It shows embeddings don't just cluster similar words together — they encode **relational/analogical structure** as linear algebra, which is a much richer form of semantic representation than one-hot or BoW vectors could ever provide (those have no notion of "direction" or "relationship" at all — every word is equally distant from every other).
- Other well-known analogy examples: `Paris − France + Italy ≈ Rome` (capital-country relationship), `walking − walk + swim ≈ swimming` (verb tense relationship).

**Caveat worth mentioning:** this analogy property is elegant but not perfect — it works best for well-represented, frequent word pairs, and can break down for rare words, or reflect biases present in the training corpus (a common criticism of Word2Vec/GloVe embeddings, e.g., picking up gender stereotypes present in the training text).

---

## Q5. How does CBOW architecture work? Network structure, input representation, training process, with diagram. (8 marks)

**CBOW (Continuous Bag of Words) — full architecture:**

**Objective:** predict a center (target) word given its surrounding context words within a fixed window size.

**Network structure (3 layers):**
1. **Input layer:** one-hot vectors for each context word (size = vocabulary size V), for all words within the window (e.g., window size 2 → 4 context words for a center word).
2. **Hidden layer:** a shared weight matrix $W_{V \times N}$ (where N = embedding dimension, e.g., 300) maps each one-hot input to its embedding; these context embeddings are then **averaged (or summed)** into a single hidden vector of size N. This is why it's called "bag of words" — order within the context window is discarded, only the average matters.
3. **Output layer:** the hidden vector is multiplied by a second weight matrix $W'_{N \times V}$ and passed through a **softmax** to produce a probability distribution over the entire vocabulary — the predicted center word.

**Input representation:**
- Example sentence: "the quick **brown** fox jumps", window size = 2, center word = "brown"
- Context words: {the, quick, fox, jumps} → each represented as a one-hot vector of length V.

**Diagram:**

```
 Context (one-hot vectors)         Hidden layer              Output layer
 ─────────────────────           ───────────────          ─────────────────

  "the"    [0,1,0,...,0]  ──┐
  "quick"  [0,0,1,...,0]  ──┤     Average of              Softmax over
                             ├──►  embeddings   ────►      vocabulary
  "fox"    [0,0,0,1,...]  ──┤    (size N, e.g. 300)        ────►  "brown"
  "jumps"  [1,0,0,...,0]  ──┘                              (predicted word)
```

**Training process:**
1. Slide a fixed-size context window across the training corpus.
2. For each window, feed the one-hot context words into the network; average their embeddings via matrix $W$.
3. Predict the center word via softmax over $W'$; compare against the actual center word (the true label, since this is self-supervised — the corpus itself provides the "correct answer").
4. Compute the loss (cross-entropy between predicted distribution and the true center word) and backpropagate to update both $W$ and $W'$.
5. In practice, **negative sampling** or **hierarchical softmax** is used instead of full softmax, since computing softmax over a huge vocabulary (potentially hundreds of thousands of words) at every training step is computationally expensive.
6. After training, the rows of $W$ (the input-to-hidden weight matrix) become the final learned word embeddings.

---

## Q6. Limitations of traditional word embeddings (Word2Vec)? How do contextual embeddings (BERT) address these? (8 marks)

**Limitations of Word2Vec/GloVe (static/traditional embeddings):**

1. **One vector per word, regardless of context (no polysemy handling):** the word "bank" gets exactly **one fixed vector**, even though it can mean "riverbank" or "financial institution." The embedding ends up being an average/blend of all its uses, which is inaccurate for any single specific context.
   - Example: "I sat by the river bank" and "I deposited money at the bank" — Word2Vec gives "bank" the identical vector in both sentences.

2. **No context sensitivity:** the embedding is looked up from a static table — it doesn't change based on the surrounding sentence at all, so the model can't disambiguate meaning dynamically.

3. **Cannot handle truly unseen words (for Word2Vec specifically):** as discussed in Q3, Word2Vec has no vector at all for OOV words (FastText partially fixes this, but plain Word2Vec doesn't).

4. **Limited ability to capture long-range dependencies/syntax:** these are just lookup-table embeddings — they don't model how a word's role changes based on complex sentence structure.

**How contextual embeddings (BERT) address these:**

1. **Dynamic, context-dependent representations:** BERT generates a **different embedding for the same word depending on its surrounding sentence**, because the embedding is computed on-the-fly by passing the whole sentence through multiple Transformer self-attention layers, not looked up from a static table.
   - Example: BERT produces a different vector for "bank" in "river bank" vs. "bank account," correctly disambiguating the meaning based on context.

2. **Bidirectional context:** BERT (Bidirectional Encoder Representations from Transformers) considers **both left and right context simultaneously** (via Masked Language Modeling pretraining), unlike Word2Vec's fixed local window, so it captures much richer contextual information across the whole sentence, not just a few nearby words.

3. **Subword tokenization (WordPiece):** BERT also handles OOV/rare words reasonably well by breaking them into known subword pieces, similar in spirit to FastText.

4. **Deep contextualization:** because BERT stacks multiple self-attention layers, later layers can capture increasingly abstract syntactic and semantic relationships across the whole sentence — something a shallow 1-hidden-layer network like Word2Vec structurally cannot do.

**Summary line:** Traditional embeddings (Word2Vec/GloVe) are **static** — one fixed vector per word type. Contextual embeddings (BERT) are **dynamic** — the vector for a word instance is recomputed based on its specific sentence context, directly solving the polysemy/ambiguity problem that static embeddings cannot.

---

## Q7. What is an n-gram model? Explain different n-gram models with examples. (7 marks)

**N-gram model:**
An n-gram is a contiguous sequence of *n* items (typically words, sometimes characters) from a given text. An n-gram language model estimates the probability of a word based on the previous $(n-1)$ words, using the **Markov assumption** — that a word's probability depends only on a limited, fixed-size window of preceding context, not the entire history of the sentence.

$$P(w_n | w_1, w_2, ..., w_{n-1}) \approx P(w_n | w_{n-1}, ..., w_{n-N+1})$$

**Different n-gram models, with example sentence:** "I love natural language processing"

**1. Unigram (n=1):**
- Considers each word independently, with **no context** at all — just raw word probability.
- Tokens: [I], [love], [natural], [language], [processing]
- $P(w) = \frac{count(w)}{total\ words}$ — order/context is completely ignored.

**2. Bigram (n=2):**
- Considers pairs of consecutive words; predicts a word based on **just the previous 1 word**.
- Tokens: [I love], [love natural], [natural language], [language processing]
- $P(w_i | w_{i-1})$ — e.g., $P(\text{"love"} | \text{"I"})$

**3. Trigram (n=3):**
- Considers triplets of consecutive words; predicts a word based on the **previous 2 words**.
- Tokens: [I love natural], [love natural language], [natural language processing]
- $P(w_i | w_{i-1}, w_{i-2})$ — e.g., $P(\text{"language"} | \text{"I love natural"})$... more precisely $P(\text{"language"}|\text{"love natural"})$

**Trade-off as n increases:**

| n | Context captured | Data sparsity risk |
|---|---|---|
| Unigram | None | Very low (lots of data per word) |
| Bigram | 1 previous word | Low–moderate |
| Trigram | 2 previous words | Moderate–high |
| 4-gram+ | 3+ previous words | Very high — most higher-order n-grams are never seen in training data, giving zero probabilities without smoothing |

**Why this matters:** higher-order n-grams (trigram, 4-gram) capture more context and produce more fluent, grammatically coherent predictions, but require exponentially more training data to reliably estimate probabilities for every possible word combination — this is exactly the **data sparsity problem** that motivates smoothing techniques like Laplace (add-1) smoothing (covered in Chapter 5), and eventually motivates moving to neural language models that don't rely on discrete counting at all.

---

*End of Chapter 4 answers. For Q1/Q5 (CBOW/Skip-gram), practice redrawing the architecture diagram from memory — that's usually worth marks on its own even before the explanation. For Q4 (king-man+woman=queen), have at least one more analogy example ready (Paris-France+Italy=Rome) in case the exam asks for a different illustration.*
