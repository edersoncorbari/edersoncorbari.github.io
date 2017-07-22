---
date:   2017-05-21
title: "Running FreeBSD on VirtualBox"
categories: 
    - Tutorials
excerpt: Simple tips for installing FreeBSD in a virtual machine.
tags: 
    - FreeBSD
    - VirtualBox
---

{% include toc %}

# Overview

Simple tips for installing FreeBSD in a virtual machine.

**Note:** This tutorial was done using the FreeBSD 11.0 release.
{: .notice--info}

# Because FreeBSD

People often ask me why I use FreeBSD, well I've always been a guy who used Unix at the time IBM-AIX and then I migrated to FreeBSD and started 
in version 3.0 and I use FreeBSD to this day as a workstation and server. I like the simple and easy things, also eventually use Linux and Mac 
for a specific project. I need to create a virtual machine for development tests and I decided to write a howto to show how simple it is to install FreeBSD so let's go...

## 1. Preparing the working directory

Open your terminal and execute the commands below:

{%highlight bash%}
mkdir ~/work && cd ~/work
fetch ftp://ftp.freebsd.org/pub/FreeBSD/releases/ISO-IMAGES/11.0/FreeBSD-11.0-RELEASE-amd64-disc1.iso
OR
wget ftp://ftp.freebsd.org/pub/FreeBSD/releases/ISO-IMAGES/11.0/FreeBSD-11.0-RELEASE-amd64-disc1.iso
{%endhighlight%}

## 2. Creating the virtual machine

I'm considering that you already have Virtualbox installed.


* 2.1 Make sure you have FreeBSD 64

{%highlight bash%}
VBoxManage list ostypes | grep FreeBSD
ID:          FreeBSD
Description: FreeBSD (32-bit)
ID:          FreeBSD_64
Description: FreeBSD (64-bit)
{%endhighlight%}

* 2.2 Makes an export with the VM ostype

{%highlight bash%}
export VM='FreeBSD_64' && echo $VM
{%endhighlight%}

* 2.3 Creating a VDI with 30GB

{%highlight bash%}
VBoxManage createvm --name $VM --ostype $VM --register
{%endhighlight%}

* 2.4 Adding a SATA controller

{%highlight bash%}
VBoxManage storagectl $VM --name "SATA Controller" --add sata --controller IntelAHCI
VBoxManage storageattach $VM --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium $VM.vdi
{%endhighlight%}

* 2.5 Make sure your HD has been created

{%highlight bash%}
VBoxManage list hdds | grep $VM
{%endhighlight%}

* 2.6 Adding the IDE drive is the ISO image

{%highlight bash%}
VBoxManage storagectl $VM --name "IDE Controller" --add ide
VBoxManage storageattach $VM --storagectl "IDE Controller" --port 0 --device 0 --type dvddrive --medium ~/work/FreeBSD-11.0-RELEASE-amd64-disc1.iso
{%endhighlight%}

* 2.7 Changing the boot order and memory for VM.

{%highlight bash%}
VBoxManage modifyvm $VM --boot1 dvd --boot2 disk --boot3 none --boot4 none
VBoxManage modifyvm $VM --memory 4000 --vram 16
{%endhighlight%}

* Start FreeBSD Virtual Machine

{%highlight bash%}
VBoxManage startvm $VM --type gui
{%endhighlight%}

If all went well, you should see this image to start the installation:

* Screen 1

![Screen1]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/1.png)
{: .align-center}

## 3. Following the screen step by step

I did print all the installation screens basically without any changes, just follow them all to finish.

* Screen 2

![Screen2]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/2.png)
{: .align-center}

* Screen 3

![Screen3]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/3.png)
{: .align-center}

* Screen 4

![Screen4]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/4.png)
{: .align-center}

* Screen 5

![Screen5]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/5.png)
{: .align-center}

* Screen 6

![Screen6]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/6.png)
{: .align-center}

* Screen 7

![Screen7]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/7.png)
{: .align-center}

* Screen 8

![Screen8]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/8.png)
{: .align-center}

* Screen 9

![Screen9]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/9.png)
{: .align-center}

* Screen 10

![Screen10]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/10.png)
{: .align-center}

* Screen 11

![Screen11]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/11.png)
{: .align-center}

* Screen 12

![Screen12]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/12.png)
{: .align-center}

* Screen 13

![Screen13]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/13.png)
{: .align-center}

* Screen 14

![Screen14]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/14.png)
{: .align-center}

* Screen 15

![Screen15]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/15.png)
{: .align-center}

* Screen 16

![Screen16]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/16.png)
{: .align-center}

* Screen 17

![Screen17]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/17.png)
{: .align-center}

* Screen 18

![Screen18]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/18.png)
{: .align-center}

* Screen 19

![Screen19]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/19.png)
{: .align-center}

* Screen 20

![Screen20]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/20.png)
{: .align-center}

* Screen 21

![Screen21]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/21.png)
{: .align-center}
 
* Screen 22

![Screen22]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/22.png)
{: .align-center}

* Screen 23

![Screen23]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/23.png)
{: .align-center}

* Screen 24

![Screen24]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/24.png)
{: .align-center}

* Screen 25

![Screen25]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/25.png)
{: .align-center}

* Screen 26

![Screen26]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/26.png)
{: .align-center}

* Screen 27

![Screen27]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/27.png)
{: .align-center}

* Screen 28

![Screen28]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/28.png)
{: .align-center}

Ready! Now it is necessary to shut down the virtual machine and change the boot order again. Run the command:</p>

{%highlight bash%}
VBoxManage modifyvm $VM --boot1 disk --boot2 none --boot3 none --boot4 none
{%endhighlight%}

FreeBSD installed and running, have fun!

![Screen29]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-21/29.png)
{: .align-center}

In case of doubts the documentation of the FreeBSD is quite updated see in: [Handbook](https://www.freebsd.org/doc/handbook/).

