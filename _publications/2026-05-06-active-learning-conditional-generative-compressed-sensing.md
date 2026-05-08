---
title: "Active Learning for Conditional Generative Compressed Sensing"
collection: publications
category: manuscripts
permalink: /publication/active-learning-for-conditional-generative-compressed-sensing/
excerpt: "Prompt-conditioned Christoffel sampling for image recovery from subsampled Fourier measurements."
date: 2026-05-06
venue: "arXiv"
status: "Preprint"
authors: "Alexander DeLise and Nick Dexter"
image: "/images/publications/active-learning-conditional-gcs.png"
image_alt: "Stable Diffusion sampling distribution for a cat prompt"
paperurl:
arxivurl: "https://arxiv.org/abs/2605.05435"
openreviewurl:
htmlurl:
codeurl: "https://github.com/alexdelise/ActiveConditionalGCS"
demourl:
posterurl:
slidesurl:
bibtexurl:
citation:
---

## Abstract

Generative compressed sensing uses the range of a pretrained generator as a nonlinear model for recovering structured signals from limited measurements. We study a conditional version of this problem for image recovery from subsampled Fourier measurements using prompt-conditioned generative models. Our framework separates two roles of conditioning: the prompt used to design the sampling distribution and the prompt used to define the recovery model. For ReLU and Lipschitz conditional generators, we prove stable recovery bounds showing that prompt-matched Christoffel sampling retains the same Christoffel complexity constant as existing near-optimal generative compressed sensing theory, while prompt mismatch incurs an explicit compatibility penalty. Experiments with Stable Diffusion show that prompts meaningfully reshape Christoffel sampling distributions and influence image recovery. Overall, our results suggest that prompts should be treated as design variables with distinct effects on sensing, approximation, and recovery.
