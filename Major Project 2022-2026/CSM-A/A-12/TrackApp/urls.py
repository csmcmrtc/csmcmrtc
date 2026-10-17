from django.urls import path

from . import views

urlpatterns = [path("index.html", views.index, name="index"),
	             path('UserLogin.html', views.UserLogin, name="UserLogin"), 
	       path('Register.html', views.Register, name="Register"),
	       path('RegisterAction', views.RegisterAction, name="RegisterAction"),	
	       path('UserLoginAction', views.UserLoginAction, name="UserLoginAction"),
	       path('TrainDetection', views.TrainDetection, name="TrainDetection"),
	       path('Chatbot', views.Chatbot, name="Chatbot"),
	       path("TextChatData", views.TextChatData, name="TextChatData"),	
	       path('UserScreen', views.UserScreen, name="UserScreen"),
	       path('DetectCameraWaste', views.DetectCameraWaste, name="DetectCameraWaste"),
	       path('DetectWaste', views.DetectWaste, name="DetectWaste"),
	       path('DetectWasteAction', views.DetectWasteAction, name="DetectWasteAction"), 	       
]
