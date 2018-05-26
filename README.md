# CricPredict
## Synopsis
This application predicts the outcome of virtual cricket matches based on player profiles created from historical data. It uses a `MLP Classifier` under the hood to predict the matches. I have got about 70% accuracy using the IPL dataset.
## Software Stack
* Node.JS 8 or above
* Python 3.5 or above
## Setup
### Python
* Set the command used to access python in main.js as the variable `python_call`
* Install the following packages: scikit-learn (http://scikit-learn.org/) and numpy (http://www.numpy.org/). These packages can be installed easily using PyPI
### Node.JS
* Run ```npm install``` in the main directory to auto-install all dependencies
### Data
* Download historical data from https://cricsheet.org/downloads/ in YAML form.   Place all the `.yaml` files from the downloaded archive in a new folder created inside the `match_data` directory
## Usage
* You may use the provided model and player database which are created based on the IPL dataset (Avaliable @ https://cricsheet.org/downloads/ipl.zip). You can use them by simply copying the files from the `ipl` subfolder in `ml_data` to `ml_data`. If you do this you can skip directly to creating virtual matches -> Step 4
* This application creates a player database using historical match data is created from which a match database is created based on the historical match data which contains players from both teams and which team won the match. (**Only be concerned with this if you plan to use multiple historical datasets**)
* Run ```node ./main.js``` in the main directory and select the historical data for each database (*Always make sure the dataset used creating the player database contains the dataset used for creating the match database if your using multiple historical datasets*)
* If you want to potentially increase your accuracy you can try messing around with the parameters of the `MLPClassifier` in `ml_backend/model_create.py` (**Optional**)
* Now just define the players in the virtual match you wanted to see played out using the template in the `virt_matches` directory. Some example templates are already present but these are created with the **IPL historical data** used to create the player database
* Run ```node ./match.js``` in the main directory then select the virtual match you wanted and see the result :)
## Disclaimer
By downloading this you agree that the author of the following items is not responsible for any misuse of the following items and is completely exempt from any legal action as a result of the misuse 