#!/bin/bash
rsync -vrhe ssh /mnt/sda5/Documents/Absa\ Aliens/Locker-Management/Pi/NodeJS/ pi@24.153.255.117:/home/pi/piServer/
rsync -vrhe ssh pi@24.153.255.117:/home/pi/piServer/ /mnt/sda5/Documents/Absa\ Aliens/Locker-Management/Pi/NodeJS/
