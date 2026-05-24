---
title: "Partitioned-Constraint QAOA (PC-QAOA): Structural State Preparation and Penalty Enforcement for Quantum Optimization"
collection: publications
category: research
permalink: /publication/partitioned-constraint-qaoa-structural-state-preparation-penalty-enforcement-quantum-optimization/
redirect_from:
  - /publication/learning-feasible-quantum-states-for-quadratic-constrained-binary-optimization-problems/
excerpt: "PC-QAOA partitions constraints between feasibility-preserving state preparation and penalty enforcement for constrained quantum optimization."
date: 2026-05-18
venue: "arXiv"
status: "Preprint"
authors: "Anthony Wilkie, Alexander DeLise, Andrew Del Real, Rebekah Herrman, and James Ostrowski"
image: "/images/publications/pcqaoa.png"
image_alt: "PC-QAOA circuit diagram"
paperurl:
arxivurl: "https://arxiv.org/abs/2508.02590"
openreviewurl:
htmlurl:
codeurl: "https://github.com/Vilcius/constraint_gadgets"
demourl:
posterurl:
slidesurl:
bibtexurl:
citation: 'Anthony Wilkie, Alexander DeLise, Andrew Del Real, Rebekah Herrman, and James Ostrowski. (2026). &quot;Partitioned-Constraint QAOA (PC-QAOA): Structural State Preparation and Penalty Enforcement for Quantum Optimization.&quot; <i>arXiv:2508.02590v2</i>.'
---

## Abstract

Constrained combinatorial optimization remains challenging for quantum algorithms because feasibility must be explicitly enforced, typically through penalty terms or problem-specific mixers. We introduce Partitioned-Constraint QAOA (PC-QAOA), which partitions constraints into those enforced structurally and those enforced energetically. Structural constraints are handled via feasible-state preparation and a Grover mixer that preserves feasibility, while the remaining constraints are enforced through penalties. We show that constraints with disjoint support can be prepared in parallel with little error accumulation. We identify broad classes of constraints (including cardinality, assignment, and flow conservation) that admit efficient structural enforcement, and introduce a variational gadget construction that extends this approach to arbitrary low-support constraints. Across 413 completed instances spanning multiple constraint families, PC-QAOA substantially improves feasibility and solution quality at shallow depth relative to penalty-based QAOA, demonstrating the value of partial structural enforcement.
