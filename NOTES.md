# DEV_NOTES

## CREATED: 05/07/2026

## LAST UPDATED: 06/07/2026

I reverted Momentum back to it's freshest state. I have some important info that will help it during a build, so that I won't experience recurring problems like in my previous projects. Most of these below are rules that should be in TRD.md, PRD.md or PHASES.md as they guide the user and agents to a functioning project.

- If a theme is to be added to enable theme switching, then it must be added at the beginning, aas part of the project, not an add-on later. If it's done later, agents will mess it up likely, as they cannot identify that the issue is the default, hard-coded theme not accommodating new themes.
- If using Clerk Auth and Supabase, store `clerk_id` as a string like `text` not `uuid`, and all `user_id` columns as `text` type, supabase doesn't accept clerk_id just like that. it'll result in some error. Do a web search on clerk and supabase best practices, u'll get more info.
- Use Clerk with **Custom Session Tokens** (preferred for speed and control over webhooks where possible).
- Clerk user IDs stored as `text` in Supabase.
- RLS enforced via `auth.jwt() ->> 'sub'`.
- Ensure that users can access other user data by correctly entering their user ids
- next dev: -- webpack. not turbopack, as my pc can build compile as fast with turbopack. But deployment is still turbopack
- Set a goal in PRD.md and never stray from it, echo it in all project docs, otherwise scope creep sets in, and u will never ship that project.
  - Make sure all possible questions are answered in the docs, so that the agent building never strays or sees holes to jump out from.
  - Every thing is defined in the docs, this keeps the user and the agent in check ensuring they know the next steps and don't get lost.
- Prioritize SPEED, BEAUTY, and EFFICIENCY. Anything that can potentially slow down the site/app speed, make it look ugly or not function properly is cut-off before it even has the chance to.
- "Done" is when the user can take a screenshot or video of the app functioning and not have to change anything. The project isn't designed to be perfect, it is engineered to function as it should, with no half-measures.
  - "Done" is when a hiring manager can look at the project and say "hmm, this person knows what they are doing" nodding in agreement.
- The project is not a saas nor should it function as one.
- The project is a portfolio piece meant to help the user make better financial decisions.
- In PAGE_Specs is supposed to be the largest of all docs as it defines the Layout, function, structure, reasons, and overall behavior of every single page in that project, from landing to legal (ToS and Privacy policy). It exists as the foundation on which every page will be built on (APP-flow is the soil on which the foundation is built), leading to it's size. 
  - What should the landing page look like? It's in page-specs, what should the landing page do? page-specs, porfolio front door? page-specs, what should the dashboard say? page specs, what how will the cards on the goals page be positioned? page-specs, etc. signin/register page? page-specs. It answers every page related question.
  - With the above examples, u should know how to create a page specs doc. It works closely with APP-flow. Every page in APP flow is showing in page specs. App flow is defined before page specs. It defined the user journey into the app and around it.
- The agent building the app should be able to build everything precisely using the project docs, with little help from the user. The user will only provide all the env vars, supabase project values, deployment links, repo and stuff that the agent can't do from it's position.
- The docs must be updated along with the changes made to the project files. They are not stagnant. If anything is built, document it. If any changes are requested by the user, document it. The timestamp of the last time a doc/file was changed must be added to the PHASES document. The docs stay updated about everything.
- Phases is the last doc to be create when drafting docs as it says **WHEN** everything is to be built, and contains any extra infor that isn't provided in other docs.
- All docs must have a reference line that connects to other relevant docs. By default, all docs reference PRD.md, TRD.md, NOTES.md and PHASES.md. Like PHASES references everything else as it says when they'll be built. PAGE-SPECS references PRD, APP-FLOW, TRD, and UIUX-BRIEF. UIUX-BRIEF references SCHEMA if some ui decisions required database storage.

---

## Updated: 06/07/2026 3:20

**THE DOCS ARE THE SOURCE OF TRUTH**

  
