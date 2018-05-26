# Made by ◱ PixelyIon (https://github.com/PixelyIon)

# Import the stuff we need
from sklearn.externals import joblib # We need joblib to save trained models
from numpy import array,float,amin,amax,subtract,divide # We need numpy to perform complex maths operations
from sys import argv,exit # We need sys to process arguments

## Part I: Argument checking
if(len(argv)<24): # If two or more arguments are not given
    exit("Model and/or parameters are not specified") # Quit with an exception

## Part II: Data normalization
dat=array([[argv[2],argv[3],argv[4],argv[5],argv[6],argv[7],argv[8],argv[9],argv[10],argv[11],argv[12],argv[13],argv[14],argv[15],argv[16],argv[17],argv[18],argv[19],argv[20],argv[21],argv[22],argv[23]]]).astype(float);
dat_min=amin(dat) # Get the lowest value in the dataset
dat_max=amax(dat) # Get the highest value in the dataset
dat_dif=dat_max-dat_min # Get the difference between the highest and lowest value in the dataset
dat=divide(subtract(dat,dat_min),dat_dif) # Change MinMax of dat to 0 and 1

## Part III: Import model and predict using it
clf=joblib.load(argv[1]) # Load up the model
pred=clf.predict(dat) # Predict the samples on the test set
# Part III.II: Results
print(pred[0])