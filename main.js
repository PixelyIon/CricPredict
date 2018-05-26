// Made by ◱ PixelyIon (https://github.com/PixelyIon)
// Warning: Some parts of the following code are not made for human consumption due to their's convoluted nature aka Spaghetti Code (https://en.wikipedia.org/wiki/Spaghetti_code)

/* Imports */
const ym = require("js-yaml"); // We use 'js-yaml' for parsing YAML files
const fs = require("fs"); // We use 'fs' for doing filesystem related actions
const { execSync } = require("child_process"); // We use 'child_process' for executing applications
const inq = require("inquirer"); // We use 'inquirer' for providing a easy to use CLI

/* Parameters */
pdata_folder = "./match_data/"; // Define the folder the player data is stored in
mdata_folder = "./match_data/"; // Define the folder the match data is stored in
output_folder = "./ml_data/"; // Define the folder that the data is saved to (Sync changes with virt_match.js's input_folder)
python_call = "python"; // Define what is used for calling python 3.x.x

/* Global Variables */
players = {}; // This will store all player data

// Part I-I: Inquire about input data
dirs = fs.readdirSync("./match_data/"); // Read all folders in the match_data folder
if (dirs.length == 0) {
  console.error(
    "No match data was found in the 'match_data' folder -> Follow steps in README.md"
  );
  process.exit();
}
inq
  .prompt([
    {
      type: "list",
      name: "pdata_folder",
      message: "Which data should the player DB created with ?",
      choices: dirs
    },
    {
      type: "list",
      name: "mdata_folder",
      message: "Which data should the match DB created with ?",
      choices: dirs
    }
  ])
  .then(ans => {
    pdata_folder += ans.pdata_folder + "/"; // Write out the selected pdata directory's full path
    mdata_folder += ans.mdata_folder + "/"; // Write out the selected mdata directory's full path
    // Part I.I: Parse YAML and store them in memory
    pdirectory = fs
      .readdirSync(pdata_folder)
      .sort(require("javascript-natural-sort")); // This lists all files in 'pdata_folder' and sorts them the correct order using 'javascript-natural-sort'
    i = 1; // 'i' is an iterator
    pdirectory.forEach(file => {
      // This loops over each file in 'data_folder'
      process.stdout.write(
        "Generating Player DB -> " +
          file +
          " (" +
          i +
          "/" +
          pdirectory.length +
          ")"
      ); // Write the name of the current file to STDOUT
      data = ym.load(fs.readFileSync(pdata_folder + file, "utf8")); // Assign the loaded up file to the data variable
      // Part I.II: Create the Player DB
      cur_players = []; // This holds the players in the current match
      data.innings.forEach(inn => {
        // This loops through all the innings in this match
        inn = inn[Object.keys(inn)[0]]; // Actually refer to the respective innings object
        del_arr = inn.deliveries; // Refer to the deliveries in each inning
        c_over = 0; // This refers to the current over
        del_arr.forEach(del => {
          // This loops through every delivery
          del = del[Object.keys(del)[0]]; // Actually refer to the respective delivery object
          if (cur_players.indexOf(del.batsman) == -1) {
            // If the cur_players index doesn't contain the current batsman
            cur_players[del.batsman] = {};
            cur_players[del.batsman].name = del.batsman;
            if (cur_players[del.batsman].type == undefined);
            cur_players[del.batsman].type = [];
            cur_players[del.batsman].type.push("batsman");
          }
          if (cur_players.indexOf(del.bowler) == -1) {
            // If the cur_players index doesn't contain the current bowler
            cur_players[del.bowler] = {};
            cur_players[del.bowler].name = del.bowler;
            if (cur_players[del.bowler].type == undefined);
            cur_players[del.bowler].type = [];
            cur_players[del.bowler].type.push("bowler");
          }
          if (del.wicket != null) {
            // If there was an wicket in the current delivery
            if (del.wicket.fielders != null) {
              // If the wicket was due to fielders
              del.wicket.fielders.forEach(fdr => {
                // For each fielder involved
                if (cur_players.indexOf(fdr) == -1) {
                  // If the cur_players index doesn't contain the current fielder
                  cur_players[fdr] = {};
                  cur_players[fdr].name = fdr;
                  if (cur_players[fdr].type == undefined);
                  cur_players[fdr].type = [];
                  cur_players[fdr].type.push("fielder");
                }
              });
            }
          }
          if (
            players[del.batsman] != null &&
            players[del.batsman].type.indexOf("batsman") != -1
          ) {
            // If the profile exists as a batsman exists
            players[del.batsman].bat_overs += 0.16; // Add the current delivery to the batsman's stats (Delivery is 1/6th of a over)
            players[del.batsman].runs += del.runs.total; // Add the current runs to the batsman's stats
          } else if (
            players[del.batsman] != null &&
            players[del.batsman].type.indexOf("batsman") == -1
          ) {
            // If the profile exists but not as a batsman
            players[del.batsman].type.push("batsman"); // Add the "batsman" type
            players[del.batsman].bat_overs = 0.16; // Set the amount of overs
            players[del.batsman].runs = del.runs.total; // Set the amount of runs
          } else if (players[del.batsman] == null) {
            // If the profile doesn't exist
            players[del.batsman] = {
              bat_overs: 0.16,
              runs: del.runs.total,
              type: ["batsman"]
            }; // Create a new one
          }
          if (
            players[del.bowler] != null &&
            players[del.bowler].type.indexOf("bowler") != -1
          ) {
            // If the profile of the bowler exists
            players[del.bowler].bow_overs += 0.16; // Add the current delivery to the bowler's stats
            if (del.wicket != null) {
              // If the current delivery had a wicket
              if (del.wicket.kind == "bowled") {
                // If the current wicket was due to the bowler
                players[del.bowler].wickets++; // Increment the wickets of the bowler by one
              }
            }
          } else if (
            players[del.bowler] != null &&
            players[del.batsman].type.indexOf("bowler") == -1
          ) {
            // If the profile exists but not as a bowler
            players[del.bowler].type.push("bowler"); // Add the "bowler" type
            players[del.bowler].bow_overs = 0.16; // Set the amount of overs
            players[del.bowler].wickets = 0; // Initiate wickets as zero
            if (del.wicket != null) {
              // If the current delivery had a wicket
              if (del.wicket.kind == "bowled") {
                // If the current wicket was due to the bowler
                players[del.bowler].wickets++; // Increment the wickets of the bowler by one
              }
            }
          } else if (players[del.bowler] == null) {
            // If the profile doesn't exist
            players[del.bowler] = {
              bow_overs: 0.16,
              wickets: 0,
              type: ["bowler"]
            }; // Create a new one
            if (del.wicket != null) {
              // If the current delivery had a wicket
              if (del.wicket.kind == "bowled") {
                // If the current wicket was due to the bowler
                players[del.bowler].wickets++; // Increment the wickets of the bowler by one
              }
            }
          }
          if (del.wicket != null) {
            // If the current delivery had a wicket
            if (del.wicket.fielders != null) {
              // If the wicket was due to fielders
              del.wicket.fielders.forEach(fdr => {
                // For each fielder involved
                if (
                  players[fdr] != null &&
                  players[fdr].type.indexOf("fielder") != -1
                ) {
                  // If the profile exists as a batsman exists
                  if (del.wicket.kind == "caught") {
                    // If there was a caught
                    players[fdr].caught++; // Increment the caughts by that fielder
                  }
                  if (del.wicket.kind == "run out") {
                    // If there was a run out
                    players[fdr].runout++; // Increment the run outs by that fielder
                  }
                } else if (
                  players[fdr] != null &&
                  players[fdr].type.indexOf("fielder") == -1
                ) {
                  // If the profile exists but not as a batsman
                  players[fdr].type.push("fielder"); // Add the "fielder" type
                  players[fdr].caught = 0; // Initialize the caughts by that fielder as 0
                  players[fdr].runout = 0; // Initialize the run outs by that fielder as 0
                  if (del.wicket.kind == "caught") {
                    // If there was a caught
                    players[fdr].caught++; // Increment the caughts by that fielder
                  }
                  if (del.wicket.kind == "run out") {
                    // If there was a run out
                    players[fdr].runout++; // Increment the run outs by that fielder
                  }
                } else if (players[fdr] == null) {
                  // If the profile doesn't exist
                  players[fdr] = {
                    caught: 0,
                    runout: 0,
                    type: ["fielder"]
                  }; // Create a new one
                  if (del.wicket.kind == "caught") {
                    // If there was a caught
                    players[fdr].caught = 1; // Initialize the caughts by that fielder as 1
                  }
                  if (del.wicket.kind == "run out") {
                    // If there was a run out
                    players[fdr].runout = 1; // Initialize the caughts by that fielder as 1
                  }
                }
              });
            }
          }
        });
      });
      // Part I.II: Add up matches for players in the Player DB
      Object.keys(cur_players).forEach(cpl => {
        // For each player
        cpl = cur_players[cpl]; // Refer to the actual current player in cur_players
        pl = players[cpl.name]; // Set 'pl' to refer to the actual player object
        if (cpl.type.indexOf("batsman") != -1) {
          if (pl.bat_matches != null)
            // If the matches property exists for said player
            pl.bat_matches++;
          // Increment it by one
          // Otherwise
          else pl.bat_matches = 1; // Initiate it as one
        }
        if (cpl.type.indexOf("bowler") != -1) {
          if (pl.bow_matches != null)
            // If the matches property exists for said player
            pl.bow_matches++;
          // Increment it by one
          // Otherwise
          else pl.bow_matches = 1; // Initiate it as one
        }
        if (pl.matches != null)
          // If the matches property exists for said player
          pl.matches++;
        // Increment it by one
        // Otherwise
        else pl.matches = 1; // Initiate it as one
      });
      // Part I.III: Round up decimal parameters and calculate statistics
      if (i == pdirectory.length) {
        Object.keys(players).forEach(pla => {
          // For each player
          pl = players[pla]; // Set 'pl' to refer to the actual player object
          if (pl.type.indexOf("batsman") != -1) {
            // If the current player is a batsman
            pl.bat_overs = Math.round(Math.round(pl.bat_overs)); // Round up the overs
            if (pl.runs != 0 && pl.bat_overs != 0) {
              // If rr doesn't become a numerically undefinable value then
              pl.rr = Math.round(pl.runs / pl.bat_overs); // Calculate the run rate of the batsman and set it as the rr attribute of the player
            } else {
              // Otherwise
              delete pl.type.batsman;
              delete pl.bat_overs;
              delete pl.runs; // Delete attributes of the player
            }
          }
          if (pl.type.indexOf("bowler") != -1) {
            // If the current player is a bowler
            pl.bow_overs = Math.round(pl.bow_overs); // Round up the overs
            if (pl.bow_overs != 0 && pl.wickets != 0)
              // If sr doesn't become a numerically undefinable value then
              pl.sr = Math.round(pl.bow_overs / 0.16 / pl.wickets);
            // Calculate the strike rate of the bowler and set it as the sr attribute of the player
            else {
              // Otherwise
              delete pl.type.bowler;
              delete pl.bow_overs;
              delete pl.wickets; // Delete attributes of the player
            }
          }
          if (pl.type.indexOf("fielder") != -1) {
            // If the current player is a fielder
            if (pl.caught + pl.runout != 0 && pl.matches != 0)
              // If carpm doesn't become a numerically undefinable value then
              pl.carpm = (pl.caught + pl.runout) / pl.matches;
            // Calculate the Catches and Runout per match of the fielder and set it as the carpm attribute of the player
            else {
              // Otherwise
              delete pl.type.fielder;
              delete pl.caught;
              delete pl.runout; // Delete attributes of the player
            }
          }
        });
        fs.writeFileSync(
          output_folder + "players.json",
          JSON.stringify(players, null, "\t"),
          "utf8"
        ); // Write player database to players.json
      }
      i++; // Increment the iterator by one
      process.stdout.clearLine(); // Clear the line in STDOUT
      process.stdout.cursorTo(0); // Move back the cursor to the beginning
    });

    // Part II.I: Generate match data
    i = 1; // 'i' is an iterator
    fs.writeFileSync(
      output_folder + "match.csv",
      "bt_ov1,bt_rn1,bt_rr1,bt_mc1,bo_ov1,bo_wi1,bo_sr1,bo_mc1,fi_cg1,fi_ro1,fi_cpm1,bt_ov2,bt_rn2,bt_rr2,bt_mc2,bo_ov2,bo_wi2,bo_sr2,bo_mc2,fi_cg2,fi_ro2,fi_cpm2,win",
      "utf8"
    ); // Write out the current player DB
    mdirectory = fs
      .readdirSync(mdata_folder)
      .sort(require("javascript-natural-sort")); // This lists all files in 'mdata_folder' and sorts them the correct order using 'javascript-natural-sort'
    mdirectory.forEach(file => {
      // This loops over each file in 'mdata_folder'
      process.stdout.write(
        "Generating Matches -> " +
          file +
          " (" +
          i +
          "/" +
          mdirectory.length +
          ")"
      ); // Write the name of the current file to STDOUT
      data = ym.load(fs.readFileSync(mdata_folder + file, "utf8")); // Assign the loaded up file to the data variable
      // Part II.II: Create the Match DB
      teams = data.info.teams; // Refer to the teams convieniently
      match_db = []; // This holds the players in the current match
      data.innings.forEach(inn_ => {
        // This loops through all the innings in this match
        inn = inn_[Object.keys(inn_)[0]]; // Actually refer to the respective innings object
        team = teams.indexOf(inn.team); // Index of the current team
        if (match_db[team] == undefined)
          // Check if the current team object existed
          match_inn = match_db[team] = {
            bat: [],
            bow: [],
            fld: []
          };
        // Team which is batting in the current innings
        else match_inn = match_db[team];
        team=!team ? 1 : 0; // Invert team operator to get the index of the other team
        if (match_db[team] == undefined)
          // Check if the current team object existed
          match_oth = match_db[team] = {
            bat: [],
            bow: [],
            fld: []
          };
        // Team which is bowling in the current innings
        else match_oth = match_db[team];
        del_arr = inn.deliveries; // Refer to the deliveries in each inning
        c_over = 0; // This refers to the current over
        del_arr.forEach(del => {
          // This loops through every delivery
          del = del[Object.keys(del)[0]]; // Actually refer to the respective delivery object
          if (match_inn.bat.indexOf(del.batsman) == -1) {
            // If the match_db index doesn't contain the current batsman
            match_inn.bat.push(del.batsman); // Add batsman to match_db
          }
          if (match_oth.bow.indexOf(del.bowler) == -1) {
            // If the match_db index doesn't contain the current bowler
            match_oth.bow.push(del.bowler); // Add players to match_db
          }
          if (del.wicket != null) {
            // If there was an wicket in the current delivery
            if (del.wicket.fielders != null) {
              // If the wicket was due to fielders
              del.wicket.fielders.forEach(fdr => {
                // For each fielder involved
                if (match_oth.fld.indexOf(fdr) == -1) {
                  // If the match_db index doesn't contain the current fielder
                  match_oth.fld.push(fdr); // Add players to match_db
                }
              });
            }
          }
        });
      });
      // Part II.II: Generate hypothetical players
      hypos = [
        {
          bat: {
            overs: 0,
            runs: 0,
            rr: 0,
            matches: 0
          },
          bow: {
            overs: 0,
            wickets: 0,
            sr: 0,
            matches: 0
          },
          fld: {
            caught: 0,
            runout: 0,
            carpm: 0
          }
        },
        {
          bat: {
            overs: 0,
            runs: 0,
            rr: 0,
            matches: 0
          },
          bow: {
            overs: 0,
            runs: 0,
            wickets: 0,
            sr: 0,
            matches: 0
          },
          fld: {
            caught: 0,
            runout: 0,
            carpm: 0
          }
        }
      ]; // Create hypothetical player array
      x = 0; // Hold the current inning's index
      match_db.forEach(inn => {
        // Loop through both innings in match_db
        Object.keys(inn).forEach(typ => {
          // Loop through every type of player
          p_no = inn[typ].length; // Hold the number of players
          _typ = inn[typ]; // Actually refer to the type object
          _typ.forEach(pl => {
            // Loop through each player in that type
            if (players[pl] != undefined) {
              if (typ == "bat") {
                if (players[pl].bat_overs != undefined) {
                  hypos[x].bat.overs += players[pl].bat_overs / p_no;
                }
                if (players[pl].runs != undefined) {
                  hypos[x].bat.runs += players[pl].runs / p_no;
                }
                if (players[pl].rr != undefined) {
                  hypos[x].bat.rr += players[pl].rr / p_no;
                }
                if (players[pl].bat_matches != undefined) {
                  hypos[x].bat.matches += players[pl].bat_matches / p_no;
                }
              }
              if (typ == "bow") {
                if (players[pl].bow_overs != undefined) {
                  hypos[x].bow.overs += players[pl].bow_overs / p_no;
                }
                if (players[pl].wickets != undefined) {
                  hypos[x].bow.wickets += players[pl].wickets / p_no;
                }
                if (players[pl].sr != undefined) {
                  hypos[x].bow.sr += players[pl].sr / p_no;
                }
                if (players[pl].bow_matches != undefined) {
                  hypos[x].bow.matches += players[pl].bow_matches / p_no;
                }
              }
              if (typ == "fld") {
                if (players[pl].caught != undefined) {
                  hypos[x].fld.caught += players[pl].caught / p_no;
                }
                if (players[pl].runout != undefined) {
                  hypos[x].fld.runout += players[pl].runout / p_no;
                }
                if (players[pl].carpm != undefined) {
                  hypos[x].fld.carpm += players[pl].carpm / p_no;
                }
              }
            }
          });
        });
        x++; // Increment the current inning index by 1
      });
      // Part II.III: Write data to CSV
      fs.appendFileSync(
        output_folder + "match.csv",
        "\n" +
          hypos[0].bat.overs +
          "," +
          hypos[0].bat.runs +
          "," +
          hypos[0].bat.rr +
          "," +
          hypos[0].bat.matches +
          "," +
          hypos[0].bow.overs +
          "," +
          hypos[0].bow.wickets +
          "," +
          hypos[0].bow.sr +
          "," +
          hypos[0].bow.matches +
          "," +
          hypos[0].fld.caught +
          "," +
          hypos[0].fld.runout +
          "," +
          hypos[0].fld.carpm +
          "," +
          hypos[1].bat.overs +
          "," +
          hypos[1].bat.runs +
          "," +
          hypos[1].bat.rr +
          "," +
          hypos[1].bat.matches +
          "," +
          hypos[1].bow.overs +
          "," +
          hypos[1].bow.wickets +
          "," +
          hypos[1].bow.sr +
          "," +
          hypos[1].bow.matches +
          "," +
          hypos[1].fld.caught +
          "," +
          hypos[1].fld.runout +
          "," +
          hypos[1].fld.carpm +
          "," +
          teams.indexOf(data.info.outcome.winner),
        "utf-8"
      );
      i++; // Increment the iterator by one
      process.stdout.clearLine(); // Clear the line in STDOUT
      process.stdout.cursorTo(0); // Move back the cursor to the beginning
    });

    // Part III: Train model using python
    process.stdout.clearLine(); // Clear the line in STDOUT
    process.stdout.cursorTo(0); // Move back the cursor to the beginning
    process.stdout.write("Training MLP Classifier based on data.."); // Write the name of the current file to STDOUT
    var accr = execSync(
      python_call +
        " ./ml_backend/model_create.py " +
        output_folder +
        "match.csv " +
        output_folder +
        "cric.mdl"
    ).toString();
    process.stdout.clearLine(); // Clear the line in STDOUT
    process.stdout.cursorTo(0); // Move back the cursor to the beginning
    console.log("Accuracy: " + accr + "%");

    // Part IV: Success :)
    console.info("✔ The model has been successfully trained!");
    console.log('Press any key to continue.');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  });
