# CV Tracker

This app is a simple job tracker, so you can keep track of your job applications.

It's pretty much experiment with creating own slop out there via opencode.

As I see, it can create working app, but... it's a slop

I used mostly model MiMo 2.5V Free.

I managed to get something, but...

- Model preferred to nuke db via `docker compose down -v` instead of migration
- My instructions in docs were imprecise or invalid, but I corrected them
- Model itself could've been trained on old data given it has used zod from `astro::schema`
