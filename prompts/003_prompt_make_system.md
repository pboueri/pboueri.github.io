# PromptMake System


The goal of this prompt is to make a build system that reads the prompts in this folder, prompts, and creates a dependency tree similar to new make. Then it runs the agentic coding agent from cursor to build each prompt incrementally by saying do X prompt with the target outputs. The target output should be defined by the prompt. In some fashion, a system can validate it. This validation should be clear and checkable. And if the outputs exist, then the prompt is skipped. Otherwise, the prompt is rerun, very similar to new make. In fact, you may use new make if need be.

Specs:
- The prompt should declare variables at the top for which coding agent system to use (for example gemini-2.5 or claude-4-sonnet)
- A Prompt is a "rule" that generates "targets". 
- The prompt should have a clear syntax of instruction set and targets separated, where the targets is a clear, validatable set of instructions.
- There's a dependency tree between a prompt rule and a different prompt rule ...via reference.
- If a target exists, then the prompt is not rerun.
- The method of running a prompt is to put it in a coding agent and say do this prompt.
- The method of checking if a prompt has succeeded and contributed to the target is by asking the coding agent, does the generated content look like the target
- The state is not managed within the prompts, but every time the prompt is checked, the coding agent is asked, "Is the target created?"
