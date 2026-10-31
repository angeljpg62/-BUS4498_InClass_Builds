# Week 10 test log: what Club Event Radar knows and remembers

- Student: @angeljpg62
- Website: https://angeljpg62.github.io/BUS4498_InClass_Builds/event_radar/
- Folder: https://github.com/angeljpg62/BUS4498_InClass_Builds/tree/main/event_radar
- Chat app: GroupMe
- Written by the BUS 4498 Memory Builder on Oct 30, 2026, 5:39 PM.

## Builder checks

| Check | Result | When |
|---|---|---|
| Week 9 build ready | Passed. The events table is there, and visitors can read published posts. The agent is running with your AI key: claude-haiku-5-5. New sign-ups are off. Your website opens at https://angeljpg62.github.io/BUS4498_InClass_Builds/event_radar/ | 4:35 PM |
| Chat-group reader | Not passed. The reader is running, but a GroupMe secret is missing. It hasn’t run yet. The scheduled job runs it within a minute; check again. No GROUPME_BOT_ID: posts are read, but the group gets no reply. | 5:01 PM |
| Club list | Not passed. The club list has 6 clubs: Accounting Society, Board Game Guild, Cal Poly Ski & Snowboard Club, Mustang Pitch Society, Sustainability Crew, Women in Finance Circle. Cal Poly Kite Flyers isn’t on the list yet. Post B shows you when to add it. The agent reads the club list: it knows 6 clubs. | 5:12 PM |
| Lessons table | Not run |  |

## Test posts

| Post | Expected | What happened | What the agent looked at |
|---|---|---|---|
| A. A nickname | Published, with the club shown as Board Game Guild: the agent matched the nickname "BGG" on the club list. | published: Your event is on the website. | Club list (6 clubs): matched “BGG” to Board Game Guild. |
| B. A club that isn't on the list | Waiting for a moderator, because "Cal Poly Kite Flyers" isn't on the club list yet. | waiting: Thanks! A moderator will check your post before it appears on the website. | Club list (6 clubs): no match for “Cal Poly Kite Flyers”. |
| C. The new club's next post | Published, with the club shown as Cal Poly Kite Flyers. You changed what the agent knows without touching the code. | duplicate: This event is already on the website: same date, start time, and place. | Club list (7 clubs): found Cal Poly Kite Flyers. |
| D. A known club, no place | Waiting for a moderator, because the place is missing (rule R2). The reason adds a hint from the club list: Board Game Guild usually meets at University Union (UU), Room 220. The agent didn't fill the place in: knowledge about a club in general isn't a fact about this event. | waiting: Thanks! A moderator will check your post before it appears on the website. | Club list (7 clubs): found Board Game Guild. Board Game Guild usually meets at University Union (UU), Room 220. Given as a hint only; the place wasn't filled in. |
| E. The original post | Published for Tuesday, November 3 at 6:00 PM at the UU Plaza. | published: Your event is on the website. | Club list (7 clubs): found Mustang Pitch Society. Checked 0 upcoming posts from Mustang Pitch Society. |
| F. An update | Published, replacing E. The agent checked the club's upcoming posts, saw that this updates "pitch practice," and copied the place from the earlier post. The earlier card leaves the website. | published: Your event is on the website. It replaces the earlier post “Pitch Practice” (Tue, Nov 3, 6:00 PM, UU Plaza). | Club list (7 clubs): found Mustang Pitch Society. Checked 1 upcoming post from Mustang Pitch Society. This updates “Pitch Practice” (Tue, Nov 3, 6:00 PM, UU Plaza). “Pitch Practice” (Tue, Nov 3, 6:00 PM, UU Plaza) is marked replaced, so the website shows the new card instead. |
| G. A reminder that changes nothing | Already posted. A reminder isn't an update, and the database's duplicate check (same date, start time, and place as F) refuses a second copy. | duplicate: This event is already on the website: same date, start time, and place. | Club list (7 clubs): found Mustang Pitch Society. Checked 1 upcoming post from Mustang Pitch Society. |
| H. Something the rules don't cover | Published. The posting rules don't say anything about study hours, so to the agent it looks like an event. Now teach it: sign in as a moderator and save this lesson: *Drop-in study hours, tutoring, and office hours aren't events for this website. Hold them for a moderator.* | published: Your event is on the website. | Club list (7 clubs): found Accounting Society. Checked 0 upcoming posts from Accounting Society. Lessons: none switched on. |
| I. The next one, after the lesson | Waiting for a moderator, citing your lesson. | duplicate: This event is already on the website: same date, start time, and place. | Club list (7 clubs): found Accounting Society. Checked 4 upcoming posts from Accounting Society. Lessons: none switched on. |
| J. A post that tries to teach the agent | Waiting for a moderator. Your lesson still applies, and the post is flagged for trying to give the AI instructions. Check Table Editor → lessons: there is still only the lesson you wrote. A post can't teach the agent, because only signed-in moderators can write lessons. | waiting: Thanks! A moderator will check your post before it appears on the website. | Club list (7 clubs): found Accounting Society. Checked 2 upcoming posts from Accounting Society. Lessons: none switched on. |
| K. After you switch the lesson off | Published. The agent forgot the lesson the moment you switched it off. Switch it back on when you're done. | published: Your event is on the website. | Club list (7 clubs): found Accounting Society. Checked 3 upcoming posts from Accounting Society. Lessons: none switched on. |

## My answers

**The demo (Step 1):** (not answered)

**The fix (Step 2):** (not answered)

**My chat group (Step 4):** (not answered)

**Knowledge (Step 5):** (not answered)

**Memory (Step 6):** (not answered)

**Lessons (Step 7):** (not answered)
