import sys
import RPi.GPIO as GPIO
from time import sleep

#setup GPI0 pins
##def setup():
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(12,GPIO.OUT)
pwm = GPIO.PWM(12,50)
pwm.start(0)
GPIO.setup(40,GPIO.OUT)
#This function changes the angle of the servo motor

def SetAngle(duty):
	
    GPIO.output(12, True)
    pwm.ChangeDutyCycle(duty)
    sleep(2)
    GPIO.output(12, False)
    pwm.ChangeDutyCycle(0)

def Lock():
    SetAngle(10)
    GPIO.output(40,False)
    
def Unlock():
    SetAngle(5.8)
    GPIO.output(40,True)
    

if sys.argv[1] == '0':
    Unlock()
    print("Unlocked lock!")
elif sys.argv[1] == '1':
    Lock()
    print("Locked lock!")
    
    
pwm.stop()
GPIO.cleanup()
