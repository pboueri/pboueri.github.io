---
title: "Compilers of Intent"
date: 2025-06-20
draft: false
---


# Compilers of Intent

Maybe the most disconcerting thing about the recent coding agents has been their ability to take imprecise instruction and render precise, working code. Programming languages are formal things; they have a clear syntax, clear rules, that can be parsed and manipulated into trees. A programmer would have an intent, which the specify in code, which is then compiled and rewritten as the intent was progressively lowered to machine instructions. Yes it's complicated. Yes, no single person can understand it. But the _grammar_ was all well defined. The new coding agents are a total departure from how we have built up abstractions in the past. It's why "vibe coding" feels so strange, it's a completely uncertain, novel, and hyper productive way to translate intent into working machine code. 

So how might we tame the madness? Like previous programming languages, we _can_ define a more formal grammar and syntax to what it is we're doing, with a more formal structure of how to manage our cowboy code and rein in the frontier models. I'm Making my own sanity. Using Make. 


## Terms

Any formal system defines its terms:
  
  
- **Vision**: The evolving, extremely abstract goal of the product or endeavor that someone seeks to make real
- **Intent**: An incremental goal, often loosely specified in which a range of solutions can meet it, to achieve the larger vision that a person seeks to accomplish
- **Prompt**: The translation of intent in written language such that a coding agent can interpret the intent to achieve the goal. The medium may evolve over time to be speech, thoughts, or other channels. 
- **Agent**: A process that takes a prompt and compiles it into an output
- **Output**: The result of a coding agent's prompt that is shown back to the user in order to meet the intent, and therefore the goal
- **Validation**: Assertions by the user, based on inspection or automation, that the output has had the intended effect. For the most part it's "you know it when you see it"
- **Refinement**: Based on validation, refining the prompt to get the output that you want. 
- **Dependency**: A reliance of one intent on another in order to build up a complete vision


Succinctly a person has a Vision, which they seek via incremental Dependent Intents via Prompts. These Prompts are interpreted by an agent to create an Output. The Outputs are Validated and if found to be deficient, are Refined until they achieve the overall goal of the Intent. 



## PromptMake 

The above is _very_ similar to another system of compilation -- [GNU Make](https://www.gnu.org/software/make/). Here rules define targets which are compiled to create a final output. 

So what about PromptMake? Something that allows a prompt structure of the following


```yaml
---
name: prompt-005
agent: default
inputs: 
    prompt-001 # Defines the required input prompts
    prompt-003
targets:
    llm: _The product is built with the requirements specified here_
    manual: true
---
prompt:
    _the whole description of the product goes here_

implementation:
    _instructions on what to check and what is learned from each successive run are stored here_
```

With a folder of files like the above you can create a DAG that generates targets. The most difficult part of PromptMake is specifying the Validation. How do you know the generation worked? If you break down the task too narrowly you'd have too many prompts. Additionally the act of crafting a good prompt is running it, validating the outputs, refining the prompt, and running it again. A sufficiently mature make system would have many methods of validating targets, storing state to prevent regeneration, and paramaterizing the prompts. However suppose we even restrict ourselves to this basic version, then we could imagine a development cycle might look something like this:

```bash
> prompt-make prompt-005 agent=claude-4-sonnet
...generating prompt-001...
...validated prompt-001...
...detected prompt-003, not rebuilding...
...validated prompt-003...
...generating prompt-005...
...validated llm rule...
Does the output look good y/n:
```

Then you inspect the outputs and respond y/n. If no, it compiles a feedback loop which modifies the input prompt and allows you to regenerate the target. This cycle would allow someone to build increasingly complex products with well structured prompts. 

## Why Bother?

Right now all our agentic coding suffers from a key shortcoming that has plagued build systems of all types. They are wonderful for developing iteratively, but awful for hardened production systems that need to be rebuilt and tested and collaborated on. We're in the jupyter notebook age of Agentic coding, the aws console age. We need more declarative specifications that can be built as a team collaboratively towards a shared vision. I think this approach would have many benefits, and gets the code _out of the way_. When compiling to a lower language, you never even know it's there. Why should we care in this case? Here's what I think a system like PromptMake achieves:

- **Declarative:** Focus on what you want not how to get it. The prompts that capture the intent _are the product_. Not the code. 
- **Future Proof:** Suppose a much better coding agent comes out tomorrow, can you tear your entire product down and rebuild it in the new hot language, with the new best agent. Sure why not with the current declarative intent of our PromptMake system!
- **Discrete:** Each prompt would be a distinct intent task, that ideally is large enough to matter, that breaks down how to build up your product again. It tells a clear story
- **Discipline:** This requires you to be specific about what it is you want and how to get it. So much of prompting is changing how we speak so that we can get what we want


I strongly believe this is the way we will be building software in the near future. The art of building these systems will be how we decompose the problem, verify the functionality, and define our intent such that the system is tractable and well specified... same as it ever was. 

## What would a good PromptMake product look like?

A really well developed product would allow a user to bridge the gap from local to cloud, offloading long running tasks and caching them for others, similar to [Bazel](https://bazel.build/remote/caching), with a team first mindset of allowing many people to contribute new intents towards a vision. 

It would have a clear way of developing new intents and writing them out, removing boiler plate and distilling down essence. With the project context and vision, it would enable the author to go quickly and allow for serendipity as intent crystallizes to prompts with helpful suggestions.

It would have a first class editor that helps specify validations as precisely or loosely as required, and fix them as needed. 

It would support iterative feedback loops to allow someone to tweak as needed, with an incremental or full rebuild, refining the prompts and validations to get to the desired output. Didn't like a generated output -- prompt it to change what you want and the system bakes it into the prior prompts as optimally as possible.

It would support a cost-conscious rebuild cycle, with the option to rebuild from a fresh slate to create new coherent outputs. 

It would allow for migrations to new agents or technologies with the ease of a single build, without the need for much toil, blowing away all code and rebuilding it from scratch. 

It would be "state" aware and know what's hard to change and migrate (like databases), and what's stateful and easy to migrate. 

It would allow for a CI/CD deployment cycle with integrated analytics and A/B tests, allowing new builds to replace old builds in blue green or hypothesis based rollouts. 

It would be able to introspect its own complexity and refine and fuse rules and intents into a project level specification independent of any particular prompt. 

It would feel smart. 

## Future

As agents get more competent and the miss rate goes down and their speed goes up and our media of how we can communicate with them changes, the loop of intent will get tighter and tighter and tighter. There is a natural speed limit to how fast we can express what we want and how fast we can evaluate things. What that speed lemon is we don't know. Does the world even need all this stuff, we don't know. But it seems like progress is inexorably getting closer to this end point. 

## Inspiration

Many software projects have hit on these patterns or anti-patterns in different ways, below is a list that come to mind. 

- [GNU Make](https://www.gnu.org/software/make/)
- [Bazel](https://bazel.build/remote/caching)
- [Incremental](https://github.com/janestreet/incremental)
- [Flyaway](https://github.com/flyway/flyway)
- [Terraform](https://developer.hashicorp.com/terraform)
- [Jupyter Notebooks](https://jupyter.org/)