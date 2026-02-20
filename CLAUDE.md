# Avacdo App
An education focused app for learning AI and tech concepts


## Stack
- Typescript with Bun. Use bun and never npm, pnpm, npx 
- Use shadcn library modified for our style, check existing components before adding new ones
- Ue use react query, hooks, and also check the router setup if you need to modify it
- Space Grotesk if changing design styles do check space-grotesk-typography skill
- Use tailwind v4, avoid inline style="" tags and use tailwind classes or consider adding a reusable class
- anime.js, avoid adding any other animation library - instead leverage existing
 

## Coding Style
- Use of useEffect is forbidden unless you're specifically asked to implement it
- Check and reuse exising components before creating new ones
- Use types and typechecks, avoid "Any"
- Use linter and lint after changes

## On Request
- You MUST read existing code, provided links, references, relevant skills if any TO make and present your plan BEFORE making changes
- In a complex codebase or for a reuqest requiring complex changes - use sub-agents read the files and get specific context
- Mention in the plan what exactly will you change where and downstream changes required (avoid backward compatability), list breaking downstream changes to be changed as todo items/part of the plan
- On approval, use or create sub-agents (if available) to execute the changes - make sure you give specific instructions. You are likely to have access to "kimi" as a cli agent as well
- After the changes, see if a tool can allow you to verify your changes (browser access for design/frontend changes) and/or cli commands for bacend changes. Verify your changes for correctness, and ensure no bugs before claiming that a request is done/finished
