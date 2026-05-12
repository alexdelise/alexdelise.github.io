---
title: "Learning Feasible Quantum States for Quadratic Constrained Binary Optimization Problems"
collection: publications
category: research
permalink: /publication/learning-feasible-quantum-states-for-quadratic-constrained-binary-optimization-problems/
excerpt: "Variational constraint gadgets for preparing feasible QCBO states and initializing GM-QAOA."
date: 2025-08-04
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
citation:
---

## Abstract

Quantum computing approaches excel at solving quadratic unconstrained binary optimization (QUBO) problems, however solving quadratic constrained binary optimization problems (QCBOs) is more challenging. In this work, we develop a variational approach that creates an equal superposition of quantum states that satisfy constraints in a QCBO. The method relies on flag qubits, one per constraint, to identify when a constraint is violated or not. The resulting equal superposition can be used as an initial state for quantum algorithms that solve QUBOs/QCBOs such as Grover's search algorithm or the quantum approximate optimization algorithm (QAOA). We test the approach on sets of one and two linear inequality constraints and find that it is able to generate an equal superposition of feasible states with a .98 AR on average. We then use the approach to generate initial states for Grover-mixer QAOA (GM-QAOA) and find that GM-QAOA with the constraint gadgets yields significantly higher probability of measuring the optimal solution than random guessing.
