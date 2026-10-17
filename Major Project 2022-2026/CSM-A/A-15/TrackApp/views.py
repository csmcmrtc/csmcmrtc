import matplotlib
matplotlib.use('Agg')
from django.shortcuts import render
from datetime import datetime
from django.template import RequestContext
from django.contrib import messages
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
import os
import base64
import numpy as np
import io
import matplotlib.pyplot as plt
import cv2
from ultralytics import YOLO
import pymysql
from sklearn.feature_extraction.text import TfidfVectorizer
from numpy import dot
from numpy.linalg import norm
import pandas as pd
from django.views.decorators.csrf import csrf_exempt

global username

#yolo confidence threshold to detect skin disorder
CONFIDENCE_THRESHOLD = 0.50
GREEN = (0, 255, 0)

yolo_model = YOLO("model/best.pt")
print("Yolo Model Loaded")

dataset = pd.read_csv("model/Questions.csv", usecols=['Question','Answer'])
question = dataset['Question'].ravel()
answers = dataset['Answer'].ravel()

for i in range(len(question)):
    data = question[i].strip().lower()
    question[i] = data
vectorizer = TfidfVectorizer(use_idf=True, smooth_idf=False, norm=None, decode_error='replace')
question = vectorizer.fit_transform(question).toarray()

def UserScreen(request):
    if request.method == 'GET':
        global username
        context= {'data':"<font size=3 color=blue>"+'Welcome back '+username+"</font>"}
        return render(request,'UserScreen.html', context)

@csrf_exempt
def TextChatData(request):
    if request.method == 'GET':
        global vectorizer, question, answers
        questions = request.GET.get('mytext', False)
        questions = questions.strip().lower()
        data = vectorizer.transform([questions]).toarray()
        data = data[0]
        output =  "Sorry! I am unaware of this question"
        max_accuracy = 0
        index = -1
        for i in range(len(question)):
            predict_score = dot(question[i], data) / (norm(question[i])* norm(data))
            if predict_score > max_accuracy:
                max_accuracy = predict_score
                index = i
        if index != -1:
            output = answers[index]
        return HttpResponse("Chatbot: "+output, content_type="text/html")              

def Chatbot(request):
    if request.method == 'GET':
        return render(request, 'Chatbot.html', {})    

def TrainDetection(request):
    if request.method == 'GET':
        cnn_train_detection = cv2.imread("model/result.png")
        plt.figure(figsize=(12,7))
        plt.imshow(cnn_train_detection)
        plt.title("CNN Training Waste Detection Graph")
        plt.axis('off')
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        img_b64 = base64.b64encode(buf.getvalue()).decode()
        plt.clf()
        plt.cla()
        #plt.close()
        context= {'data':"CNN Training for Eco Track Graph", 'img': img_b64}
        return render(request, 'UserScreen.html', context)

def detectWaste(frame):
    global yolo_model
    labels = ['Bottle', 'Cup', 'Glass', 'Hazardous', 'Metal', 'Organic', 'Plastic', 'Plastik']
    detections = yolo_model(frame)[0]
    # loop over the detections
    for data in detections.boxes.data.tolist():
        print(data)
        # extract the confidence (i.e., probability) associated with the detection
        confidence = data[4]
        cls_id = data[5]
        # filter out weak detections by ensuring the 
        # confidence is greater than the minimum confidence
        if float(confidence) >= CONFIDENCE_THRESHOLD:
            xmin, ymin, xmax, ymax = int(data[0]), int(data[1]), int(data[2]), int(data[3])
            cv2.rectangle(frame, (xmin, ymin) , (xmax, ymax), GREEN, 2)
            cv2.putText(frame, labels[int(cls_id)], (xmin, ymin-10),  cv2.FONT_HERSHEY_SIMPLEX,0.7, (255, 0, 0), 2)
    return frame

def DetectCameraWaste(request):
    if request.method == 'GET':
        video_cap = cv2.VideoCapture(0)
        while True:
            ret, frame = video_cap.read()
            if ret == True:
                frame = detectWaste(frame)
                cv2.imshow("Waste Classification Output", frame)
                if cv2.waitKey(5) == ord("q"):
                    break
            else:
                break
        video_cap.release()
        cv2.destroyAllWindows()
        context= {'data':'Processing Completed'}
        return render(request, 'UserScreen.html', context)   

def DetectWasteAction(request):
    if request.method == 'POST':
        filename = request.FILES['t1'].name
        image = request.FILES['t1'].read() #reading uploaded file from user
        if os.path.exists("TrackApp/static/"+filename):
            os.remove("TrackApp/static/"+filename)
        with open("TrackApp/static/"+filename, "wb") as file:
            file.write(image)
        file.close()
        img = cv2.imread("TrackApp/static/"+filename)
        img = detectWaste(img)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (500,300))#display image with predicted output
        plt.imshow(img)
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close()
        img_b64 = base64.b64encode(buf.getvalue()).decode() 
        context= {'data':"CNN Waste Detection Output", 'img': img_b64}
        return render(request, 'UserScreen.html', context)

def DetectWaste(request):
    if request.method == 'GET':
        return render(request,'DetectWaste.html', {})     

def index(request):
    if request.method == 'GET':
        return render(request,'index.html', {})

def Register(request):
    if request.method == 'GET':
       return render(request, 'Register.html', {})
    
def UserLogin(request):
    if request.method == 'GET':
       return render(request, 'UserLogin.html', {})

def RegisterAction(request):
    if request.method == 'POST':
        global usersList, nonce, chain_id, from_address, private_key
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        contact = request.POST.get('t3', False)
        email = request.POST.get('t4', False)
        address = request.POST.get('t5', False)
        output = "none"
        con = pymysql.connect(host='127.0.0.1',port = 3306,user = 'root', password = 'root', database = 'ecotrack',charset='utf8')
        with con:
            cur = con.cursor()
            cur.execute("select username FROM register")
            rows = cur.fetchall()
            for row in rows:
                if row[0] == username:
                    output = username+" Username already exists"
                    break                
        if output == "none":
            db_connection = pymysql.connect(host='127.0.0.1',port = 3306,user = 'root', password = 'root', database = 'ecotrack',charset='utf8')
            db_cursor = db_connection.cursor()
            student_sql_query = "INSERT INTO register VALUES('"+username+"','"+password+"','"+contact+"','"+email+"','"+address+"')"
            db_cursor.execute(student_sql_query)
            db_connection.commit()
            print(db_cursor.rowcount, "Record Inserted")
            if db_cursor.rowcount == 1:
                output = "Signup process completed. Login to perform "
        else:
            output = 'Given username already exists'
        context= {'data':"<font size=3 color=blue>"+output+"</font>"}
        return render(request, 'Register.html', context)    


def UserLoginAction(request):
    if request.method == 'POST':
        global username
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        status = "none"
        con = pymysql.connect(host='127.0.0.1',port = 3306,user = 'root', password = 'root', database = 'ecotrack',charset='utf8')
        with con:
            cur = con.cursor()
            cur.execute("select username,password,email FROM register")
            rows = cur.fetchall()
            for row in rows:
                if row[0] == username and row[1] == password:
                    status = "success"
                    break
        if status == 'success':
            context= {'data':"<font size=3 color=blue>"+'Welcome '+username+"</font>"}
            return render(request, "UserScreen.html", context)
        else:
            context= {'data':"<font size=3 color=red>Invalid username</font>"}
            return render(request, 'UserLogin.html', context)
        


        


        
