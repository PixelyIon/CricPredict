// Made by ◱ PixelyIon (https://github.com/PixelyIon)
// Warning: Some parts of the following code are not made for human consumption due to their's convoluted nature aka Spaghetti Code (https://en.wikipedia.org/wiki/Spaghetti_code)

/* Imports */
const fs = require("fs"); // We use 'fs' for doing filesystem related actions
const { execSync } = require("child_process"); // We use 'child_process' for executing applications
const inq = require("inquirer"); // We use 'inquirer' for providing a easy to use CLI

/* Parameters */
vmatch = "./virt_matches/"; // Define the virtual match we are going to use
output_folder = "./ml_data/"; // Define the folder that the data is loaded from (Sync changes with main.js's output_folder)
python_call = "python"; // Define what is used for calling python 3.x.x

/* Global Variables */
players = require(output_folder + "players.json"); // This will store all player data

// Part I-I: Inquire about input data
mtchs_ = fs.readdirSync(vmatch); // Read all folders in the match_data folder
mtchs = []; // Filter out all files which are not .json
mtchs_.forEach(mch=>{
  if(mch.endsWith(".json")){
    mtchs.push(mch);
  }
});
if (mtchs.length == 0) {
  console.error(
    "No match data was found in the 'match_data' folder -> Follow steps in README.md"
  );
  process.exit();
}
inq
  .prompt([
    {
      type: "list",
      name: "match",
      message: "Which match should be played out (Select a .JSON file) ?",
      choices: mtchs
    }
  ])
  .then(ans => {
    vmatch += ans.match; // Write out the selected match's full path
    // Part I.I: Load up the virtual match data
    match_db = require(vmatch); // Assign the loaded up file to the data variable
    // Part I.II: Generate hypothetical players
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
                hypos[x].bow.matches += players[pl].bow_matches / p_no;;
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

    // Part I.III: Run the match through the model
    process.stdout.clearLine(); // Clear the line in STDOUT
    process.stdout.cursorTo(0); // Move back the cursor to the beginning
    process.stdout.write("Running MLP Classifier on match.."); // Write the name of the current file to STDOUT
    var win = execSync(
      python_call + " ./ml_backend/model_run.py ./ml_data/cric.mdl " + hypos[0].bat.overs +
        " " +
        hypos[0].bat.runs +
        " " +
        hypos[0].bat.rr +
        " " +
        hypos[0].bat.matches +
        " " +
        hypos[0].bow.overs +
        " " +
        hypos[0].bow.wickets +
        " " +
        hypos[0].bow.sr +
        " " +
        hypos[0].bow.matches +
        " " +
        hypos[0].fld.caught +
        " " +
        hypos[0].fld.runout +
        " " +
        hypos[0].fld.carpm +
        " " +
        hypos[1].bat.overs +
        " " +
        hypos[1].bat.runs +
        " " +
        hypos[1].bat.rr +
        " " +
        hypos[1].bat.matches +
        " " +
        hypos[1].bow.overs +
        " " +
        hypos[1].bow.wickets +
        " " +
        hypos[1].bow.sr +
        " " +
        hypos[1].bow.matches +
        " " +
        hypos[1].fld.caught +
        " " +
        hypos[1].fld.runout +
        " " +
        hypos[1].fld.carpm
    ).toString();
    process.stdout.clearLine(); // Clear the line in STDOUT
    process.stdout.cursorTo(0); // Move back the cursor to the beginning
    process.stdout.write("Winner: Team " + win);
    console.log('Press any key to continue.');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  });
