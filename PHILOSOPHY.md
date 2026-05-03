# Rune Philosophy

## Contracts in the Form of Signals

Most binding systems are notational. They give you a way to write down what a value does. Rune is different — it gives you a way to *signal* it.

The distinction matters. A notation tells you something. A signal **changes how every reader behaves** toward the thing it touches.

When an AI assistant encounters `~risk-threshold`, it does not infer "probably editable from context." It reads a declared signal: mutable, governed, bidirectional — something with a mutation surface that deserves respect. It won't suggest caching the value. It won't inline it as a constant. It knows, structurally, that something is responsible for managing its changes.

When it encounters `!submit-order`, it reads: explicit boundary — nothing consequential here happens without deliberate human invocation. It won't auto-complete a call to it inside a loop. It won't batch it silently. The signal shapes behavior in the collaboration, not just comprehension of the code.

This is what makes Rune powerful in AI-assisted development. The runes are not annotations layered on top of a system. They are signals that travel *with* the binding — through refactors, across language boundaries, from the declaration site to every reader, human or machine. The signal is the contract. The contract is the signal.

Four signals. Every reactive system, at every scale, needs exactly these four. Nothing more is possible.

---

## Why Four

The obvious question: why four runes? Why not three, or six, or twelve?

The answer is that four is the number of distinct operations in any reactive document. Not five. Not three. Exactly four.

**Read** — observe state without affecting it.  
**Sync** — couple an input to state bidirectionally.  
**Act** — invoke a named behavior explicitly.  
**Annotate** — record meaning for humans and machines.

These are not arbitrary choices. They are the result of asking: what is the minimum set of operations that, combined, can express any interactive document? The answer is four. You can prove this by attempting to collapse them:

- Merge `@` and `~`: you lose the ability to distinguish read-only display from editable input. Every text field becomes ambiguous.
- Merge `~` and `!`: you lose explicit action invocation. Side effects become implicit — a change to an input silently triggers behavior.
- Remove `?`: you lose the ability to record intent in the document itself. Intent migrates to comments (stripped), external docs (separated), or nowhere.
- Add a fifth: any candidate fifth rune decomposes into a combination of the existing four.

Four is a proof, not a preference.

---

## The HTTP Verbs Analogy

When HTTP defined `GET POST PUT DELETE`, the verbs seemed arbitrary. In practice they turned out to cover every operation the web needed. Decades of APIs have been built on four verbs.

Rune's four runes are the same kind of primitive for reactive documents. `@ ~ ! ?` covers every interaction pattern a document needs. The web hasn't needed a fifth HTTP verb. Rune won't need a fifth rune.

The analogy goes deeper: HTTP verbs are meaningful *because they have semantics*, not just syntax. `GET` means idempotent, read-only. `POST` means state-changing. The verb is a contract. Rune runes are the same — `@` is a contract that the binding has no side effects. `!` is a contract that nothing happens without explicit invocation. The character is the contract.

---

## Why Sigils, Not Attributes

Most frameworks use verbose attribute syntax: `data-bind="value"`, `v-model="field"`, `ng-click="handler"`. Rune uses prefix sigils: `@value`, `~field`, `!handler`.

The difference is not cosmetic.

**Visual salience.** `@title` jumps out in markup. `data-bind="title"` blends in. In a dense document, the difference between reading bindings and reading content matters. Sigils create a visual layer — scan a document and the bindings are immediately visible.

**Parsing simplicity.** A sigil is unambiguous. The first character of an attribute name tells you everything about its semantics. No quoted values to parse, no attribute namespaces to resolve, no disambiguation rules.

**Mnemonic density.** `@` means "at" — where a value comes from. `~` means back-and-forth — two-way flow. `!` means action — do something. `?` means intent — what does this mean? Four characters, four semantics, learnable in minutes.

**No escaping.** Attribute values need escaping. Sigils don't. `@item.title` is the identifier. No quotes, no brackets, no ceremony.

---

## The `?` Rune as Novel Primitive

The first three runes have analogues in existing systems. `@` is like Angular's property binding. `~` is like React's controlled inputs. `!` is like any event handler. They are better versions of known ideas.

`?` has no analogue.

The closest thing is a code comment. But comments are not structured, not addressable, not guaranteed to survive compilation, not attached to specific elements, and not designed to be read by machines. Comments are informal. `?` is formal.

What `?` formalises is the separation between **what a document does** and **what its author intended**. These are always different. Implementation drifts. Intent is stable. `?` makes intent a first-class citizen of the document — co-located with the binding it describes, addressable by tooling, preserved through the document's lifecycle.

The timing is not accidental. We are building AI-augmented systems where documents need to communicate with AI generators, summarisers, and auditors. `?` is the primitive that makes this reliable. Not a prompt, not a comment, not external metadata — a structured intent annotation that lives where the binding lives.

This is genuinely new. The field does not have a standard for this. Rune defines it.

---

## Bounded Completeness

The most important property of Rune is not what it includes — it's what it excludes.

Rune has no escape hatch. There is no "raw binding," no "advanced mode," no extension syntax that breaks the four-rune contract. This is intentional.

The value of a bounded grammar comes from its bounds. A developer learning Rune needs to learn four things. An AI generating Rune documents needs to know four rules. A tool validating Rune documents needs to enforce four contracts. The moment you add a fifth operation, you double the surface area of every implementation, every tutorial, every mental model.

This is restraint as design principle. The same principle that makes Mere's 26-element vocabulary powerful is what makes Rune's four-rune grammar powerful. The bounds are the feature.

---

## Rune and Mere

Rune grew out of Mere, a workbook format for apps. Mere needed a binding grammar that was:
- Small enough for non-programmers to learn
- Consistent enough for AI to generate reliably
- Expressive enough to build real applications
- Readable by humans and machines equally

The four sigils emerged from those constraints. They worked. Applications got built. AI generation became reliable. Non-programmers learned the grammar in minutes.

At some point it became clear that the grammar was larger than the format. The four operations Mere needed were the four operations every reactive document needed. The sigils were not a Mere feature — they were a protocol that Mere happened to discover first.

Rune is the name for what Mere found.

**Mere invented it. Rune names it.**
