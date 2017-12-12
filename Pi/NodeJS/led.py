#!/usr/bin/python

import sys
import RPi.GPIO as GPIO
import time
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(21,GPIO.OUT)
if sys.argv[1]=="0":
    GPIO.output(21,GPIO.LOW)
elif sys.argv[1]=="1":
    GPIO.output(21,GPIO.HIGH)
elif sys.argv[1]=="2":
    count=0
    while(count<10):
        GPIO.output(21,GPIO.HIGH)
        time.sleep(0.5)
        GPIO.output(21,GPIO.LOW)
	time.sleep(0.5)
	count+=1
elif sys.argv[1]=="3":
    GPIO.cleanup()
   

