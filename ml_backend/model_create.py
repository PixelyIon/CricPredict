# Made by ◱ PixelyIon (https://github.com/PixelyIon)

# Import the stuff we need
from sklearn.neural_network import MLPClassifier # We need MLPClassifier to use a Multi layer Perceptron
from sklearn.externals import joblib # We need joblib to save trained models
from numpy import genfromtxt,floor,arange,amin,amax,divide,subtract,count_nonzero # We need numpy for doing complex maths operations
from sys import argv # We need sys to process arguments

# Parameters
train_divide=0.75 # How much data to reserve for training

## Part I: Argument checking
if(len(argv)<3): # If three or more arguments are not given
    exit("No match data location or model dump location specified") # Quit with an exception

## Part II: Data processing
# Part II.I: Data loading and basic processing
dat=genfromtxt(argv[1],delimiter=',',skip_header=1) # Import data
[n,p]=dat.shape # Set n and p to the dimensions of the data
# Part II.II: Data classification
trn_end=int(floor(train_divide*n)) # Defines the last index of the training data
dat_trn=dat[arange(0,trn_end,1),:] # Get all values from the rows 0 to trn_end and all the columns
dat_tst=dat[arange((trn_end+1),n,1),:] # Same as above except from rows trn_end+1 (As trn_end is used by dat_trn and we don't want to overlap) to the end of the data
trn_win=dat_trn[:,(dat_trn.shape[1]-1)].astype('int') # Get the wins in the training data
dat_trn=dat_trn[:,:-1] # Get the training data
tst_win=dat_tst[:,(dat_tst.shape[1]-1)].astype('int') # Get the wins in the testing data
dat_tst=dat_tst[:,:-1] # Get the testing data
# Part II.III: Data normalization
dat_min=amin(dat[:,:-1]) # Get the lowest value in the dataset
dat_max=amax(dat[:,:-1]) # Get the highest value in the dataset
dat_dif=dat_max-dat_min # Get the difference between the highest and lowest value in the dataset
dat_trn=divide(subtract(dat_trn,dat_min),dat_dif) # Change MinMax of dat_trn to 0 and 1
dat_tst=divide(subtract(dat_tst,dat_min),dat_dif) # Change MinMax of dat_tst to 0 and 1

## Part III: NN
# Part III.I: Classifier
clf = MLPClassifier(solver='lbfgs', alpha=1e-5, hidden_layer_sizes=(48,7), random_state=1, activation="relu") # Define the classifier
clf.fit(dat_trn,trn_win) # Fit the data to the classifier
joblib.dump(clf,argv[2]) # Save the model as cric.mdl
pred=clf.predict(dat_tst) # Predict the samples on the test set
# Part III.II: Results
print(count_nonzero(pred==tst_win)/pred.shape[0]*100,end="") # Print out the exact difference between the ground truth and predictions