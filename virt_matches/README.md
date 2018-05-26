# Virtual Matches
## Rules for creation of Virtual Matches
* Make sure atleast one of each type of player is present (Batsman, Bowler and Fielder)
* Make sure the players you define are present in `players.json` in the `ml_data` directory
* The amount of players per team can range from 3 to infinity. The data generated from these don't consider the team size so although it may seem obvious that a team with 999 players may win against a team with 3 players they might not
## Files
* match.json.template - This is the template file for creating new virtual matches
* ipl: This contains one team filled with SC Ganguly and the other filled with P Kumar. This should output "Team 0".
* ipl-inv: This is just `ipl` but with the teams exchanged. This should output "Team 1".
* ipl_real: This contains a real IPL match from 4th May 2018 between MI and KXIP. A overview of this match can be seen @ http://www.litzscore.com/series/iplt20_2018/iplt20_2018_g34/. MI won the match and so it should output "Team 1"