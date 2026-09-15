# CV Tracker

This app is a simple job tracker, so you can keep track of your job applications.

It's pretty much experiment with creating own slop out there via opencode.

As I see, it can create working app, but... it's a slop

I used mostly model MiMo 2.5V Free, but started with Big Pickle.

I managed to get something, but...

- Model preferred to nuke db via `docker compose down -v` instead of migration
- My instructions in docs were imprecise or invalid, but I corrected them
- Model itself could've been trained on old data given it has used zod from `astro::schema`, but still it could correct itself after clarification
- I had to tell to split some funcitons into files
- Thanks to the fact I had previous project, I could use some working code there (AI was happy to duplicate)

It's quite simplistic, so I didn't use tanstack query for example although I should or leverage more SSR

Although it was a good thing to ask LLM questions if something isn't precise
