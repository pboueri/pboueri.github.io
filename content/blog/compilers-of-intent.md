---
title: "Compilers of Intent"
date: 2025-06-20
draft: false
---


# Compilers of Intent

Maybe the most disconcerting thing about the recent Coding Agents has been their ability to take imprecise instruction and render precise, working code. Programming languages are formal things; they have a clear syntax, clear rules, that can be parsed and manipulated into trees, then compiled and rewritten progressively lowered to machine instructions. Yes it's complicated. Yes, no single person can understand it. But the _grammar_ was all well defined... no more. This, I believe, represents a total departure from how we have built up abstractions in the past. It's why "vibe coding" feels so strange, it's a completely uncertain, novel, and hyper productive way to translate intent into working machine code. 

So how might we tame the madness? Like previous programming languages, we _can_ define a more formal grammer and syntax to what it is we're doing, with a more formal structure of how to manage our cowboy code and rein in the frontier models. I'm Making my own sanity. Using Make. 


## Terms

Any formal system defines its terms:
  
  
- **Vision**: The evolving, extermely abstract goal of the product or endeavor that someone seeks to make real
- **Intent**: An incremental goal, often loosely specified in which a range of solutions can meet it, to achieve the larger vision that a person seeks to accomplish
- **Prompt**: The translation of intent in written language such that a coding agent can interpret the intent to achieve the goal. The medium may evolve over time to be speech, thoughts, or other channels. 
- **Agent**: A process that takes a prompt and compiles it into an output
- **Output**: The result of a coding agent's prompt that is shown back to the user in order to meet the intent, and therefore the goal
- **Validation**: Assertions by the user, based on inspection or automation, that the output has had the intended effect. For the most part it's "you know it when you see it"
- **Refinement**: Based on validation, refining the prompt to get the output that you want. 
- **Dependency**: A reliance of one intent on another in order to build up a complete vision


Succintly a person has a vision, which they seek via incremental dependent intents via prompts. These prompts are interpreted by an Agent to create an Output. The Outputs are validated and if found to be deficient, are refined until they achieve the overall goal of the intent. 


The above is _very_ similar to another system of compilation -- [GNU Make](https://www.gnu.org/software/make/). Here rules define targets which are compiled to create a final output. 

## PromptMake 

To tame the stochastic, and vibe based agentic future, we should structure our products as discrete 
